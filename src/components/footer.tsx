import Link from "next/link";
import { ShieldCheck, Lock } from "lucide-react";

const COLUMNS: { heading: string; links: { label: string; href: string }[] }[] = [
  {
    heading: "Platform",
    links: [
      { label: "Platform Overview", href: "/platform" },
      { label: "RFQ Engine", href: "/platform/rfq" },
      { label: "Blind Quoting", href: "/platform/quoting" },
      { label: "Facility Registry", href: "/registry" },
      { label: "Marketplace", href: "/marketplace" },
    ],
  },
  {
    heading: "Solutions",
    links: [
      { label: "For Researchers", href: "/solutions/researchers" },
      { label: "For Laboratories", href: "/solutions/labs" },
      { label: "For Suppliers", href: "/solutions/suppliers" },
      { label: "For Administrators", href: "/solutions/admin" },
    ],
  },
  {
    heading: "Resources",
    links: [
      { label: "Documentation", href: "/resources/docs" },
      { label: "Platform Updates", href: "/resources/news" },
      { label: "FAQs", href: "/resources/faqs" },
      { label: "Verification Criteria", href: "/resources/verification" },
    ],
  },
  {
    heading: "Company",
    links: [
      { label: "About Syntax of Life", href: "/company/about" },
      { label: "Contact", href: "/company/contact" },
      { label: "Trust & Data Policy", href: "/company/trust" },
      { label: "Terms & Privacy", href: "/company/legal" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="relative bg-navy">
      <div className="rainbow-line" />
      <div className="container-x py-14 sm:py-16">
        <Link href="/" className="inline-block" aria-label="Syntax of Life home">
          <img src="/brand/logo-dark.png" alt="Syntax of Life" className="h-20 w-auto sm:h-24" />
        </Link>
        <div className="mt-10 grid gap-10 sm:mt-12 lg:grid-cols-[1fr_repeat(4,auto)] lg:gap-8">
          <div>
            <p className="max-w-xs text-[13.5px] leading-relaxed text-[#a2c1d7]">
              A federated digital marketplace connecting Pakistan&apos;s research community with
              verified sequencing capacity, bioinformatics providers and indigenous biotech suppliers.
            </p>
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
            © 2026 Syntax of Life Private Limited. All rights reserved.
          </p>
          <p className="font-mono text-[11px] tracking-wide text-[#7a97b0]">
            Karachi · Lahore · Islamabad — Nationwide
          </p>
        </div>
      </div>
    </footer>
  );
}
