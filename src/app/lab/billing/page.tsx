export const instant = false

import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";
import { getPartnerAccess } from "@/lib/entitlements";
import { BillingView } from "@/components/portal/billing-view";

export default async function LabBillingPage() {
  const session = await requireRole("PROVIDER");
  const profile = await prisma.providerProfile.findUnique({ where: { userId: session.user.id } });
  if (!profile) notFound();
  const access = await getPartnerAccess(session.user.id);
  const [payables, receivables, payouts, pendingPayments] = await Promise.all([
    prisma.invoice.findMany({
      where: { billedUserId: session.user.id },
      include: { items: true, payments: true },
      orderBy: { issuedAt: "desc" },
    }),
    prisma.invoice.findMany({
      where: { issuerType: "PROVIDER", issuerId: profile.id },
      include: { items: true, payments: true },
      orderBy: { issuedAt: "desc" },
    }),
    prisma.payout.findMany({ where: { payeeId: profile.id }, orderBy: { createdAt: "desc" } }),
    prisma.payment.findMany({
      // milestone invoices are escrowed — Syntax admin verifies those, not the lab
      where: { status: "PENDING", invoice: { issuerType: "PROVIDER", issuerId: profile.id, milestoneId: null } },
      include: { invoice: true },
      orderBy: { createdAt: "asc" },
    }),
  ]);
  return (
    <BillingView
      access={access}
      payables={payables}
      receivables={receivables}
      payouts={payouts}
      pendingForMe={pendingPayments.map((p) => ({ payment: p, canConfirm: true }))}
    />
  );
}
