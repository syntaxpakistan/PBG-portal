"use client";

import { Fragment } from "react";
import { motion } from "motion/react";
import {
  ShieldCheck,
  Microscope,
  Package,
  FileText,
  Dna,
  FlaskConical,
  CircleCheck,
  Building2,
  EyeOff,
  CircleDot,
} from "lucide-react";

/* ---------- mini card designs (biotech equivalents of prezent's slide cards) ---------- */

function QuoteCard() {
  return (
    <div className="rounded-2xl bg-surface p-5 shadow-xl shadow-navy/30">
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted">Blind quote</p>
        <span className="inline-flex items-center gap-1 rounded-full bg-navy/5 px-2 py-0.5 text-[9px] font-semibold text-ink">
          <EyeOff className="size-2.5" /> hidden
        </span>
      </div>
      <p className="mt-2 text-[13px] font-semibold text-ink">Provider B</p>
      <p className="font-mono text-[18px] font-medium text-ink">PKR 412,500</p>
      <div className="mt-2 flex items-center gap-2 text-[10.5px] text-muted">
        <span className="rounded-full bg-(--st-green-bg) px-2 py-0.5 font-semibold text-(--st-green-fg)">10 days TAT</span>
        <span>incl. taxes</span>
      </div>
    </div>
  );
}

function ChartCard() {
  return (
    <div className="rounded-2xl bg-surface p-5 shadow-xl shadow-navy/30">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted">Coverage profile</p>
      <svg viewBox="0 0 220 90" className="mt-2 w-full">
        <polyline
          points="0,70 25,60 50,64 75,40 100,46 125,30 150,36 175,22 200,28 220,18"
          fill="none" stroke="#21a7e0" strokeWidth="2.5" strokeLinecap="round"
        />
        <polyline
          points="0,78 25,72 50,74 75,58 100,62 125,50 150,55 175,44 200,48 220,40"
          fill="none" stroke="#ff9b3e" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="1 6"
        />
        {[0, 20, 40, 60, 80].map((y) => (
          <line key={y} x1="0" x2="220" y1={85 - y} y2={85 - y} stroke="#eef2f8" strokeWidth="1" />
        ))}
      </svg>
      <div className="mt-1 flex gap-3 text-[9.5px] text-muted">
        <span className="flex items-center gap-1"><span className="size-2 rounded-full bg-blue-bright" /> Sample A</span>
        <span className="flex items-center gap-1"><span className="size-2 rounded-full bg-orange" /> Sample B</span>
      </div>
    </div>
  );
}

function MatrixCard() {
  const rows = [
    { label: "Price", vals: [1, 0, 0] },
    { label: "Turnaround", vals: [0, 1, 0] },
    { label: "Platform", vals: [0, 0, 1] },
    { label: "Exclusions", vals: [1, 0, 1] },
  ];
  return (
    <div className="rounded-2xl bg-surface p-5 shadow-xl shadow-navy/30">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted">Offer comparison</p>
      <div className="mt-3 grid grid-cols-4 gap-y-2.5 text-[10px] text-body">
        <span />
        {["A", "B", "C"].map((h) => (
          <span key={h} className="text-center font-semibold text-ink">{h}</span>
        ))}
        {rows.map((r) => (
          <Fragment key={r.label}>
            <span className="font-medium">{r.label}</span>
            {r.vals.map((v, i) => (
              <span key={i} className="flex justify-center">
                <CircleDot className={`size-3 ${v ? "text-blue-bright" : "text-line-strong"}`} />
              </span>
            ))}
          </Fragment>
        ))}
      </div>
    </div>
  );
}

function DetailsCard() {
  const rows = [
    { icon: Dna, label: "Organism", val: "Triticum aestivum" },
    { icon: FileText, label: "Samples", val: "48 × leaf tissue" },
    { icon: Microscope, label: "Output", val: "VCF + report" },
  ];
  return (
    <div className="rounded-2xl bg-surface p-5 shadow-xl shadow-navy/30">
      <div className="rounded-lg bg-navy px-3 py-1.5 text-center text-[10px] font-semibold uppercase tracking-wider text-white">
        Project details
      </div>
      <div className="mt-3 space-y-2">
        {rows.map((r) => (
          <div key={r.label} className="flex items-center gap-2.5 rounded-lg border border-line px-2.5 py-2">
            <r.icon className="size-3.5 text-blue" />
            <span className="flex-1 text-[10.5px] text-muted">{r.label}</span>
            <span className="text-[10.5px] font-medium text-ink">{r.val}</span>
          </div>
        ))}
      </div>
      <div className="mt-2.5 rounded-lg bg-paper-2 px-2.5 py-2 text-[9.5px] text-muted">
        Attachments · 2 files (≤25MB, no raw reads)
      </div>
    </div>
  );
}

function LabCard() {
  return (
    <div className="rounded-2xl bg-surface p-5 shadow-xl shadow-navy/30">
      <div className="flex items-center gap-2.5">
        <span className="grid size-9 place-items-center rounded-lg bg-navy text-white">
          <Building2 className="size-4.5" />
        </span>
        <div>
          <p className="text-[12px] font-semibold text-ink">Genomics Facility — LUMS</p>
          <p className="flex items-center gap-1 text-[9.5px] text-blue">
            <ShieldCheck className="size-3" /> Verified · non-gov badge
          </p>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {["NovaSeq X", "ONT PromethION", "HPC"].map((t) => (
          <span key={t} className="rounded-full border border-line px-2 py-0.5 text-[9px] font-medium text-body">{t}</span>
        ))}
      </div>
    </div>
  );
}

function DnaCard() {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#2a1a4e] to-[#120a26] p-4 shadow-xl shadow-navy/30">
      <Dna className="absolute -right-3 -top-3 size-24 text-white/10" strokeWidth={1} />
      <p className="text-[11px] font-semibold text-white">Sindh Genome Surveillance</p>
      <p className="mt-1 text-[9.5px] text-white/50">Whole-genome · 240 isolates</p>
      <div className="mt-3 h-px w-3/4 bg-gradient-to-r from-mint via-yellow to-transparent" />
    </div>
  );
}

function StatusCard() {
  const steps = [
    { l: "Sample received", done: true },
    { l: "Work in progress", done: true },
    { l: "Results available", done: false },
  ];
  return (
    <div className="rounded-2xl bg-surface p-5 shadow-xl shadow-navy/30">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted">Project status</p>
      <div className="mt-3 space-y-2">
        {steps.map((s) => (
          <div key={s.l} className="flex items-center gap-2 text-[11px]">
            {s.done ? <CircleCheck className="size-3.5 text-blue" /> : <span className="size-3.5 rounded-full border-2 border-line-strong" />}
            <span className={s.done ? "font-medium text-ink" : "text-muted"}>{s.l}</span>
          </div>
        ))}
      </div>
      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-paper-2">
        <div className="h-full w-2/3 rounded-full bg-gradient-to-r from-blue-bright to-mint" />
      </div>
    </div>
  );
}

function ProductCard() {
  return (
    <div className="rounded-2xl bg-surface p-5 shadow-xl shadow-navy/30">
      <div className="flex items-center gap-2.5">
        <span className="grid size-9 place-items-center rounded-lg bg-(--st-amber-bg) text-(--st-amber-fg)">
          <Package className="size-4.5" />
        </span>
        <div>
          <p className="text-[12px] font-semibold text-ink">RNA Extraction Kit</p>
          <p className="text-[9.5px] text-muted">Indigenous supplier · Lahore</p>
        </div>
      </div>
      <div className="mt-3 flex items-center justify-between">
        <span className="font-mono text-[13px] font-medium text-ink">PKR 24,800</span>
        <span className="rounded-full bg-navy px-2.5 py-1 text-[9px] font-semibold text-white">Enquire</span>
      </div>
    </div>
  );
}

function PipelineCard() {
  return (
    <div className="rounded-2xl bg-surface p-5 shadow-xl shadow-navy/30">
      <div className="flex items-center gap-2.5">
        <span className="grid size-9 place-items-center rounded-lg bg-(--st-green-bg) text-(--st-green-fg)">
          <FlaskConical className="size-4.5" />
        </span>
        <div>
          <p className="text-[12px] font-semibold text-ink">Bioinformatics Pipeline</p>
          <p className="text-[9.5px] text-muted">De novo assembly · 32-node HPC</p>
        </div>
      </div>
      <div className="mt-3 flex items-center gap-1.5 text-[9px] font-medium text-muted">
        {["QC", "Trim", "Assemble", "Annotate"].map((s, i) => (
          <span key={s} className="flex items-center gap-1.5">
            <span className={`rounded-full px-2 py-0.5 ${i < 2 ? "bg-navy text-white" : "border border-line"}`}>{s}</span>
            {i < 3 && <span className="text-line-strong">→</span>}
          </span>
        ))}
      </div>
    </div>
  );
}

/* ---------- scrolling column ---------- */

function Column({ cards, duration, reverse }: { cards: React.ReactNode[]; duration: number; reverse?: boolean }) {
  return (
    <div className="relative h-full overflow-hidden">
      <div
        className={reverse ? "col-scroll-rev flex flex-col gap-4" : "col-scroll flex flex-col gap-4"}
        style={{ animationDuration: `${duration}s` }}
      >
        {[...cards, ...cards].map((c, i) => (
          <div key={i} className="shrink-0">{c}</div>
        ))}
      </div>
    </div>
  );
}

export function HeroCollage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 1, ease: [0.22, 1, 0.36, 1], delay: 0.35 }}
      className="collage-mask relative hidden h-[560px] md:block lg:h-[620px]"
    >
      <div className="grid h-full grid-cols-2 gap-5">
        <Column duration={38} cards={[<QuoteCard key="q" />, <MatrixCard key="m" />, <DnaCard key="d" />, <StatusCard key="s" />]} />
        <Column duration={46} cards={[<DetailsCard key="d" />, <ChartCard key="c" />, <ProductCard key="p" />, <LabCard key="l" />, <PipelineCard key="p" />]} />
      </div>
    </motion.div>
  );
}
