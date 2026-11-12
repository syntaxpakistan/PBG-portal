"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { setProviderStatus, setSupplierStatus, setCustomerStatus } from "@/lib/actions/admin";
import { toast } from "sonner";

export function VerifyButtons({ id, kind, status }: { id: string; kind: "provider" | "supplier" | "customer"; status: string }) {
  const [loading, setLoading] = useState<string | null>(null);
  const fn = kind === "provider" ? setProviderStatus : kind === "supplier" ? setSupplierStatus : setCustomerStatus;

  async function act(status: "APPROVED" | "REJECTED" | "SUSPENDED") {
    const note = status !== "APPROVED" ? prompt(`Reason for ${status.toLowerCase()}?`) ?? "" : undefined;
    setLoading(status);
    try {
      await fn(id, status, note || undefined);
      toast.success(`Marked ${status.toLowerCase()}.`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    }
    setLoading(null);
  }

  return (
    <div className="flex shrink-0 gap-2">
      {status !== "APPROVED" && (
        <button onClick={() => act("APPROVED")} disabled={!!loading} className="btn-primary !px-4 !py-2 text-[12px]">
          {loading === "APPROVED" ? <Loader2 className="size-3.5 animate-spin" /> : "Approve"}
        </button>
      )}
      {status === "APPROVED" && (
        <button onClick={() => act("SUSPENDED")} disabled={!!loading} className="btn-outline !px-4 !py-2 text-[12px]">
          {loading === "SUSPENDED" ? <Loader2 className="size-3.5 animate-spin" /> : "Suspend"}
        </button>
      )}
      {(status === "PENDING" || status === "APPROVED") && (
        <button onClick={() => act("REJECTED")} disabled={!!loading} className="rounded-full border border-(--st-red-bd) px-4 py-2 text-[12px] font-medium text-(--st-red-fg) transition-colors hover:bg-(--st-red-bg)">
          {loading === "REJECTED" ? <Loader2 className="size-3.5 animate-spin" /> : "Reject"}
        </button>
      )}
    </div>
  );
}
