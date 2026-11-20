"use client";

import { useEffect } from "react";
import Lenis from "lenis";

// landing-page-only smooth scroll, keep it out of the portal shells
export function SmoothScroll() {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 0.6,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      anchors: { offset: -124 },
    });
    // deep links like /#pricing: land on the section centered, not clipped
    // under the fixed header (native hash jump fires before Lenis is ready)
    if (window.location.hash) {
      const el = document.getElementById(window.location.hash.slice(1));
      if (el) setTimeout(() => el.scrollIntoView({ block: "center" }), 350);
    }
    let raf = 0;
    const loop = (time: number) => {
      lenis.raf(time);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      lenis.destroy();
    };
  }, []);
  return null;
}
