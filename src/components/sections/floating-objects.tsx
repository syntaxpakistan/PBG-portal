"use client";

import { motion } from "motion/react";
import {
  ShieldCheck,
  Microscope,
  Package,
  FileText,
  GitCompareArrows,
  Dna,
  FlaskConical,
  Activity,
} from "lucide-react";

type FloatChip = {
  icon: React.ElementType;
  title: string;
  sub?: string;
  className: string;
  duration: number;
  delay: number;
  accent?: "yellow" | "mint" | "blue";
};

const CHIPS: FloatChip[] = [
  // left side
  { icon: ShieldCheck, title: "Verified Lab", sub: "Syntax criteria passed", className: "left-[2%] top-[6%] xl:left-[4%]", duration: 6.5, delay: 0, accent: "yellow" },
  { icon: Microscope, title: "Illumina NovaSeq", sub: "Karachi · verified", className: "left-[1%] top-[38%] xl:left-[3%]", duration: 7.5, delay: 1.2, accent: "blue" },
  { icon: FileText, title: "RFQ routed", sub: "→ 12 matching providers", className: "left-[4%] top-[68%] xl:left-[6%]", duration: 8, delay: 0.6, accent: "mint" },
  // right side
  { icon: GitCompareArrows, title: "Blind quote", sub: "PKR 385,000 · 14 days", className: "right-[2%] top-[10%] xl:right-[4%]", duration: 7, delay: 0.4, accent: "yellow" },
  { icon: FlaskConical, title: "Bioinformatics", sub: "HPC · 32-node cluster", className: "right-[1%] top-[42%] xl:right-[3%]", duration: 8.5, delay: 1.6, accent: "mint" },
  { icon: Package, title: "Reagent kit", sub: "Indigenous supplier", className: "right-[4%] top-[72%] xl:right-[6%]", duration: 6.8, delay: 0.9, accent: "blue" },
];

const ACCENT = {
  yellow: "border-yellow/40 text-yellow",
  mint: "border-mint/40 text-mint",
  blue: "border-blue-bright/50 text-blue-bright",
};

export function FloatingObjects() {
  return (
    <div className="pointer-events-none absolute inset-0 hidden lg:block" aria-hidden>
      {CHIPS.map((c, i) => (
        <motion.div
          key={c.title}
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ delay: 0.9 + i * 0.12, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className={`absolute ${c.className}`}
        >
          <motion.div
            animate={{ y: [0, -16, 0] }}
            transition={{ duration: c.duration, delay: c.delay, repeat: Infinity, ease: "easeInOut" }}
            className="flex items-center gap-2.5 rounded-xl border border-white/12 bg-white/[0.05] px-3.5 py-2.5 shadow-lg shadow-black/30 backdrop-blur-md"
          >
            <span className={`grid size-8 place-items-center rounded-lg border bg-white/[0.06] ${ACCENT[c.accent ?? "blue"]}`}>
              <c.icon className="size-4" strokeWidth={1.8} />
            </span>
            <span className="text-left">
              <span className="block text-[12px] font-medium leading-tight text-white">{c.title}</span>
              {c.sub && <span className="block text-[10.5px] leading-tight text-[#7a97b0]">{c.sub}</span>}
            </span>
          </motion.div>
        </motion.div>
      ))}

      {/* drifting vertical light streaks */}
      {[12, 30, 68, 86].map((x, i) => (
        <motion.span
          key={x}
          className="absolute top-0 h-40 w-px bg-gradient-to-b from-transparent via-mint/25 to-transparent"
          style={{ left: `${x}%` }}
          animate={{ y: ["-20%", "120%"], opacity: [0, 1, 0] }}
          transition={{ duration: 9 + i * 2.5, repeat: Infinity, delay: i * 1.8, ease: "linear" }}
        />
      ))}

      {/* lone DNA icon drifting */}
      <motion.div
        className="absolute left-[47%] top-[9%] text-mint/50"
        animate={{ y: [0, -18, 0], rotate: [0, 8, 0] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
      >
        <Dna className="size-7" strokeWidth={1.5} />
      </motion.div>
      <motion.div
        className="absolute right-[30%] top-[58%] text-yellow/40"
        animate={{ y: [0, -14, 0], rotate: [0, -10, 0] }}
        transition={{ duration: 7.5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      >
        <Activity className="size-6" strokeWidth={1.5} />
      </motion.div>
    </div>
  );
}
