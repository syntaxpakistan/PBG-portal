export const instant = false

import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";
import { StatusBadge, PageHead } from "@/components/portal/ui";
import { FileLink } from "@/components/portal/file-link";
import { pkr } from "@/lib/constants";
import { QuoteSelectButton } from "./select-button";
import { DeleteRfqButton } from "../delete-button";

export default async function RfqDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await requireRole("CUSTOMER");
  const rfq = await prisma.rfq.findUnique({
    where: { id },
    include: {
      quotes: {
        include: { provider: { select: { orgName: true, city: true, platforms: true, status: true } } },
        orderBy: { price: "asc" },
      },
      project: true,
    },
  });
  if (!rfq || rfq.customerId !== session.user.id) notFound();

  return (
    <>
      <PageHead
        title={rfq.title}
        sub={`${rfq.refNo} · ${rfq.organism} · ${rfq.sampleCount} × ${rfq.sampleType}`}
        action={
          <div className="flex items-center gap-2">
            <StatusBadge status={rfq.status} />
            {!rfq.project && rfq.status !== "AWARDED" && <DeleteRfqButton rfqId={rfq.id} refNo={rfq.refNo} />}
          </div>
        }
      />

      {rfq.visibility === "BOARD" && rfq.moderation === "PENDING" && (
        <div className="mb-5 rounded-xl border border-(--st-amber-bd) bg-(--st-amber-bg) px-4 py-3 text-[13px] text-(--st-amber-fg)">
          This request is awaiting admin review — it will go live on the request board once approved, and matching labs will be notified.
        </div>
      )}
      {rfq.visibility === "BOARD" && rfq.moderation === "REJECTED" && (
        <div className="mb-5 rounded-xl border border-(--st-red-bd) bg-(--st-red-bg) px-4 py-3 text-[13px] text-(--st-red-fg)">
          This request was not approved for the open board{rfq.moderationNote ? `: ${rfq.moderationNote}` : ""}. Labs you explicitly invite can still see it.
        </div>
      )}
      {rfq.visibility === "BOARD" && rfq.moderation === "APPROVED" && (
        <div className="mb-5 rounded-xl border border-(--st-green-bd) bg-(--st-green-bg) px-4 py-3 text-[13px] text-(--st-green-fg)">
          Live on the request board — all verified labs can see it and submit sealed quotes.
        </div>
      )}

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <Info label="Service category" value={rfq.serviceCategory} />
        <Info label="Requested output" value={rfq.requestedOutput} />
        <Info label="Deadline" value={rfq.deadline ? rfq.deadline.toLocaleDateString() : "—"} />
      </div>
      {rfq.attachmentName && (
        <div className="mb-6">
          <FileLink storageKey={rfq.attachmentKey} filename={rfq.attachmentName} />
        </div>
      )}

      <h2 className="mb-3 text-[15px] font-semibold text-ink">
        Quotes received ({rfq.quotes.length})
        <span className="ml-2 text-[11.5px] font-normal text-muted">competing labs cannot see each other&apos;s quotes</span>
      </h2>
      {rfq.quotes.length === 0 && (
        <div className="card p-8 text-center text-[13px] text-muted">
          Waiting for providers — you&apos;ll be notified as quotes arrive.
        </div>
      )}
      <div className="grid gap-4 lg:grid-cols-2">
        {rfq.quotes.map((q) => {
          const expired = !!q.validUntil && q.validUntil < new Date();
          return (
          <div key={q.id} className={`card p-5 ${expired ? "opacity-70" : ""}`}>
            <div className="flex items-start justify-between">
              <div>
                <div className="text-[15px] font-semibold text-ink">{q.provider.orgName}</div>
                <div className="mt-0.5 text-[12px] text-muted"><span className="font-mono font-semibold">{q.quoteNo}</span> · {q.provider.city} · {q.provider.platforms}</div>
              </div>
              <div className="flex items-center gap-2">
                {expired && <span className="rounded-full bg-(--st-red-bg) px-2.5 py-0.5 text-[10.5px] font-semibold text-(--st-red-fg)">Expired</span>}
                <StatusBadge status={q.status} />
              </div>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-3 border-t border-line pt-4 text-center">
              <div>
                <div className="text-[10.5px] uppercase tracking-wider text-muted">Price</div>
                <div className="font-display mt-1 text-[19px] font-medium text-ink">{pkr(q.price + q.taxAmount)}</div>
                {q.taxAmount > 0 && <div className="text-[10.5px] text-muted">incl. {pkr(q.taxAmount)} tax</div>}
              </div>
              <div>
                <div className="text-[10.5px] uppercase tracking-wider text-muted">Turnaround</div>
                <div className="font-display mt-1 text-[19px] font-medium text-ink">{q.turnaroundDays} days</div>
                {q.estTurnaround && <div className="text-[10.5px] text-muted">est. {q.estTurnaround}d</div>}
              </div>
              <div>
                <div className="text-[10.5px] uppercase tracking-wider text-muted">Platform</div>
                <div className="mt-1 text-[12px] font-medium leading-tight text-ink">{q.platform}</div>
              </div>
            </div>
            {(q.deliverables || q.scope || q.exclusions || q.notes || q.validUntil) && (
              <div className="mt-4 space-y-1.5 border-t border-line pt-3 text-[12px] text-body">
                {q.deliverables && <div><span className="font-medium text-ink">Deliverables:</span> {q.deliverables}</div>}
                {q.scope && <div><span className="font-medium text-ink">Scope:</span> {q.scope}</div>}
                {q.exclusions && <div><span className="font-medium text-ink">Exclusions:</span> {q.exclusions}</div>}
                {q.notes && <div><span className="font-medium text-ink">Notes:</span> {q.notes}</div>}
                {q.validUntil && <div className={expired ? "font-medium text-(--st-red-fg)" : "text-muted"}>Quote valid until {q.validUntil.toLocaleDateString()}{expired ? " — expired" : ""}</div>}
              </div>
            )}
            {rfq.status === "OPEN" && q.status === "SUBMITTED" && !expired && (
              <QuoteSelectButton quoteId={q.id} />
            )}
            {rfq.status === "OPEN" && q.status === "SUBMITTED" && expired && (
              <div className="mt-4 rounded-lg bg-paper-2 px-3.5 py-2.5 text-center text-[12px] font-medium text-muted">
                This offer has lapsed — ask the lab to re-submit with fresh validity before awarding.
              </div>
            )}
            {q.status === "SELECTED" && (
              <div className="mt-4 rounded-lg bg-(--st-green-bg) px-3.5 py-2.5 text-center text-[13px] font-semibold text-(--st-green-fg)">
                Selected — project created
              </div>
            )}
          </div>
          );
        })}
      </div>
      {rfq.project && (
        <div className="mt-6">
          <a href={`/dashboard/projects/${rfq.project.id}`} className="btn-secondary !py-2.5">Open project →</a>
        </div>
      )}
    </>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="card p-4">
      <div className="text-[10.5px] font-semibold uppercase tracking-wider text-muted">{label}</div>
      <div className="mt-1 text-[13.5px] font-medium text-ink">{value}</div>
    </div>
  );
}
