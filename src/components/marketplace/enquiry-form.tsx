"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { createEnquiry } from "@/lib/actions/catalog";
import { toast } from "sonner";

export function EnquiryForm({ productId }: { productId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="btn-outline mt-4 w-full justify-center !py-2 text-[12.5px]">
        Send enquiry
      </button>
    );
  }
  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
          await createEnquiry(productId, new FormData(e.currentTarget));
          toast.success("Enquiry sent to supplier.");
          setOpen(false);
          router.refresh();
        } catch (err) {
          toast.error(err instanceof Error ? err.message : "Failed");
        }
        setLoading(false);
      }}
      className="mt-4 space-y-2 border-t border-line pt-3"
    >
      <input name="qty" type="number" min={1} defaultValue={1} required className="w-full rounded-lg border border-line px-3 py-2 text-[12.5px] outline-none" placeholder="Quantity" />
      <input name="message" className="w-full rounded-lg border border-line px-3 py-2 text-[12.5px] outline-none" placeholder="Message (delivery, variants…)" />
      <button type="submit" disabled={loading} className="btn-primary w-full justify-center !py-2 text-[12.5px]">
        {loading ? <Loader2 className="size-3.5 animate-spin" /> : "Submit enquiry"}
      </button>
    </form>
  );
}
