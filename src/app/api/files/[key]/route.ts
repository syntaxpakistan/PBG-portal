import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { readUpload } from "@/lib/files";

/**
 * Secure document download. A storage key is only served if the caller is a
 * legitimate party: project customer / assigned lab / admin — or, for RFQ
 * attachments, the customer / any approved provider / admin.
 */
export async function GET(_req: NextRequest, { params }: { params: Promise<{ key: string }> }) {
  const { key } = await params;
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const uid = session.user.id;
  const isAdmin = session.user.role === "ADMIN";

  // check which entity owns this key
  const [resultFile, message, rfq] = await Promise.all([
    prisma.resultFile.findFirst({ where: { storageKey: key }, include: { project: true } }),
    prisma.message.findFirst({ where: { attachmentKey: key }, include: { project: true } }),
    prisma.rfq.findFirst({ where: { attachmentKey: key } }),
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
  } else {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  try {
    const buf = await readUpload(key);
    return new NextResponse(new Uint8Array(buf), {
      headers: {
        "Content-Type": "application/octet-stream",
        "Content-Disposition": `attachment; filename="${filename ?? key}"`,
      },
    });
  } catch {
    return NextResponse.json({ error: "File missing" }, { status: 404 });
  }
}
