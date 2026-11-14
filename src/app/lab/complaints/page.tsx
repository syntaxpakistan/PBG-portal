export const instant = false

import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";
import { PageHead, StatusBadge } from "@/components/portal/ui";

export default async function LabComplaintsPage() {
  const session = await requireRole("PROVIDER");
  const complaints = await prisma.complaint.findMany({
    where: {
      OR: [{ filedById: session.user.id }, { project: { providerUserId: session.user.id } }],
    },
    orderBy: { createdAt: "desc" },
    include: { project: { select: { refNo: true, id: true } }, filedBy: { select: { name: true, role: true } } },
  });

  return (
    <>
      <PageHead title="Complaints" sub="Tickets you've filed plus disputes raised on your projects — each has a private thread with Syntax." />
      <div className="card divide-y divide-line">
        {complaints.length === 0 && (
          <p className="px-5 py-10 text-center text-[13px] text-muted">No complaints — tickets filed by you or about your projects appear here.</p>
        )}
        {complaints.map((c) => {
          const aboutYou = c.filedById !== session.user.id;
          return (
            <div key={c.id} className="px-5 py-4">
              <div className="flex items-center gap-2">
                <span className="font-mono text-[12px] font-semibold text-muted">{c.ticketNo}</span>
                <Link href={`/lab/complaints/${c.id}`} className="text-[14px] font-semibold text-ink hover:text-blue">{c.subject}</Link>
                <StatusBadge status={c.status} />
                {aboutYou && <span className="rounded-full bg-(--st-amber-bg) px-2 py-0.5 text-[10px] font-semibold text-(--st-amber-fg)">about your work</span>}
              </div>
              <div className="mt-1 text-[12px] text-muted">
                {c.project ? <Link href={`/lab/projects/${c.project.id}`} className="font-medium text-blue hover:underline">{c.project.refNo}</Link> : "General"} · filed by {aboutYou ? `${c.filedBy.name} (${c.filedBy.role === "CUSTOMER" ? "client" : "you"})` : "you"} · {c.createdAt.toLocaleDateString()}
              </div>
              <p className="mt-2 max-w-xl text-[13px] leading-relaxed text-body">{c.details}</p>
              {c.resolution && (
                <p className="mt-2 rounded-lg bg-(--st-green-bg) px-3 py-2 text-[12px] text-(--st-green-fg)">Syntax resolution: {c.resolution}</p>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}
