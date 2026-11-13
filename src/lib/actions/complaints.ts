"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { notify, notifyAllAdmins } from "@/lib/notify";
import { complaintParties, PROVIDER_ROLES, type ComplaintChannel } from "@/lib/complaints";

export type { ComplaintChannel };

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
    },
  });
  if (complaint.status === "RESOLVED" || complaint.status === "DISMISSED") {
    throw new Error("This complaint is closed — the conversation is locked.");
  }

  const role = session.user.role ?? "";
  const { customerUserId, providerUserId } = complaintParties({
    projectId: complaint.projectId,
    filedById: complaint.filedById,
    filerRole: complaint.filedBy.role,
    project: complaint.project,
  });

  let counterpartyUserId: string | null = null;
  if (role === "ADMIN") {
    counterpartyUserId = channel === "CUSTOMER" ? customerUserId : providerUserId;
    if (!counterpartyUserId) throw new Error(`No ${channel === "CUSTOMER" ? "client" : "lab"} is a party to this complaint.`);
  } else if (role === "CUSTOMER") {
    if (channel !== "CUSTOMER" || (session.user.id !== complaint.filedById && session.user.id !== complaint.project?.customerId)) {
      throw new Error("Not your complaint.");
    }
  } else if (PROVIDER_ROLES.includes(role)) {
    if (channel !== "PROVIDER" || (session.user.id !== complaint.filedById && session.user.id !== complaint.project?.providerUserId)) {
      throw new Error("Not your complaint.");
    }
  } else {
    throw new Error("Not allowed.");
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
    await notify({
      toUserId: counterpartyUserId,
      subject: `Support replied on complaint: ${complaint.subject}`,
      body: `New message on your complaint${complaint.project ? ` (${complaint.project.refNo})` : ""}: "${text.slice(0, 140)}${text.length > 140 ? "…" : ""}"`,
      href: channel === "PROVIDER" ? `/lab/complaints/${complaintId}` : `/dashboard/complaints/${complaintId}`,
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
}
