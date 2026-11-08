"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { selectQuote } from "@/lib/actions/marketplace";
import { toast } from "sonner";

export function QuoteSelectButton({ quoteId }: { quoteId: string }) {
  const [loading, setLoading] = useState(false);
  const [po, setPo] = useState("");
  return (
    <div className="mt-4 space-y-2">
      <input
        value={po} onChange={(e) => setPo(e.target.value)}
        placeholder="Purchase order # (optional)"
        className="w-full rounded-lg border border-line bg-surface px-3 py-2 text-[12.5px] text-ink outline-none focus:border-navy-3"
      />
      <button
        onClick={async () => {
          if (!confirm("Award this RFQ to this provider? Other quotes will be declined.")) return;
          setLoading(true);
          try {
            await selectQuote(quoteId, po || undefined);
          } catch (e) {
            setLoading(false);
            toast.error(e instanceof Error ? e.message : "Could not select quote");
          }
        }}
        disabled={loading}
        className="btn-primary w-full justify-center !py-2.5"
      >
        {loading ? <Loader2 className="size-4 animate-spin" /> : "Select this offer"}
      </button>
    </div>
  );
}
