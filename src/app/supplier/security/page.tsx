export const instant = false

import { requireRole } from "@/lib/session";
import { SecurityCard } from "@/components/portal/security-card";
import { ReauthGate } from "@/components/portal/reauth-gate";
import { hasFreshReauth } from "@/lib/reauth";

export default async function SecurityPage({ searchParams }: { searchParams: Promise<{ reauth?: string }> }) {
  const session = await requireRole("SUPPLIER");
  if (!(await hasFreshReauth(session.user.id))) {
    const sp = await searchParams;
    return <ReauthGate returnTo="/supplier/security" error={sp.reauth === "wrong"} />;
  }
  const enabled = (session.user as { twoFactorEnabled?: boolean }).twoFactorEnabled ?? false;
  return <SecurityCard enabled={enabled} required={false} returnTo="/supplier" />;
}
