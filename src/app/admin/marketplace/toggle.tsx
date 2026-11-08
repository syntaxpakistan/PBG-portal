"use client";

import { setProductActive } from "@/lib/actions/admin";
import { toast } from "sonner";

export function ProductToggle({ id, active }: { id: string; active: boolean }) {
  return (
    <button
      onClick={async () => {
        try {
          await setProductActive(id, !active);
          toast.success(active ? "Product delisted." : "Product live.");
        } catch (e) {
          toast.error(e instanceof Error ? e.message : "Failed");
        }
      }}
      className={`rounded-full px-3.5 py-1.5 text-[11.5px] font-medium ${active ? "border border-line text-ink hover:bg-paper-2" : "bg-navy text-yellow hover:bg-navy-2"}`}
    >
      {active ? "Delist" : "Re-activate"}
    </button>
  );
}
