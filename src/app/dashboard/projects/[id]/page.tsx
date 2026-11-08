export const instant = false

import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";
import { PageHead, StageTracker, StatusBadge, StageLadder } from "@/components/portal/ui";
import { HistoryTimeline, MessageThread, ResultFilesCard } from "@/components/portal/project-parts";
import { PauseCircle, FlaskConical } from "lucide-react";
import { completeProject, fileComplaint, payMilestone, submitReview, shipSamples, resolveQc } from "@/lib/actions/marketplace";
import { pkr, slaInfo, QC_STAGE_LABELS } from "@/lib/constants";

export default async function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await requireRole("CUSTOMER");
  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      rfq: true,
      quote: true,
      provider: { select: { orgName: true, city: true } },
      history: { include: { changedBy: { select: { name: true } } }, orderBy: { createdAt: "asc" } },
      messages: { include: { sender: { select: { name: true, role: true } } }, orderBy: { createdAt: "asc" } },
      resultFiles: { where: { released: true }, orderBy: { createdAt: "desc" } },
      transaction: true,
      milestones: { orderBy: { createdAt: "asc" } },
      review: true,
      workStages: { orderBy: { sort: "asc" } },
      qcRecords: { orderBy: { createdAt: "desc" } },
    },
  });
  if (!project || project.customerId !== session.user.id) notFound();

  const canComplete = project.status === "RESULTS_AVAILABLE";
  const complete = completeProject.bind(null, project.id);
  const complain = fileComplaint.bind(null, project.id);
  const review = submitReview.bind(null, project.id);
  const ship = shipSamples.bind(null, project.id);
  const sla = slaInfo(project.dueAt, project.status, project.pausedAt);
  const pendingQc = project.qcRecords.filter((q) => q.decision === null);

  return (
    <>
      <PageHead
        title={`${project.refNo} — ${project.rfq.title}`}
        sub={`${project.provider.orgName} (${project.provider.city}) · awarded ${pkr(project.quote.price + project.quote.taxAmount)} · ${project.quote.turnaroundDays}-day turnaround${project.poNumber ? ` · PO ${project.poNumber}` : ""}`}
        action={<StatusBadge status={project.status} />}
      />
      <div className="card mb-6 overflow-x-auto p-5">
        <StageTracker status={project.status} />
      </div>
      {project.status === "OFFER_SELECTED" && !project.acceptedAt && (
        <div className="mb-6 flex items-center gap-2.5 rounded-xl border border-(--st-amber-bd) bg-(--st-amber-bg) px-4 py-3 text-[13px] font-medium text-(--st-amber-fg)">
          Waiting for the lab to confirm the award — they review and accept before work begins. If they decline, your other quotes reopen.
        </div>
      )}
      {sla && (
        <div className={`mb-6 flex items-center gap-2.5 rounded-xl border px-4 py-3 text-[13px] font-medium ${sla.overdue ? "border-(--st-red-bd) bg-(--st-red-bg) text-(--st-red-fg)" : sla.paused ? "border-(--st-orange-bd) bg-(--st-orange-bg) text-(--st-orange-fg)" : "border-line bg-surface text-body"}`}>
          {sla.paused
            ? <>Turnaround clock is paused — {sla.days} day{sla.days === 1 ? "" : "s"} remaining when work resumes.{project.pausedFor === "CUSTOMER" && " The lab is waiting on you."}</>
            : sla.overdue
            ? `This project is ${Math.abs(sla.days)} day${Math.abs(sla.days) === 1 ? "" : "s"} past the quoted turnaround — you can message the lab or raise a complaint below.`
            : `Quoted turnaround: due ${sla.dueAt.toLocaleDateString()} · ${sla.days} day${sla.days === 1 ? "" : "s"} remaining${project.quote.estTurnaround ? ` · lab estimate ${project.quote.estTurnaround}d` : ""}`}
        </div>
      )}
      {project.pausedAt && (
        <div className="mb-6 flex items-center gap-2.5 rounded-xl border border-(--st-orange-bd) bg-(--st-orange-bg) px-4 py-3 text-[13px] font-medium text-(--st-orange-fg)">
          <PauseCircle className="size-4" />
          Work paused {project.pausedAt.toLocaleDateString()} — waiting on {project.pausedFor === "CUSTOMER" ? "you" : "the lab"}
          {project.pauseReason && <span className="font-normal">· {project.pauseReason}</span>}
        </div>
      )}

      {/* QC decision gate — flagged metrics need the customer's call */}
      {pendingQc.length > 0 && (
        <div className="card mb-6 border-(--st-red-bd) p-5">
          <h3 className="text-[14px] font-semibold text-ink">QC decision needed</h3>
          <p className="mt-1 text-[12px] text-muted">The lab flagged a QC gate. Proceed under disclaimer, send replacement samples, or cancel.</p>
          <div className="mt-3 space-y-3">
            {pendingQc.map((q) => (
              <div key={q.id} className="rounded-xl border border-(--st-red-bd) bg-(--st-red-bg)/40 p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[13px] font-semibold text-ink">{QC_STAGE_LABELS[q.stage] ?? q.stage}</span>
                  <StatusBadge status={q.result} />
                  <span className="text-[11.5px] text-body">
                    {q.concentration != null && `${q.concentration} ng/µL · `}
                    {q.rin != null && `RIN ${q.rin} · `}
                    {q.ratio != null && `260/280 ${q.ratio} · `}
                    {q.instrument && `${q.instrument} · `}
                    {q.note}
                  </span>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <form action={resolveQc.bind(null, q.id, "PROCEED")}>
                    <button type="submit" className="btn-primary !py-2 text-[12px]">Proceed anyway — sign disclaimer</button>
                  </form>
                  {q.stage === "SAMPLE_QC" && (
                    <form action={resolveQc.bind(null, q.id, "RESEND")}>
                      <button type="submit" className="btn-outline !py-2 text-[12px]">I&apos;ll send replacement samples</button>
                    </form>
                  )}
                  <form action={resolveQc.bind(null, q.id, "CANCEL")}>
                    <button type="submit" className="rounded-lg border border-(--st-red-bd) px-4 py-2 text-[12px] font-medium text-(--st-red-fg) hover:bg-(--st-red-bg)">Cancel project</button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* sample shipping — chain of custody */}
      {project.status === "SAMPLE_AWAITED" && (
        <div className="card mb-6 p-5">
          <h3 className="text-[14px] font-semibold text-ink">Ship your samples</h3>
          {project.shippedAt ? (
            <p className="mt-1.5 text-[12.5px] text-body">
              Logged as shipped {project.shippedAt.toLocaleDateString()} via <span className="font-medium text-ink">{project.shipmentCourier ?? "courier"}</span>
              {project.trackingNo && <> · tracking <span className="font-mono text-[12px] text-ink">{project.trackingNo}</span></>}
              <span className="block mt-1 text-[11.5px] text-muted">The lab will log receipt + sample QC when the package arrives.</span>
            </p>
          ) : (
            <form action={ship} className="mt-3 flex flex-wrap items-end gap-3">
              <div>
                <label className="mb-1 block text-[11.5px] font-medium text-ink">Courier *</label>
                <input name="courier" required placeholder="TCS, Leopard, M&P, DHL…" className="w-48 rounded-lg border border-line bg-surface px-3 py-2 text-[13px] text-ink outline-none focus:border-navy-3" />
              </div>
              <div>
                <label className="mb-1 block text-[11.5px] font-medium text-ink">Tracking #</label>
                <input name="trackingNo" placeholder="e.g. 7788991234" className="w-48 rounded-lg border border-line bg-surface px-3 py-2 text-[13px] text-ink outline-none focus:border-navy-3" />
              </div>
              <button type="submit" className="btn-primary !py-2.5">Mark samples shipped</button>
            </form>
          )}
        </div>
      )}
      {project.sampleQc && (
        <div className={`mb-6 flex items-center gap-2.5 rounded-xl border px-4 py-3 text-[13px] font-medium ${project.sampleQc === "PASS" ? "border-(--st-green-bd) bg-(--st-green-bg) text-(--st-green-fg)" : project.sampleQc === "PARTIAL" ? "border-(--st-amber-bd) bg-(--st-amber-bg) text-(--st-amber-fg)" : "border-(--st-red-bd) bg-(--st-red-bg) text-(--st-red-fg)"}`}>
          Sample QC: {project.sampleQc === "PASS" ? "all samples passed" : project.sampleQc === "PARTIAL" ? "partial pass — some flagged" : "failed — unusable"}
          {project.sampleQcNote && <span className="font-normal">· {project.sampleQcNote}</span>}
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-2">
        <div className="space-y-6">
          {project.workStages.length > 0 && (
            <div className="card p-5">
              <h3 className="mb-4 flex items-center gap-2 text-[14px] font-semibold text-ink">
                <FlaskConical className="size-4 text-muted" /> Lab progress
              </h3>
              <StageLadder stages={project.workStages} paused={!!project.pausedAt} />
            </div>
          )}
          {project.qcRecords.length > 0 && (
            <div className="card p-5">
              <h3 className="mb-3 text-[14px] font-semibold text-ink">QC results</h3>
              <div className="space-y-2">
                {project.qcRecords.map((q) => (
                  <div key={q.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-paper-2 px-4 py-2.5">
                    <div className="text-[12.5px]">
                      <span className="font-medium text-ink">{QC_STAGE_LABELS[q.stage] ?? q.stage}</span>
                      <span className="text-muted">
                        {q.concentration != null && ` · ${q.concentration} ng/µL`}
                        {q.rin != null && ` · RIN ${q.rin}`}
                        {q.ratio != null && ` · ${q.ratio} (260/280)`}
                        {q.instrument && ` · ${q.instrument}`}
                        {q.note && ` · ${q.note}`}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <StatusBadge status={q.result} />
                      <span className="text-[11px] text-muted">{q.createdAt.toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          <HistoryTimeline history={project.history} />
          {project.milestones.length > 0 && (
            <div className="card p-5">
              <h3 className="mb-3 text-[14px] font-semibold text-ink">Milestones</h3>
              <div className="space-y-2">
                {project.milestones.map((m) => (
                  <div key={m.id} className="flex items-center justify-between rounded-lg bg-paper-2 px-4 py-2.5">
                    <div>
                      <div className="text-[13px] font-medium text-ink">{m.title}</div>
                      <div className="text-[11px] text-muted">{pkr(m.amount)}{m.dueDate ? ` · due ${m.dueDate.toLocaleDateString()}` : ""}{m.paidAt ? ` · paid ${m.paidAt.toLocaleDateString()}` : ""}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <StatusBadge status={m.status} />
                      {m.status === "INVOICED" && (
                        <form action={payMilestone.bind(null, m.id)}>
                          <button type="submit" className="btn-primary !px-3 !py-1.5 text-[11px]">Mark paid</button>
                        </form>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {project.status === "COMPLETED" && (
            <div className="card p-5">
              <h3 className="text-[14px] font-semibold text-ink">Rate this provider</h3>
              {project.review ? (
                <p className="mt-2 text-[13px] text-body">
                  You rated <span className="font-semibold text-ink">{project.review.rating}/5</span>
                  {project.review.comment ? ` — “${project.review.comment}”` : ""}
                </p>
              ) : (
                <form action={review} className="mt-3 space-y-3">
                  <div className="flex items-center gap-3">
                    <select name="rating" required className="rounded-lg border border-line bg-surface px-3 py-2 text-[13px] text-ink outline-none focus:border-navy-3">
                      <option value="">Rating…</option>
                      {[5, 4, 3, 2, 1].map((r) => <option key={r} value={r}>{r} ★</option>)}
                    </select>
                    <input name="comment" placeholder="How was the work? (optional)" className="w-full rounded-lg border border-line bg-surface px-3 py-2 text-[13px] text-ink outline-none focus:border-navy-3" />
                  </div>
                  <button type="submit" className="btn-outline !py-2 text-[12.5px]">Submit review</button>
                </form>
              )}
              <p className="mt-2 text-[11px] text-muted">Reviews appear on the provider&apos;s public registry profile.</p>
            </div>
          )}
          {project.transaction && (
            <div className="card p-5">
              <h3 className="mb-3 text-[14px] font-semibold text-ink">Commercials</h3>
              <dl className="space-y-1.5 text-[13px]">
                <div className="flex justify-between"><dt className="text-body">Quoted value</dt><dd className="font-medium text-ink">{pkr(project.transaction.quotedValue)}</dd></div>
                <div className="flex justify-between"><dt className="text-body">Platform fee ({project.transaction.feePercent}%)</dt><dd className="font-medium text-ink">{pkr(project.transaction.feeAmount)}</dd></div>
                <div className="flex justify-between"><dt className="text-body">Fee status</dt><dd><StatusBadge status={project.transaction.status} /></dd></div>
              </dl>
            </div>
          )}
        </div>
        <div className="space-y-6">
          <ResultFilesCard files={project.resultFiles} />
          <MessageThread projectId={project.id} messages={project.messages} currentUserId={session.user.id} />
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        {canComplete && (
          <form action={complete}>
            <button type="submit" className="btn-primary !py-2.5">Mark completed</button>
          </form>
        )}
        <details className="card px-5 py-3">
          <summary className="cursor-pointer text-[13px] font-medium text-ink">Raise a complaint</summary>
          <form action={complain} className="mt-3 space-y-3">
            <input name="subject" required placeholder="Subject" className="w-72 rounded-lg border border-line px-3 py-2 text-[13px] outline-none focus:border-navy-3" />
            <textarea name="details" required rows={3} placeholder="What went wrong?" className="w-72 rounded-lg border border-line px-3 py-2 text-[13px] outline-none focus:border-navy-3" />
            <button type="submit" className="btn-outline block !py-2 text-[12.5px]">Submit complaint</button>
          </form>
        </details>
      </div>
    </>
  );
}
