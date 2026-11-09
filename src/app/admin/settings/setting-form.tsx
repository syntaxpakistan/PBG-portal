"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { setPlatformSetting } from "@/lib/actions/admin";
import { toast } from "sonner";

export function SettingForm({ settingKey, current, suffix, min, max, step = 1 }: {
  settingKey: string; current: number; suffix?: string; min: number; max: number; step?: number;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
          const value = String(new FormData(e.currentTarget).get("value"));
          await setPlatformSetting(settingKey, value);
          toast.success("Setting saved.");
          router.refresh();
        } catch (err) {
          toast.error(err instanceof Error ? err.message : "Failed");
        }
        setLoading(false);
      }}
      className="mt-3 flex items-center gap-3"
    >
      <input
        name="value" type="number" min={min} max={max} step={step} defaultValue={current} required
        className="w-28 rounded-lg border border-line px-3 py-2 text-[13.5px] outline-none focus:border-navy-3"
      />
      {suffix && <span className="text-[13px] text-muted">{suffix}</span>}
      <button type="submit" disabled={loading} className="btn-secondary !py-2 text-[12.5px]">
        {loading ? <Loader2 className="size-3.5 animate-spin" /> : "Save"}
      </button>
    </form>
  );
}
