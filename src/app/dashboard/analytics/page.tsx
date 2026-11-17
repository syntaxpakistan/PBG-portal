export const instant = false

import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";
import { hasAnalyticsAccess } from "@/lib/entitlements";
import { getAnalyticsAddonPrice } from "@/lib/settings";
import { PageHead, StatCard, FunnelBar } from "@/components/portal/ui";
import { AnalyticsGate } from "@/components/portal/analytics-gate";
import { pkr } from "@/lib/constants";

export default async function CustomerAnalyticsPage() {
  const session = await requireRole("CUSTOMER");

  if (!(await hasAnalyticsAccess(session.user.id))) {
    const pending = await prisma.addOn.findFirst({
      where: { userId: session.user.id, kind: "ANALYTICS", status: "PENDING_PAYMENT" },
      include: { invoice: { select: { number: true } } },
    });
    return <AnalyticsGate price={await getAnalyticsAddonPrice()} pendingInvoiceNo={pending?.invoice?.number} />;
  }

  const [rfqs, openRfqs, quotes, awarded, projects, completed, paidInvoices] = await Promise.all([
    prisma.rfq.count({ where: { customerId: session.user.id } }),
    prisma.rfq.count({ where: { customerId: session.user.id, status: "OPEN" } }),
    prisma.quote.count({ where: { rfq: { customerId: session.user.id } } }),
    prisma.quote.count({ where: { rfq: { customerId: session.user.id }, status: "SELECTED" } }),
    prisma.project.count({ where: { customerId: session.user.id } }),
    prisma.project.count({ where: { customerId: session.user.id, status: "COMPLETED" } }),
    prisma.invoice.findMany({
      where: { billedUserId: session.user.id, status: "PAID" },
      select: { total: true, currency: true },
    }),
  ]);

  const spendPkr = paidInvoices.reduce((n, inv) => n + inv.total, 0);
  const avgQuotes = rfqs ? (quotes / rfqs).toFixed(1) : "0";
  const awardRate = rfqs ? Math.round((awarded / rfqs) * 100) : 0;

  return (
    <>
      <PageHead title="Client analytics" sub="Your RFQ activity, quote response and spend — Pro-plan reporting." />
      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="RFQs posted" value={rfqs} sub={`${openRfqs} still open`} />
        <StatCard label="Quotes received" value={quotes} sub={`avg ${avgQuotes} per RFQ`} />
        <StatCard label="Projects" value={projects} sub={`${completed} completed · ${awardRate}% award rate`} />
        <StatCard
          label="Total spend"
          value={spendPkr ? pkr(spendPkr) : "—"}
          sub={spendPkr ? "paid invoices" : "no paid invoices yet"}
        />
      </div>
      <div className="card p-5">
        <h3 className="mb-4 text-[14px] font-semibold text-ink">RFQ → award funnel</h3>
        <div className="space-y-2.5">
          <FunnelBar label="RFQs posted" value={rfqs} max={Math.max(rfqs, 1)} tone="bg-navy" />
          <FunnelBar label="Quotes received" value={quotes} max={Math.max(quotes, rfqs, 1)} tone="bg-(--st-blue-fg)" />
          <FunnelBar label="Projects awarded" value={awarded} max={Math.max(quotes, 1)} tone="bg-(--st-green-fg)" />
          <FunnelBar label="Completed" value={completed} max={Math.max(projects, 1)} tone="bg-(--st-purple-fg)" />
        </div>
        {rfqs === 0 && (
          <p className="mt-4 text-[12px] text-muted">
            Post your first RFQ under <Link href="/dashboard/rfqs/new" className="font-medium text-blue hover:underline">New RFQ</Link> to start seeing analytics.
          </p>
        )}
      </div>
    </>
  );
}
