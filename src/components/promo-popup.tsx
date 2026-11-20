"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { X, ArrowRight } from "lucide-react";

const SEEN_KEY = "pbg-launch-promo-seen";
const store = {
  get: () => { try { return sessionStorage.getItem(SEEN_KEY); } catch { return null; } },
  set: () => { try { sessionStorage.setItem(SEEN_KEY, "1"); } catch {} },
};
const PUBLIC_ROUTES = new Set([
  "/",
  "/services",
  "/suppliers",
  "/marketplace",
  "/registry",
  "/partners",
  "/biogateway",
  "/login",
]);

export function PromoPopup() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!PUBLIC_ROUTES.has(pathname)) return;
    if (store.get()) return;
    const t = setTimeout(() => setOpen(true), 1200);
    return () => clearTimeout(t);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  const close = () => {
    store.set();
    setOpen(false);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-[90] flex items-center justify-center bg-navy/70 p-4 backdrop-blur-sm"
          onClick={close}
          role="dialog"
          aria-modal="true"
          aria-label="Launch offer"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={close}
              aria-label="Close"
              className="absolute -right-3 -top-3 z-10 grid size-9 place-items-center rounded-full bg-white text-ink shadow-lg transition-transform hover:scale-105"
            >
              <X className="size-4.5" />
            </button>

            <div className="relative aspect-[3/2] w-[min(94vw,1100px,114vh)] overflow-hidden rounded-2xl shadow-2xl">
              <Image
                src="/promo/launch-collage.jpeg"
                alt="Pakistan Biotechnology Gateway launch offer, 50% off all subscriptions until 31 December 2026"
                fill
                priority
                sizes="(max-width: 1200px) 94vw, 1100px"
                className="object-cover"
              />
            </div>

            <div className="mt-3 flex justify-center">
              <Link
                href="/biogateway"
                onClick={close}
                className="btn-secondary inline-flex items-center gap-2 !px-6 !py-2.5 text-[14px]"
              >
                Join the Gateway <ArrowRight className="size-4" />
              </Link>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
