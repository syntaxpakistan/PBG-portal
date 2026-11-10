export const instant = false

import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";
import { PageHead } from "@/components/portal/ui";
import { isPriorityClientSubscription } from "@/lib/entitlements";
import { getGraceDays } from "@/lib/settings";

export default async function LabRfqsPage({
  searchParams,
}: {
  searchParams: Promise<{ invited?: string; tab?: string }>;
}) {
  const { invited, tab } = await searchParams;
  const session = await requireRole("PROVIDER");
  const profile = await prisma.providerProfile.findUnique({
    where: { userId: session.user.id },
    select: { id: true, status: true, serviceCategories: true, quotes: { select: { rfqId: true } }, declines: { select: { rfqId: true } }, invites: { select: { rfqId: true } } },
  });
  if (!profile) notFound();
  const approved = profile.status === "APPROVED";

  const quotedIds = new Set(profile.quotes.map((q) => q.rfqId));
  const declinedIds = new Set(profile.declines.map((d) => d.rfqId));
  const invitedIds = new Set(profile.invites.map((i) => i.rfqId));
  const excluded = [...quotedIds, ...declinedIds];

  const isBoard = tab === "board";

  const openRfqs = await prisma.rfq.findMany({
    where: {
      status: "OPEN",
      id: { notIn: excluded },
      // board tab: approved posts only. routed tab: routed RFQs + approved board posts +
      // unapproved board posts only when this lab was explicitly invited
      ...(isBoard
        ? { visibility: "BOARD", moderation: "APPROVED" }
        : {
            OR: [
              { visibility: "ROUTED" },
              { moderation: "APPROVED" },
              { invites: { some: { providerId: profile.id } } },
            ],
          }),
    },
    include: {
      // masked context only — org type, never the buyer's name/org (+ plan for priority badge)
      customer: { select: { customerProfile: { select: { orgType: true, city: true } }, subscription: { select: { plan: true, status: true, expiresAt: true } } } },
      _count: { select: { quotes: true } },
    },
    orderBy: { createdAt: "desc" },
  });
  const routed = profile.serviceCategories
    ? openRfqs.filter((r) =>
        profile.serviceCategories!.split(",").some((c) =>
          r.serviceCategory.toLowerCase().includes(c.trim().toLowerCase())
        )
      )
    : openRfqs;
  const graceDays = await getGraceDays();
  const inbox = (isBoard ? openRfqs : (routed.length ? routed : openRfqs).filter((r) => !invited || invitedIds.has(r.id)))
    .slice()
    .sort((a, b) => Number(isPriorityClientSubscription(b.customer.subscription, graceDays)) - Number(isPriorityClientSubscription(a.customer.subscription, graceDays)));

  const isPriorityClient = (r: (typeof openRfqs)[number]) => isPriorityClientSubscription(r.customer.subscription, graceDays);

  return (
    <>
      <PageHead
        title={isBoard ? "Request board" : "Incoming RFQs"}
        sub={
          !approved
            ? "Available once your lab is verified."
            : isBoard
              ? "Admin-approved requests open to every verified lab — buyer identities stay masked until award."
              : `${inbox.length} open request${inbox.length === 1 ? "" : "s"} routed to you.`
        }
        action={
          <span className="flex gap-1.5">
            <Link href="/lab/rfqs" className={`rounded-full px-3 py-1.5 text-[11.5px] font-medium ${!isBoard && !invited ? "bg-ink text-paper" : "border border-line text-body hover:bg-paper-2"}`}>Routed to you</Link>
            <Link href="/lab/rfqs?invited=1" className={`rounded-full px-3 py-1.5 text-[11.5px] font-medium ${!isBoard && invited ? "bg-ink text-paper" : "border border-line text-body hover:bg-paper-2"}`}>Invited only</Link>
            <Link href="/lab/rfqs?tab=board" className={`rounded-full px-3 py-1.5 text-[11.5px] font-medium ${isBoard ? "bg-ink text-paper" : "border border-line text-body hover:bg-paper-2"}`}>Open board</Link>
          </span>
        }
      />
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[880px] text-[12.5px]">
            <thead className="border-b border-line bg-paper-2">
              <tr>
                <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted">Request</th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted">Posted by</th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted">Samples</th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted">Deadline</th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted">Budget</th>
                <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-muted">Quotes</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {!approved && <tr><td colSpan={7} className="px-5 py-8 text-center text-muted">RFQs appear here once you&rsquo;re verified.</td></tr>}
              {approved && inbox.length === 0 && (
                <tr><td colSpan={7} className="px-5 py-10 text-center text-muted">
                  {isBoard ? "No open board requests right now — new posts appear here after admin approval." : `No open RFQs${invited ? " matching this filter" : ""} — you'll be notified when one routes to you.`}
                </td></tr>
              )}
              {approved && inbox.map((r) => (
                <tr key={r.id} className="transition-colors hover:bg-paper-2/60">
                  <td className="px-4 py-3.5 align-top">
                    <Link href={`/lab/rfqs/${r.id}`} className="font-medium text-ink hover:text-blue">{r.title}</Link>
                    <div className="mt-0.5 text-[11px] text-muted">
                      {r.refNo} · {r.serviceCategory} · {r.organism} · posted {r.createdAt.toLocaleDateString()}
                      {r.attachmentName && <span className="ml-1.5" title={r.attachmentName}>📎</span>}
                    </div>
                    <div className="mt-0.5 text-[11px] text-muted">Output: {r.requestedOutput}</div>
                  </td>
                  <td className="px-4 py-3.5 align-top">
                    <span className="text-body">Verified customer</span>
                    {isPriorityClient(r) && <span className="ml-1.5 rounded-full bg-(--st-amber-bg) px-2 py-0.5 text-[10px] font-semibold text-(--st-amber-fg)">Priority client</span>}
                    <div className="mt-0.5 text-[11px] text-muted">
                      {[r.customer.customerProfile?.orgType, r.customer.customerProfile?.city].filter(Boolean).join(" · ") || "identity masked until award"}
                    </div>
                  </td>
                  <td className="px-4 py-3.5 align-top whitespace-nowrap text-body">{r.sampleCount} × {r.sampleType}</td>
                  <td className="px-4 py-3.5 align-top whitespace-nowrap text-body">{r.deadline ? r.deadline.toLocaleDateString() : "Flexible"}</td>
                  <td className="px-4 py-3.5 align-top whitespace-nowrap text-body">{r.budgetHint ?? "—"}</td>
                  <td className="px-4 py-3.5 align-top whitespace-nowrap">
                    <span className="text-muted">{r._count.quotes} sealed</span>
                    {invitedIds.has(r.id) && <div className="mt-1"><span className="rounded-full bg-(--st-blue-bg) px-2 py-0.5 text-[10px] font-semibold text-(--st-blue-fg)">Invited</span></div>}
                    {isBoard && <div className="mt-1"><span className="rounded-full bg-(--st-purple-bg) px-2 py-0.5 text-[10px] font-medium text-(--st-purple-fg)">Open board</span></div>}
                  </td>
                  <td className="px-4 py-3.5 align-top text-right">
                    <Link href={`/lab/rfqs/${r.id}`} className="btn-outline !px-3 !py-1.5 text-[11.5px] whitespace-nowrap">Quote →</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
