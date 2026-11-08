export const instant = false

import Link from "next/link";
import { FileText, FolderKanban, Package, CreditCard, Inbox, ArrowRight, Wallet, FlaskConical, AlertTriangle, PauseCircle } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";
import { StatusBadge, PageHead, StatCard, StageTracker } from "@/components/portal/ui";
import { pkr, slaInfo } from "@/lib/constants";

export default async function DashboardPage() {
  const session = await requireRole("CUSTOMER");
  const uid = session.user.id;
  const [rfqs, projects] = await Promise.all([
    prisma.rfq.findMany({
      where: { customerId: uid },
      include: { _count: { select: { quotes: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.project.findMany({
      where: { customerId: uid },
      include: {
        provider: { select: { orgName: true } },
        resultFiles: { where: { released: true } },
        transaction: true,
        milestones: true,
        qcRecords: { where: { decision: null } },
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);
  const quotesToReview = rfqs.reduce((n, r) => n + (r.status === "OPEN" ? r._count.quotes : 0), 0);

  // needs-attention feed — what the customer should do right now
  type Action = { label: string; detail: string; href: string; tone: "blue" | "yellow" | "green" };
  const actions: Action[] = [
    ...rfqs.filter((r) => r.status === "OPEN" && r._count.quotes > 0).map((r) => ({
      label: "Compare quotes", detail: `${r._count.quotes} quote${r._count.quotes === 1 ? "" : "s"} on ${r.refNo}`, href: `/dashboard/rfqs/${r.id}`, tone: "blue" as const,
    })),
    ...projects.filter((p) => p.status === "SAMPLE_AWAITED" && !p.shippedAt).map((p) => ({
      label: "Ship samples", detail: `${p.refNo} · lab is waiting`, href: `/dashboard/projects/${p.id}`, tone: "yellow" as const,
    })),
    ...projects.filter((p) => p.qcRecords.length > 0).map((p) => ({
      label: "QC decision", detail: `${p.refNo} · lab flagged a QC gate`, href: `/dashboard/projects/${p.id}`, tone: "yellow" as const,
    })),
    ...projects.filter((p) => p.pausedAt && p.pausedFor === "CUSTOMER").map((p) => ({
      label: "Lab waiting on you", detail: `${p.refNo} · clock paused`, href: `/dashboard/projects/${p.id}`, tone: "yellow" as const,
    })),
    ...projects.filter((p) => p.status === "RESULTS_AVAILABLE").map((p) => ({
      label: "Review results", detail: `${p.refNo} · ${p.resultFiles.length} deliverable${p.resultFiles.length === 1 ? "" : "s"} ready`, href: `/dashboard/projects/${p.id}`, tone: "green" as const,
    })),
    ...projects.flatMap((p) => p.milestones.filter((m) => m.status === "INVOICED").map((m) => ({
      label: "Pay milestone", detail: `${p.refNo} · ${m.title} — ${pkr(m.amount)}`, href: `/dashboard/projects/${p.id}`, tone: "yellow" as const,
    }))),
    ...projects.filter((p) => { const s = slaInfo(p.dueAt, p.status, p.pausedAt); return s?.overdue; }).map((p) => ({
      label: "Follow up — overdue", detail: `${p.refNo} is past the quoted turnaround`, href: `/dashboard/projects/${p.id}`, tone: "yellow" as const,
    })),
  ];
  const spent = projects.filter((p) => p.status === "COMPLETED" && p.transaction).reduce((n, p) => n + p.transaction!.quotedValue, 0);

  return (
    <>
      <PageHead
        title={`Salaam, ${session.user.name?.split(" ")[0] ?? "there"}`}
        sub="Your RFQs, quotes and active projects."
        action={<Link href="/dashboard/rfqs/new" className="btn-primary !py-2.5">New RFQ</Link>}
      />
      <div className="mb-8 grid gap-4 sm:grid-cols-4">
        <StatCard label="RFQs submitted" value={rfqs.length} icon={<FileText className="size-4" />} />
        <StatCard label="Quotes awaiting review" value={quotesToReview} icon={<Inbox className="size-4" />} />
        <StatCard label="Active projects" value={projects.filter((p) => p.status !== "COMPLETED" && p.status !== "CANCELLED").length} icon={<FlaskConical className="size-4" />} />
        <StatCard label="Total spend" value={spent ? pkr(spent) : "—"} sub="completed projects" icon={<Wallet className="size-4" />} />
      </div>

      {/* needs your attention */}
      {actions.length > 0 && (
        <div className="card mb-8 overflow-hidden">
          <div className="border-b border-line px-5 py-3.5">
            <h2 className="text-[14px] font-semibold text-ink">Needs your attention</h2>
          </div>
          <div className="divide-y divide-line">
            {actions.slice(0, 6).map((a, i) => (
              <Link key={i} href={a.href} className="flex items-center justify-between px-5 py-3.5 transition-colors hover:bg-paper-2">
                <div className="flex items-center gap-3">
                  <span className={`grid size-8 place-items-center rounded-lg ${a.tone === "blue" ? "bg-(--st-blue-bg) text-(--st-blue-fg)" : a.tone === "green" ? "bg-(--st-green-bg) text-(--st-green-fg)" : "bg-(--st-amber-bg) text-(--st-amber-fg)"}`}>
                    {a.label.startsWith("Ship") ? <Package className="size-4" /> : a.label.startsWith("Pay") ? <CreditCard className="size-4" /> : <Inbox className="size-4" />}
                  </span>
                  <div>
                    <div className="text-[13px] font-medium text-ink">{a.label}</div>
                    <div className="text-[11.5px] text-muted">{a.detail}</div>
                  </div>
                </div>
                <ArrowRight className="size-4 text-muted" />
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* RFQs */}
        <div className="card overflow-hidden">
          <div className="flex items-center justify-between border-b border-line px-5 py-3.5">
            <h2 className="flex items-center gap-2 text-[14px] font-semibold text-ink"><FileText className="size-4 text-muted" /> Your RFQs</h2>
            <Link href="/dashboard/rfqs" className="text-[12px] font-medium text-blue hover:underline">View all →</Link>
          </div>
          <div className="divide-y divide-line">
            {rfqs.length === 0 && <p className="px-5 py-8 text-center text-[13px] text-muted">No RFQs yet — submit your first request.</p>}
            {rfqs.map((r) => (
              <Link key={r.id} href={`/dashboard/rfqs/${r.id}`} className="flex items-center justify-between px-5 py-3.5 transition-colors hover:bg-paper-2">
                <div>
                  <div className="text-[13.5px] font-medium text-ink">{r.title}</div>
                  <div className="mt-0.5 text-[11.5px] text-muted">{r.refNo} · {r.serviceCategory} · {r.sampleCount} samples</div>
                </div>
                <div className="flex items-center gap-3">
                  {r._count.quotes > 0 && (
                    <span className="rounded-full bg-navy px-2 py-0.5 text-[10.5px] font-semibold text-yellow">{r._count.quotes} quotes</span>
                  )}
                  <StatusBadge status={r.status} />
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Projects */}
        <div className="card overflow-hidden">
          <div className="flex items-center justify-between border-b border-line px-5 py-3.5">
            <h2 className="flex items-center gap-2 text-[14px] font-semibold text-ink"><FolderKanban className="size-4 text-muted" /> Projects</h2>
            <Link href="/dashboard/projects" className="text-[12px] font-medium text-blue hover:underline">View all →</Link>
          </div>
          <div className="divide-y divide-line">
            {projects.length === 0 && <p className="px-5 py-8 text-center text-[13px] text-muted">No projects yet — award a quote to begin.</p>}
            {projects.map((p) => {
              const sla = slaInfo(p.dueAt, p.status, p.pausedAt);
              return (
              <Link key={p.id} href={`/dashboard/projects/${p.id}`} className="flex items-center justify-between px-5 py-3.5 transition-colors hover:bg-paper-2">
                <div>
                  <div className="text-[13.5px] font-medium text-ink">{p.refNo} · {p.provider.orgName}</div>
                  <div className="mt-0.5 text-[11.5px] text-muted">
                    {p.resultFiles.length} deliverable{p.resultFiles.length === 1 ? "" : "s"}
                    {sla && (sla.paused
                      ? <span className="ml-2 inline-flex items-center gap-1 font-semibold text-(--st-orange-fg)"><PauseCircle className="size-3" />paused</span>
                      : sla.overdue
                      ? <span className="ml-2 font-semibold text-(--st-red-fg)">{Math.abs(sla.days)}d overdue</span>
                      : <span className="ml-2">due in {sla.days}d</span>)}
                  </div>
                </div>
                <StatusBadge status={p.status} />
              </Link>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}
