export const instant = false

import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";
import { PageHead, StageTracker, StatusBadge, StageLadder } from "@/components/portal/ui";
import { HistoryTimeline, MessageThread, ResultFilesCard } from "@/components/portal/project-parts";
import { pkr, slaInfo, QC_STAGE_LABELS } from "@/lib/constants";

export default async function AdminProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await requireRole("ADMIN");
  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      rfq: true,
      quote: true,
      provider: { select: { orgName: true, city: true } },
      customer: { select: { name: true, email: true } },
      history: { include: { changedBy: { select: { name: true } } }, orderBy: { createdAt: "asc" } },
      messages: { include: { sender: { select: { name: true, role: true } } }, orderBy: { createdAt: "asc" } },
      resultFiles: { orderBy: { createdAt: "desc" } },
      milestones: { orderBy: { createdAt: "asc" } },
      workStages: { orderBy: { sort: "asc" } },
      qcRecords: { orderBy: { createdAt: "desc" } },
      transaction: true,
      complaints: { include: { filedBy: { select: { name: true } } }, orderBy: { createdAt: "desc" } },
      review: true,
    },
  });
  if (!project) notFound();
  const sla = slaInfo(project.dueAt, project.status, project.pausedAt);

  return (
    <>
      <PageHead
        title={`${project.refNo} — ${project.rfq.title}`}
        sub={`${project.customer.name} ↔ ${project.provider.orgName} · awarded ${pkr(project.quote.price + project.quote.taxAmount)}${project.poNumber ? ` · PO ${project.poNumber}` : ""}${project.internalId ? ` · lab ref ${project.internalId}` : ""}`}
        action={<StatusBadge status={project.status} />}
      />
      <div className="card mb-6 overflow-x-auto p-5">
        <StageTracker status={project.status} />
        {sla && (
          <div className={`mt-3 text-[12.5px] font-medium ${sla.overdue ? "text-(--st-red-fg)" : sla.paused ? "text-(--st-orange-fg)" : "text-body"}`}>
            {sla.paused ? `Paused — ${sla.days}d remaining on resume` : sla.overdue ? `Overdue by ${Math.abs(sla.days)}d (due ${sla.dueAt.toLocaleDateString()})` : `Due ${sla.dueAt.toLocaleDateString()} · ${sla.days}d left`}
          </div>
        )}
      </div>

      {project.complaints.length > 0 && (
        <div className="card mb-6 p-5">
          <h3 className="mb-3 text-[14px] font-semibold text-ink">Complaints on this project</h3>
          <div className="space-y-2">
            {project.complaints.map((c) => (
              <div key={c.id} className="flex items-center justify-between rounded-lg bg-paper-2 px-4 py-2.5">
                <div>
                  <div className="text-[13px] font-medium text-ink">{c.subject} <span className="font-normal text-muted">· by {c.filedBy.name}</span></div>
                  <div className="text-[11.5px] text-muted">{c.details}{c.resolution ? ` · Resolution: ${c.resolution}` : ""}</div>
                </div>
                <StatusBadge status={c.status} />
              </div>
            ))}
          </div>
          <Link href="/admin/complaints" className="mt-3 inline-block text-[12px] font-medium text-blue hover:underline">Triage in complaints queue →</Link>
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-2">
        <div className="space-y-6">
          {project.workStages.length > 0 && (
            <div className="card p-5">
              <h3 className="mb-4 text-[14px] font-semibold text-ink">Lab workflow</h3>
              <StageLadder stages={project.workStages} paused={!!project.pausedAt} />
            </div>
          )}
          {project.qcRecords.length > 0 && (
            <div className="card p-5">
              <h3 className="mb-3 text-[14px] font-semibold text-ink">QC records</h3>
              <div className="space-y-2">
                {project.qcRecords.map((q) => (
                  <div key={q.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-paper-2 px-4 py-2.5">
                    <div className="text-[12.5px]">
                      <span className="font-medium text-ink">{QC_STAGE_LABELS[q.stage] ?? q.stage}</span>
                      <span className="text-muted">
                        {q.concentration != null && ` · ${q.concentration} ng/µL`}
                        {q.rin != null && ` · RIN ${q.rin}`}
                        {q.ratio != null && ` · ${q.ratio}`}
                        {q.instrument && ` · ${q.instrument}`}
                        {q.decision && ` · decision: ${q.decision.toLowerCase()}`}
                      </span>
                    </div>
                    <StatusBadge status={q.result} />
                  </div>
                ))}
              </div>
            </div>
          )}
          {project.milestones.length > 0 && (
            <div className="card p-5">
              <h3 className="mb-3 text-[14px] font-semibold text-ink">Milestones</h3>
              <div className="space-y-2">
                {project.milestones.map((m) => (
                  <div key={m.id} className="flex items-center justify-between rounded-lg bg-paper-2 px-4 py-2.5">
                    <span className="text-[13px] font-medium text-ink">{m.title} <span className="font-normal text-muted">· {pkr(m.amount)}</span></span>
                    <StatusBadge status={m.status} />
                  </div>
                ))}
              </div>
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
          {project.review && (
            <div className="card p-5">
              <h3 className="mb-2 text-[14px] font-semibold text-ink">Customer review</h3>
              <p className="text-[13px] text-body"><span className="font-semibold text-ink">{project.review.rating}/5</span>{project.review.comment ? ` — “${project.review.comment}”` : ""}</p>
            </div>
          )}
          <HistoryTimeline history={project.history} />
        </div>
        <div className="space-y-6">
          <ResultFilesCard files={project.resultFiles} showDrafts />
          <MessageThread projectId={project.id} messages={project.messages} currentUserId={session.user.id} />
        </div>
      </div>
    </>
  );
}
