export const instant = false

import { prisma } from "@/lib/prisma";
import { createRfq } from "@/lib/actions/marketplace";
import { PageHead } from "@/components/portal/ui";
import { SubmitButton } from "./submit-button";

const input =
  "w-full rounded-lg border border-line bg-surface px-3.5 py-2.5 text-[14px] text-ink outline-none transition-colors focus:border-navy-3";

export default async function NewRfqPage({ searchParams }: { searchParams: Promise<{ invite?: string; cat?: string; title?: string; analysis?: string }> }) {
  const sp = await searchParams;
  const invitedIds = new Set((sp.invite ?? "").split(",").filter(Boolean));
  const providers = await prisma.providerProfile.findMany({
    where: { status: "APPROVED" },
    select: { id: true, orgName: true, city: true, serviceCategories: true },
    orderBy: { orgName: "asc" },
  });
  return (
    <div className="max-w-3xl">
      <PageHead title="Submit an RFQ" sub="Verified providers matching your service category are routed automatically. Quotes arrive blind — labs can't see each other." />
      <form action={createRfq} className="card space-y-5 p-6">
        <div>
          <label className="mb-1.5 block text-[12.5px] font-medium text-ink">Project title *</label>
          <input name="title" required defaultValue={sp.title ?? ""} className={input} placeholder="e.g. Wheat rust resistance panel — 48 samples" />
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-[12.5px] font-medium text-ink">Organism *</label>
            <input name="organism" required className={input} placeholder="e.g. Triticum aestivum" />
          </div>
          <div>
            <label className="mb-1.5 block text-[12.5px] font-medium text-ink">Sample count *</label>
            <input name="sampleCount" type="number" min={1} required className={input} placeholder="48" />
          </div>
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-[12.5px] font-medium text-ink">Sample type *</label>
            <input name="sampleType" required className={input} placeholder="e.g. FFPE, gDNA, PBMC, plant leaf" />
          </div>
          <div>
            <label className="mb-1.5 block text-[12.5px] font-medium text-ink">Service category *</label>
            <select name="serviceCategory" required defaultValue={sp.cat ?? ""} className={input}>
              <option value="">Select…</option>
              {["WGS", "WES", "RNA-Seq", "Long-read", "Metagenome", "Epigenetics", "Bioinformatics", "Sanger", "Sequencing Only", "qPCR", "Panels"].map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-[12.5px] font-medium text-ink">Requested output *</label>
            <input name="requestedOutput" required className={input} placeholder="e.g. VCF + annotation report" />
          </div>
          <div>
            <label className="mb-1.5 block text-[12.5px] font-medium text-ink">Analysis type</label>
            <input name="analysisType" className={input} defaultValue={sp.analysis ?? ""} placeholder="e.g. Variant calling, DE" />
          </div>
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-[12.5px] font-medium text-ink">Deadline</label>
            <input name="deadline" type="date" className={input} />
          </div>
          <div>
            <label className="mb-1.5 block text-[12.5px] font-medium text-ink">Budget hint (optional)</label>
            <input name="budgetHint" className={input} placeholder="e.g. PKR 350k–450k" />
          </div>
        </div>
        <div>
          <label className="mb-1.5 block text-[12.5px] font-medium text-ink">Who can see this request? *</label>
          <div className="grid gap-2 sm:grid-cols-2">
            <label className="flex cursor-pointer items-start gap-2.5 rounded-xl border border-line p-3.5 hover:bg-paper-2 has-checked:border-navy-3 has-checked:bg-(--st-blue-bg)">
              <input type="radio" name="visibility" value="ROUTED" defaultChecked className="mt-0.5 accent-navy" />
              <span>
                <span className="block text-[13px] font-medium text-ink">Targeted routing</span>
                <span className="mt-0.5 block text-[11.5px] leading-snug text-muted">Capability-matched + invited labs only. Goes live immediately.</span>
              </span>
            </label>
            <label className="flex cursor-pointer items-start gap-2.5 rounded-xl border border-line p-3.5 hover:bg-paper-2 has-checked:border-navy-3 has-checked:bg-(--st-blue-bg)">
              <input type="radio" name="visibility" value="BOARD" className="mt-0.5 accent-navy" />
              <span>
                <span className="block text-[13px] font-medium text-ink">Open request board</span>
                <span className="mt-0.5 block text-[11.5px] leading-snug text-muted">Every verified lab can see and quote — your org stays masked. Live after admin approval.</span>
              </span>
            </label>
          </div>
        </div>
        <details className="rounded-xl border border-line p-4" open={invitedIds.size > 0}>
          <summary className="cursor-pointer text-[13px] font-medium text-ink">
            Invite specific facilities <span className="text-[11.5px] font-normal text-muted">(optional — they get a direct invite on top of automatic routing)</span>
            {invitedIds.size > 0 && <span className="ml-2 rounded-full bg-(--st-blue-bg) px-2 py-0.5 text-[10.5px] font-medium text-(--st-blue-fg)">{invitedIds.size} pre-selected</span>}
          </summary>
          <div className="mt-3 grid max-h-48 gap-1.5 overflow-y-auto sm:grid-cols-2">
            {providers.map((p) => (
              <label key={p.id} className="flex cursor-pointer items-center gap-2.5 rounded-lg border border-line px-3 py-2 text-[12.5px] hover:bg-paper-2">
                <input type="checkbox" name="inviteIds" value={p.id} defaultChecked={invitedIds.has(p.id)} className="accent-navy" />
                <span className="min-w-0">
                  <span className="block truncate font-medium text-ink">{p.orgName}</span>
                  <span className="block truncate text-[11px] text-muted">{p.city} · {p.serviceCategories}</span>
                </span>
              </label>
            ))}
          </div>
        </details>
        <div>
          <label className="mb-1.5 block text-[12.5px] font-medium text-ink">Attachment (PDF/DOCX only, ≤25MB)</label>
          <input name="attachment" type="file" accept=".pdf,.doc,.docx,.csv,.png,.jpg,.html" className="w-full rounded-lg border border-line bg-surface px-3.5 py-2 text-[13px] file:mr-3 file:rounded-full file:border-0 file:bg-navy file:px-4 file:py-1.5 file:text-[12px] file:font-medium file:text-yellow" />
          <p className="mt-1.5 text-[11.5px] text-muted">Raw sequencing data (FASTQ/BAM/VCF) is never hosted on the Gateway — labs transfer it via secure out-of-band links.</p>
        </div>
        <SubmitButton />
      </form>
    </div>
  );
}
