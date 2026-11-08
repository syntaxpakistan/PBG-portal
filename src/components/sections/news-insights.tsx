"use client";

import Link from "next/link";
import { ArrowRight, CalendarDays, Newspaper, FileText, PenLine } from "lucide-react";
import { Reveal, Stagger, fadeUp } from "@/components/motion-primitives";
import { motion } from "motion/react";

const NEWS = [
  {
    date: "June 2026",
    tag: "News",
    icon: Newspaper,
    title: "New grant program backs single-cell spatial transcriptomics projects built on Illumina spatial technology",
    href: "/resources/news",
  },
  {
    date: "July 2026",
    tag: "Publication",
    icon: FileText,
    title: "Reanalysis of NGS data across 101 neuromuscular disorder families lifts diagnostic yield, uncovers intronic variants and a novel disease gene",
    href: "/resources/news",
  },
  {
    date: "2026",
    tag: "Blog",
    icon: PenLine,
    title: "Choosing the right NGS partner for complex multiomics — quicker turnaround, higher quality, better value",
    href: "/resources/docs",
  },
];

export function NewsInsights() {
  return (
    <section className="border-t border-line bg-paper-2/60 py-24 sm:py-28">
      <div className="container-x">
        <Reveal>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="eyebrow">News & insights</p>
              <h2 className="h-section mt-4">
                From the <em className="grad-text">Gateway</em>
              </h2>
            </div>
            <Link href="/resources/news" className="inline-flex items-center gap-1.5 text-[14px] font-medium text-navy-2 hover:text-blue">
              All updates <ArrowRight className="size-4" />
            </Link>
          </div>
        </Reveal>

        <Stagger className="mt-12 grid gap-5 lg:grid-cols-[1fr_1fr_1fr_1.15fr]">
          {NEWS.map((n) => (
            <motion.div key={n.title} variants={fadeUp}>
              <Link href={n.href} className="card card-hover group flex h-full flex-col p-6">
                <div className="flex items-center gap-2 text-[11px] font-medium">
                  <n.icon className="size-3.5 text-blue" />
                  <span className="uppercase tracking-wider text-blue">{n.tag}</span>
                  <span className="text-muted">· {n.date}</span>
                </div>
                <h3 className="mt-4 flex-1 text-[15px] font-semibold leading-snug text-ink group-hover:text-navy-2">
                  {n.title}
                </h3>
                <span className="mt-5 inline-flex items-center gap-1.5 text-[12.5px] font-medium text-muted transition-colors group-hover:text-blue">
                  Read <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
                </span>
              </Link>
            </motion.div>
          ))}

          {/* event card */}
          <motion.div variants={fadeUp}>
            <div className="relative flex h-full flex-col overflow-hidden rounded-2xl bg-navy p-6">
              <div className="glow-orb right-[-60px] top-[-60px] size-[200px] bg-mint/15" />
              <p className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-wider text-yellow">
                <CalendarDays className="size-3.5" /> Upcoming
              </p>
              <h3 className="mt-4 flex-1 text-[16px] font-semibold leading-snug text-white">
                AACR Annual Meeting 2027 — find the team at Booth 1356
              </h3>
              <p className="mt-3 text-[12px] text-[#a2c1d7]">April 2 – 7, 2027 · Orlando, FL · Grab a slot to plan your next multiomics study</p>
              <span className="btn-wrap mt-5 self-start">
                <Link href="/resources/events" className="btn-white !px-4 !py-2 !text-[12.5px]">
                  Book a meeting
                </Link>
              </span>
            </div>
          </motion.div>
        </Stagger>
      </div>
    </section>
  );
}
