export const instant = false

import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";
import { PageHead, StatusBadge } from "@/components/portal/ui";

export default async function CustomerComplaintsPage() {
  const session = await requireRole("CUSTOMER");
  const complaints = await prisma.complaint.findMany({
    where: { filedById: session.user.id },
    orderBy: { createdAt: "desc" },
    include: { project: { select: { refNo: true, id: true } } },
  });

  return (
    <>
      <PageHead title="My complaints" sub="Disputes you've filed with Syntax — track triage and resolution." />
      <div className="card divide-y divide-line">
        {complaints.length === 0 && (
          <p className="px-5 py-10 text-center text-[13px] text-muted">No complaints filed. Open a project and use “Report an issue” to file one.</p>
        )}
        {complaints.map((c) => (
          <div key={c.id} className="px-5 py-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[14px] font-semibold text-ink">{c.subject}</span>
                  <StatusBadge status={c.status} />
                </div>
                <div className="mt-1 text-[12px] text-muted">
                  {c.project ? <Link href={`/dashboard/projects/${c.project.id}`} className="font-medium text-blue hover:underline">{c.project.refNo}</Link> : "General"} · filed {c.createdAt.toLocaleDateString()}
                </div>
                <p className="mt-2 max-w-xl text-[13px] leading-relaxed text-body">{c.details}</p>
                {c.resolution && (
                  <p className="mt-2 rounded-lg bg-(--st-green-bg) px-3 py-2 text-[12px] text-(--st-green-fg)">Syntax resolution: {c.resolution}</p>
                )}
                {c.status === "OPEN" && <p className="mt-2 text-[11.5px] text-muted">Awaiting review by Syntax operations.</p>}
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
