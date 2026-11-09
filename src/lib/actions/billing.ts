"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { notify, notifyAllAdmins } from "@/lib/notify";
import { saveUpload } from "@/lib/files";
import { PLANS, type PlanKey } from "@/lib/plans";
import { getInvoiceDueDays, getPlanPrice } from "@/lib/settings";
import type { Invoice, Payment, Plan } from "@prisma/client";

async function audit(actorId: string, action: string, entity: string, entityId: string, meta?: string) {
  await prisma.auditLog.create({ data: { actorId, action, entity, entityId, meta } });
}

async function requireAdmin() {
  const session = await getSession();
  if (!session || session.user.role !== "ADMIN") throw new Error("Admin only");
  return session;
}

async function nextInvoiceNumber() {
  const year = new Date().getFullYear();
  const seq = await prisma.invoiceSequence.upsert({
    where: { year },
    update: { last: { increment: 1 } },
    create: { year, last: 1 },
    select: { last: true },
  });
  return `INV-${year}-${String(seq.last).padStart(4, "0")}`;
}

async function orgSnapshot(userId: string) {
  const u = await prisma.user.findUniqueOrThrow({
    where: { id: userId },
    include: {
      providerProfile: { select: { orgName: true } },
      supplierProfile: { select: { orgName: true } },
      customerProfile: { select: { orgName: true } },
    },
  });
  return {
    org: u.providerProfile?.orgName ?? u.supplierProfile?.orgName ?? u.customerProfile?.orgName ?? u.name,
    email: u.email,
    role: u.role,
  };
}

function billingHref(role: string) {
  return role === "PROVIDER" ? "/lab/billing" : role === "SUPPLIER" ? "/supplier/billing" : "/dashboard/billing";
}

export type InvoiceInput = {
  billedUserId: string;
  issuerType?: "PLATFORM" | "PROVIDER" | "SUPPLIER";
  issuerId?: string;
  items: { description: string; qty?: number; unitPrice: number }[];
  currency?: string;
  subscriptionId?: string;
  milestoneId?: string;
  transactionId?: string;
  dueAt?: Date;
  note?: string;
};

/** Create an ISSUED invoice with line items. Called by billing flows + admin. */
export async function issueInvoice(input: InvoiceInput): Promise<Invoice> {
  if (!input.items.length) throw new Error("Invoice needs at least one item");
  if (input.items.some((i) => !Number.isFinite(i.unitPrice) || i.unitPrice < 0 || (i.qty != null && (!Number.isFinite(i.qty) || i.qty <= 0)))) {
    throw new Error("Invalid invoice item");
  }
  const { org, email, role } = await orgSnapshot(input.billedUserId);
  const subtotal = input.items.reduce((n, i) => n + (i.qty ?? 1) * i.unitPrice, 0);
  const invoice = await prisma.invoice.create({
    data: {
      number: await nextInvoiceNumber(),
      billedUserId: input.billedUserId,
      billedOrg: org,
      billedEmail: email,
      issuerType: input.issuerType ?? "PLATFORM",
      issuerId: input.issuerId ?? null,
      subscriptionId: input.subscriptionId,
      milestoneId: input.milestoneId,
      transactionId: input.transactionId,
      subtotal,
      taxAmount: 0,
      total: subtotal,
      currency: input.currency ?? "PKR",
      dueAt: input.dueAt ?? null,
      note: input.note ?? null,
      items: {
        create: input.items.map((i) => ({
          description: i.description,
          qty: i.qty ?? 1,
          unitPrice: i.unitPrice,
          amount: (i.qty ?? 1) * i.unitPrice,
        })),
      },
    },
    include: { items: true },
  });
  await notify({
    toUserId: input.billedUserId,
    subject: `Invoice ${invoice.number} — ${invoice.currency} ${invoice.total.toLocaleString()}`,
    body: `${invoice.issuerType === "PLATFORM" ? "Syntax of Life" : "Your counterparty"} issued invoice ${invoice.number} for ${invoice.currency} ${invoice.total.toLocaleString()}${invoice.dueAt ? `, due ${invoice.dueAt.toLocaleDateString()}` : ""}. View it under Billing.`,
    href: billingHref(role),
  });
  return invoice;
}

/** Recompute invoice status from CONFIRMED payments. */
async function recomputeInvoice(invoiceId: string) {
  const inv = await prisma.invoice.findUniqueOrThrow({ where: { id: invoiceId } });
  const agg = await prisma.payment.aggregate({
    where: { invoiceId, status: "CONFIRMED" },
    _sum: { amount: true },
  });
  const paid = agg._sum.amount ?? 0;
  const status = paid >= inv.total ? "PAID" : paid > 0 ? "PARTIALLY_PAID" : "ISSUED";
  await prisma.invoice.update({
    where: { id: invoiceId },
    data: { status: status as Invoice["status"], paidAt: status === "PAID" ? new Date() : null },
  });
  return { invoice: { ...inv, status: status as Invoice["status"] }, paid };
}

/** Side effects once a payment is CONFIRMED — settle linked records. */
async function applyConfirmedPayment(paymentId: string) {
  const payment = await prisma.payment.findUniqueOrThrow({
    where: { id: paymentId },
    include: { invoice: { include: { billedUser: { select: { role: true } } } } },
  });
  const { invoice } = await recomputeInvoice(payment.invoiceId);
  if (invoice.status !== "PAID") return;

  if (invoice.milestoneId) {
    const m = await prisma.milestone.findUnique({ where: { id: invoice.milestoneId }, include: { project: true } });
    if (m && m.status !== "PAID") {
      await prisma.milestone.update({ where: { id: m.id }, data: { status: "PAID", paidAt: new Date() } });
      await notify({
        toUserId: m.project.providerUserId,
        subject: `${m.project.refNo}: milestone payment confirmed`,
        body: `Payment for "${m.title}" (invoice ${invoice.number}) was verified — milestone settled.`,
        href: `/lab/projects/${m.projectId}`,
      });
      await audit(payment.confirmedById ?? payment.recordedById, "MILESTONE_PAID", "Milestone", m.id, `${m.project.refNo} · ${m.title} · ${invoice.number}`);
    }
  }
  if (invoice.transactionId) {
    await prisma.transaction.updateMany({ where: { id: invoice.transactionId, status: { not: "PAID" } }, data: { status: "PAID" } });
  }
  if (invoice.subscriptionId) {
    await notify({
      toUserId: invoice.billedUserId,
      subject: `Payment received — invoice ${invoice.number} settled`,
      body: `Your payment of ${invoice.currency} ${payment.amount.toLocaleString()} was confirmed. Invoice ${invoice.number} is fully paid. Thank you.`,
      href: billingHref(payment.invoice.billedUser.role),
    });
  }
}

// ---------- payer side: report a payment (stays PENDING until confirmed) ----------

export async function reportPayment(invoiceId: string, formData: FormData) {
  const session = await getSession();
  if (!session) redirect("/login");
  const invoice = await prisma.invoice.findUniqueOrThrow({ where: { id: invoiceId } });
  const isAdmin = session.user.role === "ADMIN";
  if (invoice.billedUserId !== session.user.id && !isAdmin) throw new Error("Not your invoice");
  if (invoice.status === "PAID" || invoice.status === "VOID") throw new Error("Invoice already settled");

  const amount = Number(formData.get("amount"));
  const method = String(formData.get("method") || "BANK_TRANSFER");
  if (!amount || amount <= 0) throw new Error("Enter a valid amount");
  const outstanding = invoice.total - ((await prisma.payment.aggregate({
    where: { invoiceId, status: "CONFIRMED" }, _sum: { amount: true },
  }))._sum.amount ?? 0);
  if (amount > outstanding + 0.001) throw new Error(`Amount exceeds outstanding balance (${invoice.currency} ${outstanding.toLocaleString()})`);

  const file = formData.get("receipt");
  let receiptKey: string | null = null;
  if (file instanceof File && file.size > 0) {
    receiptKey = (await saveUpload(file)).key;
  }
  const payment = await prisma.payment.create({
    data: {
      invoiceId,
      amount,
      method: ["BANK_TRANSFER", "JAZZCASH", "EASYPAISA", "CARD", "CASH", "OTHER"].includes(method)
        ? (method as Payment["method"]) : "OTHER",
      reference: String(formData.get("reference") || "") || null,
      note: String(formData.get("note") || "") || null,
      receiptKey,
      recordedById: session.user.id,
    },
  });
  await audit(session.user.id, "PAYMENT_REPORTED", "Payment", payment.id, `${invoice.number} · ${invoice.currency} ${amount}`);

  // tell whoever verifies: admins for platform + milestone (escrow) invoices, the issuer for other partner invoices
  if (invoice.issuerType === "PLATFORM" || invoice.milestoneId) {
    await notifyAllAdmins(
      `Payment reported: ${invoice.number}`,
      `${invoice.billedOrg} reported ${invoice.currency} ${amount.toLocaleString()} via ${method}${payment.reference ? ` (ref ${payment.reference})` : ""}.${invoice.milestoneId ? " Milestone escrow — confirm receipt into the Syntax account, then settle the milestone." : " Confirm it in Finance."}`,
      "/admin/finance"
    );
  } else {
    const issuer = await issuerFor(invoice);
    if (issuer) await notify({
      toUserId: issuer.userId,
      subject: `Payment reported on ${invoice.number}`,
      body: `${invoice.billedOrg} reported ${invoice.currency} ${amount.toLocaleString()} via ${method}. Confirm receipt in your billing page.`,
      href: billingHref(issuer.role),
    });
  }
  revalidatePath("/dashboard/billing");
  revalidatePath("/lab/billing");
  revalidatePath("/supplier/billing");
  revalidatePath("/admin/finance");
}

// attach / replace a receipt on a pending payment
export async function attachReceipt(paymentId: string, formData: FormData) {
  const session = await getSession();
  if (!session) redirect("/login");
  const payment = await prisma.payment.findUniqueOrThrow({ where: { id: paymentId }, include: { invoice: true } });
  if (payment.invoice.billedUserId !== session.user.id && session.user.role !== "ADMIN") throw new Error("Not your payment");
  if (payment.status !== "PENDING") throw new Error("Only pending payments can take a receipt");
  const file = formData.get("receipt");
  if (!(file instanceof File) || file.size === 0) throw new Error("Attach a receipt file");
  const receiptKey = (await saveUpload(file)).key;
  await prisma.payment.update({ where: { id: paymentId }, data: { receiptKey } });
  revalidatePath("/dashboard/billing");
  revalidatePath("/lab/billing");
  revalidatePath("/supplier/billing");
}

// ---------- confirmation side ----------

async function issuerFor(invoice: { issuerType: string; issuerId: string | null }) {
  if (invoice.issuerType === "PROVIDER" && invoice.issuerId) {
    const p = await prisma.providerProfile.findUnique({ where: { id: invoice.issuerId }, select: { userId: true, user: { select: { role: true } } } });
    return p ? { userId: p.userId, role: p.user.role } : null;
  }
  if (invoice.issuerType === "SUPPLIER" && invoice.issuerId) {
    const p = await prisma.supplierProfile.findUnique({ where: { id: invoice.issuerId }, select: { userId: true, user: { select: { role: true } } } });
    return p ? { userId: p.userId, role: p.user.role } : null;
  }
  return null;
}

/** admin or the invoice issuer confirms a reported payment */
export async function confirmPayment(paymentId: string) {
  const session = await getSession();
  if (!session) redirect("/login");
  const payment = await prisma.payment.findUniqueOrThrow({ where: { id: paymentId }, include: { invoice: true } });
  if (payment.status !== "PENDING") throw new Error("Payment already resolved");
  const isAdmin = session.user.role === "ADMIN";
  // milestone invoices are escrowed — only Syntax admin verifies the money, never the lab
  if (payment.invoice.milestoneId && !isAdmin) throw new Error("Milestone payments are verified by Syntax — contact support if this is wrong");
  const issuer = await issuerFor(payment.invoice);
  if (!isAdmin && issuer?.userId !== session.user.id) throw new Error("Only admin or the issuer can confirm");
  await prisma.payment.update({
    where: { id: paymentId },
    data: { status: "CONFIRMED", confirmedById: session.user.id, confirmedAt: new Date() },
  });
  await applyConfirmedPayment(paymentId);
  await audit(session.user.id, "PAYMENT_CONFIRMED", "Payment", paymentId, `${payment.invoice.number} · ${payment.invoice.currency} ${payment.amount}`);
  revalidatePath("/admin/finance");
  revalidatePath("/dashboard/billing");
  revalidatePath("/lab/billing");
  revalidatePath("/supplier/billing");
}

export async function rejectPayment(paymentId: string, formData: FormData) {
  const session = await requireAdmin();
  const note = String(formData.get("note") || "") || null;
  const payment = await prisma.payment.findUniqueOrThrow({ where: { id: paymentId }, include: { invoice: { include: { billedUser: { select: { role: true } } } } } });
  if (payment.status !== "PENDING") throw new Error("Payment already resolved");
  await prisma.payment.update({ where: { id: paymentId }, data: { status: "REJECTED", confirmedById: session.user.id, confirmedAt: new Date(), note: note ?? payment.note } });
  await notify({
    toUserId: payment.invoice.billedUserId,
    subject: `Payment could not be verified — ${payment.invoice.number}`,
    body: `The ${payment.invoice.currency} ${payment.amount.toLocaleString()} payment you reported was rejected${note ? `: ${note}` : "."} You can report it again or contact support.`,
    href: billingHref(payment.invoice.billedUser.role),
  });
  await audit(session.user.id, "PAYMENT_REJECTED", "Payment", paymentId, note ?? undefined);
  revalidatePath("/admin/finance");
  revalidatePath("/dashboard/billing");
}

/** admin records money already received offline — confirmed immediately */
export async function adminRecordPayment(invoiceId: string, formData: FormData) {
  const session = await requireAdmin();
  const invoice = await prisma.invoice.findUniqueOrThrow({ where: { id: invoiceId } });
  if (invoice.status === "PAID" || invoice.status === "VOID") throw new Error("Invoice already settled");
  const amount = Number(formData.get("amount"));
  const method = String(formData.get("method") || "BANK_TRANSFER");
  if (!amount || amount <= 0) throw new Error("Enter a valid amount");
  const payment = await prisma.payment.create({
    data: {
      invoiceId,
      amount,
      method: ["BANK_TRANSFER", "JAZZCASH", "EASYPAISA", "CARD", "CASH", "OTHER"].includes(method)
        ? (method as Payment["method"]) : "OTHER",
      reference: String(formData.get("reference") || "") || null,
      note: String(formData.get("note") || "") || null,
      status: "CONFIRMED",
      recordedById: session.user.id,
      confirmedById: session.user.id,
      confirmedAt: new Date(),
    },
  });
  await applyConfirmedPayment(payment.id);
  await audit(session.user.id, "PAYMENT_RECORDED", "Payment", payment.id, `${invoice.number} · ${invoice.currency} ${amount}`);
  revalidatePath("/admin/finance");
  revalidatePath("/dashboard/billing");
  revalidatePath("/lab/billing");
  revalidatePath("/supplier/billing");
}

export async function voidInvoice(invoiceId: string, formData: FormData) {
  const session = await requireAdmin();
  const note = String(formData.get("note") || "") || null;
  const invoice = await prisma.invoice.findUniqueOrThrow({ where: { id: invoiceId }, include: { payments: true } });
  if (invoice.payments.some((p) => p.status === "CONFIRMED")) throw new Error("Invoice has confirmed payments — refund flow required first");
  await prisma.invoice.update({ where: { id: invoiceId }, data: { status: "VOID", note: note ?? invoice.note } });
  await audit(session.user.id, "INVOICE_VOIDED", "Invoice", invoiceId, invoice.number);
  revalidatePath("/admin/finance");
  revalidatePath("/dashboard/billing");
  revalidatePath("/lab/billing");
  revalidatePath("/supplier/billing");
}

// ---------- plan changes (self-serve request → admin approves) ----------

export async function requestPlanChange(plan: string) {
  const session = await getSession();
  if (!session || !["CUSTOMER", "PROVIDER", "SUPPLIER"].includes(session.user.role ?? "")) redirect("/login");
  if (!PLANS[plan as PlanKey]) throw new Error("Invalid plan");
  const planKey = plan as PlanKey;
  const sub = await prisma.subscription.findUnique({ where: { userId: session.user.id } });
  if (sub && sub.plan === plan) throw new Error("Already on this plan");
  if (!sub) {
    // no subscription yet — create one on the requested plan; invoice goes out immediately
    const planPrice = await getPlanPrice(planKey);
    const created = await prisma.subscription.create({
      data: { userId: session.user.id, plan: planKey as Plan, priceUsd: planPrice },
    });
    await issueInvoice({
      billedUserId: session.user.id,
      issuerType: "PLATFORM",
      subscriptionId: created.id,
      currency: "USD",
      dueAt: new Date(Date.now() + (await getInvoiceDueDays()) * 864e5),
      note: `${PLANS[planKey].label} plan — first billing cycle`,
      items: [{ description: `Gateway ${PLANS[planKey].label} subscription — monthly`, unitPrice: planPrice }],
    });
    await notifyAllAdmins(
      `New subscription: ${planKey}`,
      `${session.user.name} (${session.user.email}) subscribed to the ${PLANS[planKey].label} plan. Confirm payment to activate.`,
      "/admin/subscriptions"
    );
    await audit(session.user.id, "SUBSCRIPTION_CREATED", "Subscription", created.id, planKey);
  } else {
    await prisma.subscription.update({
      where: { id: sub.id },
      data: { requestedPlan: plan, planChangeRequestedAt: new Date() },
    });
    await notifyAllAdmins(
      `Plan change requested: ${sub.plan} → ${plan}`,
      `${session.user.name} (${session.user.email}) requested to switch their subscription from ${sub.plan} to ${plan}. Approve it from the subscription row.`,
      "/admin/subscriptions"
    );
    await audit(session.user.id, "PLAN_CHANGE_REQUESTED", "Subscription", sub.id, `${sub.plan} → ${plan}`);
  }
  revalidatePath("/dashboard/billing");
  revalidatePath("/lab/billing");
  revalidatePath("/supplier/billing");
}

// ---------- platform fee invoices (admin) ----------

/** Bill the provider their platform commission for an awarded project. */
export async function issueFeeInvoice(transactionId: string) {
  const session = await requireAdmin();
  const txn = await prisma.transaction.findUniqueOrThrow({
    where: { id: transactionId },
    include: { project: { include: { provider: true, quote: true, rfq: { select: { title: true } } } }, invoice: true },
  });
  if (txn.invoice) throw new Error("Fee already invoiced");
  const inv = await issueInvoice({
    billedUserId: txn.project.providerUserId,
    issuerType: "PLATFORM",
    transactionId: txn.id,
    currency: "PKR",
    dueAt: new Date(Date.now() + 14 * 864e5),
    note: `Platform fee ${txn.feePercent}% on ${txn.project.refNo} (quoted value PKR ${txn.quotedValue.toLocaleString()})`,
    items: [{
      description: `Platform commission — ${txn.project.refNo} (${txn.project.rfq?.title ?? "sequencing project"})`,
      unitPrice: txn.feeAmount,
    }],
  });
  await audit(session.user.id, "FEE_INVOICE_ISSUED", "Invoice", inv.id, `${txn.project.refNo} · ${inv.number}`);
  revalidatePath("/admin/transactions");
  revalidatePath("/admin/finance");
  revalidatePath("/lab/billing");
}

// ---------- payouts (admin settlement records) ----------

export async function createPayout(formData: FormData) {
  const session = await requireAdmin();
  const payeeType = String(formData.get("payeeType"));
  const payeeId = String(formData.get("payeeId"));
  const periodStart = new Date(String(formData.get("periodStart")));
  const periodEnd = new Date(String(formData.get("periodEnd")));
  const grossAmount = Number(formData.get("grossAmount"));
  const feeAmount = Number(formData.get("feeAmount") || 0);
  const netAmount = grossAmount - feeAmount;
  if (!["PROVIDER", "SUPPLIER"].includes(payeeType)) throw new Error("Invalid payee type");
  if (!payeeId) throw new Error("Payee required");
  if (Number.isNaN(periodStart.getTime()) || Number.isNaN(periodEnd.getTime())) throw new Error("Invalid period dates");
  if (!Number.isFinite(grossAmount) || grossAmount <= 0) throw new Error("Gross amount must be a positive number");
  if (!Number.isFinite(feeAmount) || feeAmount < 0) throw new Error("Fee amount must be zero or positive");
  if (periodEnd <= periodStart) throw new Error("Period end must be after period start");
  if (netAmount <= 0) throw new Error("Net payout must be positive — fees cannot meet or exceed gross");

  let payeeUserId = "";
  let payeeOrg = "";
  if (payeeType === "PROVIDER") {
    const p = await prisma.providerProfile.findUniqueOrThrow({ where: { id: payeeId } });
    payeeUserId = p.userId; payeeOrg = p.orgName;
  } else {
    const p = await prisma.supplierProfile.findUniqueOrThrow({ where: { id: payeeId } });
    payeeUserId = p.userId; payeeOrg = p.orgName;
  }
  const payout = await prisma.payout.create({
    data: {
      payeeType, payeeId, payeeUserId, payeeOrg,
      periodStart, periodEnd, grossAmount, feeAmount, netAmount,
      note: String(formData.get("note") || "") || null,
    },
  });
  await notify({
    toUserId: payeeUserId,
    subject: `Payout ${payout.id.slice(-6)} scheduled — ${netAmount.toLocaleString()} PKR`,
    body: `A settlement of PKR ${netAmount.toLocaleString()} (gross ${grossAmount.toLocaleString()} − fees ${feeAmount.toLocaleString()}) for ${periodStart.toLocaleDateString()} → ${periodEnd.toLocaleDateString()} is on the books. Track it under Billing → Payouts.`,
    href: payeeType === "PROVIDER" ? "/lab/billing" : "/supplier/billing",
  });
  await audit(session.user.id, "PAYOUT_CREATED", "Payout", payout.id, `${payeeOrg} · net ${netAmount}`);
  revalidatePath("/admin/finance");
  revalidatePath("/lab/billing");
  revalidatePath("/supplier/billing");
}

export async function setPayoutStatus(id: string, status: "PROCESSING" | "PAID" | "CANCELLED", formData?: FormData) {
  const session = await requireAdmin();
  const reference = formData ? String(formData.get("reference") || "") || null : null;
  const payout = await prisma.payout.update({
    where: { id },
    data: { status, paidAt: status === "PAID" ? new Date() : null, reference: reference ?? undefined },
  });
  if (status === "PAID") {
    await notify({
      toUserId: payout.payeeUserId,
      subject: `Payout sent — PKR ${payout.netAmount.toLocaleString()}`,
      body: `Your settlement of PKR ${payout.netAmount.toLocaleString()} was paid${payout.reference ? ` (ref ${payout.reference})` : ""}. It will reflect in your account per your bank's timeline.`,
      href: payout.payeeType === "PROVIDER" ? "/lab/billing" : "/supplier/billing",
    });
  }
  await audit(session.user.id, `PAYOUT_${status}`, "Payout", id, payout.payeeOrg);
  revalidatePath("/admin/finance");
  revalidatePath("/lab/billing");
  revalidatePath("/supplier/billing");
}
