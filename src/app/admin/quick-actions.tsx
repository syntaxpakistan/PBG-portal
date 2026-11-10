"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, X, Loader2, CircleCheck } from "lucide-react";
import { toast } from "sonner";
import {
  setProviderStatus, setSupplierStatus, setRfqBoardModeration, setServiceModeration,
  setComplaintStatus, setSubscriptionStatus,
} from "@/lib/actions/admin";
import { confirmPayment, rejectPayment } from "@/lib/actions/billing";
import { markLeadHandled } from "@/lib/actions/leads";

export type QuickKind =
  | "provider" | "supplier" | "boardRfq" | "listing"
  | "payment" | "lead" | "complaint" | "subscription";

export function QuickAction({ kind, id }: { kind: QuickKind; id: string }) {
  const [busy, setBusy] = useState<string | null>(null);
  const router = useRouter();

  async function run(label: string, fn: () => Promise<unknown>) {
    setBusy(label);
    try {
      await fn();
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
      setBusy(null);
    }
  }

  const approve = () =>
    run("ok", async () => {
      if (kind === "provider") return setProviderStatus(id, "APPROVED");
      if (kind === "supplier") return setSupplierStatus(id, "APPROVED");
      if (kind === "boardRfq") return setRfqBoardModeration(id, "APPROVED");
      if (kind === "listing") return setServiceModeration(id, "APPROVED");
      if (kind === "payment") return confirmPayment(id);
      if (kind === "lead") return markLeadHandled(id);
      if (kind === "subscription") return setSubscriptionStatus(id, "ACTIVE");
    });

  const reject = () =>
    run("no", async () => {
      const note = prompt("Reason / note (optional):") ?? "";
      if (kind === "provider") return setProviderStatus(id, "REJECTED", note || undefined);
      if (kind === "supplier") return setSupplierStatus(id, "REJECTED", note || undefined);
      if (kind === "boardRfq") return setRfqBoardModeration(id, "REJECTED", note || undefined);
      if (kind === "listing") return setServiceModeration(id, "REJECTED", note || undefined);
      if (kind === "payment") {
        const fd = new FormData();
        if (note) fd.set("note", note);
        return rejectPayment(id, fd);
      }
      if (kind === "complaint") return setComplaintStatus(id, "DISMISSED", note || undefined);
      if (kind === "subscription") return setSubscriptionStatus(id, "CANCELLED");
    });

  const resolveComplaint = () =>
    run("ok", async () => {
      const res = prompt("Resolution note:") ?? "";
      return setComplaintStatus(id, "RESOLVED", res || undefined);
    });

  if (kind === "lead") {
    return (
      <button
        onClick={approve}
        disabled={busy !== null}
        className="inline-flex shrink-0 items-center gap-1 rounded-full border border-(--st-green-bd) bg-(--st-green-bg) px-2.5 py-1 text-[10.5px] font-semibold text-(--st-green-fg) transition-colors hover:border-(--st-green-fg) hover:shadow-xs disabled:opacity-50"
      >
        {busy === "ok" ? <Loader2 className="size-3 animate-spin" /> : <CircleCheck className="size-3" />} Handled
      </button>
    );
  }

  if (kind === "complaint") {
    return (
      <div className="flex shrink-0 gap-1.5">
        <ActionBtn busy={busy} onClick={resolveComplaint} label="Resolve" positive loading={busy === "ok"} />
        <ActionBtn busy={busy} onClick={reject} label="Dismiss" loading={busy === "no"} />
      </div>
    );
  }

  const yesLabel = kind === "payment" ? "Confirm" : kind === "subscription" ? "Activate" : "Approve";
  return (
    <div className="flex shrink-0 gap-1.5">
      <ActionBtn busy={busy} onClick={approve} label={yesLabel} positive loading={busy === "ok"} />
      <ActionBtn busy={busy} onClick={reject} label="Reject" loading={busy === "no"} />
    </div>
  );
}

function ActionBtn({
  busy, onClick, label, positive, loading, icon,
}: {
  busy: string | null;
  onClick: () => void;
  label: string;
  positive?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      disabled={busy !== null}
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[10.5px] font-semibold transition-colors disabled:opacity-50 ${
        positive
          ? "border-(--st-green-bd) bg-(--st-green-bg) text-(--st-green-fg) hover:border-(--st-green-fg) hover:shadow-xs"
          : "border-(--st-red-bd) bg-(--st-red-bg) text-(--st-red-fg) hover:border-(--st-red-fg) hover:shadow-xs"
      }`}
    >
      {loading ? <Loader2 className="size-3 animate-spin" /> : icon ?? (positive ? <Check className="size-3" /> : <X className="size-3" />)}
      {label}
    </button>
  );
}
