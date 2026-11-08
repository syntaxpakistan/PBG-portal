export const instant = false

import { LayoutDashboard, BadgeCheck, Users, Receipt, Flag, ScrollText, Store, Settings, CreditCard, FileText, ShieldCheck } from "lucide-react";
import { PortalShell } from "@/components/portal/shell";
import { requireRole } from "@/lib/session";

const items = [
  { href: "/admin", label: "Overview", icon: <LayoutDashboard className="size-4" /> },
  { href: "/admin/verification", label: "Verification queue", icon: <BadgeCheck className="size-4" /> },
  { href: "/admin/moderation", label: "Moderation", icon: <ShieldCheck className="size-4" /> },
  { href: "/admin/users", label: "Users & orgs", icon: <Users className="size-4" /> },
  { href: "/admin/subscriptions", label: "Subscriptions", icon: <CreditCard className="size-4" /> },
  { href: "/admin/rfqs", label: "RFQs", icon: <FileText className="size-4" /> },
  { href: "/admin/transactions", label: "Transactions & fees", icon: <Receipt className="size-4" /> },
  { href: "/admin/marketplace", label: "Marketplace", icon: <Store className="size-4" /> },
  { href: "/admin/complaints", label: "Complaints", icon: <Flag className="size-4" /> },
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
  return <PortalShell title="Syntax admin" items={items}>{children}</PortalShell>;
}
