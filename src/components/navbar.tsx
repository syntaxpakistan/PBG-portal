"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import { ArrowRight, ChevronDown, Cpu, Dna, Menu, TestTubes, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/theme-toggle";
import { useSession } from "@/lib/auth-client";

const PORTAL_HREF: Record<string, string> = {
  ADMIN: "/admin",
  PROVIDER: "/lab",
  SUPPLIER: "/supplier",
  CUSTOMER: "/dashboard",
};

const LINKS = [
  { label: "Services", href: "/services" },
  { label: "Marketplace", href: "/marketplace" },
  { label: "Partners", href: "/partners" },
  { label: "Pricing", href: "/#pricing" },
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

const PROMO_KEY = "pbg-promo-launch-50";

function PromoBar({ onDismiss }: { onDismiss: () => void }) {
  return (
    <div className="relative flex h-9 items-center justify-center gap-3 bg-yellow px-4 text-navy">
      <p className="truncate text-center text-[12px] font-semibold sm:text-[12.5px]">
        🎉 Launch offer: 50% off all subscriptions until 31 Dec 2026
      </p>
      <Link
        href="/#pricing"
        className="shrink-0 rounded-full bg-navy px-3 py-1 text-[11px] font-semibold text-yellow transition-transform hover:scale-105"
      >
        Claim offer →
      </Link>
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Dismiss announcement"
        className="absolute right-3 grid size-6 place-items-center rounded-full text-navy/70 hover:bg-navy/10 hover:text-navy"
      >
        <X className="size-3.5" />
      </button>
    </div>
  );
}

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  // mounted-gated so the bar can't flash for users who dismissed it
  const [promo, setPromo] = useState(false);
  const { data: session, isPending, error } = useSession();
  const sessionReady = !isPending || !!error;
  const portal = session ? PORTAL_HREF[(session.user as { role?: string }).role ?? "CUSTOMER"] ?? "/dashboard" : null;

  useEffect(() => {
    if (!mobileOpen) return;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  useEffect(() => {
    const raf = requestAnimationFrame(() => {
      try {
        if (localStorage.getItem(PROMO_KEY) !== "1") setPromo(true);
      } catch {}
    });
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      {promo && (
        <PromoBar
          onDismiss={() => {
            try { localStorage.setItem(PROMO_KEY, "1"); } catch {}
            setPromo(false);
          }}
        />
      )}
      <div className={cn("container-x pt-3 transition-all duration-500", scrolled ? "max-w-[1100px]" : "max-w-[1200px]")}>
        <nav className="relative flex h-[68px] items-center justify-between gap-4 rounded-full px-5">
          {/* backdrop blur lives on a non-interactive layer — iOS Safari can
              drop taps on children of a backdrop-filter element */}
          <div
            aria-hidden
            className={cn(
              "absolute inset-0 rounded-full transition-all duration-500",
              scrolled || mobileOpen ? "bg-navy/95 shadow-xl shadow-navy/20 backdrop-blur-xl" : "bg-navy-2/40 backdrop-blur-md"
            )}
          />
          <Link href="/" className="relative z-10 flex items-center" aria-label="Pakistan Biotechnology Gateway home">
            <Image src="/brand/pbg-logo-dark.webp" alt="Pakistan Biotechnology Gateway" width={1024} height={334} priority className="h-14 w-auto" />
          </Link>

          <ul className="relative z-10 hidden items-center gap-0.5 xl:flex">
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

          <div className="relative z-10 flex items-center gap-2.5">
            <ThemeToggle onDark />
            {!sessionReady ? (
              <span className="hidden h-9 w-24 rounded-full sm:inline-flex" aria-hidden />
            ) : portal ? (
              <Link href={portal} className="btn-secondary hidden !px-4 !py-2 text-[12.5px] sm:inline-flex">
                Open portal
              </Link>
            ) : (
              <>
                <Link href="/login" className="btn-ghost on-dark hidden !px-4 !py-2 text-[12.5px] sm:inline-flex">
                  Sign in
                </Link>
                <Link href="/biogateway" className="btn-secondary hidden !px-4 !py-2 text-[12.5px] sm:inline-flex">
                  Join the Gateway
                </Link>
              </>
            )}
            <button
              type="button"
              onClick={() => setMobileOpen((o) => !o)}
              aria-label="Toggle menu"
              aria-expanded={mobileOpen}
              className="relative z-10 grid size-9 touch-manipulation place-items-center rounded-full text-white/80 transition-colors hover:bg-white/10 hover:text-white xl:hidden"
            >
              {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
          </div>
        </nav>

        <AnimatePresence>
          {mobileOpen && (
            <>
            {/* iOS Safari can drop taps inside backdrop-filter containers —
                render the sheet outside the blurred nav, above the hero */}
            <div className="fixed inset-0 z-[55] bg-navy/60 xl:hidden" onClick={() => setMobileOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="fixed inset-x-4 top-[108px] z-[60] mt-2 overflow-hidden xl:hidden"
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
                  {!sessionReady ? (
                    <span className="h-10 flex-1" aria-hidden />
                  ) : portal ? (
                    <Link href={portal} onClick={() => setMobileOpen(false)} className="btn-secondary flex-1 justify-center !py-2.5">
                      Open portal
                    </Link>
                  ) : (
                    <>
                      <Link href="/login" onClick={() => setMobileOpen(false)} className="btn-ghost flex-1 justify-center !py-2.5">
                        Sign in
                      </Link>
                      <Link href="/biogateway" onClick={() => setMobileOpen(false)} className="btn-secondary flex-1 justify-center !py-2.5">
                        Join the Gateway
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}
