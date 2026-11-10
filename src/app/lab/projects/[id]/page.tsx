export const instant = false

import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";
import { PageHead, StageTracker, StatusBadge, StageLadder } from "@/components/portal/ui";
import { HistoryTimeline, MessageThread } from "@/components/portal/project-parts";
import { FileLink } from "@/components/portal/file-link";
import { PauseCircle, Lock, FlaskConical } from "lucide-react";
import { advanceProjectStatus, addResultFile, addMilestone, invoiceMilestone, receiveSamples } from "@/lib/actions/marketplace";
import { pkr, STAGE_LABELS, PROJECT_STAGES, stageIndex, slaInfo, QC_STAGE_LABELS, QC_DECISION_LABELS, WORK_STAGE_LABELS } from "@/lib/constants";
import { StatusUpdateButtons, ResultUploadForm, AwardDecision, StageControls, QcForm, PauseControls, ReleaseButton, InternalsForm } from "./controls";
import { SubmitButton } from "@/components/portal/submit-button";

export default async function LabProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await requireRole("PROVIDER");
  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      rfq: true,
      quote: true,
      customer: { select: { name: true, email: true } },
      history: { include: { changedBy: { select: { name: true } } }, orderBy: { createdAt: "asc" } },
      messages: { include: { sender: { select: { name: true, role: true } } }, orderBy: { createdAt: "asc" } },
      resultFiles: { orderBy: { createdAt: "desc" } },
      milestones: { orderBy: { createdAt: "asc" } },
      workStages: { orderBy: { sort: "asc" } },
      qcRecords: { orderBy: { createdAt: "desc" } },
    },
  });
  if (!project || project.providerUserId !== session.user.id) notFound();

  const idx = stageIndex(project.status);
  const nextStage = idx >= 0 && idx < PROJECT_STAGES.length - 1 ? PROJECT_STAGES[idx + 1] : null;
  const awaitingDecision = project.status === "OFFER_SELECTED" && !project.acceptedAt;
  const addMs = addMilestone.bind(null, project.id);
  const receive = receiveSamples.bind(null, project.id);
  const sla = slaInfo(project.dueAt, project.status, project.pausedAt);
  const paused = !!project.pausedAt;
  const live = project.acceptedAt && project.status !== "CANCELLED" && project.status !== "COMPLETED";

  return (
    <>
      <PageHead
        title={`${project.refNo} — ${project.rfq.title}`}
        sub={`Customer: ${project.customer.name} · awarded ${pkr(project.quote.price + project.quote.taxAmount)}`}
        action={<StatusBadge status={project.status} />}
      />
      <div className="card mb-6 overflow-x-auto p-5">
        <StageTracker status={project.status} />
        {sla && (
          <div className={`mt-3 flex items-center gap-2 text-[12.5px] font-medium ${sla.overdue ? "text-(--st-red-fg)" : sla.paused ? "text-(--st-orange-fg)" : "text-body"}`}>
            {sla.paused
              ? `Clock paused — ${sla.days}d remaining on resume · due ${sla.dueAt.toLocaleDateString()} (will shift)`
              : sla.overdue
              ? `⚠ ${Math.abs(sla.days)} day${Math.abs(sla.days) === 1 ? "" : "s"} past quoted turnaround (due ${sla.dueAt.toLocaleDateString()})`
              : `Turnaround SLA: due ${sla.dueAt.toLocaleDateString()} · ${sla.days} day${sla.days === 1 ? "" : "s"} remaining${project.quote.estTurnaround ? ` · est. ${project.quote.estTurnaround}d` : ""}`}
          </div>
        )}
      </div>

      {/* original RFQ attachment — stays accessible after award since the RFQ page closes */}
      {project.rfq.attachmentName && (
        <div className="mb-6">
          <FileLink storageKey={project.rfq.attachmentKey} filename={project.rfq.attachmentName} label={`RFQ attachment: ${project.rfq.attachmentName}`} />
        </div>
      )}

      {/* pause banner / controls */}
      {paused && live && (
        <div className="mb-6 flex items-center justify-between gap-3 rounded-xl border border-(--st-orange-bd) bg-(--st-orange-bg) px-4 py-3">
          <span className="flex items-center gap-2 text-[13px] font-medium text-(--st-orange-fg)">
            <PauseCircle className="size-4" />
            Paused — waiting on {project.pausedFor === "CUSTOMER" ? "the customer" : "lab (internal)"}
            {project.pauseReason && <span className="font-normal">· {project.pauseReason}</span>}
          </span>
          <PauseControls projectId={project.id} paused />
        </div>
      )}
      {!paused && live && project.status !== "OFFER_SELECTED" && (
        <div className="card mb-6 p-4">
          <PauseControls projectId={project.id} paused={false} />
        </div>
      )}

      {/* sample receipt + QC — chain of custody */}
      {project.status === "SAMPLE_AWAITED" && (
        <div className="card mb-6 p-5">
          <h3 className="text-[14px] font-semibold text-ink">Receive samples</h3>
          {project.shippedAt ? (
            <p className="mt-1 text-[12.5px] text-body">
              Customer shipped {project.shippedAt.toLocaleDateString()} via <span className="font-medium text-ink">{project.shipmentCourier ?? "courier"}</span>
              {project.trackingNo && <> · tracking <span className="font-mono text-[12px] text-ink">{project.trackingNo}</span></>}
            </p>
          ) : (
            <p className="mt-1 text-[12.5px] text-muted">Customer hasn&apos;t logged a shipment yet.</p>
          )}
          <form action={receive} className="mt-4 flex flex-wrap items-end gap-3">
            <div>
              <label className="mb-1 block text-[11.5px] font-medium text-ink">Receipt QC *</label>
              <select name="sampleQc" required className="rounded-lg border border-line bg-surface px-3 py-2 text-[13px] text-ink outline-none focus:border-navy-3">
                <option value="PASS">Pass — all samples good</option>
                <option value="PARTIAL">Partial — some flagged</option>
                <option value="FAIL">Fail — unusable</option>
              </select>
            </div>
            <input name="qcNote" placeholder="QC note (e.g. 22/24 FFPE passed DV200)" className="w-72 rounded-lg border border-line bg-surface px-3 py-2 text-[13px] text-ink outline-none focus:border-navy-3" />
            <SubmitButton className="btn-primary !py-2.5">Log receipt + QC</SubmitButton>
          </form>
        </div>
      )}

      {awaitingDecision && <AwardDecision projectId={project.id} />}

      {/* in-lab pipeline — editable ladder + QC gates */}
      {project.workStages.length > 0 && (
        <div className="card mb-6 p-5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-[14px] font-semibold text-ink">
              <FlaskConical className="size-4 text-muted" /> Lab workflow
            </h3>
            <span className="text-[11px] text-muted">visible to the customer as live progress</span>
          </div>
          <ol className="space-y-0">
            {project.workStages.map((s, i) => {
              const last = i === project.workStages.length - 1;
              return (
                <li key={s.id} className="relative flex gap-3 pb-4 last:pb-0">
                  {!last && <span className={`absolute left-[11px] top-6 h-full w-0.5 ${s.status === "DONE" ? "bg-green" : "bg-line"}`} />}
                  <span className={`z-10 grid size-6 shrink-0 place-items-center rounded-full border-2 ${
                    s.status === "DONE" ? "border-green bg-green text-navy"
                    : s.status === "ACTIVE" ? paused ? "border-(--st-orange-bd) bg-(--st-orange-bg) text-(--st-orange-fg)" : "border-navy-3 bg-(--st-blue-bg) text-(--st-blue-fg)"
                    : s.status === "SKIPPED" ? "border-line bg-paper-2 text-muted"
                    : "border-line bg-surface text-muted/50"
                  }`}>
                    {s.status === "DONE" ? "✓" : i + 1}
                  </span>
                  <div className="min-w-0 flex-1 pt-0.5">
                    <div className="flex flex-wrap items-baseline gap-2">
                      <span className={`text-[13px] font-medium ${s.status === "PENDING" ? "text-muted" : "text-ink"}`}>
                        {WORK_STAGE_LABELS[s.key] ?? s.key}
                      </span>
                      {s.doneAt && <span className="text-[10.5px] text-muted">{s.doneAt.toLocaleDateString()}</span>}
                      {(s.operator || s.note) && (
                        <span className="text-[11px] text-body">{[s.operator, s.note].filter(Boolean).join(" · ")}</span>
                      )}
                    </div>
                    <StageControls projectId={project.id} stageKey={s.key} status={s.status} />
                  </div>
                </li>
              );
            })}
          </ol>

          {/* QC gate log + capture */}
          <div className="mt-5 border-t border-line pt-4">
            <h4 className="text-[13px] font-semibold text-ink">QC records</h4>
            {project.qcRecords.length === 0 && <p className="mt-1 text-[12px] text-muted">No QC records yet — log sample QC after receipt and library QC before the run.</p>}
            <div className="mt-2 space-y-2">
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
                    {q.decision && q.decision !== "PROCEED" && <span className="text-[11px] text-muted">{QC_DECISION_LABELS[q.decision] ?? q.decision}</span>}
                    {q.decision === null && <span className="rounded-full bg-(--st-amber-bg) px-2 py-0.5 text-[10.5px] font-semibold text-(--st-amber-fg)">awaiting customer</span>}
                  </div>
                </div>
              ))}
            </div>
            <QcForm projectId={project.id} stages={["SAMPLE_QC", "LIBRARY_QC"]} />
          </div>
        </div>
      )}

      {/* lab internals — never shown to the customer */}
      {project.acceptedAt && (
        <div className="card mb-6 p-5">
          <h3 className="flex items-center gap-2 text-[14px] font-semibold text-ink">
            <Lock className="size-4 text-muted" /> Lab internals <span className="text-[11px] font-normal text-muted">— hidden from customer</span>
          </h3>
          <InternalsForm
            projectId={project.id}
            defaults={{ internalId: project.internalId, storageLoc: project.storageLoc, disposalAt: project.disposalAt }}
          />
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-2">
        <div className="space-y-6">
          {/* milestones / partial invoicing */}
          {!awaitingDecision && project.status !== "CANCELLED" && (
            <div className="card p-5">
              <h3 className="text-[14px] font-semibold text-ink">Milestones &amp; invoicing</h3>
              <p className="mb-4 mt-1 text-[12px] text-muted">Plan partial payments tied to deliverables — invoice each when the stage is reached.</p>
              <div className="space-y-2">
                {project.milestones.map((m) => (
                  <div key={m.id} className="flex items-center justify-between rounded-lg bg-paper-2 px-4 py-2.5">
                    <div>
                      <div className="text-[13px] font-medium text-ink">{m.title}</div>
                      <div className="text-[11px] text-muted">{pkr(m.amount)}{m.dueDate ? ` · due ${m.dueDate.toLocaleDateString()}` : ""}{m.paidAt ? ` · paid ${m.paidAt.toLocaleDateString()}` : ""}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <StatusBadge status={m.status} />
                      {m.status === "PLANNED" && (
                        <form action={invoiceMilestone.bind(null, m.id)}>
                          <SubmitButton className="btn-outline !px-3 !py-1.5 text-[11px]">Invoice</SubmitButton>
                        </form>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <form action={addMs} className="mt-4 flex flex-wrap items-end gap-2 border-t border-line pt-4">
                <input name="title" required placeholder="e.g. Library prep complete" className="w-44 rounded-lg border border-line bg-surface px-3 py-2 text-[12.5px] text-ink outline-none focus:border-navy-3" />
                <input name="amount" type="number" required min={1} placeholder="PKR" className="w-28 rounded-lg border border-line bg-surface px-3 py-2 text-[12.5px] text-ink outline-none focus:border-navy-3" />
                <input name="dueDate" type="date" className="rounded-lg border border-line bg-surface px-3 py-2 text-[12.5px] text-ink outline-none focus:border-navy-3" />
                <SubmitButton className="btn-outline !py-2 text-[12px]">Add milestone</SubmitButton>
              </form>
            </div>
          )}
          {/* status advance */}
          {nextStage && project.status !== "RESULTS_AVAILABLE" && (
            <div className="card p-5">
              <h3 className="mb-3 text-[14px] font-semibold text-ink">Advance status</h3>
              <StatusUpdateButtons projectId={project.id} nextStage={nextStage} />
            </div>
          )}
          {/* result upload */}
          {project.status !== "COMPLETED" && project.status !== "CANCELLED" && (
            <div className="card p-5">
              <h3 className="mb-1 text-[14px] font-semibold text-ink">Deliver results</h3>
              <p className="mb-4 text-[12px] text-muted">
                Upload drafts freely — the customer sees nothing until you press <span className="font-medium text-ink">Release</span>.
                Raw data (FASTQ/BAM/VCF) is sent out-of-band — never hosted here.
              </p>
              <ResultUploadForm projectId={project.id} />
              {project.resultFiles.length > 0 && (
                <div className="mt-4 space-y-2 border-t border-line pt-4">
                  {project.resultFiles.map((f) => (
                    <div key={f.id} className="flex items-center justify-between rounded-lg bg-paper-2 px-4 py-2.5 text-[12.5px]">
                      <div>
                        <span className="font-medium text-ink">{f.filename}</span>
                        {f.version > 1 && <span className="ml-1.5 text-[10.5px] text-muted">v{f.version}</span>}
                        {f.releasedAt && <span className="ml-1.5 text-[10.5px] text-muted">· released {f.releasedAt.toLocaleDateString()}</span>}
                      </div>
                      <div className="flex flex-wrap items-center justify-end gap-2">
                        {f.storageKey && <FileLink storageKey={f.storageKey} filename={f.filename} compact />}
                        <span className="text-muted">{(f.sizeBytes / 1024).toFixed(0)} KB</span>
                        {f.released
                          ? <span className="rounded-full bg-(--st-green-bg) px-2 py-0.5 text-[10.5px] font-semibold text-(--st-green-fg)">Released</span>
                          : <ReleaseButton fileId={f.id} />}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          <HistoryTimeline history={project.history} />
        </div>
        <MessageThread projectId={project.id} messages={project.messages} currentUserId={session.user.id} />
      </div>
    </>
  );
}
