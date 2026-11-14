export const instant = false

import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PageHead, StatusBadge } from "@/components/portal/ui";
import { Pagination, PAGE_SIZE, pageOf, qs } from "@/components/portal/pagination";
import { pkr } from "@/lib/constants";

const STATUSES = ["OFFER_SELECTED", "SAMPLE_AWAITED", "SAMPLE_RECEIVED", "WORK_IN_PROGRESS", "RESULTS_AVAILABLE", "COMPLETED", "CANCELLED"] as const;

export default async function AdminProjectsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; page?: string }>;
}) {
  const sp = await searchParams;
  const { status } = sp;
  const page = pageOf(sp);
  const where = status ? { status: status as (typeof STATUSES)[number] } : {};
  const [projects, total] = await Promise.all([
    prisma.project.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: {
        customer: { select: { name: true, customerProfile: { select: { orgName: true } } } },
        provider: { select: { orgName: true, orgNo: true } },
        rfq: { select: { title: true, refNo: true } },
        quote: { select: { price: true, quoteNo: true } },
        transaction: { select: { status: true } },
        _count: { select: { complaints: true } },
      },
    }),
    prisma.project.count({ where }),
  ]);

  return (
    <>
      <PageHead title="Project oversight" sub={`${total} projects${status ? ` · filtered: ${status.replaceAll("_", " ").toLowerCase()}` : ""}.`} />
      <div className="mb-4 flex flex-wrap gap-2">
        <Link href="/admin/projects" className={`rounded-full px-3.5 py-1.5 text-[12px] font-medium ${!status ? "bg-ink text-paper" : "border border-line text-body hover:bg-paper-2"}`}>All</Link>
        {STATUSES.map((s) => (
          <Link key={s} href={`/admin/projects?status=${s}`} className={`rounded-full px-3.5 py-1.5 text-[12px] font-medium ${status === s ? "bg-ink text-paper" : "border border-line text-body hover:bg-paper-2"}`}>
            {s.replaceAll("_", " ").charAt(0) + s.replaceAll("_", " ").slice(1).toLowerCase()}
          </Link>
        ))}
      </div>
      <div className="card overflow-hidden">
        <div className="overflow-x-auto"><table className="w-full min-w-[820px] text-left text-[13px]">
          <thead className="border-b border-line bg-paper-2 text-[11px] uppercase tracking-wider text-muted">
            <tr>
              <th className="px-5 py-3 font-semibold">Project</th>
              <th className="px-5 py-3 font-semibold">Client</th>
              <th className="px-5 py-3 font-semibold">Laboratory</th>
              <th className="px-5 py-3 font-semibold">Value</th>
              <th className="px-5 py-3 font-semibold">Status</th>
              <th className="px-5 py-3 font-semibold">Payment</th>
              <th className="px-5 py-3 font-semibold">Open</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {projects.map((p) => (
              <tr key={p.id} className="hover:bg-paper-2/60">
                <td className="px-5 py-3">
                  <Link href={`/admin/projects/${p.id}`} className="font-medium text-blue hover:underline">{p.refNo}</Link>
                  <div className="text-[11px] text-muted">{p.rfq.refNo} — {p.rfq.title} · {p.createdAt.toLocaleDateString()}{p.dueAt ? ` · due ${p.dueAt.toLocaleDateString()}` : ""}</div>
                </td>
                <td className="px-5 py-3 text-body">{p.customer.customerProfile?.orgName ?? p.customer.name}</td>
                <td className="px-5 py-3 text-body">
                  {p.provider.orgName}
                  <div className="font-mono text-[10.5px] text-muted">{p.provider.orgNo}</div>
                </td>
                <td className="px-5 py-3 text-body">{pkr(p.quote.price)}</td>
                <td className="px-5 py-3"><StatusBadge status={p.status} /></td>
                <td className="px-5 py-3">{p.transaction ? <StatusBadge status={p.transaction.status} /> : <span className="text-muted">—</span>}</td>
                <td className="px-5 py-3">
                  <Link href={`/admin/projects/${p.id}`} className="font-medium text-blue hover:underline">View →</Link>
                  {p._count.complaints > 0 && <div className="text-[10.5px] text-(--st-red-fg)">{p._count.complaints} complaint{p._count.complaints > 1 ? "s" : ""}</div>}
                </td>
              </tr>
            ))}
            {projects.length === 0 && <tr><td colSpan={7} className="px-5 py-8 text-center text-muted">No projects match this filter.</td></tr>}
          </tbody>
        </table></div>
        <Pagination page={page} total={total} base={`/admin/projects${qs({ status })}`} />
      </div>
    </>
  );
}
