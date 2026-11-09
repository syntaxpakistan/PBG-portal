export const instant = false

import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";
import { getPartnerAccess } from "@/lib/entitlements";
import { BillingView } from "@/components/portal/billing-view";
import { SupplierShell } from "../shell";

export default async function SupplierBillingPage() {
  const session = await requireRole("SUPPLIER");
  const profile = await prisma.supplierProfile.findUnique({ where: { userId: session.user.id } });
  if (!profile) notFound();
  const access = await getPartnerAccess(session.user.id);
  const [payables, receivables, payouts, pendingPayments] = await Promise.all([
    prisma.invoice.findMany({
      where: { billedUserId: session.user.id },
      include: { items: true, payments: true },
      orderBy: { issuedAt: "desc" },
    }),
    prisma.invoice.findMany({
      where: { issuerType: "SUPPLIER", issuerId: profile.id },
      include: { items: true, payments: true },
      orderBy: { issuedAt: "desc" },
    }),
    prisma.payout.findMany({ where: { payeeId: profile.id }, orderBy: { createdAt: "desc" } }),
    prisma.payment.findMany({
      where: { status: "PENDING", invoice: { issuerType: "SUPPLIER", issuerId: profile.id } },
      include: { invoice: true },
      orderBy: { createdAt: "asc" },
    }),
  ]);
  return (
    <SupplierShell title="Supplier portal — billing" name={session.user.name}>
      <BillingView
        access={access}
        payables={payables}
        receivables={receivables}
        payouts={payouts}
        pendingForMe={pendingPayments.map((p) => ({ payment: p, canConfirm: true }))}
      />
    </SupplierShell>
  );
}
