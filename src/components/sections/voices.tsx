"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { ArrowRight, Quote } from "lucide-react";
import { Reveal, Stagger, fadeUp } from "@/components/motion-primitives";

const STORIES = [
  {
    quote:
      "Finding a lab that could handle plant genomes used to take months of emails. A structured RFQ with competing quotes compresses that into days.",
    role: "Principal Investigator",
    org: "Agriculture & livestock research",
    metric: "Days",
    metricLabel: "not months, to first quote",
  },
  {
    quote:
      "Blind quoting changes the dynamic completely — our pricing is judged on merit, and we never wonder who else saw our numbers.",
    role: "Lab Director",
    org: "Sequencing service provider",
    metric: "Fair",
    metricLabel: "competition, enforced by design",
  },
  {
    quote:
      "Listing indigenous kits on a moderated national catalog puts local supply chains in front of every verified research buyer.",
    role: "Commercial Lead",
    org: "Reagents & consumables supplier",
    metric: "Direct",
    metricLabel: "enquiries from verified buyers",
  },
];

export function Voices() {
  return (
    <section className="bg-surface py-24 sm:py-28">
      <div className="container-x">
        <Reveal>
          <p className="eyebrow">Why it matters</p>
          <h2 className="h-section mt-4 max-w-3xl">
            Built for the people <em className="grad-text">doing the science</em>
          </h2>
        </Reveal>

        <Stagger className="mt-14 grid gap-5 lg:grid-cols-3">
          {STORIES.map((s) => (
            <motion.figure key={s.role} variants={fadeUp} className="card card-hover flex flex-col p-7">
              <Quote className="size-6 text-blue-bright" />
              <blockquote className="mt-4 flex-1 text-[14.5px] leading-relaxed text-ink/85">
                “{s.quote}”
              </blockquote>
              <figcaption className="mt-6">
                <p className="text-[13.5px] font-semibold text-ink">{s.role}</p>
                <p className="text-[12.5px] text-muted">{s.org}</p>
              </figcaption>
              <div className="mt-5 border-t border-line pt-5">
                <p className="grad-text font-display text-[24px] font-medium tracking-tight">{s.metric}</p>
                <p className="text-[11.5px] text-muted">{s.metricLabel}</p>
              </div>
            </motion.figure>
          ))}
        </Stagger>

        <Reveal delay={2} className="mt-10">
          <Link href="/solutions/researchers" className="btn-ghost">
            Explore the workflows <ArrowRight className="size-4" />
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
