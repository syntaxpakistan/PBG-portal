"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { setEnquiryStatus } from "@/lib/actions/admin";
import { toast } from "sonner";

export function EnquiryMod({ id, status }: { id: string; status: string }) {
  const [loading, setLoading] = useState(false);
  if (status === "FULFILLED") return <span className="text-[11px] text-muted">closed</span>;
  async function act(s: "OPEN" | "CLOSED") {
    setLoading(true);
    try {
      await setEnquiryStatus(id, s);
      toast.success(`Marked ${s.toLowerCase()}.`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    }
    setLoading(false);
  }
  return (
    <div className="flex gap-2">
      {status === "CLOSED" ? (
        <button onClick={() => act("OPEN")} disabled={loading} className="rounded-full border border-line px-3 py-1 text-[11.5px] font-medium text-ink hover:bg-paper-2">
          {loading ? <Loader2 className="size-3 animate-spin" /> : "Reopen"}
        </button>
      ) : (
        <button onClick={() => act("CLOSED")} disabled={loading} className="rounded-full border border-(--st-red-bd) px-3 py-1 text-[11.5px] font-medium text-(--st-red-fg) hover:bg-(--st-red-bg)">
          {loading ? <Loader2 className="size-3 animate-spin" /> : "Close"}
        </button>
      )}
    </div>
  );
}
