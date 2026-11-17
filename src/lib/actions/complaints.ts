"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { notify, notifyAllAdmins } from "@/lib/notify";
import { nextRef } from "@/lib/refs";
import { complaintParties, type ComplaintChannel } from "@/lib/complaints";

export type { ComplaintChannel };

// buyer or supplier raises a dispute on a supply order — one ticket, two
// private admin-mediated channels (buyer = CUSTOMER, supplier = PROVIDER)
export async function fileEnquiryComplaint(enquiryId: string, formData: FormData) {
  const session = await getSession();
  if (!session) redirect("/login");
  const enquiry = await prisma.enquiry.findUnique({
    where: { id: enquiryId },
    include: { supplier: { select: { userId: true } } },
  });
  const isParty =
    enquiry &&
    (session.user.id === enquiry.buyerId ||
      session.user.id === enquiry.supplier.userId ||
      (session.user.role ?? "") === "ADMIN");
  if (!isParty) throw new Error("Only the buyer or supplier can file a complaint on this order.");
  // idempotent — one open complaint per order per filer; double-clicks can't spam the queue
  const open = await prisma.complaint.findFirst({
    where: { enquiryId, filedById: session.user.id, status: { in: ["OPEN", "IN_REVIEW"] } },
    select: { id: true },
  });
  if (open) {
    revalidatePath(`/supplier/enquiries/${enquiryId}`);
    revalidatePath(`/dashboard/enquiries/${enquiryId}`);
    revalidatePath(`/lab/enquiries/${enquiryId}`);
    return;
  }
  const complaint = await prisma.complaint.create({
    data: {
      ticketNo: await nextRef("CMP", { yearly: true }),
      enquiryId,
      filedById: session.user.id,
      subject: String(formData.get("subject")),
      details: String(formData.get("details")),
    },
  });
  await prisma.auditLog.create({
    data: { actorId: session.user.id, action: "COMPLAINT_FILED", entity: "Enquiry", entityId: enquiryId, meta: `${complaint.ticketNo} · ${String(formData.get("subject"))}` },
  });
  await notifyAllAdmins(
    `Complaint ${complaint.ticketNo}: ${String(formData.get("subject"))}`,
    `${session.user.name ?? "A user"} filed ticket ${complaint.ticketNo} on order ${enquiry.enquiryNo}. Open it to mediate between the parties.`,
    `/admin/complaints/${complaint.id}`
  );
  revalidatePath(`/supplier/enquiries/${enquiryId}`);
  revalidatePath(`/dashboard/enquiries/${enquiryId}`);
  revalidatePath(`/lab/enquiries/${enquiryId}`);
}

export async function sendComplaintMessage(complaintId: string, channel: ComplaintChannel, body: string) {
  const session = await getSession();
  if (!session) redirect("/login");
  const text = body.trim();
  if (!text) return;
  if (text.length > 2000) throw new Error("Message too long — keep it under 2000 characters.");

  const complaint = await prisma.complaint.findUniqueOrThrow({
    where: { id: complaintId },
    include: {
      filedBy: { select: { role: true } },
      project: { select: { id: true, refNo: true, customerId: true, providerUserId: true } },
      enquiry: { select: { id: true, enquiryNo: true, buyerId: true, supplier: { select: { userId: true } } } },
    },
  });
  if (complaint.status === "RESOLVED" || complaint.status === "DISMISSED") {
    throw new Error("This complaint is closed — the conversation is locked.");
  }

  const role = session.user.role ?? "";
  const { customerUserId, providerUserId } = complaintParties({
    projectId: complaint.projectId,
    enquiryId: complaint.enquiryId,
    filedById: complaint.filedById,
    filerRole: complaint.filedBy.role,
    project: complaint.project,
    enquiry: complaint.enquiry
      ? { buyerId: complaint.enquiry.buyerId, supplierUserId: complaint.enquiry.supplier.userId }
      : null,
  });

  let counterpartyUserId: string | null = null;
  if (role === "ADMIN") {
    counterpartyUserId = channel === "CUSTOMER" ? customerUserId : providerUserId;
    if (!counterpartyUserId) throw new Error(`No ${channel === "CUSTOMER" ? "client" : "provider"} is a party to this complaint.`);
  } else {
    // the channel a party may post on is decided by which SIDE of the dispute
    // they sit on, not their account role — a lab buying supplies is the buyer
    const allowedChannel =
      session.user.id === customerUserId ? "CUSTOMER"
      : session.user.id === providerUserId ? "PROVIDER"
      : null;
    if (!allowedChannel || channel !== allowedChannel) throw new Error("Not your complaint.");
  }

  await prisma.complaintMessage.create({
    data: { complaintId, channel, senderId: session.user.id, body: text },
  });
  // a live conversation means someone is reviewing it — OPEN bumps to IN_REVIEW
  if (complaint.status === "OPEN") {
    await prisma.complaint.update({ where: { id: complaintId }, data: { status: "IN_REVIEW" } });
  }
  await prisma.auditLog.create({
    data: { actorId: session.user.id, action: "COMPLAINT_MESSAGE", entity: "Complaint", entityId: complaintId, meta: channel },
  });

  if (role === "ADMIN" && counterpartyUserId) {
    const counterparty = await prisma.user.findUnique({ where: { id: counterpartyUserId }, select: { role: true } });
    const base =
      counterparty?.role === "SUPPLIER" ? "/supplier/complaints"
      : counterparty?.role === "CUSTOMER" ? "/dashboard/complaints"
      : "/lab/complaints";
    const ref = complaint.project ? ` (${complaint.project.refNo})` : complaint.enquiry ? ` (${complaint.enquiry.enquiryNo})` : "";
    await notify({
      toUserId: counterpartyUserId,
      subject: `Support replied on complaint: ${complaint.subject}`,
      body: `New message on your complaint${ref}: "${text.slice(0, 140)}${text.length > 140 ? "…" : ""}"`,
      href: `${base}/${complaintId}`,
    });
  } else if (role !== "ADMIN") {
    await notifyAllAdmins(
      `Complaint reply from ${session.user.name ?? "a party"}: ${complaint.subject}`,
      `"${text.slice(0, 140)}${text.length > 140 ? "…" : ""}"`,
      `/admin/complaints/${complaintId}`
    );
  }

  revalidatePath(`/admin/complaints/${complaintId}`);
  revalidatePath(`/dashboard/complaints/${complaintId}`);
  revalidatePath(`/lab/complaints/${complaintId}`);
  revalidatePath(`/supplier/complaints/${complaintId}`);
}
