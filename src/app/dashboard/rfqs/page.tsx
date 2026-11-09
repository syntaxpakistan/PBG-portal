export const instant = false

import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";
import { PageHead, StatusBadge } from "@/components/portal/ui";
import { DeleteRfqButton } from "./delete-button";

export default async function CustomerRfqsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const session = await requireRole("CUSTOMER");
  const rfqs = await prisma.rfq.findMany({
    where: { customerId: session.user.id, ...(status ? { status: status as "OPEN" | "AWARDED" | "CANCELLED" | "CLOSED" } : {}) },
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { quotes: true } }, project: { select: { id: true, refNo: true } } },
  });
  const STATUSES = ["OPEN", "AWARDED", "CLOSED", "CANCELLED"];

  return (
    <>
      <PageHead
        title="My RFQs"
        sub={`${rfqs.length} requests${status ? ` · filtered: ${status.toLowerCase()}` : ""}.`}
        action={<Link href="/dashboard/rfqs/new" className="btn-primary !py-2 text-[12.5px]">New RFQ</Link>}
      />
      <div className="mb-4 flex flex-wrap gap-2">
        <Link href="/dashboard/rfqs" className={`rounded-full px-3.5 py-1.5 text-[12px] font-medium ${!status ? "bg-ink text-paper" : "border border-line text-body hover:bg-paper-2"}`}>All</Link>
        {STATUSES.map((s) => (
          <Link key={s} href={`/dashboard/rfqs?status=${s}`} className={`rounded-full px-3.5 py-1.5 text-[12px] font-medium ${status === s ? "bg-ink text-paper" : "border border-line text-body hover:bg-paper-2"}`}>
            {s.charAt(0) + s.slice(1).toLowerCase()}
          </Link>
        ))}
      </div>
      <div className="card divide-y divide-line">
        {rfqs.length === 0 && <p className="px-5 py-10 text-center text-[13px] text-muted">No RFQs match this filter.</p>}
        {rfqs.map((r) => {
          const deletable = !r.project && r.status !== "AWARDED";
          return (
          <div key={r.id} className="flex items-center justify-between gap-3 px-5 py-3.5 transition-colors hover:bg-paper-2">
            <Link href={`/dashboard/rfqs/${r.id}`} className="min-w-0 flex-1">
              <div className="text-[13.5px] font-medium text-ink">{r.title}</div>
              <div className="mt-0.5 text-[11.5px] text-muted">
                {r.refNo} · {r.serviceCategory} · {r.organism} · {r.sampleCount} × {r.sampleType}
                {r.deadline ? ` · due ${r.deadline.toLocaleDateString()}` : ""}{r.budgetHint ? ` · ${r.budgetHint}` : ""}
              </div>
            </Link>
            <div className="flex shrink-0 items-center gap-3">
              {r.visibility === "BOARD" && r.moderation === "PENDING" && (
                <span className="rounded-full bg-(--st-amber-bg) px-2.5 py-0.5 text-[10.5px] font-medium text-(--st-amber-fg)">Board: awaiting review</span>
              )}
              {r.visibility === "BOARD" && r.moderation === "REJECTED" && (
                <span className="rounded-full bg-(--st-red-bg) px-2.5 py-0.5 text-[10.5px] font-medium text-(--st-red-fg)">Board: not approved</span>
              )}
              {r.visibility === "BOARD" && r.moderation === "APPROVED" && (
                <span className="rounded-full bg-(--st-purple-bg) px-2.5 py-0.5 text-[10.5px] font-medium text-(--st-purple-fg)">Live on board</span>
              )}
              {r._count.quotes > 0 && <span className="rounded-full bg-navy px-2 py-0.5 text-[10.5px] font-semibold text-yellow">{r._count.quotes} quotes</span>}
              <StatusBadge status={r.status} />
              {deletable && <DeleteRfqButton rfqId={r.id} refNo={r.refNo} />}
            </div>
          </div>
          );
        })}
      </div>
    </>
  );
}
