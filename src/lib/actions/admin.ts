"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { notify } from "@/lib/notify";
import { notifyProvidersForRfq } from "@/lib/actions/marketplace";
import type { VerificationStatus, ComplaintStatus, TxnStatus } from "@prisma/client";

async function requireAdmin() {
  const session = await getSession();
  if (!session || session.user.role !== "ADMIN") throw new Error("Admin only");
  return session;
}

async function audit(actorId: string, action: string, entity: string, entityId: string, meta?: string) {
  await prisma.auditLog.create({ data: { actorId, action, entity, entityId, meta } });
}

export async function setProviderStatus(id: string, status: VerificationStatus, note?: string) {
  const session = await requireAdmin();
  const p = await prisma.providerProfile.update({
    where: { id },
    data: { status, statusNote: note || null, verifiedAt: status === "APPROVED" ? new Date() : null },
  });
  await audit(session.user.id, `PROVIDER_${status}`, "ProviderProfile", id, note);
  await notify({
    toUserId: p.userId,
    subject:
      status === "APPROVED" ? `Verification approved — ${p.orgName} is live` :
      status === "REJECTED" ? `Verification not approved — ${p.orgName}` :
      `Account ${status.toLowerCase()} — ${p.orgName}`,
    body:
      status === "APPROVED"
        ? `Syntax verified ${p.orgName}. Incoming RFQs now route to you, the request board is open, and your approved service listings appear on the marketplace.`
        : `Your laboratory verification status is now ${status.toLowerCase()}.${note ? ` Reason: ${note}.` : ""} Contact admin@syntaxlife.pk if you believe this is an error.`,
    href: status === "APPROVED" ? "/lab" : "/lab/profile",
  });
  revalidatePath("/admin/verification");
}

export async function setSupplierStatus(id: string, status: VerificationStatus, note?: string) {
  const session = await requireAdmin();
  const p = await prisma.supplierProfile.update({
    where: { id },
    data: { status, statusNote: note || null, verifiedAt: status === "APPROVED" ? new Date() : null },
  });
  await audit(session.user.id, `SUPPLIER_${status}`, "SupplierProfile", id, note);
  await notify({
    toUserId: p.userId,
    subject:
      status === "APPROVED" ? `Verification approved — ${p.orgName} is live` :
      status === "REJECTED" ? `Verification not approved — ${p.orgName}` :
      `Account ${status.toLowerCase()} — ${p.orgName}`,
    body:
      status === "APPROVED"
        ? `Syntax verified ${p.orgName}. Your products are now visible to marketplace buyers and you can respond to enquiries.`
        : `Your supplier verification status is now ${status.toLowerCase()}.${note ? ` Reason: ${note}.` : ""} Contact admin@syntaxlife.pk if you believe this is an error.`,
    href: "/supplier",
  });
  revalidatePath("/admin/verification");
}

export async function setComplaintStatus(id: string, status: ComplaintStatus, resolution?: string) {
  const session = await requireAdmin();
  await prisma.complaint.update({ where: { id }, data: { status, resolution: resolution || null } });
  await audit(session.user.id, `COMPLAINT_${status}`, "Complaint", id, resolution);
  revalidatePath("/admin/complaints");
}

export async function setTxnStatus(id: string, status: TxnStatus) {
  const session = await requireAdmin();
  await prisma.transaction.update({ where: { id }, data: { status } });
  await audit(session.user.id, `TXN_${status}`, "Transaction", id);
  revalidatePath("/admin/transactions");
}

export async function setEnquiryStatus(id: string, status: "OPEN" | "ANSWERED" | "CLOSED") {
  const session = await getSession();
  const role = (session?.user as { role?: string } | undefined)?.role;
  if (!session || !["ADMIN", "SUPPLIER"].includes(role ?? "")) throw new Error("Forbidden");
  await prisma.enquiry.update({ where: { id }, data: { status } });
  await audit(session.user.id, `ENQUIRY_${status}`, "Enquiry", id);
  revalidatePath("/admin/marketplace");
  revalidatePath("/admin");
}

export async function setPlatformFee(formData: FormData) {
  const session = await requireAdmin();
  const fee = Number(formData.get("fee"));
  if (isNaN(fee) || fee < 0 || fee > 30) throw new Error("Fee must be 0–30%");
  await prisma.platformSetting.upsert({
    where: { key: "platform_fee_percent" },
    update: { value: String(fee) },
    create: { key: "platform_fee_percent", value: String(fee) },
  });
  await audit(session.user.id, "FEE_UPDATED", "PlatformSetting", "platform_fee_percent", `${fee}%`);
  revalidatePath("/admin/settings");
}

// ---------- content moderation (request board + service catalog) ----------

// approve/reject an RFQ's board visibility — approval publishes it + fires routing notifications
export async function setRfqBoardModeration(id: string, decision: "APPROVED" | "REJECTED", note?: string) {
  const session = await requireAdmin();
  const rfq = await prisma.rfq.findUniqueOrThrow({ where: { id } });
  if (rfq.visibility !== "BOARD") throw new Error("Not a board request");
  await prisma.rfq.update({ where: { id }, data: { moderation: decision, moderationNote: note || null } });
  await audit(session.user.id, `RFQ_BOARD_${decision}`, "Rfq", id, `${rfq.refNo}${note ? ` · ${note}` : ""}`);

  if (decision === "APPROVED") {
    await notify({
      toUserId: rfq.customerId,
      subject: `${rfq.refNo}: your request is live on the board`,
      body: `"${rfq.title}" was approved — all verified labs can now see it and submit sealed quotes.`,
      href: `/dashboard/rfqs/${rfq.id}`,
    });
    await notifyProvidersForRfq(rfq, true);
  } else {
    await notify({
      toUserId: rfq.customerId,
      subject: `${rfq.refNo}: request not approved`,
      body: `"${rfq.title}" was not approved for the open board.${note ? ` Reason: ${note}.` : ""} It remains visible only to labs you invited.`,
      href: `/dashboard/rfqs/${rfq.id}`,
    });
  }
  revalidatePath("/admin/moderation");
  revalidatePath("/admin/rfqs");
}

// approve/reject a service listing — only approved listings appear on the marketplace
export async function setServiceModeration(id: string, decision: "APPROVED" | "REJECTED", note?: string) {
  const session = await requireAdmin();
  const svc = await prisma.serviceListing.findUniqueOrThrow({ where: { id }, include: { provider: true } });
  await prisma.serviceListing.update({ where: { id }, data: { moderation: decision, moderationNote: note || null } });
  await audit(session.user.id, `SERVICE_${decision}`, "ServiceListing", id, `${svc.name}${note ? ` · ${note}` : ""}`);
  await notify({
    toUserId: svc.provider.userId,
    subject: decision === "APPROVED" ? `Service live: ${svc.name}` : `Service not approved: ${svc.name}`,
    body:
      decision === "APPROVED"
        ? `"${svc.name}" is now visible on the marketplace and your registry storefront.`
        : `"${svc.name}" was not approved for the marketplace.${note ? ` Reason: ${note}.` : ""} Edit it and resubmit for review.`,
    href: "/lab/services",
  });
  revalidatePath("/admin/moderation");
  revalidatePath("/lab/services");
  revalidatePath("/marketplace");
}

export async function setProductActive(id: string, active: boolean) {
  const session = await requireAdmin();
  await prisma.product.update({ where: { id }, data: { active } });
  await audit(session.user.id, active ? "PRODUCT_ACTIVATED" : "PRODUCT_DELISTED", "Product", id);
  revalidatePath("/admin/marketplace");
}

export async function setSubscriptionStatus(id: string, status: "ACTIVE" | "CANCELLED" | "EXPIRED") {
  const session = await requireAdmin();
  const data: Record<string, unknown> = { status };
  if (status === "ACTIVE") {
    data.startedAt = new Date();
    data.expiresAt = new Date(Date.now() + 30 * 864e5); // 30-day cycle
  }
  await prisma.subscription.update({ where: { id }, data });
  await audit(session.user.id, `SUBSCRIPTION_${status}`, "Subscription", id);
  revalidatePath("/admin/subscriptions");
}

export async function setSubscriptionPlan(id: string, plan: "BASIC" | "PRO" | "CUSTOM", priceUsd: number) {
  const session = await requireAdmin();
  await prisma.subscription.update({ where: { id }, data: { plan, priceUsd } });
  await audit(session.user.id, "SUBSCRIPTION_PLAN_CHANGED", "Subscription", id, `${plan} $${priceUsd}`);
  revalidatePath("/admin/subscriptions");
}

// confirm a renewal payment — extends/activates the cycle and clears the request
export async function extendSubscription(id: string) {
  const session = await requireAdmin();
  const sub = await prisma.subscription.findUniqueOrThrow({ where: { id } });
  const base = sub.expiresAt && sub.expiresAt > new Date() ? sub.expiresAt : new Date();
  await prisma.subscription.update({
    where: { id },
    data: {
      status: "ACTIVE",
      startedAt: sub.startedAt ?? new Date(),
      expiresAt: new Date(base.getTime() + 30 * 864e5),
      renewRequestedAt: null,
    },
  });
  await audit(session.user.id, "SUBSCRIPTION_RENEWED", "Subscription", id);
  await notify({ toUserId: sub.userId, subject: "Subscription renewed", body: `Your ${sub.plan} plan has been extended by 30 days.`, href: "/lab/profile" });
  revalidatePath("/admin/subscriptions");
}
