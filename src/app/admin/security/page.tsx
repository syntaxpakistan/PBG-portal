export const instant = false

import { requireRole } from "@/lib/session";
import { PageHead } from "@/components/portal/ui";
import { MfaSetup } from "./mfa-setup";
import { ShieldCheck, ShieldAlert } from "lucide-react";

export default async function AdminSecurityPage() {
  const session = await requireRole("ADMIN");
  const enabled = (session.user as { twoFactorEnabled?: boolean }).twoFactorEnabled ?? false;

  return (
    <div className="max-w-2xl">
      <PageHead title="Security" sub="Multi-factor authentication is required for all Syntax administrator accounts." />
      <div className="card p-6">
        <div className="flex items-center gap-3">
          {enabled
            ? <span className="grid size-10 place-items-center rounded-full bg-(--st-green-bg) text-(--st-green-fg)"><ShieldCheck className="size-5" /></span>
            : <span className="grid size-10 place-items-center rounded-full bg-(--st-red-bg) text-(--st-red-fg)"><ShieldAlert className="size-5" /></span>}
          <div>
            <h2 className="text-[15px] font-semibold text-ink">Two-factor authentication (TOTP)</h2>
            <p className="text-[12.5px] text-body">{enabled ? "Enabled — your account requires an authenticator code at sign-in." : "Not enabled — required before full admin access."}</p>
          </div>
        </div>
        {!enabled && <MfaSetup />}
      </div>
    </div>
  );
}
