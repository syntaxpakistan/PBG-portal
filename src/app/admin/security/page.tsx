export const instant = false

import { requireRole } from "@/lib/session";
import { SecurityCard } from "@/components/portal/security-card";

export default async function AdminSecurityPage() {
  const session = await requireRole("ADMIN");
  const enabled = (session.user as { twoFactorEnabled?: boolean }).twoFactorEnabled ?? false;
  const required = process.env.MFA_REQUIRED === "true" || process.env.ADMIN_MFA_REQUIRED === "true";
  return <SecurityCard enabled={enabled} required={required} returnTo="/admin" />;
}
