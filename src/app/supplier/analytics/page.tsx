export const instant = false

import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";
import { PageHead, StatCard, FunnelBar } from "@/components/portal/ui";
import { pkr } from "@/lib/constants";

export default async function SupplierAnalyticsPage() {
  const session = await requireRole("SUPPLIER");
  const profile = await prisma.supplierProfile.findUniqueOrThrow({
    where: { userId: session.user.id },
    include: {
      products: { select: { id: true, name: true, prodNo: true, active: true, _count: { select: { enquiries: true } } } },
      enquiries: { select: { status: true, quotedPrice: true, qty: true, createdAt: true } },
    },
  });

  const count = (s: string) => profile.enquiries.filter((e) => e.status === s).length;
  const [open, quoted, invoiced, paid, fulfilled] = [count("OPEN"), count("QUOTED"), count("INVOICED"), count("PAID"), count("FULFILLED")];
  const funnelMax = Math.max(profile.enquiries.length, 1);

  const revenue = await prisma.invoice.aggregate({
    where: { issuerType: "SUPPLIER", issuerId: profile.id, status: "PAID" },
    _sum: { total: true },
  });
  const pendingRevenue = await prisma.invoice.aggregate({
    where: { issuerType: "SUPPLIER", issuerId: profile.id, status: { in: ["ISSUED", "PARTIALLY_PAID"] } },
    _sum: { total: true },
  });
  const payouts = await prisma.payout.aggregate({
    where: { payeeType: "SUPPLIER", payeeId: profile.id, status: "PAID" },
    _sum: { netAmount: true },
  });

  const avgResponse = profile.enquiries.length
    ? Math.round((quoted + invoiced + paid + fulfilled) / profile.enquiries.length * 100)
    : 0;
  const topProducts = [...profile.products].sort((a, b) => b._count.enquiries - a._count.enquiries).slice(0, 5);

  return (
    <>
      <PageHead title="Supplier analytics" sub="Your catalogue performance, enquiry funnel and collections." />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Enquiries" value={profile.enquiries.length} sub={`${avgResponse}% answered`} />
        <StatCard label="Orders" value={paid + fulfilled} sub={`${fulfilled} delivered`} />
        <StatCard label="Collected" value={pkr(revenue._sum.total ?? 0)} sub="paid invoices" />
        <StatCard label="Paid out" value={pkr(payouts._sum.netAmount ?? 0)} sub={`${pkr(pendingRevenue._sum.total ?? 0)} awaiting payment`} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card p-5">
          <h3 className="mb-4 text-[14px] font-semibold text-ink">Enquiry funnel</h3>
          <div className="space-y-3">
            <FunnelBar label="Received" value={profile.enquiries.length} max={funnelMax} tone="bg-(--st-blue-bg) text-(--st-blue-fg)" />
            <FunnelBar label="Awaiting reply" value={open} max={funnelMax} tone="bg-(--st-amber-bg) text-(--st-amber-fg)" />
            <FunnelBar label="Offers sent" value={quoted} max={funnelMax} tone="bg-(--st-blue-bg) text-(--st-blue-fg)" />
            <FunnelBar label="Invoiced" value={invoiced} max={funnelMax} tone="bg-paper-2 text-body" />
            <FunnelBar label="Paid" value={paid} max={funnelMax} tone="bg-(--st-green-bg) text-(--st-green-fg)" />
            <FunnelBar label="Delivered" value={fulfilled} max={funnelMax} tone="bg-(--st-green-bg) text-(--st-green-fg)" />
          </div>
          {profile.enquiries.length === 0 && (
            <p className="mt-4 text-[12.5px] text-muted">Enquiries arrive when buyers request your products on the marketplace, keep listings complete with photos and datasheets to convert more.</p>
          )}
        </div>

        <div className="card p-5">
          <h3 className="mb-4 text-[14px] font-semibold text-ink">Top products by enquiries</h3>
          {topProducts.length === 0 && <p className="text-[12.5px] text-muted">No products yet, list your first product on the Overview page.</p>}
          <div className="divide-y divide-line">
            {topProducts.map((p) => (
              <div key={p.id} className="flex items-center justify-between py-2.5">
                <div>
                  <div className="text-[13px] font-medium text-ink">{p.name}</div>
                  <div className="font-mono text-[11px] text-muted">{p.prodNo}{!p.active ? " · hidden" : ""}</div>
                </div>
                <span className="text-[13px] font-semibold text-ink">{p._count.enquiries} enquir{p._count.enquiries === 1 ? "y" : "ies"}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
