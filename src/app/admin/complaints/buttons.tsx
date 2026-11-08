"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { setComplaintStatus } from "@/lib/actions/admin";
import { toast } from "sonner";

export function ComplaintButtons({ id, status }: { id: string; status: string }) {
  const [loading, setLoading] = useState(false);
  async function act(s: "IN_REVIEW" | "RESOLVED" | "DISMISSED") {
    const resolution = s !== "IN_REVIEW" ? prompt("Resolution note?") ?? "" : undefined;
    setLoading(true);
    try {
      await setComplaintStatus(id, s, resolution || undefined);
      toast.success("Updated.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    }
    setLoading(false);
  }
  return (
    <div className="flex shrink-0 gap-2">
      {loading && <Loader2 className="size-4 animate-spin text-muted" />}
      {status === "OPEN" && (
        <button onClick={() => act("IN_REVIEW")} className="rounded-full border border-line px-3.5 py-1.5 text-[12px] font-medium text-ink hover:bg-paper-2">Review</button>
      )}
      {status !== "RESOLVED" && status !== "DISMISSED" && (
        <>
          <button onClick={() => act("RESOLVED")} className="rounded-full bg-navy px-3.5 py-1.5 text-[12px] font-medium text-yellow hover:bg-navy-2">Resolve</button>
          <button onClick={() => act("DISMISSED")} className="rounded-full border border-line px-3.5 py-1.5 text-[12px] text-muted hover:bg-paper-2">Dismiss</button>
        </>
      )}
    </div>
  );
}
