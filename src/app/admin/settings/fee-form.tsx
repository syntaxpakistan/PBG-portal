"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { setPlatformFee } from "@/lib/actions/admin";
import { toast } from "sonner";

export function FeeForm({ current }: { current: number }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
          await setPlatformFee(new FormData(e.currentTarget));
          toast.success("Fee updated.");
          router.refresh();
        } catch (err) {
          toast.error(err instanceof Error ? err.message : "Failed");
        }
        setLoading(false);
      }}
      className="mt-4 flex items-center gap-3"
    >
      <input
        name="fee" type="number" min={0} max={30} step={0.1} defaultValue={current} required
        className="w-28 rounded-lg border border-line px-3 py-2 text-[13.5px] outline-none focus:border-navy-3"
      />
      <span className="text-[13px] text-muted">%</span>
      <button type="submit" disabled={loading} className="btn-secondary !py-2 text-[12.5px]">
        {loading ? <Loader2 className="size-3.5 animate-spin" /> : "Save"}
      </button>
    </form>
  );
}
