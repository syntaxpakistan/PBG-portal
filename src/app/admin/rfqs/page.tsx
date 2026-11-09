export const instant = false

import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PageHead, StatusBadge } from "@/components/portal/ui";

export default async function AdminRfqsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const where = status ? { status: status as "OPEN" | "AWARDED" | "CANCELLED" | "CLOSED" } : {};
  const rfqs = await prisma.rfq.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      customer: { select: { name: true, customerProfile: { select: { orgName: true } } } },
      _count: { select: { quotes: true, invites: true } },
      project: { select: { id: true, refNo: true } },
    },
  });

  const STATUSES = ["OPEN", "AWARDED", "CLOSED", "CANCELLED"];

  return (
    <>
      <PageHead
        title="RFQ oversight"
        sub={`${rfqs.length} requests${status ? ` · filtered: ${status.toLowerCase()}` : ""}.`}
        action={<Link href="/api/admin/export/rfqs" className="btn-outline !py-2 text-[12.5px]">Export CSV</Link>}
      />
      <div className="mb-4 flex flex-wrap gap-2">
        <Link href="/admin/rfqs" className={`rounded-full px-3.5 py-1.5 text-[12px] font-medium ${!status ? "bg-ink text-paper" : "border border-line text-body hover:bg-paper-2"}`}>All</Link>
        {STATUSES.map((s) => (
          <Link key={s} href={`/admin/rfqs?status=${s}`} className={`rounded-full px-3.5 py-1.5 text-[12px] font-medium ${status === s ? "bg-ink text-paper" : "border border-line text-body hover:bg-paper-2"}`}>
            {s.charAt(0) + s.slice(1).toLowerCase()}
          </Link>
        ))}
      </div>
      <div className="card overflow-hidden">
        <div className="overflow-x-auto"><table className="w-full min-w-[760px] text-left text-[13px]">
          <thead className="border-b border-line bg-paper-2 text-[11px] uppercase tracking-wider text-muted">
            <tr>
              <th className="px-5 py-3 font-semibold">RFQ</th>
              <th className="px-5 py-3 font-semibold">Customer</th>
              <th className="px-5 py-3 font-semibold">Category</th>
              <th className="px-5 py-3 font-semibold">Quotes</th>
              <th className="px-5 py-3 font-semibold">Board</th>
              <th className="px-5 py-3 font-semibold">Status</th>
              <th className="px-5 py-3 font-semibold">Project</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {rfqs.map((r) => (
              <tr key={r.id} className="hover:bg-paper-2/60">
                <td className="px-5 py-3">
                  <div className="font-medium text-ink">{r.refNo} — {r.title}</div>
                  <div className="text-[11px] text-muted">{r.sampleCount}× {r.sampleType} · {r.createdAt.toLocaleDateString()}{r.deadline ? ` · due ${r.deadline.toLocaleDateString()}` : ""}</div>
                </td>
                <td className="px-5 py-3 text-body">{r.customer.customerProfile?.orgName ?? r.customer.name}</td>
                <td className="px-5 py-3 text-body">{r.serviceCategory}</td>
                <td className="px-5 py-3 text-body">{r._count.quotes}{r._count.invites > 0 ? ` · ${r._count.invites} invited` : ""}</td>
                <td className="px-5 py-3">
                  {r.visibility === "ROUTED" ? <span className="text-muted">routed</span> :
                   r.moderation === "PENDING" ? <span className="rounded-full bg-(--st-amber-bg) px-2 py-0.5 text-[10.5px] font-medium text-(--st-amber-fg)">board · pending</span> :
                   r.moderation === "REJECTED" ? <span className="rounded-full bg-(--st-red-bg) px-2 py-0.5 text-[10.5px] font-medium text-(--st-red-fg)">board · rejected</span> :
                   <span className="rounded-full bg-(--st-green-bg) px-2 py-0.5 text-[10.5px] font-medium text-(--st-green-fg)">board · live</span>}
                </td>
                <td className="px-5 py-3"><StatusBadge status={r.status} /></td>
                <td className="px-5 py-3">
                  {r.project ? <Link href={`/admin/projects/${r.project.id}`} className="font-medium text-blue hover:underline">{r.project.refNo} →</Link> : <span className="text-muted">—</span>}
                </td>
              </tr>
            ))}
            {rfqs.length === 0 && <tr><td colSpan={7} className="px-5 py-8 text-center text-muted">No RFQs match this filter.</td></tr>}
          </tbody>
        </table></div>
      </div>
    </>
  );
}
