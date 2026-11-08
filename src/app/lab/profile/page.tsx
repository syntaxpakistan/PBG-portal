export const instant = false

import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";
import { PageHead, StatusBadge } from "@/components/portal/ui";
import { SubscriptionCard } from "@/components/portal/subscription-card";
import { updateProviderProfile } from "@/lib/actions/profiles";

const input = "w-full rounded-lg border border-line bg-surface px-3.5 py-2.5 text-[14px] text-ink outline-none focus:border-navy-3";
const label = "mb-1.5 block text-[12.5px] font-medium text-ink";

export default async function LabProfilePage() {
  const session = await requireRole("PROVIDER");
  const profile = await prisma.providerProfile.findUnique({
    where: { userId: session.user.id },
    include: { user: { select: { email: true, name: true, phone: true, subscription: true } } },
  });
  if (!profile) notFound();

  return (
    <div className="grid max-w-5xl gap-6 xl:grid-cols-[1fr_320px]">
      <div>
        <PageHead
          title="Facility profile"
          sub="This is what Syntax reviews and what appears in the national registry once approved."
          action={<StatusBadge status={profile.status} />}
        />
        <form action={updateProviderProfile} className="card space-y-5 p-6">
          <div>
            <label className={label}>Lab / facility name *</label>
            <input name="orgName" required defaultValue={profile.orgName} className={input} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={label}>City *</label>
              <input name="city" required defaultValue={profile.city} className={input} />
            </div>
            <div>
              <label className={label}>Established (year)</label>
              <input name="establishedYear" type="number" defaultValue={profile.establishedYear ?? ""} className={input} />
            </div>
          </div>
          <div>
            <label className={label}>Platforms / sequencers</label>
            <input name="platforms" defaultValue={profile.platforms} className={input} placeholder="Illumina NovaSeq X, ONT PromethION…" />
          </div>
          <div>
            <label className={label}>Sample types</label>
            <input name="sampleTypes" defaultValue={profile.sampleTypes} className={input} placeholder="gDNA, RNA, FFPE, PBMC…" />
          </div>
          <div>
            <label className={label}>Service categories</label>
            <input name="serviceCategories" defaultValue={profile.serviceCategories} className={input} placeholder="WGS, RNA-Seq, Epigenetics…" />
            <p className="mt-1 text-[11px] text-muted">These drive RFQ routing — keep them accurate.</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={label}>HPC capacity</label>
              <input name="hpcCapacity" defaultValue={profile.hpcCapacity ?? ""} className={input} />
            </div>
            <div>
              <label className={label}>Accreditations</label>
              <input name="accreditations" defaultValue={profile.accreditations ?? ""} className={input} placeholder="ISO 15189, CAP…" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={label}>Contact person</label>
              <input name="contactPerson" defaultValue={profile.contactPerson ?? ""} className={input} />
            </div>
            <div>
              <label className={label}>Website</label>
              <input name="website" type="url" defaultValue={profile.website ?? ""} className={input} />
            </div>
          </div>
          <div>
            <label className={label}>Bio</label>
            <textarea name="bio" rows={4} defaultValue={profile.bio ?? ""} className={input} />
          </div>
          <button type="submit" className="btn-secondary !py-2.5">Save profile</button>
        </form>
      </div>
      <div className="space-y-5">
        <SubscriptionCard sub={profile.user.subscription} />
        <div className="card p-5">
          <h3 className="text-[14px] font-semibold text-ink">Account</h3>
          <dl className="mt-3 space-y-2 text-[12.5px]">
            <div className="flex justify-between"><dt className="text-muted">Contact</dt><dd className="text-ink">{profile.user.email}</dd></div>
            <div className="flex justify-between"><dt className="text-muted">Phone</dt><dd className="text-ink">{profile.user.phone ?? "—"}</dd></div>
            <div className="flex justify-between"><dt className="text-muted">Verified on</dt><dd className="text-ink">{profile.verifiedAt?.toLocaleDateString() ?? "Pending"}</dd></div>
          </dl>
        </div>
      </div>
    </div>
  );
}
