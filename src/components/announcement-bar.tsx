"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { Megaphone } from "lucide-react";

const ITEMS = [
  "10x Xenium spatial profiling now available across the verified network",
  "Olink Reveal proteomics added — 1,000+ protein biomarkers from only 4 μL",
  "PacBio Revio long-read sequencing joins the registry for structural variant work",
  "Illumina StrataMap 15×50mm spatial slides — newly supported by providers",
];

export function AnnouncementBar() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI((v) => (v + 1) % ITEMS.length), 4500);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="fixed inset-x-0 top-0 z-[60] flex h-[34px] items-center bg-navy-3/90 backdrop-blur-md">
      <div className="container-x flex items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-2.5">
          <Megaphone className="size-3.5 shrink-0 text-yellow" />
          <div className="relative h-[16px] min-w-0 flex-1 overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.span
                key={i}
                initial={{ y: 14, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -14, opacity: 0 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                className="block truncate text-[11.5px] font-medium text-[#c5d2e1]"
              >
                {ITEMS[i]}
              </motion.span>
            </AnimatePresence>
          </div>
        </div>
        <div className="hidden shrink-0 items-center gap-4 text-[11.5px] font-medium sm:flex">
          <Link href="/login" className="text-white/70 transition-colors hover:text-white">Login</Link>
          <Link href="/contact" className="text-white/70 transition-colors hover:text-white">Contact</Link>
          <Link
            href="/biogateway"
            className="rounded-full bg-yellow px-3.5 py-1 text-[11px] font-semibold text-navy transition-colors hover:bg-white"
          >
            Gateway Portal
          </Link>
        </div>
      </div>
    </div>
  );
}
