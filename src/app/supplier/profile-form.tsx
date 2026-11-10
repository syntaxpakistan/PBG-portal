"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { updateSupplierProfile } from "@/lib/actions/profiles";
import { toast } from "sonner";
import type { SupplierProfile } from "@prisma/client";

const input = "w-full rounded-lg border border-line bg-surface px-3 py-2 text-[13px] outline-none focus:border-navy-3";

export function SupplierProfileForm({ profile }: { profile: SupplierProfile }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
          await updateSupplierProfile(new FormData(e.currentTarget));
          toast.success("Profile saved.");
          router.refresh();
        } catch (err) {
          toast.error(err instanceof Error ? err.message : "Failed");
        }
        setLoading(false);
      }}
      className="grid grid-cols-2 gap-3"
    >
      <div className="col-span-2">
        <label className="mb-1 block text-[11.5px] font-medium text-ink">Company name</label>
        <input name="orgName" required defaultValue={profile.orgName} className={input} />
      </div>
      <div>
        <label className="mb-1 block text-[11.5px] font-medium text-ink">City</label>
        <input name="city" required defaultValue={profile.city} className={input} />
      </div>
      <div>
        <label className="mb-1 block text-[11.5px] font-medium text-ink">Established</label>
        <input name="establishedYear" type="number" defaultValue={profile.establishedYear ?? ""} className={input} />
      </div>
      <div className="col-span-2">
        <label className="mb-1 block text-[11.5px] font-medium text-ink">Product categories</label>
        <input name="categories" defaultValue={profile.categories} className={input} />
      </div>
      <div>
        <label className="mb-1 block text-[11.5px] font-medium text-ink">Contact person</label>
        <input name="contactPerson" defaultValue={profile.contactPerson ?? ""} className={input} />
      </div>
      <div>
        <label className="mb-1 block text-[11.5px] font-medium text-ink">Website</label>
        <input name="website" type="text" placeholder="yourcompany.com" defaultValue={profile.website ?? ""} className={input} />
      </div>
      <div className="col-span-2">
        <label className="mb-1 block text-[11.5px] font-medium text-ink">Bio</label>
        <textarea name="bio" rows={3} defaultValue={profile.bio ?? ""} className={input} />
      </div>
      <button type="submit" disabled={loading} className="btn-secondary col-span-2 justify-center !py-2.5">
        {loading ? <Loader2 className="size-4 animate-spin" /> : "Save profile"}
      </button>
    </form>
  );
}
