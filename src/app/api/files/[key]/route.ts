import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { readUpload } from "@/lib/files";
import JSZip from "jszip";

/** docx is a zip of XML — pull the text out of word/document.xml for preview */
async function docxText(buf: Buffer): Promise<string | null> {
  try {
    const zip = await JSZip.loadAsync(buf);
    const doc = zip.file("word/document.xml");
    if (!doc) return null;
    const xml = await doc.async("string");
    return xml
      .replace(/<\/w:p>/g, "\n")
      .replace(/<w:tab\s*\/>/g, "\t")
      .replace(/<[^>]+>/g, "")
      .replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&amp;/g, "&");
  } catch {
    return null;
  }
}

/**
 * Secure document download. A storage key is only served if the caller is a
 * legitimate party: project customer / assigned lab / admin — or, for RFQ
 * attachments, the customer / any approved provider / admin.
 */
export async function GET(req: NextRequest, { params }: { params: Promise<{ key: string }> }) {
  const { key } = await params;
  const inline = req.nextUrl.searchParams.get("inline") === "1";
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const uid = session.user.id;
  const isAdmin = session.user.role === "ADMIN";

  // check which entity owns this key
  const [resultFile, message, rfq, payment] = await Promise.all([
    prisma.resultFile.findFirst({ where: { storageKey: key }, include: { project: true } }),
    prisma.message.findFirst({ where: { attachmentKey: key }, include: { project: true } }),
    prisma.rfq.findFirst({ where: { attachmentKey: key } }),
    prisma.payment.findFirst({ where: { receiptKey: key }, include: { invoice: { include: { billedUser: { select: { role: true } } } } } }),
  ]);

  let filename: string | null = null;
  if (resultFile) {
    const p = resultFile.project;
    if (!isAdmin && uid !== p.customerId && uid !== p.providerUserId)
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    if (!resultFile.released && !isAdmin && uid !== p.providerUserId)
      return NextResponse.json({ error: "Not yet released" }, { status: 403 });
    filename = resultFile.filename;
  } else if (message) {
    const p = message.project;
    if (!isAdmin && uid !== p.customerId && uid !== p.providerUserId)
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    filename = message.attachmentName;
  } else if (rfq) {
    const isProvider = session.user.role === "PROVIDER";
    if (!isAdmin && !isProvider && uid !== rfq.customerId)
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    // providers only see attachments on requests they're eligible for — pending
    // board posts are limited to explicitly invited labs
    if (isProvider && rfq.visibility === "BOARD" && rfq.moderation !== "APPROVED") {
      const profile = await prisma.providerProfile.findUnique({ where: { userId: uid }, select: { id: true } });
      const invited = profile
        ? await prisma.rfqInvite.findUnique({ where: { rfqId_providerId: { rfqId: rfq.id, providerId: profile.id } } })
        : null;
      if (!invited) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    filename = rfq.attachmentName;
  } else if (payment) {
    const inv = payment.invoice;
    // payer, admin, or the invoice issuer may view the receipt
    const issuer =
      inv.issuerType === "PROVIDER" && inv.issuerId
        ? await prisma.providerProfile.findUnique({ where: { id: inv.issuerId }, select: { userId: true } })
        : inv.issuerType === "SUPPLIER" && inv.issuerId
          ? await prisma.supplierProfile.findUnique({ where: { id: inv.issuerId }, select: { userId: true } })
          : null;
    const issuerUid = issuer && "userId" in issuer ? issuer.userId : null;
    if (!isAdmin && uid !== inv.billedUserId && uid !== issuerUid)
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    filename = `receipt-${inv.number}`;
  } else {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  try {
    const buf = await readUpload(key);
    const ext = key.split(".").pop()?.toLowerCase() ?? "";

    // docx can't render natively — extract text and show a read-only preview page
    if (inline && ext === "docx") {
      const text = await docxText(buf);
      if (text != null) {
        const esc = text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
        return new NextResponse(
          `<!doctype html><html><head><meta charset="utf-8"><title>${(filename ?? "document").replace(/"/g, "")}</title>
<style>body{font-family:system-ui,sans-serif;max-width:820px;margin:40px auto;padding:0 20px;color:#1a1a1a}h1{font-size:18px}pre{white-space:pre-wrap;font-family:ui-monospace,monospace;font-size:13px;line-height:1.6;background:#f6f6f4;border:1px solid #e5e2da;border-radius:10px;padding:20px}a{color:#1d4ed8}</style></head>
<body><h1>${(filename ?? "Document").replace(/&/g, "&amp;").replace(/</g, "&lt;")}</h1><pre>${esc || "(no extractable text — download to view)"}</pre>
<p><a href="/api/files/${key}">⬇ Download original file</a></p></body></html>`,
          { headers: { "Content-Type": "text/html; charset=utf-8" } }
        );
      }
    }

    const type =
      ext === "pdf" ? "application/pdf"
      : ["png", "jpg", "jpeg", "gif", "webp", "svg"].includes(ext) ? `image/${ext === "jpg" ? "jpeg" : ext}`
      : ["txt", "csv"].includes(ext) ? "text/plain"
      : "application/octet-stream";
    const previewable = type !== "application/octet-stream" || ext === "docx";
    return new NextResponse(new Uint8Array(buf), {
      headers: {
        "Content-Type": type,
        // ?inline=1 renders in-browser for previewable types; everything else downloads
        "Content-Disposition": `${inline && previewable ? "inline" : "attachment"}; filename="${filename ?? key}"`,
      },
    });
  } catch {
    return NextResponse.json({ error: "File missing" }, { status: 404 });
  }
}
