export const instant = false

import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";
import { PageHead, StatusBadge } from "@/components/portal/ui";
import { saveService, setServiceActive, deleteService } from "@/lib/actions/marketplace";
import { pkr } from "@/lib/constants";

const input = "w-full rounded-lg border border-line bg-surface px-3.5 py-2.5 text-[14px] text-ink outline-none transition-colors focus:border-navy-3";
const label = "mb-1.5 block text-[12.5px] font-medium text-ink";

export default async function LabServicesPage() {
  const session = await requireRole("PROVIDER");
  const profile = await prisma.providerProfile.findUniqueOrThrow({
    where: { userId: session.user.id },
    include: { services: { orderBy: { createdAt: "desc" } } },
  });

  return (
    <>
      <PageHead
        title="Service catalog"
        sub="Fixed-price services shown on the marketplace and your registry storefront. New and edited listings go through a quick admin review before going live."
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <div className="card overflow-hidden">
          <div className="border-b border-line px-5 py-3.5">
            <h3 className="text-[14px] font-semibold text-ink">Listed services ({profile.services.length})</h3>
          </div>
          <div className="divide-y divide-line">
            {profile.services.length === 0 && (
              <p className="px-5 py-10 text-center text-[13px] text-muted">No services listed — add your standard offerings so customers can find you in the registry.</p>
            )}
            {profile.services.map((s) => (
              <div key={s.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[13.5px] font-medium text-ink">{s.name}</span>
                    {!s.active && <StatusBadge status="CLOSED" />}
                    {s.moderation === "PENDING" && (
                      <span className="rounded-full bg-(--st-amber-bg) px-2 py-0.5 text-[10px] font-medium text-(--st-amber-fg)">Awaiting admin review</span>
                    )}
                    {s.moderation === "REJECTED" && (
                      <span className="rounded-full bg-(--st-red-bg) px-2 py-0.5 text-[10px] font-medium text-(--st-red-fg)" title={s.moderationNote ?? undefined}>
                        Rejected{s.moderationNote ? `: ${s.moderationNote}` : ""}
                      </span>
                    )}
                    {s.priceVisibility !== "PUBLIC" && s.priceFrom != null && (
                      <span className="rounded-full bg-(--st-purple-bg) px-2 py-0.5 text-[10px] font-medium text-(--st-purple-fg)">
                        {s.priceVisibility === "MEMBERS" ? "Members-only price" : "Price hidden"}
                      </span>
                    )}
                  </div>
                  <div className="mt-0.5 text-[11.5px] text-muted">
                    {s.category}{s.platform ? ` · ${s.platform}` : ""}{s.turnaroundDays ? ` · ~${s.turnaroundDays}d` : ""}
                  </div>
                  {s.description && <p className="mt-1 max-w-md text-[12px] text-body">{s.description}</p>}
                </div>
                <div className="flex items-center gap-2">
                  {s.priceFrom != null && <span className="text-[13px] font-medium text-ink">{pkr(s.priceFrom)}{s.unit ? ` ${s.unit}` : ""}</span>}
                  <form action={setServiceActive.bind(null, s.id, !s.active)}>
                    <button type="submit" className="btn-outline !px-3 !py-1.5 text-[11.5px]">{s.active ? "Hide" : "Show"}</button>
                  </form>
                  <form action={deleteService.bind(null, s.id)}>
                    <button type="submit" className="rounded-lg border border-(--st-red-bd) px-3 py-1.5 text-[11.5px] font-medium text-(--st-red-fg) hover:bg-(--st-red-bg)">Delete</button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card h-fit p-5">
          <h3 className="text-[14px] font-semibold text-ink">Add a service</h3>
          <p className="mb-4 mt-1 text-[12px] text-muted">e.g. &ldquo;WGS — 30× human&rdquo;, &ldquo;RNA-Seq library prep&rdquo;. Final pricing is still quoted per-RFQ.</p>
          <form action={saveService} className="space-y-4">
            <div>
              <label className={label}>Service name *</label>
              <input name="name" required className={input} placeholder="WGS — 30× human genome" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={label}>Category *</label>
                <select name="category" required className={input}>
                  {["WGS", "WES", "RNA-Seq", "Long-read", "Single Cell", "Epigenetics", "Bioinformatics", "Sanger", "qPCR", "Panels"].map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className={label}>Turnaround (days)</label>
                <input name="turnaroundDays" type="number" min={1} className={input} />
              </div>
            </div>
            <div>
              <label className={label}>Platform</label>
              <input name="platform" className={input} placeholder="Illumina NovaSeq X" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={label}>Starting price (PKR)</label>
                <input name="priceFrom" type="number" min={0} className={input} placeholder="95000" />
              </div>
              <div>
                <label className={label}>Unit</label>
                <input name="unit" className={input} placeholder="/sample" />
              </div>
            </div>
            <div>
              <label className={label}>Price visibility</label>
              <select name="priceVisibility" className={input}>
                <option value="PUBLIC">Public — anyone browsing the marketplace</option>
                <option value="MEMBERS">Members — signed-in customers only</option>
                <option value="QUOTE_ONLY">Hidden — &ldquo;request quote&rdquo; instead of a price</option>
              </select>
              <p className="mt-1 text-[11px] text-muted">Competitors can&apos;t see member-only or hidden prices — only you and the marketplace buyers.</p>
            </div>
            <div>
              <label className={label}>Description</label>
              <textarea name="description" rows={2} className={input} placeholder="What's included, QC steps, deliverables…" />
            </div>
            <button type="submit" className="btn-primary !py-2.5">List service</button>
          </form>
        </div>
      </div>
    </>
  );
}
