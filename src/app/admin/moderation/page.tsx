export const instant = false

import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";
import { PageHead } from "@/components/portal/ui";
import { pkr } from "@/lib/constants";
import { setRfqBoardModeration, setServiceModeration } from "@/lib/actions/admin";
import { SubmitButton } from "@/components/portal/submit-button";

function ModerateForm({ action, approveLabel = "Approve", rejectLabel = "Reject" }: { action: (fd: FormData) => Promise<void>; approveLabel?: string; rejectLabel?: string }) {
  return (
    <form action={action} className="flex items-center gap-2">
      <input name="note" placeholder="Note (optional — sent to the org)" className="w-44 rounded-lg border border-line bg-surface px-3 py-2 text-[12px] text-ink outline-none focus:border-navy-3" />
      <SubmitButton name="decision" value="APPROVED" className="rounded-lg bg-(--st-green-bg) px-3 py-2 text-[12px] font-semibold text-(--st-green-fg) hover:brightness-95">{approveLabel}</SubmitButton>
      <SubmitButton name="decision" value="REJECTED" className="rounded-lg bg-(--st-red-bg) px-3 py-2 text-[12px] font-semibold text-(--st-red-fg) hover:brightness-95">{rejectLabel}</SubmitButton>
    </form>
  );
}

async function rfqDecision(rfqId: string, fd: FormData) {
  "use server";
  await setRfqBoardModeration(rfqId, String(fd.get("decision")) as "APPROVED" | "REJECTED", String(fd.get("note") || "") || undefined);
}
async function svcDecision(svcId: string, fd: FormData) {
  "use server";
  await setServiceModeration(svcId, String(fd.get("decision")) as "APPROVED" | "REJECTED", String(fd.get("note") || "") || undefined);
}

const th = "px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted";
const td = "px-4 py-4 align-top";

export default async function ModerationPage() {
  await requireRole("ADMIN");
  const [pendingRfqs, pendingServices, decided] = await Promise.all([
    prisma.rfq.findMany({
      where: { visibility: "BOARD", moderation: "PENDING" },
      include: { customer: { select: { name: true, email: true, customerProfile: { select: { orgName: true, orgType: true, city: true } } } }, _count: { select: { invites: true } } },
      orderBy: { createdAt: "asc" },
      take: 100,
    }),
    prisma.serviceListing.findMany({
      where: { moderation: "PENDING" },
      include: { provider: { select: { orgName: true, city: true, status: true } } },
      orderBy: { createdAt: "asc" },
      take: 100,
    }),
    prisma.serviceListing.findMany({
      where: { moderation: "REJECTED" },
      include: { provider: { select: { orgName: true } } },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
  ]);

  return (
    <>
      <PageHead title="Content moderation" sub="Nothing reaches the marketplace without your approval — request-board posts and lab service listings queue here." />

      {/* request board queue */}
      <div className="card mb-8 overflow-hidden">
        <div className="border-b border-line px-5 py-3.5">
          <h2 className="text-[14px] font-semibold text-ink">Request-board posts <span className="font-normal text-muted">({pendingRfqs.length} pending)</span></h2>
          <p className="mt-0.5 text-[12px] text-muted">Approved requests go live on the lab board — all verified labs can see and quote them. Buyer identity stays masked to labs.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-[12.5px]">
            <thead className="border-b border-line bg-paper-2">
              <tr>
                <th className={th}>Request</th>
                <th className={th}>Scope / tests</th>
                <th className={th}>Posted by</th>
                <th className={th}>Deadline</th>
                <th className={th}>Budget</th>
                <th className={th}>Visibility</th>
                <th className={th}>Decision</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {pendingRfqs.length === 0 && <tr><td colSpan={7} className="px-5 py-8 text-center text-muted">No board requests waiting.</td></tr>}
              {pendingRfqs.map((r) => (
                <tr key={r.id} className="hover:bg-paper-2/50">
                  <td className={`${td} min-w-52`}>
                    <div className="font-medium text-ink">{r.title}</div>
                    <div className="mt-0.5 text-[11px] text-muted">{r.refNo} · {r.createdAt.toLocaleDateString()}{r.attachmentName ? " · 📎 attachment" : ""}</div>
                  </td>
                  <td className={`${td} min-w-48`}>
                    <div className="text-body">{r.serviceCategory} · {r.organism}</div>
                    <div className="mt-0.5 text-[11px] text-muted">{r.sampleCount} × {r.sampleType}{r.analysisType ? ` · ${r.analysisType}` : ""}</div>
                    <div className="mt-0.5 text-[11px] text-muted">Output: {r.requestedOutput}</div>
                  </td>
                  <td className={`${td} min-w-40`}>
                    <div className="font-medium text-ink">{r.customer.customerProfile?.orgName ?? r.customer.name}</div>
                    <div className="mt-0.5 text-[11px] text-muted">{[r.customer.customerProfile?.orgType, r.customer.customerProfile?.city].filter(Boolean).join(" · ") || "—"}</div>
                    <div className="mt-0.5 text-[11px] text-muted">{r.customer.name} · {r.customer.email}</div>
                  </td>
                  <td className={`${td} whitespace-nowrap text-body`}>{r.deadline ? r.deadline.toLocaleDateString() : "Flexible"}</td>
                  <td className={`${td} whitespace-nowrap text-body`}>{r.budgetHint ?? "—"}</td>
                  <td className={`${td} whitespace-nowrap`}>
                    <span className="rounded-full bg-(--st-blue-bg) px-2.5 py-0.5 text-[10.5px] font-medium text-(--st-blue-fg)">Open board</span>
                    {r._count.invites > 0 && <div className="mt-1 text-[10.5px] text-muted">+ {r._count.invites} invited</div>}
                  </td>
                  <td className={td}><ModerateForm action={rfqDecision.bind(null, r.id)} approveLabel="Publish to board" rejectLabel="Reject" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* service listing queue */}
      <div className="card overflow-hidden">
        <div className="border-b border-line px-5 py-3.5">
          <h2 className="text-[14px] font-semibold text-ink">Service listings <span className="font-normal text-muted">({pendingServices.length} pending)</span></h2>
          <p className="mt-0.5 text-[12px] text-muted">Approved listings appear on the public marketplace, the customer Services tab, and the lab&rsquo;s registry storefront.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] text-[12.5px]">
            <thead className="border-b border-line bg-paper-2">
              <tr>
                <th className={th}>Service</th>
                <th className={th}>Listed by</th>
                <th className={th}>Category</th>
                <th className={th}>Price</th>
                <th className={th}>Est. TAT</th>
                <th className={th}>Price visibility</th>
                <th className={th}>Decision</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {pendingServices.length === 0 && <tr><td colSpan={7} className="px-5 py-8 text-center text-muted">No listings waiting.</td></tr>}
              {pendingServices.map((s) => (
                <tr key={s.id} className="hover:bg-paper-2/50">
                  <td className={`${td} min-w-56`}>
                    <div className="font-medium text-ink">{s.name}</div>
                    {s.platform && <div className="mt-0.5 text-[11px] text-muted">{s.platform}</div>}
                    {s.description && <div className="mt-1 text-[11px] text-body">{s.description}</div>}
                  </td>
                  <td className={`${td} min-w-36`}>
                    <div className="font-medium text-ink">{s.provider.orgName}</div>
                    <div className="mt-0.5 text-[11px] text-muted">{s.provider.city} · {s.provider.status.toLowerCase()}</div>
                  </td>
                  <td className={`${td} whitespace-nowrap text-body`}>{s.category}</td>
                  <td className={`${td} whitespace-nowrap text-body`}>{s.priceFrom != null ? `from ${pkr(s.priceFrom)}${s.unit ?? ""}` : "—"}</td>
                  <td className={`${td} whitespace-nowrap text-body`}>{s.turnaroundDays ? `~${s.turnaroundDays}d` : "—"}</td>
                  <td className={`${td} whitespace-nowrap`}>
                    {s.priceFrom == null ? (
                      <span className="text-muted">no price</span>
                    ) : (
                      <span className={`rounded-full px-2.5 py-0.5 text-[10.5px] font-medium ${s.priceVisibility === "PUBLIC" ? "bg-(--st-green-bg) text-(--st-green-fg)" : s.priceVisibility === "MEMBERS" ? "bg-(--st-purple-bg) text-(--st-purple-fg)" : "bg-paper-2 text-body"}`}>
                        {s.priceVisibility === "PUBLIC" ? "Public" : s.priceVisibility === "MEMBERS" ? "Members only" : "Quote only"}
                      </span>
                    )}
                  </td>
                  <td className={td}><ModerateForm action={svcDecision.bind(null, s.id)} approveLabel="Approve listing" rejectLabel="Reject" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {decided.length > 0 && (
        <div className="card mt-8 overflow-hidden">
          <div className="border-b border-line px-5 py-3.5"><h2 className="text-[14px] font-semibold text-ink">Recently rejected listings</h2></div>
          <div className="divide-y divide-line">
            {decided.map((s) => (
              <div key={s.id} className="flex items-center justify-between px-5 py-3 text-[12.5px]">
                <span className="text-ink">{s.name} <span className="text-muted">· {s.provider.orgName}</span></span>
                <span className="text-muted">{s.moderationNote ?? "no note"}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
