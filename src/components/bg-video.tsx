"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Layered decorative hero background:
 * - `anim` (light animated WebP) renders in SSR and always plays — the
 *   guaranteed baseline for browsers where the JS bundle can't run
 *   (e.g. iOS <16.4 Safari) or where video autoplay is blocked.
 * - `src` (mp4) mounts only after hydration and is revealed once it is
 *   actually playing, so a blocked/frozen video frame can never cover
 *   the animated fallback beneath it.
 */
export function BgVideo({
  src,
  anim,
  className,
}: {
  src: string;
  anim: string;
  className?: string;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  const [mounted, setMounted] = useState(false);
  const [playing, setPlaying] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    v.muted = true;
    const tryPlay = () => v.play().catch(() => {});
    tryPlay();
    v.addEventListener("canplay", tryPlay);
    return () => v.removeEventListener("canplay", tryPlay);
  }, [mounted]);

  return (
    <div className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}>
      <img src={anim} alt="" aria-hidden="true" className="absolute inset-0 size-full object-cover" />
      {mounted && (
        <video
          ref={ref}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          onPlaying={() => setPlaying(true)}
          className={cn(
            "absolute inset-0 size-full object-cover transition-opacity duration-700",
            playing ? "opacity-100" : "opacity-0"
          )}
          aria-hidden="true"
        >
          <source src={src} type="video/mp4" />
        </video>
      )}
    </div>
  );
}
