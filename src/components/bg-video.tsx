"use client";

import { useEffect, useRef } from "react";

/**
 * Decorative autoplay background video.
 * iOS Safari only allows autoplay when the DOM `muted` property is true at
 * play time — React's `muted` prop doesn't reliably set it, so we set it
 * imperatively and call play() on canplay. If iOS still refuses (Low Power
 * Mode), the poster remains as a static fallback.
 */
export function BgVideo({ src, poster, className }: { src: string; poster: string; className?: string }) {
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
    <video
      ref={ref}
      autoPlay
      muted
      loop
      playsInline
      preload="auto"
      poster={poster}
      className={className}
      aria-hidden="true"
    >
      <source src={src} type="video/mp4" />
    </video>
  );
}
