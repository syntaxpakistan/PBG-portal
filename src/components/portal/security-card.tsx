import { ShieldCheck, ShieldAlert } from "lucide-react";
import { PageHead } from "@/components/portal/ui";
import { MfaSetup, MfaManage, ChangePassword } from "@/components/portal/mfa";

export function SecurityCard({ enabled, required, returnTo }: { enabled: boolean; required: boolean; returnTo: string }) {
  return (
    <div className="max-w-2xl">
      <PageHead
        title="Security"
        sub={required
          ? "Multi-factor authentication is required for this portal."
          : "Protect your account with an authenticator app."}
      />
      <div className="card p-6">
        <div className="flex items-center gap-3">
          {enabled
            ? <span className="grid size-10 place-items-center rounded-full bg-(--st-green-bg) text-(--st-green-fg)"><ShieldCheck className="size-5" /></span>
            : <span className="grid size-10 place-items-center rounded-full bg-(--st-red-bg) text-(--st-red-fg)"><ShieldAlert className="size-5" /></span>}
          <div>
            <h2 className="text-[15px] font-semibold text-ink">Two-factor authentication (TOTP)</h2>
            <p className="text-[12.5px] text-body">
              {enabled
                ? "Enabled, your account requires an authenticator code at sign-in."
                : required ? "Not enabled, required before full portal access." : "Not enabled, recommended for all accounts."}
            </p>
          </div>
        </div>
        {enabled ? <MfaManage /> : <MfaSetup returnTo={returnTo} />}
      </div>
      <ChangePassword />
      <p className="mt-4 text-[12.5px] text-body">
        Lost your authenticator and backup codes? Contact an administrator, they can reset MFA on your account from Users &amp; orgs.
      </p>
    </div>
  );
}
