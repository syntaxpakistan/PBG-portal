export const instant = false

import Link from "next/link";
import { PauseCircle } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";
import { PageHead, StatusBadge } from "@/components/portal/ui";
import { slaInfo } from "@/lib/constants";

export default async function CustomerProjectsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const session = await requireRole("CUSTOMER");
  const projects = await prisma.project.findMany({
    where: { customerId: session.user.id, ...(status && status !== "active" ? { status: status as never } : {}) },
    orderBy: { createdAt: "desc" },
    include: {
      rfq: { select: { title: true, serviceCategory: true } },
      provider: { select: { orgName: true } },
      resultFiles: { select: { released: true } },
    },
  });
  const shown = status === "active"
    ? projects.filter((p) => !["COMPLETED", "CANCELLED"].includes(p.status))
    : projects;

  const FILTERS = [
    { key: "", label: "All" },
    { key: "active", label: "Active" },
    { key: "SAMPLE_AWAITED", label: "Ship samples" },
    { key: "WORK_IN_PROGRESS", label: "In the lab" },
    { key: "RESULTS_AVAILABLE", label: "Results ready" },
    { key: "COMPLETED", label: "Completed" },
    { key: "CANCELLED", label: "Cancelled" },
  ];

  return (
    <>
      <PageHead title="My projects" sub={`${shown.length} project${shown.length === 1 ? "" : "s"}${status ? " · filtered" : ""}.`} />
      <div className="mb-4 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <Link key={f.key} href={f.key ? `/dashboard/projects?status=${f.key}` : "/dashboard/projects"}
            className={`rounded-full px-3.5 py-1.5 text-[12px] font-medium ${(status ?? "") === f.key ? "bg-ink text-paper" : "border border-line text-body hover:bg-paper-2"}`}>
            {f.label}
          </Link>
        ))}
      </div>
      <div className="card divide-y divide-line">
        {shown.length === 0 && <p className="px-5 py-10 text-center text-[13px] text-muted">No projects here — award a quote to start one.</p>}
        {shown.map((p) => {
          const sla = slaInfo(p.dueAt, p.status, p.pausedAt);
          return (
            <Link key={p.id} href={`/dashboard/projects/${p.id}`} className="flex items-center justify-between px-5 py-4 transition-colors hover:bg-paper-2">
              <div className="min-w-0">
                <div className="flex items-center gap-2 text-[13.5px] font-medium text-ink">
                  {p.refNo} — {p.rfq.title}
                  {p.pausedAt && <PauseCircle className="size-3.5 text-(--st-orange-fg)" />}
                </div>
                <div className="mt-0.5 text-[11.5px] text-muted">
                  {p.provider.orgName} · {p.rfq.serviceCategory} · {p.resultFiles.length} deliverable{p.resultFiles.length === 1 ? "" : "s"}
                  {sla && (sla.paused
                    ? <span className="ml-2 font-semibold text-(--st-orange-fg)">paused</span>
                    : sla.overdue
                    ? <span className="ml-2 font-semibold text-(--st-red-fg)">{Math.abs(sla.days)}d overdue</span>
                    : <span className="ml-2">due in {sla.days}d</span>)}
                </div>
              </div>
              <StatusBadge status={p.status} />
            </Link>
          );
        })}
      </div>
    </>
  );
}
