/**
 * Decorative hero background. Uses an animated WebP rather than <video>:
 * image animations play on every browser including iOS <16.4 (where the
 * JS bundle can't run) and are never gated by autoplay policies or Low
 * Power Mode. Browsers too old to animate WebP show the first frame.
 */
export function BgVideo({ src, className }: { src: string; className?: string }) {
  return <img src={src} alt="" aria-hidden="true" className={className} />;
}
