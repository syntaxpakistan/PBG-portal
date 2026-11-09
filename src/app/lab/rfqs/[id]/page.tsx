export const instant = false

import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";
import { submitQuote, declineRfq, withdrawQuote } from "@/lib/actions/marketplace";
import { isPriorityClientSubscription } from "@/lib/entitlements";
import { getGraceDays } from "@/lib/settings";
import { PageHead } from "@/components/portal/ui";

const input =
  "w-full rounded-lg border border-line bg-surface px-3.5 py-2.5 text-[14px] text-ink outline-none transition-colors focus:border-navy-3";

export default async function LabRfqPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await requireRole("PROVIDER");
  const profile = await prisma.providerProfile.findUniqueOrThrow({ where: { userId: session.user.id } });
  // BLIND ISOLATION: only safe buyer context (org type/city) — identity masked until award
  const rfq = await prisma.rfq.findUnique({
    where: { id },
    include: { customer: { select: { customerProfile: { select: { orgType: true, city: true } }, subscription: { select: { plan: true, status: true, expiresAt: true } } } } },
  });
  // BLIND ISOLATION: never fetch other providers' quotes here — only existence count
  if (!rfq || rfq.status !== "OPEN") notFound();
  const invited = await prisma.rfqInvite.findUnique({
    where: { rfqId_providerId: { rfqId: id, providerId: profile.id } },
  });
  // board posts stay hidden until admin approval — except to labs the customer invited
  if (rfq.visibility === "BOARD" && rfq.moderation !== "APPROVED" && !invited) notFound();
  const myQuote = await prisma.quote.findUnique({
    where: { rfqId_providerId: { rfqId: id, providerId: profile.id } },
  });
  const quoteCount = await prisma.quote.count({ where: { rfqId: id } });

  const submit = submitQuote.bind(null, id);
  const decline = declineRfq.bind(null, id);
  const withdraw = withdrawQuote.bind(null, id);

  return (
    <>
      <PageHead
        title={rfq.title}
        sub={`${rfq.refNo} · posted by Verified customer${[rfq.customer.customerProfile?.orgType, rfq.customer.customerProfile?.city].filter(Boolean).join(" · ") ? ` (${[rfq.customer.customerProfile?.orgType, rfq.customer.customerProfile?.city].filter(Boolean).join(" · ")})` : ""}${rfq.visibility === "BOARD" ? " · open board" : ""}`}
      />
      {invited && (
        <div className="mb-5 flex items-center gap-2.5 rounded-xl border border-(--st-blue-bd) bg-(--st-blue-bg) px-4 py-3 text-[13px] font-medium text-(--st-blue-fg)">
          You were specifically invited to quote on this RFQ by the customer.
        </div>
      )}
      {isPriorityClientSubscription(rfq.customer.subscription, await getGraceDays()) && (
        <div className="mb-5 flex items-center gap-2.5 rounded-xl border border-[#e8d9a8] bg-[#fdf6e3] px-4 py-3 text-[13px] font-medium text-[#8a6d1f]">
          Priority client — this customer is on a paid {rfq.customer.subscription!.plan === "CUSTOM" ? "Custom" : "Pro"} plan.
        </div>
      )}

      <div className="mb-6 grid gap-4 sm:grid-cols-4">
        <Info label="Organism" value={rfq.organism} />
        <Info label="Samples" value={`${rfq.sampleCount} × ${rfq.sampleType}`} />
        <Info label="Service" value={rfq.serviceCategory} />
        <Info label="Requested output" value={rfq.requestedOutput} />
        <Info label="Analysis type" value={rfq.analysisType ?? "—"} />
        <Info label="Deadline" value={rfq.deadline ? rfq.deadline.toLocaleDateString() : "Flexible"} />
        <Info label="Budget hint" value={rfq.budgetHint ?? "Not disclosed"} />
        <Info label="Competing quotes" value={`${quoteCount} (sealed)`} />
      </div>
      {rfq.attachmentName && (
        <a href={`/api/files/${rfq.attachmentKey}`} className="mb-6 inline-flex items-center gap-2 rounded-lg border border-line bg-surface px-4 py-2.5 text-[13px] font-medium text-ink hover:bg-paper-2">
          📎 {rfq.attachmentName}
        </a>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="card p-6">
          <h2 className="mb-1 text-[15px] font-semibold text-ink">{myQuote ? "Update your quote" : "Submit a blind quote"}</h2>
          <p className="mb-5 text-[12px] text-muted">Competing labs never see your price — and you never see theirs. The customer compares offers anonymously until award.</p>
          <form action={submit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label className="mb-1.5 block text-[12.5px] font-medium text-ink">Price (PKR) *</label>
                <input name="price" type="number" min={0} required defaultValue={myQuote?.price} className={input} placeholder="385000" />
              </div>
              <div>
                <label className="mb-1.5 block text-[12.5px] font-medium text-ink">Taxes (PKR)</label>
                <input name="taxAmount" type="number" min={0} defaultValue={myQuote?.taxAmount ?? 0} className={input} placeholder="0" />
              </div>
              <div>
                <label className="mb-1.5 block text-[12.5px] font-medium text-ink">Guaranteed TAT (days) *</label>
                <input name="turnaroundDays" type="number" min={1} required defaultValue={myQuote?.turnaroundDays} className={input} placeholder="14" />
              </div>
              <div>
                <label className="mb-1.5 block text-[12.5px] font-medium text-ink">Estimated TAT (days)</label>
                <input name="estTurnaround" type="number" min={1} defaultValue={myQuote?.estTurnaround ?? ""} className={input} placeholder="10 — your best guess" />
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-[12.5px] font-medium text-ink">Platform / method *</label>
              <input name="platform" required defaultValue={myQuote?.platform ?? ""} className={input} placeholder="e.g. Illumina NovaSeq X, 2×150bp" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-[12.5px] font-medium text-ink">Deliverables</label>
                <input name="deliverables" defaultValue={myQuote?.deliverables ?? ""} className={input} placeholder="e.g. VCF + QC report + annotated variants" />
              </div>
              <div>
                <label className="mb-1.5 block text-[12.5px] font-medium text-ink">Quote valid until</label>
                <input name="validUntil" type="date" defaultValue={myQuote?.validUntil ? myQuote.validUntil.toISOString().slice(0, 10) : ""} className={input} />
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-[12.5px] font-medium text-ink">Scope of work</label>
              <textarea name="scope" rows={2} defaultValue={myQuote?.scope ?? ""} className={input} placeholder="In-scope: library prep, sequencing, alignment, variant calling…" />
            </div>
            <div>
              <label className="mb-1.5 block text-[12.5px] font-medium text-ink">Exclusions</label>
              <input name="exclusions" defaultValue={myQuote?.exclusions ?? ""} className={input} placeholder="e.g. Samples failing QC re-billed" />
            </div>
            <div>
              <label className="mb-1.5 block text-[12.5px] font-medium text-ink">Notes for the customer</label>
              <textarea name="notes" rows={3} defaultValue={myQuote?.notes ?? ""} className={input} placeholder="Capacity, QC steps, what's included…" />
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <button type="submit" className="btn-primary !py-3">{myQuote ? "Update quote" : "Submit sealed quote"}</button>
              {myQuote?.status === "SUBMITTED" && (
                <form action={withdraw}>
                  <button type="submit" className="btn-outline !py-3">Withdraw quote</button>
                </form>
              )}
            </div>
          </form>
        </div>
        <div className="card h-fit p-5">
          <h3 className="text-[14px] font-semibold text-ink">Blind quoting rules</h3>
          <ul className="mt-3 space-y-2 text-[12.5px] leading-relaxed text-body">
            <li>· You see this RFQ because your capabilities match.</li>
            <li>· Your quote is sealed — other labs only see a count.</li>
            <li>· After the customer selects you, a private channel opens.</li>
            <li>· Platform fee of 3.5% applies on award.</li>
            <li>· Result reports are delivered back through this portal.</li>
          </ul>
          <form action={decline} className="mt-5 border-t border-line pt-4">
            <label className="mb-1.5 block text-[11.5px] font-medium text-ink">Can&apos;t take this on?</label>
            <div className="flex gap-2">
              <input name="reason" placeholder="Reason (optional)" className="w-full rounded-lg border border-line bg-surface px-3 py-2 text-[12px] text-ink outline-none focus:border-navy-3" />
              <button type="submit" className="btn-outline shrink-0 !px-3 !py-2 text-[11.5px]">Decline RFQ</button>
            </div>
            <p className="mt-1.5 text-[10.5px] text-muted">Declining hides this RFQ — the customer never sees that you passed.</p>
          </form>
        </div>
      </div>
    </>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="card p-4">
      <div className="text-[10.5px] font-semibold uppercase tracking-wider text-muted">{label}</div>
      <div className="mt-1 text-[13px] font-medium text-ink">{value}</div>
    </div>
  );
}
