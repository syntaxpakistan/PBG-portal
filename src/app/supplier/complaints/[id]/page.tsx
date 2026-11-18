export const instant = false

import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";
import { PageHead, StatusBadge } from "@/components/portal/ui";
import { ComplaintThread } from "@/components/portal/complaint-thread";

export default async function SupplierComplaintPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await requireRole("SUPPLIER");
  const complaint = await prisma.complaint.findUnique({
    where: { id },
    include: {
      enquiry: { select: { id: true, enquiryNo: true, supplier: { select: { userId: true } } } },
      messages: {
        where: { channel: "PROVIDER" },
        include: { sender: { select: { name: true, role: true } } },
        orderBy: { createdAt: "asc" },
      },
    },
  });
  // filer, or the supplier on the disputed order
  if (!complaint || (complaint.filedById !== session.user.id && complaint.enquiry?.supplier.userId !== session.user.id)) notFound();

  const locked = complaint.status === "RESOLVED" || complaint.status === "DISMISSED";

  return (
    <>
      <PageHead title={`${complaint.ticketNo}: ${complaint.subject}`} sub="Private conversation with Gateway support, the buyer cannot see this thread." />

      <div className="card mb-6 p-5">
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge status={complaint.status} />
          {complaint.enquiry && (
            <Link href={`/supplier/enquiries/${complaint.enquiry.id}`} className="text-[12px] font-medium text-blue hover:underline">
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
        channel="PROVIDER"
        title="You ↔ Gateway support"
        subtitle={complaint.enquiry ? `Dispute on ${complaint.enquiry.enquiryNo}` : "Ticket you filed"}
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
