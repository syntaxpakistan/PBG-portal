export const instant = false

import Link from "next/link";
import { notFound } from "next/navigation";
import { BadgeCheck, Clock3, AlertTriangle, Gauge, Timer, Trophy, Star, Wallet, FileText } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";
import { StatusBadge, PageHead, StatCard, SlaScore, FunnelBar } from "@/components/portal/ui";
import { pkr, slaInfo, WORK_STAGE_LABELS } from "@/lib/constants";

export default async function LabPage({ searchParams }: { searchParams: Promise<{ invited?: string }> }) {
  const { invited } = await searchParams;
  const session = await requireRole("PROVIDER");
  const profile = await prisma.providerProfile.findUnique({
    where: { userId: session.user.id },
    include: {
      quotes: { include: { rfq: { select: { refNo: true, title: true, status: true, serviceCategory: true } } }, orderBy: { createdAt: "desc" } },
      projects: {
        include: {
          rfq: { select: { title: true } },
          quote: { select: { turnaroundDays: true, estTurnaround: true } },
          resultFiles: true,
          transaction: true,
          history: { where: { status: "COMPLETED" }, select: { createdAt: true }, take: 1 },
        },
        orderBy: { createdAt: "desc" },
      },
      declines: { select: { rfqId: true } },
      invites: { select: { rfqId: true } },
      reviews: { select: { rating: true } },
    },
  });
  if (!profile) notFound();

  const approved = profile.status === "APPROVED";
  const quotedIds = new Set(profile.quotes.map((q) => q.rfqId));
  const declinedIds = new Set(profile.declines.map((d) => d.rfqId));
  const invitedIds = new Set(profile.invites.map((i) => i.rfqId));
  // routing: open RFQs this lab hasn't quoted or declined, matching its categories if declared.
  // unapproved board posts stay hidden — except to labs the customer explicitly invited
  const openRfqs = await prisma.rfq.findMany({
    where: {
      status: "OPEN",
      id: { notIn: [...quotedIds, ...declinedIds] },
      OR: [
        { visibility: "ROUTED" },
        { moderation: "APPROVED" },
        { invites: { some: { providerId: profile.id } } },
      ],
    },
    include: { _count: { select: { quotes: true } } },
    orderBy: { createdAt: "desc" },
  });
  const routed = profile.serviceCategories
    ? openRfqs.filter((r) =>
        profile.serviceCategories.split(",").some((c) =>
          r.serviceCategory.toLowerCase().includes(c.trim().toLowerCase())
        )
      )
    : openRfqs;
  const inbox = (routed.length ? routed : openRfqs).filter((r) => !invited || invitedIds.has(r.id));

  // complaints filed against this lab's projects — transparency for the provider
  const complaints = await prisma.complaint.findMany({
    where: { project: { providerId: profile.id } },
    include: { project: { select: { id: true, refNo: true } }, filedBy: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
  });

  // per-category quote outcomes — which service lines convert
  const byCategory = new Map<string, { won: number; lost: number; pending: number }>();
  for (const q of profile.quotes) {
    const cat = q.rfq.serviceCategory;
    const entry = byCategory.get(cat) ?? { won: 0, lost: 0, pending: 0 };
    if (q.status === "SELECTED") entry.won++;
    else if (q.status === "DECLINED" || q.status === "WITHDRAWN") entry.lost++;
    else entry.pending++;
    byCategory.set(cat, entry);
  }
  const catRows = [...byCategory.entries()].map(([cat, e]) => ({ cat, ...e, total: e.won + e.lost + e.pending })).sort((a, b) => b.total - a.total);

  // analytics — wins, win rate, awarded value, rating (Pro-tier insights)
  const decided = profile.quotes.filter((q) => q.status === "SELECTED" || q.status === "DECLINED");
  const wins = profile.quotes.filter((q) => q.status === "SELECTED").length;
  const winRate = decided.length ? Math.round((wins / decided.length) * 100) : null;
  const earned = profile.projects
    .filter((p) => p.status === "COMPLETED" && p.transaction)
    .reduce((n, p) => n + (p.transaction!.quotedValue - p.transaction!.feeAmount), 0);
  const avgRating = profile.reviews.length
    ? (profile.reviews.reduce((n, r) => n + r.rating, 0) / profile.reviews.length).toFixed(1)
    : null;

  // workload pipeline — what needs bench attention now
  const awaitingDecision = profile.projects.filter((p) => p.status === "OFFER_SELECTED" && !p.acceptedAt);
  const awaitingSamples = profile.projects.filter((p) => p.status === "SAMPLE_AWAITED");
  const inLab = profile.projects.filter((p) => p.status === "SAMPLE_RECEIVED" || p.status === "WORK_IN_PROGRESS");
  const overdue = profile.projects.filter((p) => {
    const s = slaInfo(p.dueAt, p.status, p.pausedAt);
    return s?.overdue;
  });
  // turnaround: median days accepted → completed (from the COMPLETED history entry)
  const completed = profile.projects.filter((p) => p.status === "COMPLETED" && p.acceptedAt);
  const completedAt = (p: (typeof profile.projects)[number]) => p.history[0]?.createdAt ?? p.updatedAt;
  const tats = completed.map((p) => (completedAt(p).getTime() - p.acceptedAt!.getTime()) / 864e5);
  const medianTat = tats.length ? Math.round(tats.sort((a, b) => a - b)[Math.floor(tats.length / 2)]) : null;
  // TAT vs promised — median actual vs median guaranteed across completed work
  const promised = completed.map((p) => p.quote.turnaroundDays).sort((a, b) => a - b);
  const medianPromised = promised.length ? promised[Math.floor(promised.length / 2)] : null;
  const tatDelta = medianTat != null && medianPromised != null ? medianTat - medianPromised : null;

  // SLA compliance score — % of due-dated projects delivered (or still) on time
  const dueDated = profile.projects.filter((p) => p.dueAt && p.status !== "CANCELLED");
  const onTime = dueDated.filter((p) => {
    if (p.status === "COMPLETED") return completedAt(p) <= p.dueAt!;
    const s = slaInfo(p.dueAt, p.status, p.pausedAt);
    return s ? !s.overdue : true;
  });
  const slaScore = dueDated.length ? Math.round((onTime.length / dueDated.length) * 100) : null;

  // quote funnel — submitted → selected → lost
  const funnel = {
    submitted: profile.quotes.length,
    selected: wins,
    lost: profile.quotes.filter((q) => q.status === "DECLINED" || q.status === "WITHDRAWN").length,
  };

  // backlog by in-lab stage — which bench step is loaded right now
  const stageBacklog = await prisma.workStage.groupBy({
    by: ["key"],
    where: { status: "ACTIVE", project: { providerId: profile.id } },
    _count: { key: true },
  });
  const maxBacklog = Math.max(1, ...stageBacklog.map((s) => s._count.key));

  return (
    <>
      <PageHead
        title={profile.orgName}
        sub={`${profile.city} · ${profile.platforms}`}
        action={<StatusBadge status={profile.status} />}
      />

      {profile.status === "PENDING" && (
        <Banner icon={<Clock3 className="size-4" />} tone="yellow"
          text="Verification in progress — Syntax reviews your credentials before RFQs route to you. You'll be notified on approval." />
      )}
      {profile.status === "REJECTED" && (
        <Banner icon={<AlertTriangle className="size-4" />} tone="red"
          text={`Application declined${profile.statusNote ? `: ${profile.statusNote}` : ""}. Contact admin@syntaxlife.pk.`} />
      )}
      {profile.status === "SUSPENDED" && (
        <Banner icon={<AlertTriangle className="size-4" />} tone="red"
          text={`Account suspended${profile.statusNote ? `: ${profile.statusNote}` : ""}. Contact admin@syntaxlife.pk.`} />
      )}

      {/* workload pipeline — LIMS-style */}
      {(awaitingDecision.length > 0 || awaitingSamples.length > 0 || inLab.length > 0 || overdue.length > 0) && (
        <div className="mb-8 grid gap-3 sm:grid-cols-4">
          <PipelineCard n={awaitingDecision.length} label="Awaiting your decision" tone="blue" />
          <PipelineCard n={awaitingSamples.length} label="Samples on the way" tone="blue" />
          <PipelineCard n={inLab.length} label="In the lab" tone="green" />
          <PipelineCard n={overdue.length} label="Past due date" tone="red" />
        </div>
      )}
      {awaitingDecision.length > 0 && (
        <div className="mb-6 flex items-center gap-2.5 rounded-xl border border-(--st-blue-bd) bg-(--st-blue-bg) px-4 py-3 text-[13px] font-medium text-(--st-blue-fg)">
          {awaitingDecision.length} award{awaitingDecision.length === 1 ? "" : "s"} waiting for your accept/decline — open the project to decide.
        </div>
      )}
      {overdue.length > 0 && (
        <div className="mb-6 flex items-center gap-2.5 rounded-xl border border-(--st-red-bd) bg-(--st-red-bg) px-4 py-3 text-[13px] font-medium text-(--st-red-fg)">
          <AlertTriangle className="size-4" /> {overdue.length} project{overdue.length === 1 ? " is" : "s are"} past the quoted turnaround — update status or message the customer.
        </div>
      )}

      <div className="mb-6 grid gap-4 sm:grid-cols-3 lg:grid-cols-6">
        <StatCard label="Quotes submitted" value={profile.quotes.length} icon={<FileText className="size-4" />} />
        <StatCard label="Active projects" value={profile.projects.filter((p) => p.status !== "COMPLETED" && p.status !== "CANCELLED").length} />
        <StatCard label="Win rate" value={winRate != null ? `${winRate}%` : "—"} sub={`${wins} won`} icon={<Trophy className="size-4" />} />
        <StatCard label="Earned (completed)" value={earned ? pkr(earned) : "—"} sub="after platform fee" icon={<Wallet className="size-4" />} />
        <StatCard label="Median TAT" value={medianTat != null ? `${medianTat}d` : "—"} sub={tatDelta != null ? (tatDelta <= 0 ? `${Math.abs(tatDelta)}d ahead of quote` : `${tatDelta}d over quote`) : "accept → complete"} icon={<Timer className="size-4" />} />
        <StatCard label="Rating" value={avgRating ? `${avgRating} ★` : "—"} sub={`${profile.reviews.length} reviews`} icon={<Star className="size-4" />} />
      </div>

      {/* performance — SLA score, funnel, bench backlog */}
      <div className="mb-8 grid gap-4 lg:grid-cols-3">
        <div className="card flex items-center gap-5 p-5">
          <SlaScore pct={slaScore} />
          <div>
            <div className="text-[11.5px] font-semibold uppercase tracking-[0.1em] text-muted">SLA compliance</div>
            <div className="mt-1 text-[12.5px] text-body">
              {slaScore == null ? "No due-dated projects yet" : `${onTime.length}/${dueDated.length} projects on time`}
            </div>
            <div className="mt-0.5 flex items-center gap-1 text-[11px] text-muted"><Gauge className="size-3" /> on-time delivery vs quoted TAT</div>
          </div>
        </div>
        <div className="card p-5">
          <div className="mb-3 text-[11.5px] font-semibold uppercase tracking-[0.1em] text-muted">Quote funnel</div>
          <div className="space-y-2">
            <FunnelBar label="Submitted" value={funnel.submitted} max={funnel.submitted} tone="bg-(--st-blue-bd) text-(--st-blue-fg)" />
            <FunnelBar label="Selected" value={funnel.selected} max={funnel.submitted} tone="bg-(--st-green-bd) text-(--st-green-fg)" />
            <FunnelBar label="Not selected" value={funnel.lost} max={funnel.submitted} tone="bg-paper-2 text-body" />
          </div>
        </div>
        <div className="card p-5">
          <div className="mb-3 text-[11.5px] font-semibold uppercase tracking-[0.1em] text-muted">Bench backlog</div>
          {stageBacklog.length === 0 ? (
            <p className="py-3 text-center text-[12px] text-muted">No in-lab stages active right now.</p>
          ) : (
            <div className="space-y-2">
              {stageBacklog.map((s) => (
                <div key={s.key} className="flex items-center gap-3">
                  <span className="w-28 shrink-0 text-right text-[11.5px] font-medium text-body">{WORK_STAGE_LABELS[s.key] ?? s.key}</span>
                  <div className="h-5 flex-1 rounded-md bg-paper-2">
                    <div className="flex h-5 items-center justify-end rounded-md bg-navy/85 px-2 text-[10.5px] font-semibold text-yellow" style={{ width: `${Math.max(10, (s._count.key / maxBacklog) * 100)}%` }}>
                      {s._count.key}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {catRows.length > 0 && (
        <div className="card mb-8 p-5">
          <div className="mb-3 text-[11.5px] font-semibold uppercase tracking-[0.1em] text-muted">Win rate by service category</div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {catRows.map((c) => {
              const decidedCat = c.won + c.lost;
              const rate = decidedCat ? Math.round((c.won / decidedCat) * 100) : null;
              return (
                <div key={c.cat} className="rounded-lg bg-paper-2 px-4 py-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[12.5px] font-medium text-ink">{c.cat}</span>
                    <span className="font-display text-[15px] font-medium text-ink">{rate != null ? `${rate}%` : "—"}</span>
                  </div>
                  <div className="mt-1 text-[11px] text-muted">{c.won} won · {c.lost} lost · {c.pending} pending</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {complaints.length > 0 && (
        <div className="card mb-8 overflow-hidden">
          <div className="border-b border-line px-5 py-3.5"><h3 className="text-[14px] font-semibold text-ink">Complaints on your projects</h3></div>
          <div className="divide-y divide-line">
            {complaints.map((c) => (
              <div key={c.id} className="flex items-start justify-between gap-4 px-5 py-3.5">
                <div>
                  {c.project ? (
                    <Link href={`/lab/projects/${c.project.id}`} className="text-[13px] font-medium text-ink hover:text-blue">{c.subject} <span className="font-normal text-muted">· {c.project.refNo}</span></Link>
                  ) : (
                    <span className="text-[13px] font-medium text-ink">{c.subject}</span>
                  )}
                  <div className="mt-0.5 text-[11.5px] text-muted">filed by {c.filedBy.name} · {c.createdAt.toLocaleDateString()}</div>
                  {c.resolution && <p className="mt-1.5 rounded-md bg-(--st-green-bg) px-2.5 py-1.5 text-[11.5px] text-(--st-green-fg)">Resolution: {c.resolution}</p>}
                </div>
                <StatusBadge status={c.status} />
              </div>
            ))}
          </div>
        </div>
      )}

      {complaints.some((c) => c.status !== "RESOLVED" && c.status !== "DISMISSED") && (
        <div className="mb-6 flex items-center gap-2.5 rounded-xl border border-(--st-red-bd) bg-(--st-red-bg) px-4 py-3 text-[13px] font-medium text-(--st-red-fg)">
          <AlertTriangle className="size-4" /> A customer complaint on one of your projects is under Syntax review — see below.
        </div>
      )}

      <h2 id="rfqs" className="mb-3 flex items-center gap-3 text-[15px] font-semibold text-ink">
        Incoming RFQs
        {routed.length > 0 && <span className="text-[11.5px] font-normal text-green">routed to your capabilities</span>}
        <span className="ml-auto flex gap-1.5">
          <Link href="/lab/rfqs" className="rounded-full px-3 py-1 text-[11.5px] font-medium border border-line text-body hover:bg-paper-2">All →</Link>
          <Link href="/lab/rfqs?invited=1" className="rounded-full px-3 py-1 text-[11.5px] font-medium border border-line text-body hover:bg-paper-2">Invited only →</Link>
        </span>
      </h2>
      <div className="card mb-8 overflow-hidden">
        <div className="divide-y divide-line">
          {!approved && <p className="px-5 py-8 text-center text-[13px] text-muted">RFQs appear here once you&rsquo;re verified.</p>}
          {approved && inbox.length === 0 && <p className="px-5 py-8 text-center text-[13px] text-muted">No open RFQs right now — you&rsquo;ll be emailed when one routes to you.</p>}
          {approved && inbox.map((r) => (
            <Link key={r.id} href={`/lab/rfqs/${r.id}`} className="flex items-center justify-between px-5 py-4 transition-colors hover:bg-paper-2">
              <div>
                <div className="text-[13.5px] font-medium text-ink">{r.title}</div>
                <div className="mt-0.5 text-[11.5px] text-muted">
                  {r.refNo} · {r.organism} · {r.sampleCount} × {r.sampleType} · {r.serviceCategory}
                </div>
              </div>
              <div className="flex items-center gap-3">
                {invitedIds.has(r.id) && <span className="rounded-full bg-(--st-blue-bg) px-2.5 py-1 text-[10.5px] font-semibold text-(--st-blue-fg)">Invited</span>}
                {r.budgetHint && <span className="text-[12px] text-body">{r.budgetHint}</span>}
                <span className="text-[11px] text-muted">{r._count.quotes} quotes so far (hidden)</span>
                <span className="btn-outline !px-3 !py-1.5 text-[11.5px]">Quote →</span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card overflow-hidden">
          <div className="border-b border-line px-5 py-3.5"><h3 className="text-[14px] font-semibold text-ink">Your quotes</h3></div>
          <div className="divide-y divide-line">
            {profile.quotes.length === 0 && <p className="px-5 py-6 text-center text-[12.5px] text-muted">No quotes yet.</p>}
            {profile.quotes.map((q) => (
              <div key={q.id} className="flex items-center justify-between px-5 py-3">
                <div>
                  <div className="text-[13px] font-medium text-ink">{q.rfq.refNo} — {q.rfq.title}</div>
                  <div className="text-[11.5px] text-muted">{pkr(q.price + q.taxAmount)} · {q.turnaroundDays} days</div>
                </div>
                <StatusBadge status={q.status} />
              </div>
            ))}
          </div>
        </div>
        <div className="card overflow-hidden">
          <div className="flex items-center justify-between border-b border-line px-5 py-3.5">
            <h3 id="projects" className="text-[14px] font-semibold text-ink">Projects</h3>
            <Link href="/lab/projects" className="text-[12px] font-medium text-blue hover:underline">View all →</Link>
          </div>
          <div className="divide-y divide-line">
            {profile.projects.length === 0 && <p className="px-5 py-6 text-center text-[12.5px] text-muted">Awarded projects appear here.</p>}
            {profile.projects.map((p) => {
              const sla = slaInfo(p.dueAt, p.status, p.pausedAt);
              return (
              <Link key={p.id} href={`/lab/projects/${p.id}`} className="flex items-center justify-between px-5 py-3 transition-colors hover:bg-paper-2">
                <div>
                  <div className="text-[13px] font-medium text-ink">{p.refNo} — {p.rfq.title}</div>
                  <div className="text-[11.5px] text-muted">
                    {p.resultFiles.length} deliverable{p.resultFiles.length === 1 ? "" : "s"}
                    {sla && (sla.paused
                      ? <span className="ml-2 font-semibold text-(--st-orange-fg)">paused</span>
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

function Banner({ icon, text, tone }: { icon: React.ReactNode; text: string; tone: "yellow" | "red" | "green" }) {
  const tones = {
    yellow: "border-(--st-amber-bd) bg-(--st-amber-bg) text-(--st-amber-fg)",
    red: "border-(--st-red-bd) bg-(--st-red-bg) text-(--st-red-fg)",
    green: "border-(--st-green-bd) bg-(--st-green-bg) text-(--st-green-fg)",
  };
  return (
    <div className={`mb-6 flex items-center gap-2.5 rounded-xl border px-4 py-3 text-[13px] font-medium ${tones[tone]}`}>
      {icon} {text}
    </div>
  );
}

function PipelineCard({ n, label, tone }: { n: number; label: string; tone: "blue" | "green" | "red" }) {
  const tones = {
    blue: "border-(--st-blue-bd) bg-(--st-blue-bg) text-(--st-blue-fg)",
    green: "border-(--st-green-bd) bg-(--st-green-bg) text-(--st-green-fg)",
    red: "border-(--st-red-bd) bg-(--st-red-bg) text-(--st-red-fg)",
  };
  return (
    <div className={`rounded-xl border px-4 py-3 ${tones[tone]}`}>
      <div className="font-display text-[24px] font-semibold leading-none">{n}</div>
      <div className="mt-1 text-[11.5px] font-medium">{label}</div>
    </div>
  );
}
