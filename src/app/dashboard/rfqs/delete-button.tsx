"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { deleteRfq } from "@/lib/actions/marketplace";

export function DeleteRfqButton({ rfqId, refNo }: { rfqId: string; refNo: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  return (
    <button
      type="button"
      title="Delete request"
      disabled={loading}
      onClick={async () => {
        if (!confirm(`Delete ${refNo}? This permanently removes the request and any quotes received. Only possible before a quote is awarded.`)) return;
        setLoading(true);
        try {
          await deleteRfq(rfqId);
          router.refresh();
        } catch (e) {
          setLoading(false);
          toast.error(e instanceof Error ? e.message : "Could not delete request");
        }
      }}
      className="inline-flex items-center gap-1.5 rounded-lg border border-(--st-red-bd) px-3 py-1.5 text-[12px] font-medium text-(--st-red-fg) transition-colors hover:bg-(--st-red-bg) disabled:opacity-50"
    >
      {loading ? <Loader2 className="size-3.5 animate-spin" /> : <Trash2 className="size-3.5" />}
      Delete
    </button>
  );
}
