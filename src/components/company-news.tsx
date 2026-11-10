"use client";

import Link from "next/link";
import { ArrowRight, CalendarDays, Clock3, MapPin, Megaphone, MonitorPlay, Newspaper } from "lucide-react";
import { Reveal, Stagger, fadeUp } from "@/components/motion-primitives";
import { motion } from "motion/react";

const FEATURED = {
  date: "April 2–7, 2027",
  place: "Orlando, FL",
  kind: "Conference",
  title: "AACR Annual Meeting 2027 — meet the team at Booth 1356",
  desc: "Book time with our scientists to scope your next multiomics project.",
};

const WEBINARS = [
  {
    title: "Advancing neuroscience research with spatial transcriptomics",
    desc: "How spatial analysis reveals key molecular and cellular responses in traumatic brain injury research.",
    meta: "Online · 55:05 min", action: "Register",
  },
  {
    title: "Deriving biological insights from TCR repertoire data",
    desc: "An overview of TCR data generation, analysis and annotation workflows for interpreting adaptive immune repertoires.",
    meta: "Online · 59:21 min", action: "View recording",
  },
  {
    title: "Advanced analysis of bulk and single-cell transcriptomics",
    desc: "Advanced methods for bulk and single-cell transcriptomic data and their use in decoding molecular mechanisms of disease.",
    meta: "Online · 53:12 min", action: "View recording",
  },
  {
    title: "Bioinformatics solutions for multiomics research",
    desc: "A framework for scalable, reproducible analysis across WGS, transcriptomics, single-cell, immune profiling and genome assembly.",
    meta: "Online · 39:58 min", action: "View recording",
  },
  {
    title: "The hidden genetic treasures of South Asia",
    desc: "Why South Asian medical genetics matters — a computational biologists' meetup on population-scale genomic discovery.",
    meta: "Online · 54:09 min", action: "View recording",
  },
];

const PRESS = [
  {
    date: "June 2026", kind: "Announcement",
    title: "Spatial grant program launched on new Illumina spatial technology",
    desc: "A new grant program gives researchers free access to single-cell-resolution spatial transcriptomics — applications open for qualifying academic and translational projects.",
  },
  {
    date: "June 2026", kind: "Announcement",
    title: "Xenium 5K spatial transcriptomics grant recipients announced",
    desc: "The winning research teams selected for the Xenium 5K spatial grant gain full access to high-plex spatial profiling for their studies.",
  },
  {
    date: "January 2026", kind: "Announcement",
    title: "Xenium 5K spatial grant program launched with 10x Genomics",
    desc: "A grant offering free access to the Xenium 5K spatial gene-expression panel, targeting researchers advancing single-cell spatial biology.",
  },
];

export function NewsPage() {
  return (
    <>
      {/* hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-navy-2 via-navy to-navy pb-20 pt-[185px]">
        <div className="grid-lines on-dark absolute inset-0" />
        <div className="glow-orb left-[10%] top-[-200px] size-[500px] bg-blue-bright/15" />
        <div className="container-x relative">
          <Reveal>
            <p className="mt-5 inline-block rounded-full border border-white/25 px-4 py-1.5 text-[10.5px] font-medium uppercase tracking-[0.14em] text-[#c5d2e1]">
              Newsroom
            </p>
            <h1 className="h-display on-dark mt-5 max-w-3xl">News &amp; Events</h1>
            <p className="mt-6 max-w-2xl text-[16px] leading-relaxed text-[#c5d2e1]">
              Where to meet our scientists, upcoming webinars, and the latest announcements from the Gateway.
            </p>
          </Reveal>
        </div>
      </section>

      {/* featured event */}
      <section className="bg-paper py-16">
        <div className="container-x">
          <Reveal>
            <div className="overflow-hidden rounded-[28px] bg-navy p-9 sm:p-12">
              <div className="grid gap-8 lg:grid-cols-[auto_1fr_auto] lg:items-center">
                <div className="flex items-center gap-5">
                  <div className="grid size-20 place-items-center rounded-2xl bg-yellow text-center text-navy">
                    <div>
                      <p className="font-display text-[24px] font-semibold leading-none">02</p>
                      <p className="text-[10px] font-semibold uppercase tracking-widest">Apr</p>
                    </div>
                  </div>
                  <div className="text-[13px] text-[#a2c1d7]">
                    <p className="inline-flex items-center gap-1.5"><CalendarDays className="size-3.5" /> {FEATURED.date}</p>
                    <p className="mt-1.5 inline-flex items-center gap-1.5"><MapPin className="size-3.5" /> {FEATURED.place}</p>
                  </div>
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-mint">{FEATURED.kind} · Featured event</p>
                  <h2 className="mt-2 font-display text-[24px] font-medium tracking-tight text-white">{FEATURED.title}</h2>
                  <p className="mt-2 text-[14px] text-[#c5d2e1]">{FEATURED.desc}</p>
                </div>
                <span className="btn-wrap">
                  <Link href="/contact" className="btn-white">Book a meeting</Link>
                </span>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* webinars */}
      <section className="border-t border-line bg-surface py-24">
        <div className="container-x">
          <Reveal>
            <p className="eyebrow">Webinars</p>
            <h2 className="h-section mt-4">Watch &amp; learn</h2>
          </Reveal>
          <Stagger className="mt-12 grid gap-5 lg:grid-cols-2">
            {WEBINARS.map((w) => (
              <motion.div key={w.title} variants={fadeUp} className="card card-hover flex flex-col p-6">
                <div className="flex items-center justify-between gap-3">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-paper-2 px-3 py-1 text-[11px] font-semibold text-ink">
                    <MonitorPlay className="size-3.5" /> Webinar
                  </span>
                  <span className="inline-flex items-center gap-1 text-[11.5px] text-muted"><Clock3 className="size-3.5" />{w.meta}</span>
                </div>
                <h3 className="mt-4 text-[16px] font-semibold leading-snug text-ink">{w.title}</h3>
                <p className="mt-2.5 flex-1 text-[13px] leading-relaxed text-body">{w.desc}</p>
                <Link href="/contact" className="mt-5 inline-flex items-center gap-1.5 text-[13px] font-semibold text-blue hover:text-ink">
                  {w.action} <ArrowRight className="size-3.5" />
                </Link>
              </motion.div>
            ))}
          </Stagger>
        </div>
      </section>

      {/* press */}
      <section className="border-t border-line bg-paper-2/50 py-24">
        <div className="container-x">
          <Reveal>
            <p className="eyebrow">Press &amp; news</p>
            <h2 className="h-section mt-4">Latest announcements</h2>
          </Reveal>
          <Stagger className="mt-12 grid gap-5 lg:grid-cols-3">
            {PRESS.map((p) => (
              <motion.div key={p.title} variants={fadeUp} className="card card-hover flex flex-col p-6">
                <div className="flex items-center gap-2.5 text-[11.5px] font-medium">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-navy px-3 py-1 text-yellow">
                    <Megaphone className="size-3" /> {p.kind}
                  </span>
                  <span className="text-muted">{p.date}</span>
                </div>
                <h3 className="mt-4 flex-1 text-[15.5px] font-semibold leading-snug text-ink">{p.title}</h3>
                <p className="mt-2.5 text-[13px] leading-relaxed text-body">{p.desc}</p>
                <Link href="/company/grants" className="mt-5 inline-flex items-center gap-1.5 text-[13px] font-semibold text-blue hover:text-ink">
                  Read more <ArrowRight className="size-3.5" />
                </Link>
              </motion.div>
            ))}
          </Stagger>
        </div>
      </section>

      {/* subscribe */}
      <section className="bg-paper py-20">
        <div className="container-x">
          <Reveal>
            <div className="overflow-hidden rounded-[28px] bg-navy p-9 sm:p-12">
              <div className="flex flex-wrap items-center justify-between gap-6">
                <div>
                  <h2 className="h-section on-dark">Never miss an event or announcement</h2>
                  <p className="mt-3 max-w-lg text-[14px] text-[#c5d2e1]">
                    Conference schedules, webinar invites and company news — delivered to your inbox.
                  </p>
                </div>
                <span className="btn-wrap">
                  <Link href="/biogateway" className="btn-white">
                    <span className="inline-flex items-center gap-2"><Newspaper className="size-4" /> Subscribe</span>
                  </Link>
                </span>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
