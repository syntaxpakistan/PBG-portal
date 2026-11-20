export const instant = false

import { requireRole } from "@/lib/session";
import { SecurityCard } from "@/components/portal/security-card";

export default async function AdminSecurityPage() {
  const session = await requireRole("ADMIN");
  const enabled = (session.user as { twoFactorEnabled?: boolean }).twoFactorEnabled ?? false;
  return <SecurityCard enabled={enabled} required={false} returnTo="/admin" />;
}
