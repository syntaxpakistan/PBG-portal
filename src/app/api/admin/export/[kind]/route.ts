import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ kind: string }> }) {
  const { kind } = await params;
  const session = await getSession();
  if (!session || session.user.role !== "ADMIN") return NextResponse.json({ error: "Admin only" }, { status: 403 });

  let csv = "";
  const esc = (v: unknown) => `"${String(v ?? "").replaceAll('"', '""')}"`;

  if (kind === "transactions") {
    const rows = await prisma.transaction.findMany({
      include: {
        project: { select: { refNo: true, customer: { select: { name: true, email: true } }, provider: { select: { orgName: true } } } },
        enquiry: { select: { buyer: { select: { name: true } }, supplier: { select: { orgName: true } } } },
      },
      orderBy: { createdAt: "desc" },
    });
    csv = ["txn_no,project,customer,provider,quoted_value_pkr,fee_percent,fee_amount_pkr,status,date"].join(",") + "\n" +
      rows.map((t) => [t.txnNo, t.project?.refNo ?? "supply-sale", t.project?.customer.name ?? t.enquiry?.buyer.name ?? "", t.project?.provider.orgName ?? t.enquiry?.supplier.orgName ?? "", t.quotedValue, t.feePercent, t.feeAmount, t.status, t.createdAt.toISOString()].map(esc).join(",")).join("\n");
  } else if (kind === "audit") {
    const rows = await prisma.auditLog.findMany({ include: { actor: { select: { name: true, email: true } } }, orderBy: { createdAt: "desc" }, take: 5000 });
    csv = ["timestamp,actor,action,entity,entity_id,detail"].join(",") + "\n" +
      rows.map((l) => [l.createdAt.toISOString(), `${l.actor.name} <${l.actor.email}>`, l.action, l.entity, l.entityId, l.meta].map(esc).join(",")).join("\n");
  } else if (kind === "rfqs") {
    const rows = await prisma.rfq.findMany({
      include: { customer: { select: { name: true } }, _count: { select: { quotes: true } }, project: { select: { refNo: true } } },
      orderBy: { createdAt: "desc" },
    });
    csv = ["ref,title,customer,organism,samples,category,quotes,status,project,date"].join(",") + "\n" +
      rows.map((r) => [r.refNo, r.title, r.customer.name, r.organism, r.sampleCount, r.serviceCategory, r._count.quotes, r.status, r.project?.refNo ?? "", r.createdAt.toISOString()].map(esc).join(",")).join("\n");
  } else {
    return NextResponse.json({ error: "Unknown export" }, { status: 404 });
  }

  await prisma.auditLog.create({
    data: { actorId: session.user.id, action: "EXPORT_CSV", entity: kind, entityId: kind },
  });
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="pbg-${kind}-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
