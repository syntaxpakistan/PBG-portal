import { ShieldCheck, TriangleAlert } from "lucide-react";
import { PageHead } from "@/components/portal/ui";
import { reauthAction } from "@/lib/actions/auth-forms";

/** Password gate rendered in place of sensitive settings content until
    the user re-confirms their password (fresh pbg_reauth cookie). */
export function ReauthGate({ returnTo, error }: { returnTo: string; error?: boolean }) {
  return (
    <div className="max-w-md">
      <PageHead title="Confirm it's you" sub="For your protection, enter your password again to open this page." />
      <form action={reauthAction} className="card mt-6 space-y-4 p-6">
        {error && (
          <div className="flex items-center gap-2 rounded-lg border border-(--st-red-bd) bg-(--st-red-bg) px-3.5 py-2.5 text-[13px] font-medium text-(--st-red-fg)">
            <TriangleAlert className="size-4 shrink-0" /> Wrong password, try again.
          </div>
        )}
        <div className="flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-full bg-(--st-blue-bg,#eef3fb) text-blue"><ShieldCheck className="size-5" /></span>
          <p className="text-[13px] text-body">This unlocks the page for the next 10 minutes.</p>
        </div>
        <input type="hidden" name="returnTo" value={returnTo} />
        <input
          type="password"
          name="password"
          required
          autoFocus
          autoComplete="current-password"
          placeholder="Your password"
          className="w-full rounded-lg border border-line px-3.5 py-2.5 text-[14px] outline-none focus:border-navy-3"
        />
        <button type="submit" className="btn-primary w-full justify-center">Continue</button>
      </form>
    </div>
  );
}
