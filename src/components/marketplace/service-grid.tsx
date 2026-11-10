"use client";

import { useState } from "react";
import Link from "next/link";
import { BadgeCheck, Clock, GitCompareArrows, Star, X } from "lucide-react";

export type ServiceCardData = {
  id: string;
  name: string;
  category: string;
  platform: string | null;
  description: string | null;
  unit: string | null;
  turnaroundDays: number | null;
  priceLabel: string; // "PKR 95,000 /sample" | "Members-only price" | "Request a quote"
  provider: { id: string; orgName: string; city: string; rating: number | null };
};

// Science Exchange cart model: tick services → one RFQ fans out to all selected labs as sealed invites
export function ServiceGrid({ services, mode }: { services: ServiceCardData[]; mode: "public" | "customer" }) {
  const [picked, setPicked] = useState<Map<string, string>>(new Map()); // serviceId → providerId

  const toggle = (id: string, providerId: string) =>
    setPicked((m) => {
      const n = new Map(m);
      if (n.has(id)) n.delete(id);
      else n.set(id, providerId);
      return n;
    });

  const providerIds = [...new Set(picked.values())];
  const compareHref = `/dashboard/rfqs/new?invite=${providerIds.join(",")}`;

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {services.map((s) => {
          const checked = picked.has(s.id);
          return (
            <div key={s.id} className={`card card-hover flex flex-col p-5 ${checked ? "ring-2 ring-(--st-blue-bd)" : ""}`}>
              <div className="flex items-start justify-between gap-2">
                <span className="rounded-full bg-(--st-blue-bg) px-2.5 py-0.5 text-[10.5px] font-medium text-(--st-blue-fg)">{s.category}</span>
                {mode === "customer" && (
                  <label className="flex cursor-pointer items-center gap-1.5 text-[11px] font-medium text-muted hover:text-ink">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggle(s.id, s.provider.id)}
                      className="size-3.5 accent-navy"
                    />
                    Compare
                  </label>
                )}
              </div>
              <h3 className="mt-3 text-[15px] font-semibold text-ink">{s.name}</h3>
              <div className="mt-1 flex items-center gap-2 text-[11.5px] text-muted">
                {s.platform && <span>{s.platform}</span>}
                {s.turnaroundDays && (
                  <span className="flex items-center gap-1"><Clock className="size-3" />~{s.turnaroundDays}d</span>
                )}
              </div>
              {s.description && <p className="mt-2 line-clamp-2 flex-1 text-[12px] leading-relaxed text-body">{s.description}</p>}
              <div className="mt-3 flex items-end justify-between gap-2 border-t border-line pt-3">
                <div className="min-w-0">
                  <p className="flex items-center gap-1.5 truncate text-[12px] text-muted">
                    <BadgeCheck className="size-3.5 shrink-0 text-green" />
                    <Link href={`/registry/${s.provider.id}`} className="truncate font-medium text-body hover:text-ink hover:underline">
                      {s.provider.orgName}
                    </Link>
                    <span>· {s.provider.city}</span>
                  </p>
                  {s.provider.rating != null && (
                    <p className="mt-0.5 flex items-center gap-1 text-[11px] text-muted">
                      <Star className="size-3 fill-yellow text-yellow" />{s.provider.rating.toFixed(1)}
                    </p>
                  )}
                </div>
                <div className="shrink-0 text-right">
                  <div className="font-display text-[15px] font-medium text-ink">{s.priceLabel}</div>
                </div>
              </div>
              {mode === "customer" ? (
                <Link
                  href={`/dashboard/rfqs/new?invite=${s.provider.id}&cat=${encodeURIComponent(s.category)}&title=${encodeURIComponent(s.name)}`}
                  className="btn-outline mt-3.5 w-full justify-center !py-2 text-[12.5px]"
                >
                  Request quote →
                </Link>
              ) : (
                <Link href="/login" className="btn-outline mt-3.5 w-full justify-center !py-2 text-[12.5px]">
                  Sign in to request →
                </Link>
              )}
            </div>
          );
        })}
        {services.length === 0 && (
          <p className="col-span-full py-12 text-center text-[13px] text-muted">No services match your filters.</p>
        )}
      </div>

      {/* compare tray — Science Exchange multi-supplier cart */}
      {picked.size > 0 && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface/95 backdrop-blur-md">
          <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-6 py-3.5">
            <div className="flex items-center gap-2.5 text-[13px] text-ink">
              <GitCompareArrows className="size-4.5 text-(--st-blue-fg)" />
              <span><b>{picked.size}</b> service{picked.size > 1 ? "s" : ""} · <b>{providerIds.length}</b> lab{providerIds.length > 1 ? "s" : ""} selected — one request reaches them all, quotes arrive sealed</span>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setPicked(new Map())} className="btn-ghost !px-3 !py-2 text-[12px]"><X className="size-3.5" /> Clear</button>
              <Link href={compareHref} className="btn-primary !py-2.5 text-[13px]">Request quotes from {providerIds.length} lab{providerIds.length > 1 ? "s" : ""} →</Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
