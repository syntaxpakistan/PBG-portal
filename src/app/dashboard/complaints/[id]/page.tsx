export const instant = false

import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";
import { PageHead, StatusBadge } from "@/components/portal/ui";
import { ComplaintThread } from "@/components/portal/complaint-thread";

export default async function CustomerComplaintPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await requireRole("CUSTOMER");
  const complaint = await prisma.complaint.findUnique({
    where: { id },
    include: {
      project: { select: { id: true, refNo: true, customerId: true, providerUserId: true } },
      enquiry: { select: { id: true, enquiryNo: true, buyerId: true } },
      messages: {
        where: { channel: "CUSTOMER" },
        include: { sender: { select: { name: true, role: true } } },
        orderBy: { createdAt: "asc" },
      },
    },
  });
  // filer, the project's customer, or the buyer on a disputed supply order
  if (!complaint || (complaint.filedById !== session.user.id && complaint.project?.customerId !== session.user.id && complaint.enquiry?.buyerId !== session.user.id)) notFound();

  const locked = complaint.status === "RESOLVED" || complaint.status === "DISMISSED";

  return (
    <>
      <PageHead title={`${complaint.ticketNo}: ${complaint.subject}`} sub="Private conversation with Gateway support about this issue." />

      <div className="card mb-6 p-5">
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge status={complaint.status} />
          {complaint.project && (
            <Link href={`/dashboard/projects/${complaint.project.id}`} className="text-[12px] font-medium text-blue hover:underline">
              {complaint.project.refNo} → view project
            </Link>
          )}
          {complaint.enquiry && (
            <Link href={`/dashboard/enquiries/${complaint.enquiry.id}`} className="text-[12px] font-medium text-blue hover:underline">
              {complaint.enquiry.enquiryNo} → view order
            </Link>
          )}
        </div>
        <p className="mt-2 max-w-3xl text-[13.5px] leading-relaxed text-body">{complaint.details}</p>
        <p className="mt-2 text-[12px] text-muted">Filed {complaint.createdAt.toLocaleDateString("en-PK", { day: "numeric", month: "short", year: "numeric" })}</p>
        {complaint.resolution && (
          <p className="mt-3 rounded-lg bg-(--st-green-bg) px-3 py-2 text-[12.5px] text-(--st-green-fg)">Gateway resolution: {complaint.resolution}</p>
        )}
      </div>

      <ComplaintThread
        complaintId={complaint.id}
        channel="CUSTOMER"
        title="You ↔ Gateway support"
        subtitle={complaint.project ? `Complaint on ${complaint.project.refNo}` : complaint.enquiry ? `Dispute on ${complaint.enquiry.enquiryNo}` : "General complaint"}
        messages={complaint.messages.map((m) => ({
          id: m.id,
          senderId: m.senderId,
          senderName: m.sender.role === "ADMIN" ? "Support" : m.sender.name,
          body: m.body,
          createdAt: m.createdAt.toISOString(),
        }))}
        selfId={session.user.id}
        locked={locked}
      />
    </>
  );
}
