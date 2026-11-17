"use client";

import { useActionState } from "react";
import { Loader2, Check } from "lucide-react";
import { submitLead, type LeadResult } from "@/lib/actions/leads";

const input = "w-full rounded-lg border border-line bg-surface px-3.5 py-2.5 text-[14px] text-ink outline-none transition-colors focus:border-navy-3";

export function LeadForm() {
  const [state, action, pending] = useActionState<LeadResult | null, FormData>(submitLead, null);

  if (state?.ok) {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-(--st-green-bd) bg-(--st-green-bg) px-5 py-4 text-[13.5px] text-(--st-green-fg)">
        <Check className="size-4 shrink-0" /> Message received — The Gateway team will get back to you within one business day.
      </div>
    );
  }

  return (
    <form action={action} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-[12.5px] font-medium text-ink">First name *</label>
          <input name="firstName" required className={input} placeholder="Waqar" />
        </div>
        <div>
          <label className="mb-1.5 block text-[12.5px] font-medium text-ink">Last name</label>
          <input name="lastName" className={input} placeholder="Asghar" />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-[12.5px] font-medium text-ink">Work email *</label>
          <input name="email" type="email" required className={input} placeholder="you@institute.edu.pk" />
        </div>
        <div>
          <label className="mb-1.5 block text-[12.5px] font-medium text-ink">Organization</label>
          <input name="org" className={input} placeholder="University / hospital / lab" />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-[12.5px] font-medium text-ink">Interested in</label>
          <select name="interest" className={input}>
            <option value="">General enquiry</option>
            <option>Request a quote — sequencing</option>
            <option>Request a quote — bioinformatics</option>
            <option>Request a quote — molecular biology</option>
            <option>Reagents & supplies</option>
            <option>Listing my lab or company</option>
          </select>
        </div>
        <div>
          <label className="mb-1.5 block text-[12.5px] font-medium text-ink">Type</label>
          <select name="type" className={input} defaultValue="QUOTE">
            <option value="QUOTE">Quote request</option>
            <option value="CONTACT">General contact</option>
          </select>
        </div>
      </div>
      <div>
        <label className="mb-1.5 block text-[12.5px] font-medium text-ink">Message</label>
        <textarea name="message" rows={3} className={input} placeholder="Tell us what you're working on — sample types, targets, timeline…" />
      </div>
      <input name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
      {state?.error && <p className="text-[12.5px] text-(--st-red-fg)">{state.error}</p>}
      <button type="submit" disabled={pending} className="btn-secondary !py-2.5">
        {pending ? <Loader2 className="size-4 animate-spin" /> : "Send message"}
      </button>
    </form>
  );
}
