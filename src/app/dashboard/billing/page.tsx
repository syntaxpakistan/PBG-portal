export const instant = false

import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";
import { getPartnerAccess, getAnalyticsAddOnState } from "@/lib/entitlements";
import { BillingView } from "@/components/portal/billing-view";

export default async function CustomerBillingPage() {
  const session = await requireRole("CUSTOMER");
  const access = await getPartnerAccess(session.user.id);
  const analyticsAddOn = await getAnalyticsAddOnState(session.user.id);
  const [payables, payouts] = await Promise.all([
    prisma.invoice.findMany({
      where: { billedUserId: session.user.id },
      include: { items: true, payments: true },
      orderBy: { issuedAt: "desc" },
    }),
    prisma.payout.findMany({ where: { payeeUserId: session.user.id }, orderBy: { createdAt: "desc" } }),
  ]);
  return (
    <BillingView
      access={access}
      payables={payables}
      receivables={[]}
      payouts={payouts}
      pendingForMe={[]}
      canSubscribe={false}
      analyticsAddOn={analyticsAddOn}
    />
  );
}
