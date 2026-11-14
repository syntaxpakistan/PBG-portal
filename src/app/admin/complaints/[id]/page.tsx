export const instant = false

import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";
import { PageHead, StatusBadge } from "@/components/portal/ui";
import { ComplaintThread } from "@/components/portal/complaint-thread";
import { ComplaintButtons } from "../buttons";
import { complaintParties } from "@/lib/complaints";

export default async function AdminComplaintPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await requireRole("ADMIN");
  const complaint = await prisma.complaint.findUnique({
    where: { id },
    include: {
      filedBy: { select: { id: true, name: true, email: true, role: true } },
      project: {
        select: {
          id: true, refNo: true, status: true, customerId: true, providerUserId: true,
          customer: { select: { name: true } },
          provider: { select: { orgName: true } },
        },
      },
      messages: { include: { sender: { select: { name: true, role: true } } }, orderBy: { createdAt: "asc" } },
    },
  });
  if (!complaint) notFound();

  const parties = complaintParties({
    projectId: complaint.projectId,
    filedById: complaint.filedById,
    filerRole: complaint.filedBy.role,
    project: complaint.project,
  });

  const serialize = (channel: string) =>
    complaint.messages
      .filter((m) => m.channel === channel)
      .map((m) => ({
        id: m.id,
        senderId: m.senderId,
        senderName: m.sender.role === "ADMIN" ? "Support" : m.sender.name,
        body: m.body,
        createdAt: m.createdAt.toISOString(),
      }));

  const locked = complaint.status === "RESOLVED" || complaint.status === "DISMISSED";
  const customerMsgs = parties.customerUserId ? serialize("CUSTOMER") : [];
  const providerMsgs = parties.providerUserId ? serialize("PROVIDER") : [];
  const customerName = complaint.project?.customer.name ?? complaint.filedBy.name;
  const providerName = complaint.project?.provider.orgName ?? (complaint.filedBy.role === "PROVIDER" ? complaint.filedBy.name : null);

  return (
    <>
      <PageHead
        title={`${complaint.ticketNo}: ${complaint.subject}`}
        sub="Private channels — the client and the lab never see each other's side."
      />

      <div className="card mb-6 p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge status={complaint.status} />
              {complaint.project && (
                <Link href={`/admin/projects/${complaint.project.id}`} className="text-[12px] font-medium text-blue hover:underline">
                  {complaint.project.refNo} → view project
                </Link>
              )}
            </div>
            <p className="mt-2 max-w-3xl text-[13.5px] leading-relaxed text-body">{complaint.details}</p>
            <p className="mt-2 text-[12px] text-muted">
              Filed by {complaint.filedBy.name} ({complaint.filedBy.email}) · {complaint.createdAt.toLocaleString("en-PK", { day: "numeric", month: "short", year: "numeric" })}
            </p>
            {complaint.resolution && (
              <p className="mt-3 rounded-lg bg-(--st-green-bg) px-3 py-2 text-[12.5px] text-(--st-green-fg)">Resolution: {complaint.resolution}</p>
            )}
          </div>
          <ComplaintButtons id={complaint.id} status={complaint.status} />
        </div>
      </div>

      <div className={`grid gap-6 ${parties.customerUserId && parties.providerUserId ? "lg:grid-cols-2" : ""}`}>
        {parties.customerUserId && (
          <ComplaintThread
            complaintId={complaint.id}
            channel="CUSTOMER"
            title={`Client ↔ Support`}
            subtitle={`${customerName}${complaint.project ? ` · ${complaint.project.refNo}` : ""}`}
            messages={customerMsgs}
            selfId={session.user.id}
            locked={locked}
          />
        )}
        {parties.providerUserId && (
          <ComplaintThread
            complaintId={complaint.id}
            channel="PROVIDER"
            title={`Lab ↔ Support`}
            subtitle={`${providerName}${complaint.project ? ` · ${complaint.project.refNo}` : ""}`}
            messages={providerMsgs}
            selfId={session.user.id}
            locked={locked}
          />
        )}
      </div>
    </>
  );
}
