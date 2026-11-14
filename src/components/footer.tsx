import Link from "next/link";
import Image from "next/image";
import { ShieldCheck, Lock } from "lucide-react";

const SOCIALS: { label: string; href: string; path: string }[] = [
  {
    label: "LinkedIn",
    href: "#",
    path: "M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.225 0z",
  },
  {
    label: "X",
    href: "#",
    path: "M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z",
  },
  {
    label: "YouTube",
    href: "#",
    path: "M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z",
  },
  {
    label: "Medium",
    href: "#",
    path: "M13.54 12a6.8 6.8 0 0 1-6.77 6.82A6.8 6.8 0 0 1 0 12a6.8 6.8 0 0 1 6.77-6.82A6.8 6.8 0 0 1 13.54 12zM20.96 12c0 3.54-1.51 6.42-3.38 6.42-1.87 0-3.39-2.88-3.39-6.42s1.52-6.42 3.39-6.42 3.38 2.88 3.38 6.42M24 12c0 3.17-.53 5.75-1.19 5.75-.66 0-1.19-2.58-1.19-5.75s.53-5.75 1.19-5.75C23.47 6.25 24 8.83 24 12z",
  },
];

const COLUMNS: { heading: string; links: { label: string; href: string }[] }[] = [
  {
    heading: "Gateway",
    links: [
      { label: "Overview", href: "/" },
      { label: "How it works", href: "/#how" },
      { label: "Services", href: "/services" },
      { label: "Marketplace", href: "/marketplace" },
      { label: "Partners", href: "/partners" },
      { label: "Verified network", href: "/registry" },
    ],
  },
  {
    heading: "Join",
    links: [
      { label: "Create an account", href: "/biogateway" },
      { label: "Register as a lab", href: "/biogateway?role=provider" },
      { label: "Register as a supplier", href: "/biogateway?role=supplier" },
      { label: "Sign in", href: "/login" },
    ],
  },
  {
    heading: "Contact",
    links: [
      { label: "info@biotechnologygateway.com", href: "mailto:info@biotechnologygateway.com" },
      { label: "contact@biotechnologygateway.com", href: "mailto:contact@biotechnologygateway.com" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="relative overflow-hidden bg-navy">
      <div className="rainbow-line relative z-10" />
      <Image
        src="/media/join-dna.webp"
        alt=""
        fill
        sizes="100vw"
        className="pointer-events-none absolute inset-0 object-cover object-right opacity-40"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-navy via-navy/80 to-navy/20" />
      <div className="container-x relative py-14 sm:py-16">
        <Link href="/" className="inline-block" aria-label="Pakistan Biotechnology Gateway home">
          <Image src="/brand/pbg-logo-dark.webp" alt="Pakistan Biotechnology Gateway" width={1024} height={334} className="h-32 w-auto sm:h-36" />
        </Link>
        <div className="mt-10 grid gap-10 sm:mt-12 lg:grid-cols-[1fr_repeat(3,auto)] lg:gap-14">
          <div>
            <p className="max-w-xs text-[13.5px] leading-relaxed text-[#a2c1d7]">
              A federated digital marketplace connecting Pakistan&apos;s research community with
              verified sequencing capacity, bioinformatics providers and indigenous biotech suppliers.
            </p>
            <div className="mt-5 flex items-center gap-4">
              {SOCIALS.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="text-[#a2c1d7] transition-colors hover:text-white"
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" className="size-4.5" aria-hidden="true">
                    <path d={s.path} />
                  </svg>
                </a>
              ))}
            </div>
            <div className="mt-6 flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 px-3 py-1.5 text-[11.5px] text-[#c5d2e1]">
                <ShieldCheck className="size-3.5 text-yellow" /> Independently operated · non-governmental
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 px-3 py-1.5 text-[11.5px] text-[#c5d2e1]">
                <Lock className="size-3.5 text-yellow" /> No raw genomic data hosted
              </span>
            </div>
          </div>

          {COLUMNS.map((col) => (
            <div key={col.heading}>
              <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-[#7a97b0]">{col.heading}</p>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link href={l.href} className="text-[13.5px] text-[#a2c1d7] transition-colors hover:text-white">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 sm:flex-row">
          <p className="text-[12.5px] text-[#7a97b0]">
            © 2026 PBG | Pakistan Biotechnology Gateway. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
