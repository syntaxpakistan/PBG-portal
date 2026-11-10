"use client";

import Link from "next/link";
import { ArrowRight, Dna, FlaskConical, Microscope, TestTubes, Activity, Boxes, Atom } from "lucide-react";
import { Reveal, Stagger, fadeUp } from "@/components/motion-primitives";
import { motion } from "motion/react";

const FEATURED = [
  {
    tags: "Illumina • Oxford Nanopore • PacBio",
    title: "Whole-Genome Sequencing",
    desc: "Sequence microbial, plant and animal genomes for assembly or resequencing — long-read and short-read workflows.",
    cta: "Browse WGS",
    href: "/services/whole-genome-sequencing",
    icon: Dna,
  },
  {
    tags: "Shotgun • 16S rRNA • ITS • 18S",
    title: "Metagenomics & Microbiome Profiling",
    desc: "Characterise microbial communities in mixed samples — shotgun metagenomics and amplicon profiling.",
    cta: "Browse Metagenomics",
    href: "/services/metagenomics",
    icon: FlaskConical,
  },
];

const ICON_CHIPS = [
  { icon: TestTubes, label: "Proteomics" },
  { icon: Microscope, label: "Genomics" },
  { icon: Activity, label: "Epigenetics" },
  { icon: FlaskConical, label: "Transcriptomics" },
  { icon: Boxes, label: "RNA-Seq" },
  { icon: Atom, label: "Long-read" },
];

export function FeaturedServices() {
  return (
    <section className="bg-paper py-24 sm:py-28">
      <div className="container-x">
        <Reveal>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="eyebrow">Featured services</p>
              <h2 className="h-section mt-4 max-w-xl">
                National capacity, <em className="grad-text">one RFQ away</em>
              </h2>
            </div>
            <Link href="/services" className="inline-flex items-center gap-1.5 text-[14px] font-medium text-ink hover:text-blue">
              View all services <ArrowRight className="size-4" />
            </Link>
          </div>
        </Reveal>

        <Stagger className="mt-12 grid gap-5 lg:grid-cols-2">
          {FEATURED.map((f) => (
            <motion.div key={f.title} variants={fadeUp}>
              <Link href={f.href} className="card card-hover group flex h-full gap-5 p-7">
                <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-navy text-yellow">
                  <f.icon className="size-7" strokeWidth={1.6} />
                </span>
                <span>
                  <span className="text-[12px] font-medium tracking-wide text-muted">{f.tags}</span>
                  <span className="mt-1.5 block font-display text-[21px] font-medium tracking-tight text-ink">{f.title}</span>
                  <span className="mt-2 block text-[13.5px] leading-relaxed text-body">{f.desc}</span>
                  <span className="mt-4 inline-flex items-center gap-1.5 text-[13.5px] font-semibold text-blue group-hover:text-ink">
                    {f.cta} <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                  </span>
                </span>
              </Link>
            </motion.div>
          ))}
        </Stagger>

        <Reveal delay={1} className="mt-10">
          <div className="flex flex-wrap gap-3">
            {ICON_CHIPS.map((c) => (
              <Link
                key={c.label}
                href="/services"
                className="group inline-flex items-center gap-2.5 rounded-full border border-line bg-surface px-4 py-2.5 text-[13px] font-medium text-ink transition-all hover:border-navy-3 hover:shadow-md"
              >
                <c.icon className="size-4 text-ink transition-colors group-hover:text-blue" />
                {c.label}
              </Link>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
