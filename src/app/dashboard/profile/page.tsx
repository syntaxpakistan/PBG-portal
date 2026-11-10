export const instant = false

import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";
import { PageHead } from "@/components/portal/ui";
import { SubscriptionCard } from "@/components/portal/subscription-card";
import { updateCustomerProfile } from "@/lib/actions/profiles";
import { ORG_TYPES } from "@/lib/plans";
import { SubmitButton } from "@/components/portal/submit-button";

const input = "w-full rounded-lg border border-line bg-surface px-3.5 py-2.5 text-[14px] text-ink outline-none focus:border-navy-3";

export default async function CustomerProfilePage() {
  const session = await requireRole("CUSTOMER");
  const [profile, subscription] = await Promise.all([
    prisma.customerProfile.findUnique({ where: { userId: session.user.id } }),
    prisma.subscription.findUnique({ where: { userId: session.user.id } }),
  ]);

  return (
    <div className="grid max-w-5xl gap-6 xl:grid-cols-[1fr_320px]">
      <div>
        <PageHead title="Your profile" sub="Used on RFQs and by labs to understand who's requesting work." />
        <form action={updateCustomerProfile} className="card space-y-5 p-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1.5 block text-[12.5px] font-medium text-ink">Full name</label>
            <input name="name" defaultValue={session.user.name} required className={input} />
          </div>
          <div>
            <label className="mb-1.5 block text-[12.5px] font-medium text-ink">Phone</label>
            <input name="phone" defaultValue={session.user.phone ?? ""} className={input} />
          </div>
        </div>
        <div>
          <label className="mb-1.5 block text-[12.5px] font-medium text-ink">Email</label>
          <input value={session.user.email} disabled className={`${input} opacity-60`} />
        </div>
        <div className="border-t border-line pt-4">
          <p className="text-[12px] font-semibold uppercase tracking-wider text-muted">Organization</p>
        </div>
        <div>
          <label className="mb-1.5 block text-[12.5px] font-medium text-ink">Organization name</label>
          <input name="orgName" defaultValue={profile?.orgName ?? ""} className={input} placeholder="e.g. NIBGE, AKU, University of Punjab" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1.5 block text-[12.5px] font-medium text-ink">Organization type</label>
            <select name="orgType" defaultValue={profile?.orgType ?? ""} className={input}>
              <option value="">Select…</option>
              {ORG_TYPES.map((t) => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-[12.5px] font-medium text-ink">City</label>
            <input name="city" defaultValue={profile?.city ?? ""} className={input} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1.5 block text-[12.5px] font-medium text-ink">Department</label>
            <input name="department" defaultValue={profile?.department ?? ""} className={input} />
          </div>
          <div>
            <label className="mb-1.5 block text-[12.5px] font-medium text-ink">Designation</label>
            <input name="designation" defaultValue={profile?.designation ?? ""} className={input} />
          </div>
        </div>
        <div>
          <label className="mb-1.5 block text-[12.5px] font-medium text-ink">Address</label>
          <input name="address" defaultValue={profile?.address ?? ""} className={input} />
        </div>
        <SubmitButton className="btn-secondary !py-2.5">Save profile</SubmitButton>
        </form>
      </div>
      <div className="space-y-5">
        <SubscriptionCard sub={subscription} />
        <div className="card p-5">
          <h3 className="text-[14px] font-semibold text-ink">Account</h3>
          <dl className="mt-3 space-y-2 text-[12.5px]">
            <div className="flex justify-between"><dt className="text-muted">Contact</dt><dd className="text-ink">{session.user.email}</dd></div>
            <div className="flex justify-between"><dt className="text-muted">Phone</dt><dd className="text-ink">{session.user.phone ?? "—"}</dd></div>
          </dl>
        </div>
      </div>
    </div>
  );
}
