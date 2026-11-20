import Image from "next/image";

/** PBG wordmark — real-colour version by default; the pale variant renders in
    .dark theme where the deep green would disappear on navy surfaces. */
export function BrandLogo({ className = "h-14 w-auto", priority = false }: { className?: string; priority?: boolean }) {
  return (
    <>
      <Image
        src="/brand/pbg-logo.webp"
        alt="Pakistan Biotechnology Gateway"
        width={1024}
        height={334}
        priority={priority}
        className={`brand-logo-light ${className}`}
      />
      <Image
        src="/brand/pbg-logo-dark.webp"
        alt=""
        aria-hidden
        width={1024}
        height={334}
        priority={priority}
        className={`brand-logo-dark ${className}`}
      />
    </>
  );
}
