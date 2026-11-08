"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { ArrowRight, EyeOff, ShieldCheck, FileLock2 } from "lucide-react";
import { Reveal, Stagger, fadeUp } from "@/components/motion-primitives";

const FEATURES = [
  {
    icon: ShieldCheck,
    title: "Verified, not just listed",
    desc: "Every provider and supplier passes Syntax verification — credentials, equipment claims, track record — before earning a visible, explicitly non-governmental badge.",
  },
  {
    icon: EyeOff,
    title: "Blind by design",
    desc: "Competing quotations are isolated at the database layer. Provider A cannot see Provider B's pricing under any condition — including via the API.",
  },
  {
    icon: FileLock2,
    title: "Your data stays yours",
    desc: "Metadata and documents only (PDF/DOCX, ≤25MB). Raw FASTQ, BAM and VCF files are never stored on the Gateway — they move via lab-side secure links.",
  },
];

export function Enterprise() {
  return (
    <section className="relative overflow-hidden bg-navy py-24 sm:py-28">
      <div className="grid-lines on-dark absolute inset-0 opacity-60" />
      <div className="glow-orb left-1/2 top-[-160px] size-[480px] -translate-x-1/2 bg-blue-bright/15" />
      <div className="glow-orb right-[5%] bottom-[-100px] size-[300px] bg-mint/8" />
      <div className="container-x relative">
        <Reveal>
          <p className="eyebrow on-dark">Governance & security</p>
          <h2 className="h-section on-dark mt-4 max-w-2xl">
            Built for <em className="grad-text">accountable</em> science
          </h2>
          <p className="mt-5 max-w-2xl text-[15.5px] leading-relaxed text-[#c5d2e1]">
            Enterprise-ready from day one — RBAC, HTTPS, admin MFA, input validation and a
            non-repudiable audit log on every administrative action.
          </p>
        </Reveal>

        <Stagger className="mt-14 grid gap-5 md:grid-cols-3">
          {FEATURES.map((f) => (
            <motion.div key={f.title} variants={fadeUp} className="card-dark card-hover p-7">
              <span className="grid size-11 place-items-center rounded-xl border border-yellow/30 bg-yellow/10 text-yellow">
                <f.icon className="size-5" strokeWidth={1.8} />
              </span>
              <h3 className="mt-5 font-display text-[17px] font-medium tracking-tight text-white">{f.title}</h3>
              <p className="mt-3 text-[13.5px] leading-relaxed text-[#a2c1d7]">{f.desc}</p>
            </motion.div>
          ))}
        </Stagger>

        <Reveal delay={2} className="mt-10">
          <Link href="/company/trust" className="btn-ghost on-dark">
            Read the Trust & Data Policy <ArrowRight className="size-4" />
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
