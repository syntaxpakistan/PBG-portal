"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { markLeadHandled } from "@/lib/actions/leads";
import { toast } from "sonner";

export function HandledButton({ id }: { id: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function act() {
    setLoading(true);
    try {
      await markLeadHandled(id);
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
      setLoading(false);
    }
  }

  return (
    <button
      onClick={act}
      disabled={loading}
      className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-line px-3.5 py-1.5 text-[12px] font-medium text-ink hover:bg-paper-2 disabled:opacity-60"
    >
      {loading && <Loader2 className="size-3.5 animate-spin" />} Mark handled
    </button>
  );
}
