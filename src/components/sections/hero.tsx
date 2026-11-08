"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { ArrowRight, Play } from "lucide-react";
import { cn } from "@/lib/utils";
import { HeroCollage } from "@/components/sections/hero-collage";

const NEEDS = [
  "Whole Genome",
  "Whole Exome",
  "RNA-Seq",
  "Single-cell",
  "Spatial",
  "Long-Read",
  "Epigenomics",
  "Immune Repertoire",
  "Oncology Panels",
  "Sequencing Only",
];

const easeOut = [0.22, 1, 0.36, 1] as const;

export function Hero() {
  const [need, setNeed] = useState(NEEDS[0]);

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-navy-2 via-navy to-navy pb-24 pt-[190px] sm:pt-[210px]">
      {/* backdrop */}
      <div className="grid-lines on-dark absolute inset-0" />
      <div className="glow-orb left-[-120px] top-[-200px] size-[560px] bg-blue-bright/15" />
      <div className="glow-orb right-[-100px] top-[30%] size-[400px] bg-mint/8" />
      <div className="glow-orb left-[30%] bottom-[-200px] size-[420px] bg-navy-3/60" />

      <div className="container-x relative">
        <div className="grid items-center gap-14 lg:grid-cols-[1.05fr_0.95fr]">
          {/* left column */}
          <div>
            <motion.span
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: easeOut }}
              className="inline-block rounded-full border border-white/25 px-4 py-1.5 text-[10.5px] font-medium uppercase tracking-[0.14em] text-[#c5d2e1]"
            >
              Scientist-run · Accredited labs · Nationwide coverage
            </motion.span>

            <motion.h1
              initial={{ opacity: 0, y: 26 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.75, ease: easeOut, delay: 0.08 }}
              className="h-display on-dark mt-7"
            >
              <em className="grad-text">End-to-end NGS & multiomics</em> services, designed around your research
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: easeOut, delay: 0.18 }}
              className="mt-6 max-w-[540px] text-[16px] leading-relaxed text-[#c5d2e1]"
            >
              From study design through expert analysis, verified providers deliver fully customizable
              library prep, sequencing and bioinformatics — matched to your samples and goals,
              and quoted blind, side-by-side.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: easeOut, delay: 0.28 }}
              className="mt-8 flex flex-wrap items-center gap-5"
            >
              <span className="btn-wrap">
                <Link href="/biogateway" className="btn-white">
                  Request a Quote
                </Link>
              </span>
              <Link
                href="/services"
                className="group inline-flex items-center gap-2.5 text-[14.5px] font-medium text-white/90 transition-colors hover:text-white"
              >
                <span className="grid size-8 place-items-center rounded-full border border-white/30 transition-colors group-hover:border-white/60">
                  <Play className="size-3 fill-current" />
                </span>
                Browse services
              </Link>
            </motion.div>

            {/* need selector */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: easeOut, delay: 0.4 }}
              className="mt-14"
            >
              <p className="text-[13.5px] font-medium text-white/80">What do you need done?</p>
              <div className="mt-4 flex max-w-[560px] flex-wrap gap-2.5">
                {NEEDS.map((n) => (
                  <button
                    key={n}
                    onClick={() => setNeed(n)}
                    className={cn(
                      "relative rounded-full border px-4.5 py-2.5 text-[13px] font-medium transition-colors duration-300",
                      need === n
                        ? "border-yellow text-yellow"
                        : "border-white/30 text-white/80 hover:border-white/60 hover:text-white"
                    )}
                  >
                    {n}
                  </button>
                ))}
              </div>
              <motion.p
                key={need}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 text-[13px] text-[#7a97b0]"
              >
                Route <span className="text-yellow">{need}</span> to verified providers →
                receive competing blind quotes → compare side-by-side.
              </motion.p>
            </motion.div>
          </div>

          {/* right column — vertical card marquee collage */}
          <HeroCollage />
        </div>
      </div>
    </section>
  );
}
