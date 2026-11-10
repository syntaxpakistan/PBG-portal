export const instant = false

import { connection } from "next/server";
import { prisma } from "@/lib/prisma";
import { PageHead } from "@/components/portal/ui";
import { pkr } from "@/lib/constants";

function Bar({ pct, tone = "var(--st-blue-fg)" }: { pct: number; tone?: string }) {
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-paper-2">
      <div className="h-full rounded-full transition-all" style={{ width: `${Math.min(100, Math.max(2, pct))}%`, background: tone }} />
    </div>
  );
}

function monthKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export default async function ReportsPage() {
  await connection();
  const sixMoAgo = new Date();
  sixMoAgo.setMonth(sixMoAgo.getMonth() - 5);
  sixMoAgo.setDate(1);
  sixMoAgo.setHours(0, 0, 0, 0);

  const [
    feesAll, gmvAll, paidTxnCount, txnMonthRows,
    rfqTotal, rfqQuoted, rfqAwarded, projectsDone, paymentsConfirmed,
    usersByRole, verifiedLabs, verifiedSuppliers,
    providers, enquiriesByStatus, subsByPlan, productsCount, servicesCount,
  ] = await Promise.all([
    prisma.transaction.aggregate({ where: { status: "PAID" }, _sum: { feeAmount: true } }),
    prisma.transaction.aggregate({ where: { status: { in: ["INVOICED", "PAID"] } }, _sum: { quotedValue: true } }),
    prisma.transaction.count({ where: { status: "PAID" } }),
    prisma.transaction.findMany({
      where: { createdAt: { gte: sixMoAgo } },
      select: { createdAt: true, feeAmount: true, quotedValue: true, status: true },
    }),
    prisma.rfq.count(),
    prisma.rfq.count({ where: { quotes: { some: {} } } }),
    prisma.rfq.count({ where: { status: "AWARDED" } }),
    prisma.project.count({ where: { status: "COMPLETED" } }),
    prisma.payment.count({ where: { status: "CONFIRMED" } }),
    prisma.user.groupBy({ by: ["role"], _count: true }),
    prisma.providerProfile.count({ where: { status: "APPROVED" } }),
    prisma.supplierProfile.count({ where: { status: "APPROVED" } }),
    prisma.transaction.findMany({
      where: { status: { in: ["INVOICED", "PAID"] } },
      select: { quotedValue: true, project: { select: { provider: { select: { orgName: true } } } }, enquiry: { select: { supplier: { select: { orgName: true } } } } },
    }),
    prisma.enquiry.groupBy({ by: ["status"], _count: true }),
    prisma.subscription.groupBy({ by: ["plan", "status"], _count: true }),
    prisma.product.count({ where: { active: true } }),
    prisma.serviceListing.count({ where: { active: true, moderation: "APPROVED" } }),
  ]);

  // ---- monthly buckets (last 6 months) ----
  const months: { key: string; label: string; fees: number; gmv: number; count: number }[] = [];
  for (let i = 0; i < 6; i++) {
    const d = new Date(sixMoAgo);
    d.setMonth(d.getMonth() + i);
    months.push({ key: monthKey(d), label: d.toLocaleString("en", { month: "short" }), fees: 0, gmv: 0, count: 0 });
  }
  for (const t of txnMonthRows) {
    const m = months.find((x) => x.key === monthKey(t.createdAt));
    if (!m) continue;
    if (t.status === "PAID") { m.fees += t.feeAmount; m.count++; }
    if (t.status === "INVOICED" || t.status === "PAID") m.gmv += t.quotedValue;
  }
  const maxFee = Math.max(1, ...months.map((m) => m.fees));

  // ---- funnel ----
  const funnel = [
    { label: "RFQs posted", n: rfqTotal },
    { label: "Received ≥1 quote", n: rfqQuoted },
    { label: "Awarded", n: rfqAwarded },
    { label: "Projects completed", n: projectsDone },
    { label: "Payments confirmed", n: paymentsConfirmed },
  ];
  const funnelMax = Math.max(1, funnel[0].n);

  // ---- users by role ----
  const roleMap = Object.fromEntries(usersByRole.map((u) => [u.role, u._count]));
  const roleRows = [
    { label: "Customers", n: roleMap.CUSTOMER ?? 0, sub: "" },
    { label: "Labs / providers", n: roleMap.PROVIDER ?? 0, sub: `${verifiedLabs} verified` },
    { label: "Suppliers", n: roleMap.SUPPLIER ?? 0, sub: `${verifiedSuppliers} verified` },
    { label: "Admins", n: roleMap.ADMIN ?? 0, sub: "" },
  ];
  const roleMax = Math.max(1, ...roleRows.map((r) => r.n));

  // ---- top partners by billed volume ----
  const byOrg = new Map<string, number>();
  for (const t of providers) {
    const org = t.project?.provider.orgName ?? t.enquiry?.supplier.orgName;
    if (org) byOrg.set(org, (byOrg.get(org) ?? 0) + t.quotedValue);
  }
  const topOrgs = [...byOrg.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);
  const topMax = Math.max(1, ...topOrgs.map(([, v]) => v));

  // ---- enquiry funnel ----
  const enqMap = Object.fromEntries(enquiriesByStatus.map((e) => [e.status, e._count]));
  const enqRows = [
    { label: "Sent", n: Object.values(enqMap).reduce((a, b) => a + b, 0) },
    { label: "Quoted", n: (enqMap.QUOTED ?? 0) + (enqMap.INVOICED ?? 0) + (enqMap.PAID ?? 0) + (enqMap.FULFILLED ?? 0) },
    { label: "Paid", n: (enqMap.PAID ?? 0) + (enqMap.FULFILLED ?? 0) },
    { label: "Fulfilled", n: enqMap.FULFILLED ?? 0 },
  ];
  const enqMax = Math.max(1, enqRows[0].n);

  // ---- subscription MRR by plan ----
  const activeSubs = subsByPlan.filter((s) => s.status === "ACTIVE");
  const planRows = ["BASIC", "PRO", "CUSTOM"].map((p) => ({ plan: p, n: activeSubs.filter((s) => s.plan === p).reduce((a, s) => a + s._count, 0) })).filter((r) => r.n > 0);
  const planMax = Math.max(1, ...planRows.map((r) => r.n));

  return (
    <>
      <PageHead title="Reports" sub="Revenue, marketplace liquidity and network growth — the business layer of the Gateway." />

      {/* headline */}
      <div className="mb-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Fees collected (all time)", value: pkr(feesAll._sum.feeAmount ?? 0), sub: `${paidTxnCount} settled transactions` },
          { label: "Marketplace volume", value: pkr(gmvAll._sum.quotedValue ?? 0), sub: "invoiced + settled GMV" },
          { label: "Live catalogue", value: servicesCount + productsCount, sub: `${servicesCount} services · ${productsCount} products` },
          { label: "Verified network", value: verifiedLabs + verifiedSuppliers, sub: `${verifiedLabs} labs · ${verifiedSuppliers} suppliers` },
        ].map((s) => (
          <div key={s.label} className="card relative overflow-hidden px-4 py-3.5">
            <div className="absolute inset-y-0 left-0 w-[3px] bg-gradient-to-b from-navy/60 to-green/60" />
            <div className="text-[10.5px] font-semibold uppercase tracking-[0.1em] text-muted">{s.label}</div>
            <div className="font-display mt-1 text-[22px] font-medium tracking-tight text-ink">{s.value}</div>
            <div className="mt-0.5 text-[11px] text-body">{s.sub}</div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        {/* monthly revenue */}
        <div className="card p-5">
          <h3 className="text-[14px] font-semibold text-ink">Fees collected — last 6 months</h3>
          <div className="mt-4 space-y-3">
            {months.map((m) => (
              <div key={m.key} className="flex items-center gap-3">
                <span className="w-10 shrink-0 text-[11.5px] font-medium text-muted">{m.label}</span>
                <div className="min-w-0 flex-1"><Bar pct={(m.fees / maxFee) * 100} /></div>
                <span className="w-24 shrink-0 text-right text-[12px] font-medium text-ink">{pkr(m.fees)}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 flex items-center justify-between border-t border-line pt-3 text-[11.5px] text-muted">
            <span>GMV (invoiced+paid): {months.map((m) => pkr(m.gmv)).join(" · ")}</span>
          </div>
        </div>

        {/* RFQ funnel */}
        <div className="card p-5">
          <h3 className="text-[14px] font-semibold text-ink">Sequencing pipeline — RFQ → payment</h3>
          <div className="mt-4 space-y-3">
            {funnel.map((f, i) => (
              <div key={f.label} className="flex items-center gap-3">
                <span className="w-36 shrink-0 text-[12px] text-body">{f.label}</span>
                <div className="min-w-0 flex-1"><Bar pct={(f.n / funnelMax) * 100} tone={i === funnel.length - 1 ? "var(--st-green-fg)" : "var(--st-blue-fg)"} /></div>
                <span className="w-20 shrink-0 text-right text-[12px] font-semibold text-ink">
                  {f.n}
                  {i > 0 && funnel[0].n > 0 && <span className="ml-1 font-normal text-muted">({Math.round((f.n / funnelMax) * 100)}%)</span>}
                </span>
              </div>
            ))}
          </div>
          <p className="mt-4 border-t border-line pt-3 text-[11.5px] leading-relaxed text-muted">
            Award rate {(funnelMax && Math.round((rfqAwarded / funnelMax) * 100)) || 0}% · quote coverage {funnelMax ? Math.round((rfqQuoted / funnelMax) * 100) : 0}% — quote coverage below ~70% means routing needs attention.
          </p>
        </div>

        {/* users by role */}
        <div className="card p-5">
          <h3 className="text-[14px] font-semibold text-ink">Network composition</h3>
          <div className="mt-4 space-y-3">
            {roleRows.map((r) => (
              <div key={r.label} className="flex items-center gap-3">
                <span className="w-32 shrink-0 text-[12px] text-body">{r.label}</span>
                <div className="min-w-0 flex-1"><Bar pct={(r.n / roleMax) * 100} tone="var(--st-purple-fg)" /></div>
                <span className="w-24 shrink-0 text-right text-[12px] font-semibold text-ink">{r.n} <span className="font-normal text-muted">{r.sub}</span></span>
              </div>
            ))}
          </div>
          {planRows.length > 0 && (
            <div className="mt-5 border-t border-line pt-4">
              <h4 className="mb-3 text-[12px] font-semibold uppercase tracking-wider text-muted">Active subscriptions by plan</h4>
              <div className="space-y-2.5">
                {planRows.map((r) => (
                  <div key={r.plan} className="flex items-center gap-3">
                    <span className="w-32 shrink-0 text-[12px] text-body">{r.plan}</span>
                    <div className="min-w-0 flex-1"><Bar pct={(r.n / planMax) * 100} tone="var(--st-amber-fg)" /></div>
                    <span className="w-24 shrink-0 text-right text-[12px] font-semibold text-ink">{r.n}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* supply funnel + top partners */}
        <div className="space-y-6">
          <div className="card p-5">
            <h3 className="text-[14px] font-semibold text-ink">Supply marketplace — enquiry → fulfilment</h3>
            <div className="mt-4 space-y-3">
              {enqRows.map((f) => (
                <div key={f.label} className="flex items-center gap-3">
                  <span className="w-24 shrink-0 text-[12px] text-body">{f.label}</span>
                  <div className="min-w-0 flex-1"><Bar pct={(f.n / enqMax) * 100} tone="var(--st-orange-fg)" /></div>
                  <span className="w-16 shrink-0 text-right text-[12px] font-semibold text-ink">{f.n}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="card p-5">
            <h3 className="text-[14px] font-semibold text-ink">Top partners by billed volume</h3>
            {topOrgs.length === 0 && <p className="mt-4 text-[12.5px] text-muted">No billed transactions yet.</p>}
            <div className="mt-4 space-y-3">
              {topOrgs.map(([org, v], i) => (
                <div key={org} className="flex items-center gap-3">
                  <span className="grid size-6 shrink-0 place-items-center rounded-full bg-paper-2 text-[10.5px] font-bold text-muted">{i + 1}</span>
                  <span className="w-40 shrink-0 truncate text-[12.5px] font-medium text-ink">{org}</span>
                  <div className="min-w-0 flex-1"><Bar pct={(v / topMax) * 100} tone="var(--st-green-fg)" /></div>
                  <span className="w-24 shrink-0 text-right text-[12px] font-semibold text-ink">{pkr(v)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
