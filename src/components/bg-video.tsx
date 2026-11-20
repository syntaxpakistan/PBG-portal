"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

/**
 * Layered decorative hero background.
 * - `anim` (light animated WebP) always animates — even where the JS
 *   bundle can't run (iOS <16.4) or video autoplay is blocked.
 * - `src` (mp4) is in the SSR markup so iOS native autoplay can fire;
 *   with preload="none" and no poster it stays transparent until a frame
 *   actually plays, so it can never freeze over the animation beneath.
 */
export function BgVideo({ src, anim, className }: { src: string; anim: string; className?: string }) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    v.muted = true;
    const tryPlay = () => v.play().catch(() => {});
    tryPlay();
    v.addEventListener("canplay", tryPlay);
    return () => v.removeEventListener("canplay", tryPlay);
  }, []);

  return (
    <div className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}>
      <img src={anim} alt="" aria-hidden="true" className="absolute inset-0 size-full object-cover" />
      <video
        ref={ref}
        autoPlay
        muted
        loop
        playsInline
        preload="none"
        className="absolute inset-0 size-full object-cover"
        aria-hidden="true"
      >
        <source src={src} type="video/mp4" />
      </video>
    </div>
  );
}
