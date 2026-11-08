export const instant = false

import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PageHead, StatusBadge } from "@/components/portal/ui";
import { ComplaintButtons } from "./buttons";

export default async function ComplaintsPage() {
  const complaints = await prisma.complaint.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      filedBy: { select: { name: true, email: true } },
      project: { select: { id: true, refNo: true } },
    },
  });

  return (
    <>
      <PageHead title="Complaints" sub="Disputes filed on projects — triage and resolve." />
      <div className="card divide-y divide-line">
        {complaints.length === 0 && <p className="px-5 py-10 text-center text-[13px] text-muted">No complaints filed.</p>}
        {complaints.map((c) => (
          <div key={c.id} className="px-5 py-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[14px] font-semibold text-ink">{c.subject}</span>
                  <StatusBadge status={c.status} />
                </div>
                <div className="mt-1 text-[12px] text-muted">
                  {c.project ? <Link href={`/admin/projects/${c.project.id}`} className="font-medium text-blue hover:underline">{c.project.refNo}</Link> : "—"} · filed by {c.filedBy.name} ({c.filedBy.email}) · {c.createdAt.toLocaleDateString()}
                </div>
                <p className="mt-2 max-w-xl text-[13px] leading-relaxed text-body">{c.details}</p>
                {c.resolution && (
                  <p className="mt-2 rounded-lg bg-(--st-green-bg) px-3 py-2 text-[12px] text-(--st-green-fg)">Resolution: {c.resolution}</p>
                )}
              </div>
              <ComplaintButtons id={c.id} status={c.status} />
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
