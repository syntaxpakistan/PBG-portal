export const instant = false

import { prisma } from "@/lib/prisma";
import { PageHead, StatusBadge } from "@/components/portal/ui";
import { PLANS } from "@/lib/plans";
import { SubButtons } from "./buttons";
import { getPlanPrices } from "@/lib/settings";

export default async function SubscriptionsPage({ searchParams }: { searchParams: Promise<{ q?: string; status?: string; plan?: string }> }) {
  const { q, status, plan } = await searchParams;
  const subs = await prisma.subscription.findMany({
    where: {
      ...(status ? { status: status as "ACTIVE" | "PENDING_PAYMENT" | "CANCELLED" | "EXPIRED" } : {}),
      ...(plan ? { plan: plan as "BASIC" | "PRO" | "CUSTOM" } : {}),
      ...(q ? {
        user: {
          OR: [
            { name: { contains: q } },
            { email: { contains: q } },
            { providerProfile: { orgName: { contains: q } } },
            { supplierProfile: { orgName: { contains: q } } },
          ],
        },
      } : {}),
    },
    include: {
      user: {
        select: {
          name: true, email: true, role: true,
          providerProfile: { select: { orgName: true, status: true } },
          supplierProfile: { select: { orgName: true, status: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
  const mrr = subs.filter((s) => s.status === "ACTIVE").reduce((n, s) => n + s.priceUsd, 0);
  const pending = subs.filter((s) => s.status === "PENDING_PAYMENT").length;
  const renewals = subs.filter((s) => s.renewRequestedAt).length;
  const planChanges = subs.filter((s) => s.planChangeRequestedAt).length;
  const planPrices = await getPlanPrices();

  return (
    <>
      <PageHead
        title="Subscriptions"
        sub={`${subs.length} memberships · ${pending} awaiting payment · ${renewals} renewal requests · ${planChanges} plan-change requests · ~$${mrr.toLocaleString()}/mo active MRR`}
      />
      <form className="mb-4 flex flex-wrap items-center gap-2">
        <input name="q" defaultValue={q ?? ""} placeholder="Search org, name or email…" className="w-full max-w-xs rounded-full border border-line bg-surface px-4 py-2 text-[13px] outline-none focus:border-navy-3" />
        <select name="status" defaultValue={status ?? ""} className="rounded-full border border-line bg-surface px-4 py-2 text-[13px] outline-none focus:border-navy-3">
          <option value="">All statuses</option>
          <option value="ACTIVE">Active</option>
          <option value="PENDING_PAYMENT">Pending payment</option>
          <option value="EXPIRED">Expired</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
        <select name="plan" defaultValue={plan ?? ""} className="rounded-full border border-line bg-surface px-4 py-2 text-[13px] outline-none focus:border-navy-3">
          <option value="">All plans</option>
          <option value="BASIC">Basic $100</option>
          <option value="PRO">Pro $300</option>
          <option value="CUSTOM">Custom $500</option>
        </select>
        <button type="submit" className="btn-outline !py-2 text-[12.5px]">Filter</button>
      </form>
      <div className="card overflow-hidden">
        <div className="overflow-x-auto"><table className="w-full min-w-[760px] text-left text-[13px]">
          <thead className="border-b border-line bg-paper-2 text-[11px] uppercase tracking-wider text-muted">
            <tr>
              <th className="px-5 py-3 font-semibold">Organization</th>
              <th className="px-5 py-3 font-semibold">Role</th>
              <th className="px-5 py-3 font-semibold">Plan</th>
              <th className="px-5 py-3 font-semibold">Price</th>
              <th className="px-5 py-3 font-semibold">Billing</th>
              <th className="px-5 py-3 font-semibold">Status</th>
              <th className="px-5 py-3 font-semibold"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {subs.map((s) => {
              const org = s.user.providerProfile ?? s.user.supplierProfile;
              return (
                <tr key={s.id} className="hover:bg-paper-2/60">
                  <td className="px-5 py-3">
                    <div className="font-medium text-ink">{org?.orgName ?? s.user.name}</div>
                    <div className="text-[11px] text-muted">{s.user.email}</div>
                  </td>
                  <td className="px-5 py-3 text-body">{s.user.role === "PROVIDER" ? "Lab" : s.user.role === "SUPPLIER" ? "Supplier" : "Client"}</td>
                  <td className="px-5 py-3 font-medium text-ink">
                    {PLANS[s.plan].label}
                    {s.requestedPlan && (
                      <div className="mt-0.5 text-[10.5px] font-medium text-(--st-amber-fg)">
                        → {PLANS[s.requestedPlan as keyof typeof PLANS]?.label ?? s.requestedPlan} requested
                      </div>
                    )}
                  </td>
                  <td className="px-5 py-3 text-body">${s.priceUsd}/mo</td>
                  <td className="px-5 py-3 text-muted">
                    {s.expiresAt ? `until ${s.expiresAt.toLocaleDateString()}` : "—"}
                    {s.renewRequestedAt && <div className="mt-0.5 text-[10.5px] font-medium text-(--st-blue-fg)">renewal requested</div>}
                  </td>
                  <td className="px-5 py-3"><StatusBadge status={s.status} /></td>
                  <td className="px-5 py-3"><SubButtons id={s.id} status={s.status} plan={s.plan} renewRequested={!!s.renewRequestedAt} requestedPlan={s.requestedPlan} prices={planPrices} /></td>
                </tr>
              );
            })}
            {subs.length === 0 && <tr><td colSpan={7} className="px-5 py-8 text-center text-muted">No subscriptions match.</td></tr>}
          </tbody>
        </table></div>
      </div>
    </>
  );
}
