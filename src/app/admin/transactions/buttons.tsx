"use client";

import { setTxnStatus } from "@/lib/actions/admin";
import { toast } from "sonner";

export function TxnButtons({ id, status }: { id: string; status: string }) {
  async function act(s: "INVOICED" | "PAID" | "WAIVED") {
    try {
      await setTxnStatus(id, s);
      toast.success(`Marked ${s.toLowerCase()}.`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    }
  }
  if (status === "PAID" || status === "WAIVED") return <span className="text-[11px] text-muted">closed</span>;
  return (
    <div className="flex gap-2">
      {status === "PENDING" && (
        <button onClick={() => act("INVOICED")} className="rounded-full border border-line px-3 py-1 text-[11.5px] font-medium text-ink hover:bg-paper-2">Invoice</button>
      )}
      <button onClick={() => act("PAID")} className="rounded-full bg-navy px-3 py-1 text-[11.5px] font-medium text-yellow hover:bg-navy-2">Mark paid</button>
      <button onClick={() => act("WAIVED")} className="rounded-full border border-line px-3 py-1 text-[11.5px] text-muted hover:bg-paper-2">Waive</button>
    </div>
  );
}
