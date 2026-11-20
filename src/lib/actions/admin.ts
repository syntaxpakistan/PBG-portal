"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { notify } from "@/lib/notify";
import { notifyProvidersForRfq } from "@/lib/actions/marketplace";
import { issueInvoice } from "@/lib/actions/billing";
import { PLANS, planTermLabel, planTermMs, type PlanKey } from "@/lib/plans";
import { pkr } from "@/lib/constants";
import { discountNote, getInvoiceDueDays, getPlanPricing } from "@/lib/settings";
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
  await prisma.user.update({ where: { id: p.userId }, data: { emailVerified: status === "APPROVED" } });
  await audit(session.user.id, `PROVIDER_${status}`, "ProviderProfile", id, note);
  await notify({
    toUserId: p.userId,
    subject:
      status === "APPROVED" ? `Verification approved, ${p.orgName} (${p.orgNo}) is live` :
      status === "REJECTED" ? `Verification not approved, ${p.orgName}` :
      `Account ${status.toLowerCase()}, ${p.orgName}`,
    body:
      status === "APPROVED"
        ? `Gateway verified ${p.orgName}, your lab account number is ${p.orgNo}. Incoming RFQs now route to you, the request board is open, and your approved service listings appear on the marketplace.`
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
  await prisma.user.update({ where: { id: p.userId }, data: { emailVerified: status === "APPROVED" } });
  await audit(session.user.id, `SUPPLIER_${status}`, "SupplierProfile", id, note);
  await notify({
    toUserId: p.userId,
    subject:
      status === "APPROVED" ? `Verification approved, ${p.orgName} (${p.orgNo}) is live` :
      status === "REJECTED" ? `Verification not approved, ${p.orgName}` :
      `Account ${status.toLowerCase()}, ${p.orgName}`,
    body:
      status === "APPROVED"
        ? `Gateway verified ${p.orgName}, your supplier account number is ${p.orgNo}. Your products are now visible to marketplace buyers and you can respond to enquiries.`
        : `Your supplier verification status is now ${status.toLowerCase()}.${note ? ` Reason: ${note}.` : ""} Contact admin@syntaxlife.pk if you believe this is an error.`,
    href: "/supplier",
  });
  revalidatePath("/admin/verification");
}

export async function setCustomerStatus(id: string, status: VerificationStatus, note?: string) {
  const session = await requireAdmin();
  const p = await prisma.customerProfile.update({
    where: { id },
    data: { status, statusNote: note || null, verifiedAt: status === "APPROVED" ? new Date() : null },
    include: { user: { select: { name: true } } },
  });
  await prisma.user.update({ where: { id: p.userId }, data: { emailVerified: status === "APPROVED" } });
  await audit(session.user.id, `CUSTOMER_${status}`, "CustomerProfile", id, note);
  const label = p.orgName || p.user.name;
  await notify({
    toUserId: p.userId,
    subject:
      status === "APPROVED" ? `Account approved, welcome to the Gateway` :
      status === "REJECTED" ? `Registration not approved, ${label}` :
      `Account ${status.toLowerCase()}, ${label}`,
    body:
      status === "APPROVED"
        ? `the Gateway team approved your registration, your client account number is ${p.orgNo}. You can now post RFQs, receive lab quotes, and run projects on the Gateway.`
        : `Your client registration status is now ${status.toLowerCase()}.${note ? ` Reason: ${note}.` : ""} Contact admin@syntaxlife.pk if you believe this is an error.`,
    href: "/dashboard",
  });
  revalidatePath("/admin/verification");
}

export async function setComplaintStatus(id: string, status: ComplaintStatus, resolution?: string) {
  const session = await requireAdmin();
  const complaint = await prisma.complaint.update({
    where: { id },
    data: { status, resolution: resolution || null },
    include: {
      project: { select: { providerUserId: true, customerId: true } },
      enquiry: { select: { buyerId: true, supplier: { select: { userId: true } } } },
    },
  });
  await audit(session.user.id, `COMPLAINT_${status}`, "Complaint", id, resolution);
  // tell both parties, the filer and the counterparty, that the case moved
  const notifyIds = new Set([complaint.filedById, complaint.project?.customerId, complaint.project?.providerUserId, complaint.enquiry?.buyerId, complaint.enquiry?.supplier.userId].filter((x): x is string => !!x && x !== session.user.id));
  const roles = new Map(
    (await prisma.user.findMany({ where: { id: { in: [...notifyIds] } }, select: { id: true, role: true } })).map((u) => [u.id, u.role])
  );
  for (const uid of notifyIds) {
    const r = roles.get(uid);
    await notify({
      toUserId: uid,
      subject: `Complaint ${status === "RESOLVED" ? "resolved" : status === "DISMISSED" ? "closed" : "under review"}: ${complaint.subject}`,
      body: resolution ? `Resolution: ${resolution}` : `Your complaint is now ${status.toLowerCase().replace("_", " ")}.`,
      href: r === "PROVIDER" ? `/lab/complaints/${id}` : r === "SUPPLIER" ? `/supplier/complaints/${id}` : r === "ADMIN" ? `/admin/complaints/${id}` : `/dashboard/complaints/${id}`,
    });
  }
  revalidatePath("/admin/complaints");
  revalidatePath(`/admin/complaints/${id}`);
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
  if (role === "SUPPLIER") {
    const enquiry = await prisma.enquiry.findUnique({ where: { id }, select: { supplier: { select: { userId: true } } } });
    if (enquiry?.supplier.userId !== session.user.id) throw new Error("Forbidden");
  }
  await prisma.enquiry.update({ where: { id }, data: { status } });
  await audit(session.user.id, `ENQUIRY_${status}`, "Enquiry", id);
  revalidatePath("/admin/marketplace");
  revalidatePath("/admin");
}

// editable platform settings, whitelist keeps arbitrary keys out of the table
const EDITABLE_SETTINGS: Record<string, { label: string; min: number; max: number; suffix?: string }> = {
  platform_fee_percent: { label: "Platform fee", min: 0, max: 30, suffix: "%" },
  plan_price_basic: { label: "Basic plan price", min: 0, max: 10000000, suffix: "PKR" },
  plan_price_pro: { label: "Pro plan price", min: 0, max: 10000000, suffix: "PKR" },
  plan_price_custom: { label: "Elite plan price", min: 0, max: 10000000, suffix: "PKR" },
  plan_discount_basic: { label: "Basic plan discount", min: 0, max: 90, suffix: "%" },
  plan_discount_pro: { label: "Pro plan discount", min: 0, max: 90, suffix: "%" },
  plan_discount_custom: { label: "Elite plan discount", min: 0, max: 90, suffix: "%" },
  addon_analytics_price: { label: "Analytics add-on price", min: 0, max: 10000000, suffix: "PKR" },
  addon_analytics_discount: { label: "Analytics add-on discount", min: 0, max: 90, suffix: "%" },
  grace_days: { label: "Grace period", min: 0, max: 60, suffix: "days" },
  invoice_due_days: { label: "Invoice due window", min: 1, max: 90, suffix: "days" },
  rfq_rate_limit_per_day: { label: "RFQ rate limit", min: 1, max: 100, suffix: "per day" },
  enquiry_rate_limit_per_day: { label: "Enquiry rate limit", min: 1, max: 200, suffix: "per day" },
};

export async function setPlatformSetting(key: string, value: string) {
  const session = await requireAdmin();
  const def = EDITABLE_SETTINGS[key];
  if (!def) throw new Error("Unknown setting");
  const num = Number(value);
  if (!Number.isFinite(num) || num < def.min || num > def.max) {
    throw new Error(`${def.label} must be between ${def.min} and ${def.max}`);
  }
  await prisma.platformSetting.upsert({
    where: { key },
    update: { value: String(num) },
    create: { key, value: String(num) },
  });
  await audit(session.user.id, "SETTING_UPDATED", "PlatformSetting", key, `${num}${def.suffix ? ` ${def.suffix}` : ""}`);
  revalidatePath("/admin/settings");
}

// free-text settings, payment instructions shown on every invoice
const EDITABLE_TEXT_SETTINGS: Record<string, { label: string; maxLen: number }> = {
  payment_account_title: { label: "Account title", maxLen: 120 },
  payment_bank_name: { label: "Bank name", maxLen: 120 },
  payment_iban: { label: "IBAN / account no", maxLen: 60 },
  payment_instructions: { label: "Payment instructions", maxLen: 600 },
};

export async function setPlatformTextSetting(key: string, value: string) {
  const session = await requireAdmin();
  const def = EDITABLE_TEXT_SETTINGS[key];
  if (!def) throw new Error("Unknown setting");
  const v = String(value ?? "").trim();
  if (v.length > def.maxLen) throw new Error(`${def.label} must be under ${def.maxLen} characters`);
  await prisma.platformSetting.upsert({
    where: { key },
    update: { value: v },
    create: { key, value: v },
  });
  await audit(session.user.id, "SETTING_UPDATED", "PlatformSetting", key, v ? `${def.label} set` : `${def.label} cleared`);
  revalidatePath("/admin/settings");
}

// ---------- content moderation (request board + service catalog) ----------

// approve/reject an RFQ's board visibility, approval publishes it + fires routing notifications
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
      body: `"${rfq.title}" was approved, all verified labs can now see it and submit sealed quotes.`,
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

// approve/reject a service listing, only approved listings appear on the marketplace
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

export async function setProductModeration(id: string, decision: "APPROVED" | "REJECTED", note?: string) {
  const session = await requireAdmin();
  const product = await prisma.product.findUniqueOrThrow({ where: { id }, include: { supplier: true } });
  await prisma.product.update({ where: { id }, data: { moderation: decision, moderationNote: note || null } });
  await audit(session.user.id, `PRODUCT_${decision}`, "Product", id, `${product.name}${note ? ` · ${note}` : ""}`);
  await notify({
    toUserId: product.supplier.userId,
    subject: decision === "APPROVED" ? `Product live: ${product.name}` : `Product not approved: ${product.name}`,
    body:
      decision === "APPROVED"
        ? `"${product.name}" is now visible on the supplies marketplace and your public storefront.`
        : `"${product.name}" was not approved for the marketplace.${note ? ` Reason: ${note}.` : ""} Edit it and resubmit for review.`,
    href: "/supplier",
  });
  revalidatePath("/admin/moderation");
  revalidatePath("/supplier");
  revalidatePath("/supplier/products");
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
  const current = await prisma.subscription.findUniqueOrThrow({ where: { id } });
  const data: Record<string, unknown> = { status };
  if (status === "ACTIVE") {
    data.startedAt = new Date();
    data.expiresAt = new Date(Date.now() + planTermMs(current.plan));
  }
  const sub = await prisma.subscription.update({ where: { id }, data });
  // first activation → raise the subscription invoice if none exists yet
  if (status === "ACTIVE") {
    const existing = await prisma.invoice.findFirst({ where: { subscriptionId: id } });
    if (!existing) {
      const plan = PLANS[sub.plan];
      await issueInvoice({
        billedUserId: sub.userId,
        issuerType: "PLATFORM",
        subscriptionId: id,
        currency: "PKR",
        dueAt: sub.expiresAt ?? undefined,
        note: `${plan.label} plan, activation`,
        items: [{ description: `Gateway ${plan.label} subscription, ${planTermLabel(sub.plan)} term`, unitPrice: sub.pricePkr }],
      });
    }
  }
  await audit(session.user.id, `SUBSCRIPTION_${status}`, "Subscription", id);
  revalidatePath("/admin/subscriptions");
  revalidatePath("/admin/finance");
}

export async function setSubscriptionPlan(id: string, plan: "BASIC" | "PRO" | "CUSTOM", pricePkr: number) {
  const session = await requireAdmin();
  const sub = await prisma.subscription.findUniqueOrThrow({ where: { id }, include: { user: { select: { role: true } } } });
  const p = PLANS[plan];
  const data: Record<string, unknown> = { plan, pricePkr, requestedPlan: null, planChangeRequestedAt: null };
  // cancelled/expired subs can't just flip plans, send them back to awaiting payment with a fresh invoice
  const needsReactivation = sub.status === "CANCELLED" || sub.status === "EXPIRED";
  const refreshPendingInvoice = sub.status === "PENDING_PAYMENT";
  if (needsReactivation) {
    data.status = "PENDING_PAYMENT";
    data.startedAt = null;
    data.expiresAt = null;
  }
  await prisma.subscription.update({ where: { id }, data });
  if (needsReactivation || refreshPendingInvoice) {
    // void stale unpaid subscription invoices, then bill the new plan
    const stale = await prisma.invoice.findMany({
      where: { subscriptionId: id, status: { in: ["ISSUED", "PARTIALLY_PAID"] } },
      include: { payments: { where: { status: "CONFIRMED" }, select: { id: true } } },
    });
    for (const inv of stale.filter((i) => i.payments.length === 0)) {
      await prisma.invoice.update({ where: { id: inv.id }, data: { status: "VOID", note: "Superseded by plan change" } });
    }
    await issueInvoice({
      billedUserId: sub.userId,
      issuerType: "PLATFORM",
      subscriptionId: id,
      currency: "PKR",
      dueAt: new Date(Date.now() + (await getInvoiceDueDays()) * 864e5),
      note: `${p.label} plan, ${needsReactivation ? "reactivation" : "updated invoice"}`,
      items: [{ description: `Gateway ${p.label} subscription, ${planTermLabel(plan)} term`, unitPrice: pricePkr }],
    });
  }
  if (needsReactivation) {
    await notify({
      toUserId: sub.userId,
      subject: `Plan changed to ${p.label}, payment needed`,
      body: `Your subscription was moved to the ${p.label} plan (${pkr(pricePkr)} · ${planTermLabel(plan)} term). A new invoice is on your billing page, the plan activates once payment is confirmed.`,
      href: sub.user.role === "PROVIDER" ? "/lab/billing" : sub.user.role === "SUPPLIER" ? "/supplier/billing" : "/dashboard/billing",
    });
  }
  await audit(session.user.id, "SUBSCRIPTION_PLAN_CHANGED", "Subscription", id, `${sub.plan} → ${plan} PKR ${pricePkr}${needsReactivation ? " (reactivation)" : ""}`);
  revalidatePath("/admin/subscriptions");
  revalidatePath("/admin/finance");
}

// cancelled/expired → back to awaiting payment with a fresh invoice for the current plan
export async function reactivateSubscription(id: string) {
  const session = await requireAdmin();
  const sub = await prisma.subscription.findUniqueOrThrow({ where: { id }, include: { user: { select: { role: true } } } });
  if (sub.status === "ACTIVE") throw new Error("Subscription already active");
  const p = PLANS[sub.plan];
  await prisma.subscription.update({
    where: { id },
    data: { status: "PENDING_PAYMENT", startedAt: null, expiresAt: null, renewRequestedAt: null },
  });
  const stale = await prisma.invoice.findMany({
    where: { subscriptionId: id, status: { in: ["ISSUED", "PARTIALLY_PAID"] } },
    include: { payments: { where: { status: "CONFIRMED" }, select: { id: true } } },
  });
  for (const inv of stale.filter((i) => i.payments.length === 0)) {
    await prisma.invoice.update({ where: { id: inv.id }, data: { status: "VOID", note: "Superseded by reactivation" } });
  }
  await issueInvoice({
    billedUserId: sub.userId,
    issuerType: "PLATFORM",
    subscriptionId: id,
    currency: "PKR",
    dueAt: new Date(Date.now() + (await getInvoiceDueDays()) * 864e5),
    note: `${p.label} plan, reactivation`,
    items: [{ description: `Gateway ${p.label} subscription, ${planTermLabel(sub.plan)} term`, unitPrice: sub.pricePkr }],
  });
  await notify({
    toUserId: sub.userId,
    subject: `Subscription reactivated, ${p.label} plan payment needed`,
    body: `Your ${p.label} plan (${pkr(sub.pricePkr)} · ${planTermLabel(sub.plan)}) is back on the books. A fresh invoice is on your billing page, the plan activates once payment is confirmed.`,
    href: sub.user.role === "PROVIDER" ? "/lab/billing" : sub.user.role === "SUPPLIER" ? "/supplier/billing" : "/dashboard/billing",
  });
  await audit(session.user.id, "SUBSCRIPTION_REACTIVATED", "Subscription", id, `${sub.plan} PKR ${sub.pricePkr}`);
  revalidatePath("/admin/subscriptions");
  revalidatePath("/admin/finance");
}

// confirm a renewal payment, extends/activates the cycle and clears the request
export async function extendSubscription(id: string) {
  const session = await requireAdmin();
  const sub = await prisma.subscription.findUniqueOrThrow({ where: { id }, include: { user: { select: { role: true } } } });
  const base = sub.expiresAt && sub.expiresAt > new Date() ? sub.expiresAt : new Date();
  // a pending plan-change request is applied on renewal
  const effectivePlan = sub.requestedPlan && sub.requestedPlan in PLANS ? sub.requestedPlan : sub.plan;
  const plan = PLANS[effectivePlan as keyof typeof PLANS];
  // renewals bill the plan's current price, a pending plan change adopts the new plan's price
  const renewalPricing = sub.requestedPlan ? await getPlanPricing(effectivePlan as PlanKey) : null;
  const renewalPrice = renewalPricing?.final ?? sub.pricePkr;
  await prisma.subscription.update({
    where: { id },
    data: {
      status: "ACTIVE",
      plan: effectivePlan as typeof sub.plan,
      pricePkr: renewalPrice,
      startedAt: sub.startedAt ?? new Date(),
      expiresAt: new Date(base.getTime() + planTermMs(effectivePlan as PlanKey)),
      renewRequestedAt: null,
      requestedPlan: null,
      planChangeRequestedAt: null,
    },
  });
  // renewal cycle → fresh invoice for the next term
  await issueInvoice({
    billedUserId: sub.userId,
    issuerType: "PLATFORM",
    subscriptionId: id,
    currency: "PKR",
    dueAt: new Date(base.getTime() + planTermMs(effectivePlan as PlanKey)),
    note: `${plan.label} plan, renewal`,
    items: [{ description: `Gateway ${plan.label} subscription, renewal cycle`, unitPrice: renewalPrice }],
  });
  await audit(session.user.id, "SUBSCRIPTION_RENEWED", "Subscription", id, `${sub.plan} → ${effectivePlan}`);
  await notify({
    toUserId: sub.userId,
    subject: "Subscription renewed",
    body: `Your ${plan.label} plan has been extended by 30 days.`,
    href: sub.user.role === "PROVIDER" ? "/lab/billing" : sub.user.role === "SUPPLIER" ? "/supplier/billing" : "/dashboard/billing",
  });
  revalidatePath("/admin/subscriptions");
}

// ---------- feature add-ons (admin) ----------

/**
 * Give a user the Analytics add-on at a custom price, PKR 0 grants it free
 * for a year; any positive price issues a PLATFORM invoice at that amount.
 * Used for negotiated deals that differ from the public add-on price.
 */
export async function adminSetAnalyticsAddOn(userId: string, formData: FormData) {
  const session = await requireAdmin();
  const price = Number(formData.get("price") ?? "");
  if (!Number.isFinite(price) || price < 0) throw new Error("Enter a valid price (0 = grant free)");
  const target = await prisma.user.findUniqueOrThrow({ where: { id: userId }, select: { id: true, email: true, role: true, name: true } });
  const existing = await prisma.addOn.findFirst({
    where: { userId, kind: "ANALYTICS", status: { in: ["PENDING_PAYMENT", "ACTIVE"] } },
    include: { invoice: { select: { id: true, status: true } } },
  });
  if (existing?.status === "ACTIVE") throw new Error("User already has an active Analytics add-on, revoke it first");
  // re-issuing a pending purchase: void its invoice and drop the stale record
  if (existing) {
    if (existing.invoice && existing.invoice.status === "ISSUED") {
      await prisma.invoice.update({ where: { id: existing.invoice.id }, data: { status: "VOID", note: "Superseded by a new add-on invoice" } });
    }
    await prisma.addOn.delete({ where: { id: existing.id } });
  }

  const addOn = await prisma.addOn.create({
    data: { userId, kind: "ANALYTICS", label: "Analytics add-on", pricePkr: price },
  });
  if (price > 0) {
    await issueInvoice({
      billedUserId: userId,
      issuerType: "PLATFORM",
      addOnId: addOn.id,
      currency: "PKR",
      dueAt: new Date(Date.now() + (await getInvoiceDueDays()) * 864e5),
      note: "Analytics add-on, custom pricing",
      items: [{ description: "Gateway Analytics add-on, sample & report analysis dashboard (1 year, custom rate)", unitPrice: price }],
    });
  } else {
    await prisma.addOn.update({
      where: { id: addOn.id },
      data: { status: "ACTIVE", startedAt: new Date(), expiresAt: new Date(Date.now() + 365 * 864e5) },
    });
    await notify({
      toUserId: userId,
      subject: "Analytics add-on activated",
      body: "The Gateway team activated Analytics on your account, your dashboard is unlocked for one year.",
      href: target.role === "CUSTOMER" ? "/dashboard/analytics" : "/lab/analytics",
    });
  }
  await audit(session.user.id, price > 0 ? "ADDON_INVOICED_CUSTOM" : "ADDON_GRANTED_FREE", "AddOn", addOn.id, `${target.email} · PKR ${price}`);
  revalidatePath(`/admin/users/${userId}`);
  revalidatePath("/admin/finance");
}

/** Revoke a user's Analytics add-on (pending or active), e.g. refund/negotiation cleanup. */
export async function adminRevokeAnalyticsAddOn(addOnId: string, formData: FormData) {
  const session = await requireAdmin();
  const addOn = await prisma.addOn.update({ where: { id: addOnId }, data: { status: "EXPIRED", expiresAt: new Date() } });
  // void the linked invoice if it's still open so it can't be paid by mistake
  const inv = await prisma.invoice.findUnique({ where: { addOnId } });
  if (inv && inv.status === "ISSUED") {
    await prisma.invoice.update({ where: { id: inv.id }, data: { status: "VOID", note: "Add-on revoked by admin" } });
  }
  await audit(session.user.id, "ADDON_REVOKED", "AddOn", addOnId, `${addOn.kind} · user ${addOn.userId}`);
  revalidatePath(`/admin/users/${addOn.userId}`);
  revalidatePath("/admin/finance");
}

/** Reset a user's MFA (lockout recovery), clears their TOTP secret + backup codes so they can re-enrol. */
export async function adminResetUserMfa(userId: string) {
  const session = await requireAdmin();
  const tf = await prisma.twoFactor.findFirst({ where: { userId } });
  if (!tf) throw new Error("No MFA enrolled on this account");
  await prisma.$transaction([
    prisma.twoFactor.deleteMany({ where: { userId } }),
    prisma.user.update({ where: { id: userId }, data: { twoFactorEnabled: false } }),
    prisma.session.deleteMany({ where: { userId } }),
  ]);
  await audit(session.user.id, "USER_MFA_RESET", "User", userId, "TOTP cleared + sessions revoked (lockout recovery)");
  await notify({
    toUserId: userId,
    subject: "Two-factor authentication reset",
    body: "An administrator reset MFA on your account after a lockout. Sign in and re-enrol an authenticator from your Security page.",
    href: "/",
  });
  revalidatePath(`/admin/users/${userId}`);
}
