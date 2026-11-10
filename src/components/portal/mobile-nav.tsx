"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { Menu, X } from "lucide-react";
import { SideNav, type NavItem } from "./side-nav";
import { SignOutButton } from "./signout";
import { ThemeToggle } from "@/components/theme-toggle";
import { PlatformMark, PlatformMarkText } from "@/components/platform-mark";

export function PortalMobileNav({
  title,
  items,
  unread,
  name,
  email,
}: {
  title: string;
  items: NavItem[];
  unread: number;
  name?: string | null;
  email: string;
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // close on navigation (render-phase state adjustment) + lock body scroll while open
  const [prevPath, setPrevPath] = useState(pathname);
  if (prevPath !== pathname) {
    setPrevPath(pathname);
    setOpen(false);
  }
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <>
      {/* mobile top bar */}
      <div className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-line bg-navy px-4 lg:hidden">
        <div className="flex min-w-0 items-center gap-2.5">
          <Link href="/" className="flex shrink-0 items-center" aria-label="Syntax of Life home">
            <img src="/brand/logo-dark.png" alt="Syntax of Life" className="h-10 w-auto" />
          </Link>
          <span className="h-6 w-px shrink-0 bg-white/15" />
          <PlatformMarkText className="shrink-0" />
        </div>
        <div className="flex items-center gap-2">
          <Link href="/notifications" aria-label="Notifications" className="relative grid size-9 place-items-center rounded-full text-white/80 hover:bg-white/10">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-4.5"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>
            {unread > 0 && <span className="absolute -right-0.5 -top-0.5 grid size-4 place-items-center rounded-full bg-yellow text-[8.5px] font-bold text-navy">{unread > 9 ? "9+" : unread}</span>}
          </Link>
          <button onClick={() => setOpen(true)} aria-label="Open menu" className="grid size-9 place-items-center rounded-full text-white hover:bg-white/10">
            <Menu className="size-5" />
          </button>
        </div>
      </div>

      {/* slide-over drawer */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-50 bg-navy/60 backdrop-blur-sm lg:hidden"
            />
            <motion.aside
              initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              className="fixed inset-y-0 left-0 z-50 flex w-[280px] max-w-[85vw] flex-col bg-navy lg:hidden"
            >
              <div className="flex h-14 items-center justify-between px-5">
                <div className="flex items-center">
                  <img src="/brand/logo-dark.png" alt="Syntax of Life" className="h-12 w-auto" />
                </div>
                <button onClick={() => setOpen(false)} aria-label="Close menu" className="grid size-9 place-items-center rounded-full text-white/80 hover:bg-white/10">
                  <X className="size-5" />
                </button>
              </div>
              <div className="border-t border-white/10 px-5 py-3.5">
                <PlatformMark />
              </div>
              <div className="px-5 pb-3 pt-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#a2c1d7]">{title}</div>
              <div className="min-h-0 flex-1 overflow-y-auto">
                <SideNav items={items} unread={unread} />
              </div>
              <div className="border-t border-white/10 p-4">
                <div className="mb-3 flex items-center gap-2.5">
                  <span className="grid size-8 place-items-center rounded-full bg-yellow/20 text-[12px] font-semibold text-yellow">
                    {name?.charAt(0) ?? "U"}
                  </span>
                  <div className="min-w-0">
                    <div className="truncate text-[13px] font-medium text-white">{name}</div>
                    <div className="truncate text-[11px] text-[#a2c1d7]">{email}</div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <SignOutButton />
                  <ThemeToggle onDark />
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
