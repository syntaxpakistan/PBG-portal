export const instant = false

import { LayoutDashboard, BadgeCheck, Users, Receipt, Flag, ScrollText, Store, Settings, CreditCard, FileText, ShieldCheck, Landmark, Inbox, BarChart3 } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { PortalShell } from "@/components/portal/shell";
import { requireRole } from "@/lib/session";

const items = [
  { href: "/admin", label: "Overview", icon: <LayoutDashboard className="size-4" /> },
  { href: "/admin/reports", label: "Business Reports", icon: <BarChart3 className="size-4" /> },
  { href: "/admin/verification", label: "Verification queue", icon: <BadgeCheck className="size-4" />, key: "verify" },
  { href: "/admin/moderation", label: "Moderation", icon: <ShieldCheck className="size-4" />, key: "moderation" },
  { href: "/admin/users", label: "Users & orgs", icon: <Users className="size-4" /> },
  { href: "/admin/subscriptions", label: "Subscriptions", icon: <CreditCard className="size-4" /> },
  { href: "/admin/finance", label: "Finance", icon: <Landmark className="size-4" />, key: "finance" },
  { href: "/admin/rfqs", label: "RFQs", icon: <FileText className="size-4" /> },
  { href: "/admin/transactions", label: "Transactions & fees", icon: <Receipt className="size-4" /> },
  { href: "/admin/marketplace", label: "Marketplace", icon: <Store className="size-4" /> },
  { href: "/admin/leads", label: "Leads", icon: <Inbox className="size-4" />, key: "leads" },
  { href: "/admin/complaints", label: "Complaints", icon: <Flag className="size-4" />, key: "complaints" },
  { href: "/admin/audit", label: "Audit log", icon: <ScrollText className="size-4" /> },
  { href: "/admin/settings", label: "Settings", icon: <Settings className="size-4" /> },
];

import { redirect } from "next/navigation";
import { headers } from "next/headers";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await requireRole("ADMIN");
  // MFA enforcement — disabled during dev (no mail/authenticator testing yet).
  // Set ADMIN_MFA_REQUIRED=true to force TOTP enrollment before admin access.
  if (process.env.ADMIN_MFA_REQUIRED === "true") {
    const mfa = (session.user as { twoFactorEnabled?: boolean }).twoFactorEnabled;
    const path = (await headers()).get("x-pathname") ?? "";
    if (!mfa && !path.includes("/admin/security")) redirect("/admin/security");
  }
  const [verify, modRfqs, modListings, payments, leads, complaints] = await Promise.all([
    prisma.providerProfile.count({ where: { status: "PENDING" } }).then(async (n) => n + (await prisma.supplierProfile.count({ where: { status: "PENDING" } }))),
    prisma.rfq.count({ where: { visibility: "BOARD", moderation: "PENDING" } }),
    prisma.serviceListing.count({ where: { moderation: "PENDING" } }),
    prisma.payment.count({ where: { status: "PENDING" } }),
    prisma.lead.count({ where: { handled: false } }),
    prisma.complaint.count({ where: { status: { in: ["OPEN", "IN_REVIEW"] } } }),
  ]);
  const badges: Record<string, number> = {
    verify, moderation: modRfqs + modListings, finance: payments, leads, complaints,
  };
  const badgedItems = items.map((it) => ("key" in it ? { ...it, badge: badges[it.key as string] } : it));
  return <PortalShell title="Syntax admin" items={badgedItems}>{children}</PortalShell>;
}
