"use client";

import { useState } from "react";

export function ServicePriceFields({ input, label }: { input: string; label: string }) {
  const [rfq, setRfq] = useState(false);
  return (
    <>
      <label className="flex items-start gap-2.5 rounded-lg border border-line bg-paper px-3.5 py-2.5">
        <input
          type="checkbox"
          checked={rfq}
          onChange={(e) => setRfq(e.target.checked)}
          className="mt-0.5 size-4 accent-[var(--navy)]"
        />
        <span>
          <span className="block text-[12.5px] font-medium text-ink">Request for quote</span>
          <span className="mt-0.5 block text-[11px] text-muted">No fixed price — buyers send an RFQ and you quote per project.</span>
        </span>
      </label>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={label}>Starting price (PKR)</label>
          <input
            name="priceFrom"
            type="number"
            min={0}
            disabled={rfq}
            className={input}
            placeholder={rfq ? "Quoted per RFQ" : "95000"}
          />
        </div>
        <div>
          <label className={label}>Unit</label>
          <input name="unit" disabled={rfq} className={input} placeholder="/sample" />
        </div>
      </div>
      <div>
        <label className={label}>Price visibility</label>
        <select name={rfq ? undefined : "priceVisibility"} disabled={rfq} className={input}>
          <option value="PUBLIC">Public — anyone browsing the marketplace</option>
          <option value="MEMBERS">Members — signed-in customers only</option>
          <option value="QUOTE_ONLY">Hidden — &ldquo;request quote&rdquo; instead of a price</option>
        </select>
        {rfq && <input type="hidden" name="priceVisibility" value="QUOTE_ONLY" />}
        <p className="mt-1 text-[11px] text-muted">
          {rfq
            ? "Price stays empty — the listing shows “Request for quote” to buyers."
            : "Competitors can’t see member-only or hidden prices — only you and the marketplace buyers."}
        </p>
      </div>
    </>
  );
}
