"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import { ArrowRight, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/theme-toggle";

const LINKS = [
  { label: "How it works", href: "/#how" },
  { label: "Who it's for", href: "/#who" },
  { label: "Pricing", href: "/#pricing" },
  { label: "Marketplace", href: "/marketplace" },
  { label: "Verified network", href: "/registry" },
];

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

          <ul className="hidden items-center gap-1 lg:flex">
            {LINKS.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className="rounded-full px-3.5 py-2 text-[13.5px] font-medium text-white/75 transition-colors hover:bg-white/8 hover:text-white"
                >
                  {l.label}
                </Link>
              </li>
            ))}
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
              className="grid size-9 place-items-center rounded-full text-white/80 transition-colors hover:bg-white/10 hover:text-white lg:hidden"
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
              className="mt-2 overflow-hidden lg:hidden"
            >
              <div className="rounded-2xl border border-line bg-surface p-3 shadow-2xl shadow-navy/25">
                {LINKS.map((l) => (
                  <Link
                    key={l.href}
                    href={l.href}
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center justify-between rounded-lg px-3 py-3 text-[14.5px] font-medium text-ink hover:bg-paper-2"
                  >
                    {l.label}
                    <ArrowRight className="size-4 text-muted" />
                  </Link>
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
