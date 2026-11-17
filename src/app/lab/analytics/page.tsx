export const instant = false

import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";
import { hasAnalyticsAccess } from "@/lib/entitlements";
import { getAnalyticsAddonPrice } from "@/lib/settings";
import { PageHead, StatCard, FunnelBar } from "@/components/portal/ui";
import { AnalyticsGate } from "@/components/portal/analytics-gate";
import { pkr } from "@/lib/constants";

export default async function LabAnalyticsPage() {
  const session = await requireRole("PROVIDER");
  const profile = await prisma.providerProfile.findUnique({ where: { userId: session.user.id } });
  if (!profile) notFound();

  if (!(await hasAnalyticsAccess(session.user.id))) {
    const pending = await prisma.addOn.findFirst({
      where: { userId: session.user.id, kind: "ANALYTICS", status: "PENDING_PAYMENT" },
      include: { invoice: { select: { number: true } } },
    });
    return <AnalyticsGate price={await getAnalyticsAddonPrice()} pendingInvoiceNo={pending?.invoice?.number} />;
  }

  const [quotes, wonQuotes, projects, completed, milestones, history] = await Promise.all([
    prisma.quote.count({ where: { providerId: profile.id } }),
    prisma.quote.count({ where: { providerId: profile.id, status: "SELECTED" } }),
    prisma.project.count({ where: { providerId: profile.id } }),
    prisma.project.count({ where: { providerId: profile.id, status: "COMPLETED" } }),
    prisma.milestone.findMany({ where: { project: { providerId: profile.id } }, select: { amount: true, status: true } }),
    prisma.statusHistory.findMany({
      where: { status: "COMPLETED", project: { providerId: profile.id, acceptedAt: { not: null } } },
      include: { project: { select: { acceptedAt: true, dueAt: true, refNo: true } } },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
  ]);

  const invoiced = milestones.reduce((n, m) => n + m.amount, 0);
  const collected = milestones.filter((m) => m.status === "PAID").reduce((n, m) => n + m.amount, 0);
  const tatDays = history
    .map((h) => (h.project.acceptedAt ? (h.createdAt.getTime() - h.project.acceptedAt.getTime()) / 864e5 : null))
    .filter((d): d is number => d != null && d >= 0);
  const avgTat = tatDays.length ? (tatDays.reduce((a, b) => a + b, 0) / tatDays.length).toFixed(1) : "—";
  const onTime = history.filter((h) => h.project.dueAt && h.createdAt <= h.project.dueAt).length;
  const onTimePct = history.length ? Math.round((onTime / history.length) * 100) : null;
  const winRate = quotes ? Math.round((wonQuotes / quotes) * 100) : 0;

  return (
    <>
      <PageHead title="Lab analytics" sub="Quote performance, turnaround and collections — Pro-plan reporting." />
      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Quotes submitted" value={quotes} sub={`${wonQuotes} won · ${winRate}% win rate`} />
        <StatCard label="Projects" value={projects} sub={`${completed} completed`} />
        <StatCard label="Avg turnaround" value={avgTat === "—" ? "—" : `${avgTat}d`} sub={onTimePct != null ? `${onTimePct}% on-time` : undefined} />
        <StatCard label="Invoiced" value={pkr(invoiced)} sub={`${pkr(collected)} collected`} />
      </div>
      <div className="card p-5">
        <h3 className="mb-4 text-[14px] font-semibold text-ink">Quote → award funnel</h3>
        <div className="space-y-2.5">
          <FunnelBar label="Quotes" value={quotes} max={Math.max(quotes, 1)} tone="bg-navy" />
          <FunnelBar label="Won" value={wonQuotes} max={Math.max(quotes, 1)} tone="bg-(--st-green-fg)" />
          <FunnelBar label="Completed" value={completed} max={Math.max(projects, 1)} tone="bg-(--st-blue-fg)" />
        </div>
        {history.length > 0 && (
          <p className="mt-4 text-[12px] text-muted">
            On-time delivery: {onTime}/{history.length} completed projects met their SLA due date.
          </p>
        )}
      </div>
    </>
  );
}
