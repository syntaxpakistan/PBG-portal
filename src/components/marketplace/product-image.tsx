"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X, Expand } from "lucide-react";

export function ProductImage({ imageKey, alt, className, imgClass, hideExpand }: { imageKey: string; alt: string; className?: string; imgClass?: string; hideExpand?: boolean }) {
  const [open, setOpen] = useState(false);
  const src = `/api/files/${imageKey}?inline=1`;

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={`group relative block cursor-zoom-in overflow-hidden rounded-lg border border-line ${className ?? "w-full"}`} aria-label={`Preview ${alt}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={alt} className={imgClass ?? "h-40 w-full object-cover transition-transform duration-200 group-hover:scale-[1.03]"} />
        {!hideExpand && (
          <span className="absolute right-2 top-2 grid size-7 place-items-center rounded-full bg-ink/60 text-white opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100">
            <Expand className="size-3.5" />
          </span>
        )}
      </button>
      {open && createPortal(
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/80 p-4" onClick={() => setOpen(false)} role="dialog" aria-modal="true" aria-label={`${alt} preview`}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={src} alt={alt} className="max-h-[85vh] max-w-[90vw] rounded-xl border border-white/20 bg-white object-contain shadow-2xl" onClick={(e) => e.stopPropagation()} />
          <button type="button" onClick={() => setOpen(false)} className="absolute right-4 top-4 grid size-10 place-items-center rounded-full bg-white/90 text-ink shadow-lg hover:bg-white" aria-label="Close preview">
            <X className="size-5" />
          </button>
          <p className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-black/70 px-4 py-1.5 text-[12px] font-medium text-white">{alt}</p>
        </div>,
        document.body
      )}
    </>
  );
}
