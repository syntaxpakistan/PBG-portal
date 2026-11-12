export const instant = false

import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";
import { PageHead, StatusBadge } from "@/components/portal/ui";
import { ServiceForm } from "@/components/portal/service-form";
import { saveService, setServiceActive, deleteService } from "@/lib/actions/marketplace";
import { pkr } from "@/lib/constants";
import { SubmitButton } from "@/components/portal/submit-button";

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
        sub="List your lab's services with a price in PKR or offer them by quote. New and edited listings go through a quick admin review before going live."
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
                  {s.priceVisibility === "QUOTE_ONLY" || s.priceFrom == null ? (
                    <span className="rounded-full border border-navy-3/30 bg-paper px-2.5 py-1 text-[11px] font-semibold text-ink">Request for quote</span>
                  ) : (
                    <span className="text-[13px] font-medium text-ink">{pkr(s.priceFrom)}{s.unit ? ` ${s.unit}` : ""}</span>
                  )}
                  <form action={setServiceActive.bind(null, s.id, !s.active)}>
                    <SubmitButton className="btn-outline !px-3 !py-1.5 text-[11.5px]">{s.active ? "Hide" : "Show"}</SubmitButton>
                  </form>
                  <form action={deleteService.bind(null, s.id)}>
                    <SubmitButton className="rounded-lg border border-(--st-red-bd) px-3 py-1.5 text-[11.5px] font-medium text-(--st-red-fg) hover:bg-(--st-red-bg)">Delete</SubmitButton>
                  </form>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card h-fit p-5">
          <h3 className="text-[14px] font-semibold text-ink">Add a service</h3>
          <p className="mb-4 mt-1 text-[12px] text-muted">Pick a category and service — the listing name is generated from your selections. Publish a separate listing for each variant you price separately.</p>
          <ServiceForm action={saveService} input={input} label={label} platforms={profile.platforms.split(",").map((p) => p.trim()).filter(Boolean)} />
        </div>
      </div>
    </>
  );
}
