"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { setPlatformTextSetting } from "@/lib/actions/admin";
import { toast } from "sonner";

export function TextSettingForm({ settingKey, current, placeholder, textarea }: {
  settingKey: string; current: string; placeholder?: string; textarea?: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const cls = "w-full rounded-lg border border-line px-3 py-2 text-[13.5px] outline-none focus:border-navy-3";
  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
          const value = String(new FormData(e.currentTarget).get("value") ?? "");
          await setPlatformTextSetting(settingKey, value);
          toast.success("Saved.");
          router.refresh();
        } catch (err) {
          toast.error(err instanceof Error ? err.message : "Failed");
        }
        setLoading(false);
      }}
      className="mt-2 flex items-start gap-3"
    >
      {textarea
        ? <textarea name="value" rows={3} defaultValue={current} placeholder={placeholder} className={cls} />
        : <input name="value" defaultValue={current} placeholder={placeholder} className={cls} />}
      <button type="submit" disabled={loading} className="btn-secondary shrink-0 !py-2 text-[12.5px]">
        {loading ? <Loader2 className="size-3.5 animate-spin" /> : "Save"}
      </button>
    </form>
  );
}
