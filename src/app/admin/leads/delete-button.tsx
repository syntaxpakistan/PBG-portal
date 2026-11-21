"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Trash2 } from "lucide-react";
import { deleteLead } from "@/lib/actions/leads";
import { toast } from "sonner";

export function DeleteLeadButton({ id, leadNo }: { id: string; leadNo: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  return (
    <button
      type="button"
      title="Delete lead"
      disabled={loading}
      onClick={async () => {
        if (!confirm(`Delete ${leadNo}? This permanently removes the lead.`)) return;
        setLoading(true);
        try {
          await deleteLead(id);
          router.refresh();
        } catch (e) {
          setLoading(false);
          toast.error(e instanceof Error ? e.message : "Could not delete lead");
        }
      }}
      className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-(--st-red-bd) px-3.5 py-1.5 text-[12px] font-medium text-(--st-red-fg) transition-colors hover:bg-(--st-red-bg) disabled:opacity-50"
    >
      {loading ? <Loader2 className="size-3.5 animate-spin" /> : <Trash2 className="size-3.5" />}
      Delete
    </button>
  );
}
