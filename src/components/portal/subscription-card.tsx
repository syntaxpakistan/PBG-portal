import { PLANS } from "@/lib/plans";
import { BadgeCheck, Clock3 } from "lucide-react";
import { requestRenewal } from "@/lib/actions/marketplace";
import type { Subscription } from "@prisma/client";

const STATUS_TXT: Record<string, [string, string]> = {
  ACTIVE: ["bg-(--st-green-bg) text-(--st-green-fg)", "Active"],
  PENDING_PAYMENT: ["bg-(--st-amber-bg) text-(--st-amber-fg)", "Payment pending"],
  CANCELLED: ["bg-paper-2 text-muted", "Cancelled"],
  EXPIRED: ["bg-(--st-red-bg) text-(--st-red-fg)", "Expired"],
};

export function SubscriptionCard({ sub }: { sub: Subscription | null }) {
  if (!sub) return null;
  const plan = PLANS[sub.plan];
  const [cls, label] = STATUS_TXT[sub.status] ?? STATUS_TXT.CANCELLED;
  return (
    <div className="card overflow-hidden">
      <div className="flex items-center justify-between border-b border-line px-5 py-3.5">
        <h3 className="text-[14px] font-semibold text-ink">Subscription</h3>
        <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium ${cls}`}>{label}</span>
      </div>
      <div className="p-5">
        <div className="flex items-baseline justify-between">
          <span className="text-[16px] font-semibold text-ink">{plan.label}</span>
          <span className="font-display text-[24px] font-medium text-ink">${sub.priceUsd}<span className="text-[12px] font-normal text-muted">/mo</span></span>
        </div>
        <ul className="mt-3 space-y-1.5">
          {plan.features.map((f) => (
            <li key={f} className="flex items-center gap-2 text-[12.5px] text-body">
              {sub.status === "ACTIVE" ? <BadgeCheck className="size-3.5 shrink-0 text-green" /> : <Clock3 className="size-3.5 shrink-0 text-muted" />}
              {f}
            </li>
          ))}
        </ul>
        {sub.status === "PENDING_PAYMENT" && (
          <p className="mt-4 rounded-lg border border-(--st-amber-bd) bg-(--st-amber-bg) px-3.5 py-2.5 text-[12px] leading-relaxed text-(--st-amber-fg)">
            Syntax will invoice you after verifying your organization. Payment confirms activation.
          </p>
        )}
        {sub.expiresAt && (
          <p className="mt-3 text-[11.5px] text-muted">Renews until {sub.expiresAt.toLocaleDateString()}</p>
        )}
        {sub.renewRequestedAt ? (
          <p className="mt-3 rounded-lg border border-(--st-blue-bd) bg-(--st-blue-bg) px-3.5 py-2.5 text-[12px] text-(--st-blue-fg)">
            Renewal requested on {sub.renewRequestedAt.toLocaleDateString()} — Syntax will confirm once payment clears.
          </p>
        ) : (sub.status === "ACTIVE" || sub.status === "EXPIRED") && (
          <form action={requestRenewal} className="mt-4">
            <button type="submit" className="btn-outline w-full justify-center !py-2.5 text-[12.5px]">
              {sub.status === "EXPIRED" ? "Reactivate subscription" : "Request renewal"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
