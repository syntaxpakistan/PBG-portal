"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import { ArrowRight, ChevronDown, Cpu, Dna, Menu, TestTubes, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/theme-toggle";

const LINKS = [
  { label: "Pricing", href: "/#pricing" },
  { label: "Services", href: "/services" },
  { label: "Marketplace", href: "/marketplace" },
  { label: "Partners", href: "/partners" },
  { label: "Verified network", href: "/registry" },
];

const SERVICE_SUBLINKS = [
  {
    label: "Molecular biology services",
    desc: "DNA/RNA extraction, PCR & qPCR",
    href: "/services/molecular-biology",
    icon: TestTubes,
  },
  {
    label: "Sequencing services",
    desc: "Sanger, WGS, RNA-seq & metagenomics",
    href: "/services/sequencing",
    icon: Dna,
  },
  {
    label: "Bioinformatics services",
    desc: "Assembly, variants & analysis pipelines",
    href: "/services/bioinformatics",
    icon: Cpu,
  },
];

const linkClass =
  "inline-flex h-9 items-center whitespace-nowrap rounded-full px-3 text-[13px] font-medium text-white/75 transition-colors hover:bg-white/8 hover:text-white";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className="fixed inset-x-0 top-3 z-50">
      <div className={cn("container-x transition-all duration-500", scrolled ? "max-w-[1100px]" : "max-w-[1200px]")}>
        <nav
          className={cn(
            "flex h-[68px] items-center justify-between gap-4 rounded-full px-5 transition-all duration-500",
            scrolled || mobileOpen ? "bg-navy/95 shadow-xl shadow-navy/20 backdrop-blur-xl" : "bg-navy-2/40 backdrop-blur-md"
          )}
        >
          <Link href="/" className="flex items-center" aria-label="Pakistan Biotechnology Gateway home">
            <Image src="/brand/pbg-logo-dark.webp" alt="Pakistan Biotechnology Gateway" width={1024} height={334} className="h-14 w-auto" />
          </Link>

          <ul className="hidden items-center gap-0.5 xl:flex">
            {LINKS.map((l) =>
              l.label === "Services" ? (
                <li key={l.href} className="group relative">
                  <Link href={l.href} className={cn(linkClass, "gap-1")}>
                    {l.label}
                    <ChevronDown className="size-3.5 transition-transform duration-200 group-hover:rotate-180" />
                  </Link>
                  <div className="invisible absolute left-1/2 top-full -translate-x-1/2 pt-3 opacity-0 transition-all duration-200 group-hover:visible group-hover:opacity-100">
                    <div className="w-72 overflow-hidden rounded-2xl border border-white/10 bg-navy/95 p-2 shadow-2xl shadow-navy/40 backdrop-blur-xl">
                      <Link
                        href="/services"
                        className="flex items-center justify-between rounded-lg bg-white/5 px-3 py-2.5 text-[12px] font-semibold uppercase tracking-[0.08em] text-yellow transition-colors hover:bg-white/10"
                      >
                        All services
                        <ArrowRight className="size-3.5" />
                      </Link>
                      <div className="mt-1.5 space-y-0.5 border-t border-white/10 pt-1.5">
                        {SERVICE_SUBLINKS.map((s) => (
                          <Link
                            key={s.href}
                            href={s.href}
                            className="group/item flex items-start gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-white/8"
                          >
                            <span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-lg bg-white/8 text-yellow transition-colors group-hover/item:bg-yellow group-hover/item:text-navy">
                              <s.icon className="size-4" />
                            </span>
                            <span className="min-w-0">
                              <span className="block text-[13px] font-semibold text-white/90 transition-colors group-hover/item:text-white">
                                {s.label}
                              </span>
                              <span className="mt-0.5 block text-[11px] leading-snug text-white/50">
                                {s.desc}
                              </span>
                            </span>
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                </li>
              ) : (
                <li key={l.href}>
                  <Link href={l.href} className={linkClass}>
                    {l.label}
                  </Link>
                </li>
              )
            )}
          </ul>

          <div className="flex items-center gap-2.5">
            <ThemeToggle onDark />
            <Link href="/login" className="btn-ghost on-dark hidden !px-4 !py-2 text-[12.5px] sm:inline-flex">
              Sign in
            </Link>
            <Link href="/biogateway" className="btn-secondary hidden !px-4 !py-2 text-[12.5px] sm:inline-flex">
              Join the Gateway
            </Link>
            <button
              onClick={() => setMobileOpen((o) => !o)}
              aria-label="Toggle menu"
              className="grid size-9 place-items-center rounded-full text-white/80 transition-colors hover:bg-white/10 hover:text-white xl:hidden"
            >
              {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
          </div>
        </nav>

        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="mt-2 overflow-hidden xl:hidden"
            >
              <div className="rounded-2xl border border-line bg-surface p-3 shadow-2xl shadow-navy/25">
                {LINKS.map((l) => (
                  <div key={l.href}>
                    <Link
                      href={l.href}
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center justify-between rounded-lg px-3 py-3 text-[14.5px] font-medium text-ink hover:bg-paper-2"
                    >
                      {l.label}
                      <ArrowRight className="size-4 text-muted" />
                    </Link>
                    {l.label === "Services" &&
                      SERVICE_SUBLINKS.map((s) => (
                        <Link
                          key={s.href}
                          href={s.href}
                          onClick={() => setMobileOpen(false)}
                          className="flex items-center justify-between rounded-lg py-2.5 pl-8 pr-3 text-[13px] font-medium text-body hover:bg-paper-2"
                        >
                          {s.label}
                          <ArrowRight className="size-3.5 text-muted" />
                        </Link>
                      ))}
                  </div>
                ))}
                <div className="mt-2 flex gap-2.5 border-t border-line pt-3">
                  <Link href="/login" onClick={() => setMobileOpen(false)} className="btn-ghost flex-1 justify-center !py-2.5">
                    Sign in
                  </Link>
                  <Link href="/biogateway" onClick={() => setMobileOpen(false)} className="btn-secondary flex-1 justify-center !py-2.5">
                    Join the Gateway
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}
