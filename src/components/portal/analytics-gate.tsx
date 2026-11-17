import { Lock } from "lucide-react";
import { SubmitButton } from "@/components/portal/submit-button";
import { requestAnalyticsAddOn } from "@/lib/actions/billing";
import { pkr } from "@/lib/constants";

// lock screen shown when analytics isn't unlocked — offers the paid add-on
// (Pro/Elite partner plans include it already and never reach this)
export function AnalyticsGate({ price, pendingInvoiceNo }: { price: number; pendingInvoiceNo?: string | null }) {
  return (
    <div className="card mx-auto max-w-lg p-10 text-center">
      <Lock className="mx-auto size-8 text-muted" />
      <h2 className="mt-4 font-display text-[20px] font-medium text-ink">Analytics add-on</h2>
      <p className="mt-2 text-[13px] text-body">
        Sample analysis and report analysis — spend reporting, quote comparison and turnaround stats.
        Included on Pro &amp; Elite partner plans; available as a yearly add-on for everyone else.
      </p>
      {pendingInvoiceNo ? (
        <p className="mt-5 rounded-lg bg-(--st-amber-bg) px-4 py-2.5 text-[12.5px] font-medium text-(--st-amber-fg)">
          Invoice {pendingInvoiceNo} is awaiting payment — settle it from Billing and the dashboard unlocks.
        </p>
      ) : (
        <form action={requestAnalyticsAddOn} className="mt-5">
          <SubmitButton className="btn-primary !py-2.5 text-[13px]">Get Analytics — {pkr(price)}/year</SubmitButton>
          <p className="mt-3 text-[11.5px] text-muted">Invoices are issued by Syntax of Life — pay by bank transfer and we unlock your dashboard.</p>
        </form>
      )}
    </div>
  );
}
