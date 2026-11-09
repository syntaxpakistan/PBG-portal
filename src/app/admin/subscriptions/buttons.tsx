"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { setSubscriptionStatus, setSubscriptionPlan, extendSubscription, reactivateSubscription } from "@/lib/actions/admin";
import { PLANS } from "@/lib/plans";
import { toast } from "sonner";

export function SubButtons({ id, status, plan, renewRequested, requestedPlan, prices }: { id: string; status: string; plan: keyof typeof PLANS; renewRequested?: boolean; requestedPlan?: string | null; prices?: Record<string, number> }) {
  const [loading, setLoading] = useState(false);
  async function act(fn: () => Promise<unknown>, msg: string) {
    setLoading(true);
    try { await fn(); toast.success(msg); } catch (e) { toast.error(e instanceof Error ? e.message : "Failed"); }
    setLoading(false);
  }
  async function changePlan() {
    const p = prompt("New plan: BASIC, PRO or CUSTOM", plan)?.toUpperCase() as keyof typeof PLANS | undefined;
    if (!p || !(p in PLANS) || p === plan) return;
    await act(() => setSubscriptionPlan(id, p, prices?.[p] ?? PLANS[p].price), `Plan → ${PLANS[p].label}`);
  }
  return (
    <div className="flex gap-2">
      {loading && <Loader2 className="size-3.5 animate-spin text-muted" />}
      {status === "PENDING_PAYMENT" && (
        <button onClick={() => act(() => setSubscriptionStatus(id, "ACTIVE"), "Payment confirmed — active.")}
          className="rounded-full bg-navy px-3 py-1 text-[11.5px] font-medium text-yellow hover:bg-navy-2">Mark paid</button>
      )}
      {(status === "CANCELLED" || status === "EXPIRED") && (
        <button onClick={() => act(() => reactivateSubscription(id), "Reactivation invoice issued — awaiting payment.")}
          className="rounded-full bg-[#0e5a9d] px-3 py-1 text-[11.5px] font-medium text-white hover:opacity-90">Reactivate</button>
      )}
      {status === "ACTIVE" && (
        <button onClick={() => act(() => setSubscriptionStatus(id, "CANCELLED"), "Cancelled.")}
          className="rounded-full border border-line px-3 py-1 text-[11.5px] text-muted hover:bg-paper-2">Cancel</button>
      )}
      {requestedPlan && requestedPlan !== plan && requestedPlan in PLANS && (
        <button onClick={() => act(() => setSubscriptionPlan(id, requestedPlan as keyof typeof PLANS, prices?.[requestedPlan] ?? PLANS[requestedPlan as keyof typeof PLANS].price), `Plan change approved → ${PLANS[requestedPlan as keyof typeof PLANS].label}.`)}
          className="rounded-full bg-navy px-3 py-1 text-[11.5px] font-medium text-yellow hover:bg-navy-2">
          Approve {PLANS[requestedPlan as keyof typeof PLANS].label}
        </button>
      )}
      {renewRequested && (
        <button onClick={() => act(() => extendSubscription(id), "Renewed — +30 days active.")}
          className="rounded-full bg-[#0e5a9d] px-3 py-1 text-[11.5px] font-medium text-white hover:opacity-90">Renew +30d</button>
      )}
      <button onClick={changePlan} className="rounded-full border border-line px-3 py-1 text-[11.5px] font-medium text-ink hover:bg-paper-2">Plan</button>
    </div>
  );
}
