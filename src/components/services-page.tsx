"use client";

import Link from "next/link";
import { motion } from "motion/react";
import {
  ArrowRight, Dna, FlaskConical, TestTubes,
  Activity, ShieldPlus, Atom, CircleCheck, BadgeCheck,
  FileSearch, GitCompareArrows, PackageCheck, BarChart3,
  BookOpen, Award, Users, Newspaper, Radar,
  CircleDot, Map, Ruler, Target, Archive,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { FaqList } from "@/components/faq-item";
import { Reveal, Stagger, fadeUp } from "@/components/motion-primitives";
import { Navbar } from "@/components/navbar";
import { AnnouncementBar } from "@/components/announcement-bar";
import { Footer } from "@/components/footer";
import { CtaForm } from "@/components/sections/cta-form";

const CHIPS = [
  { label: "Transcriptomics", id: "transcriptomics" },
  { label: "RNA-Seq", id: "rna-sequencing" },
  { label: "Single Cell", id: "single-cell-sequencing" },
  { label: "Spatial", id: "spatial-transcriptomics" },
  { label: "Immune Profiling", id: "immune-profiling" },
  { label: "Premade Library", id: "premade-library-sequencing" },
  { label: "Long Read", id: "long-read" },
  { label: "Genomics", id: "genomics" },
  { label: "Oncology Panels", id: "oncology-panels" },
  { label: "Proteomics", id: "proteomics" },
  { label: "Epigenomics", id: "epigenomics" },
];

const CATEGORIES = [
  {
    icon: Activity, title: "Transcriptomics", id: "transcriptomics",
    desc: "Gene expression measured at every resolution — bulk, single-cell, spatial and full-length long-read.",
    subs: ["Bulk RNA-Seq", "Single-Cell RNA-Seq", "Spatial Transcriptomics", "PacBio Iso-Seq"],
  },
  {
    icon: FlaskConical, title: "RNA Sequencing", id: "rna-sequencing",
    desc: "Stranded, total and ultra-low-input RNA-Seq tuned to sample quality — down to 10 pg or degraded FFPE.",
    subs: ["Stranded mRNA-Seq", "Total RNA-Seq", "Low Input & FFPE RNA-Seq", "Blood RNA-Seq (globin depletion)", "Small RNA & 16S Microbiome", "Expedited RNA-Seq"],
  },
  {
    icon: CircleDot, title: "Single Cell Sequencing", id: "single-cell-sequencing",
    desc: "Droplet, microwell, plate and long-read capture for expression, multiome, immune and CITE-Seq work.",
    subs: ["10x Genomics (GEX, Multiome, FLEX)", "BD Rhapsody", "Takara SMART-Seq Plates", "PacBio Kinnex Single-Cell"],
  },
  {
    icon: Map, title: "Spatial Transcriptomics", id: "spatial-transcriptomics",
    desc: "Whole-transcriptome through subcellular mapping with tissue morphology preserved.",
    subs: ["10x Visium", "10x Xenium", "Illumina StrataMap"],
  },
  {
    icon: ShieldPlus, title: "Immune Profiling", id: "immune-profiling",
    desc: "Bulk and single-cell repertoire analysis — full-length, CDR3 and paired VDJ chains.",
    subs: ["Full-Length TCR & BCR (SMARTer 5' RACE)", "CDR3 Repertoire (DriverMap)", "FFPE TCR & BCR", "Single-Cell VDJ (10x 5')"],
  },
  {
    icon: Archive, title: "Premade Library Sequencing", id: "premade-library-sequencing",
    desc: "Sequence-only runs on your own libraries — flowcell and lane options across Illumina and PacBio.",
    subs: ["NovaSeq 6000 SP", "NovaSeq X+ (1.5B–25B)", "MiSeq i100 (5M–100M)", "PacBio Revio SMRT Cells"],
  },
  {
    icon: Ruler, title: "Long Read Services", id: "long-read",
    desc: "PacBio HiFi for contiguous assemblies, structural variants, isoforms and native methylation.",
    subs: ["De Novo Assembly & Annotation", "Comprehensive Variant Detection", "Full-Length RNA (Iso-Seq)", "Native Methylation Profiling"],
  },
  {
    icon: Dna, title: "Genomics (WGS/WES)", id: "genomics",
    desc: "Short- and long-read DNA sequencing for germline cohorts, tumors and complex variants.",
    subs: ["Whole Genome (WGS)", "Whole Exome (WES)", "PacBio Long-Read Genomics", "Targeted Gene Panels"],
  },
  {
    icon: Target, title: "Oncology Panels", id: "oncology-panels",
    desc: "High-depth targeted profiling — including the 523-gene TSO 500 assay with MSI and TMB.",
    subs: ["TruSight Oncology 500", "ctDNA Liquid Biopsy", "Hotspot Panels (20–50 genes)", "WGS/WES & RNA-Seq Add-ons"],
  },
  {
    icon: TestTubes, title: "Proteomics", id: "proteomics",
    desc: "Affinity-based NGS proteomics measuring 1,000+ proteins from just 4 μL of plasma or serum.",
    subs: ["Olink Reveal", "Olink Explore", "Proteogenomic Integration"],
  },
  {
    icon: Atom, title: "Epigenomics", id: "epigenomics",
    desc: "Chromatin accessibility, 3D architecture, methylation and TF footprints at bulk or single-cell scale.",
    subs: ["Bulk & Single-Cell ATAC-Seq", "Single-Cell Multiome (ATAC + GEX)", "Hi-C Chromatin", "Methylome Profiling", "CUT&RUN & ChIP-Seq"],
  },
];

const PLATFORMS = ["Illumina", "PacBio", "10x Genomics", "BD Rhapsody", "Takara", "Olink", "Cellecta", "Epicypher", "Miltenyi Biotec", "Twist Bioscience"];

const ADVANTAGE = [
  { icon: GitCompareArrows, title: "True Multi-Omic Integration", desc: "Run genomic, transcriptomic, epigenomic and proteomic assays under a single RFQ — no batch drift from fragmented vendors." },
  { icon: Radar, title: "Capability-Matched Routing", desc: "Your RFQ goes only to facilities whose platforms, sample types and service categories actually fit the work." },
  { icon: BadgeCheck, title: "Verified Facilities Only", desc: "Credentials, equipment claims and track record checked against Syntax criteria before any provider can quote." },
  { icon: PackageCheck, title: "Broad Sample Compatibility", desc: "Validated workflows for FFPE blocks, long-term archived specimens and fresh material — including low-input down to picogram scale." },
];

const STEPS = [
  { icon: FileSearch, title: "Structured RFQ", desc: "Capture organism, sample count, requested output, analysis type, deadline and attachments in one guided form." },
  { icon: Radar, title: "Targeted Routing", desc: "The RFQ is routed to approved providers whose registered capabilities match your requirements." },
  { icon: GitCompareArrows, title: "Blind Quotations", desc: "Providers submit pricing, taxes, turnaround, platforms and exclusions — invisible to each other." },
  { icon: PackageCheck, title: "Offer & Samples", desc: "Compare side-by-side, select an offer, then track sample handoff through the status pipeline." },
  { icon: BarChart3, title: "Delivery & Report", desc: "Results land in your private project channel; raw genomic data stays at the lab or moves via secure links." },
];

const TIERS = [
  {
    name: "Standard Analysis", badge: null,
    best: "Best for teams running their own downstream analysis.",
    items: ["Standard pipelines per platform", "QC and data filtering", "Exploratory plots & summary tables", "VCF / counts deliverables"],
  },
  {
    name: "Advanced Analysis", badge: "Most popular",
    best: "Best for teams that want results interpreted for them.",
    items: ["Everything in Standard", "Integrated tools across platforms", "Version-controlled processing", "Biological interpretation & reporting"],
  },
  {
    name: "Specialized Analysis", badge: null,
    best: "Best for novel, custom, or multi-omic study designs.",
    items: ["Everything in Advanced", "Bespoke pipelines for novel designs", "Multi-omic integration across assays", "Dedicated bioinformatician hours"],
  },
];

const INCLUDED = ["FASTQ files", "Sequencer QC report", "Alignment files (BAM)", "Processed results tables", "Publication-ready figures", "Secure delivery — SFTP, AWS or Google Cloud"];

const RESOURCES = [
  { icon: BookOpen, title: "Whitepapers & Technical Guides", desc: "Application notes and technical guides to help plan your study.", cta: "Browse resources", href: "/resources/documents" },
  { icon: Award, title: "Certified Service Program", desc: "Industry-validated workflows for the platforms you rely on.", cta: "View certifications", href: "/resources/verification" },
  { icon: Users, title: "Refer a Colleague", desc: "Earn rewards when colleagues launch their first project on the Gateway.", cta: "Start referring", href: "/resources/referral" },
  { icon: Newspaper, title: "Research Publications", desc: "Peer-reviewed papers powered by network workflows.", cta: "Read publications", href: "/resources/publications" },
];

const FAQS = [
  {
    q: "How do I submit an RFQ on the Gateway?",
    a: "Register as a customer and use the structured RFQ builder — organism, sample count, requested output, analysis type, deadline and attachments (documents only, ≤25MB). The system routes it to approved providers matching your requirements.",
  },
  {
    q: "How does blind quoting actually work?",
    a: "Providers see the RFQ but never each other. Quotes — pricing, taxes, turnaround, platform, exclusions — are isolated at the database layer, so Provider A cannot access Provider B's bid under any condition, including via the API.",
  },
  {
    q: "What sample types and input thresholds are supported?",
    a: "Providers accept purified gDNA/RNA, fresh or frozen biofluids (serum, plasma, CSF), PBMCs, cell pellets and archived FFPE. Typical guidance: RIN >7 for bulk RNA, DV200 ≥20% for FFPE, 50–1000 ng for standard genomics — low-input workflows go down to ~10 ng.",
  },
  {
    q: "Where does my raw genomic data go?",
    a: "Nowhere near our servers. The Gateway stores metadata and documents only — no FASTQ, BAM or VCF. Raw data remains on lab premises or transfers via out-of-band secure links arranged in your private project channel.",
  },
  {
    q: "What are typical turnaround times?",
    a: "Premade library sequencing and basic bulk RNA-Seq commonly quote 1–2 weeks; single-cell, spatial and multi-modal projects average 3–5 weeks from sample QC sign-off. Each provider states TAT inside their blind quote, comparable side-by-side.",
  },
  {
    q: "Does the Gateway support clinical or diagnostic work?",
    a: "The marketplace is engineered for pre-clinical, translational and discovery research. Providers declare their own accreditations in verified profiles; Syntax's badge reflects platform verification criteria and is explicitly non-governmental — not a CLIA/CAP diagnostic certification.",
  },
];


export function ServicesPage() {
  return (
    <>
      <AnnouncementBar />
      <Navbar />
      <main className="flex-1">
        {/* hero */}
        <section className="relative overflow-hidden bg-gradient-to-b from-navy-2 via-navy to-navy pb-20 pt-[185px]">
          <div className="grid-lines on-dark absolute inset-0" />
          <div className="glow-orb left-[10%] top-[-200px] size-[500px] bg-blue-bright/15" />
          <div className="glow-orb right-[5%] bottom-[-150px] size-[350px] bg-mint/10" />
          <div className="container-x relative">
            <motion.span
              initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
              className="inline-block rounded-full border border-white/25 px-4 py-1.5 text-[10.5px] font-medium uppercase tracking-[0.14em] text-[#c5d2e1]"
            >
              Nationwide · verified provider network
            </motion.span>
            <motion.h1
              initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              className="h-display on-dark mt-6 max-w-2xl"
            >
              Marketplace <em className="grad-text">sequencing & analysis</em> services
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.16, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              className="mt-6 max-w-xl text-[16px] leading-relaxed text-[#c5d2e1]"
            >
              Fully customizable, end-to-end workflows executed by independent verified labs.
              Guided RFQ design, capability-matched routing and blind competing quotes —
              tailored to your samples and research goals.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.24, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              className="mt-8 flex flex-wrap items-center gap-5"
            >
              <span className="btn-wrap">
                <Link href="/biogateway" className="btn-white">Explore our services</Link>
              </span>
              <Link href="/contact" className="group inline-flex items-center gap-2.5 text-[14.5px] font-medium text-white/90 hover:text-white">
                Consult our team <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.34, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              className="mt-12 flex flex-wrap gap-2.5"
            >
              {CHIPS.map((c, i) => (
                <a key={c.id} href={`/services/${c.id}`} className={cn(
                  "rounded-full border px-4 py-2 text-[12.5px] font-medium transition-colors",
                  i === 0 ? "border-yellow text-yellow" : "border-white/25 text-white/75 hover:border-white/50 hover:text-white"
                )}>
                  {c.label}
                </a>
              ))}
            </motion.div>
          </div>
        </section>

        {/* capabilities — 6 category cards */}
        <section id="capabilities" className="bg-paper py-24">
          <div className="container-x">
            <Reveal>
              <p className="eyebrow">Our services</p>
              <h2 className="h-section mt-4 max-w-2xl">
                Explore the <em className="grad-text">Gateway&apos;s</em> capabilities
              </h2>
              <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-body">
                Compare sample requirements, library chemistries, sequencing platforms and analysis
                deliverables across verified providers — submit one RFQ, receive competing quotes.
              </p>
            </Reveal>
            <Stagger className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {CATEGORIES.map((c) => (
                <motion.div key={c.id} id={c.id} variants={fadeUp} className="card card-hover flex scroll-mt-28 flex-col p-6">
                  <span className="grid size-11 place-items-center rounded-xl bg-navy/[0.05] text-navy-2">
                    <c.icon className="size-5.5" strokeWidth={1.7} />
                  </span>
                  <h3 className="mt-4 font-display text-[18px] font-medium tracking-tight text-ink">{c.title}</h3>
                  <p className="mt-2 text-[13px] leading-relaxed text-body">{c.desc}</p>
                  <ul className="mt-4 flex-1 space-y-1.5">
                    {c.subs.map((s) => (
                      <li key={s} className="flex items-center gap-2 text-[13px] text-body">
                        <span className="size-1.5 rounded-full bg-blue-bright" /> {s}
                      </li>
                    ))}
                  </ul>
                  <Link href={`/services/${c.id}`} className="mt-5 inline-flex items-center gap-1.5 text-[13px] font-semibold text-blue hover:text-navy-2">
                    Explore all {c.title.toLowerCase()} <ArrowRight className="size-3.5" />
                  </Link>
                </motion.div>
              ))}
            </Stagger>
            <Reveal delay={2} className="mt-8">
              <Link href="/services#tiers" className="group flex items-center justify-between rounded-2xl border border-dashed border-line-strong bg-surface p-5 transition-colors hover:border-navy-3">
                <span className="text-[14px] text-body">
                  Looking for <strong className="text-ink">multiomic solutions</strong>? Combine genomic, transcriptomic,
                  immune and epigenetic assays from a single RFQ.
                </span>
                <ArrowRight className="size-5 shrink-0 text-navy-2 transition-transform group-hover:translate-x-1" />
              </Link>
            </Reveal>
          </div>
        </section>

        {/* partners marquee */}
        <section className="border-y border-line bg-surface py-10">
          <p className="text-center text-[11.5px] font-medium uppercase tracking-[0.2em] text-muted">
            Validated platforms & instrument partners
          </p>
          <div className="relative mt-6 overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_12%,black_88%,transparent)]">
            <div className="flex w-max animate-marquee items-center gap-14 pr-14">
              {[...PLATFORMS, ...PLATFORMS].map((p, i) => (
                <span key={i} className="whitespace-nowrap font-display text-[16px] font-medium tracking-tight text-muted transition-colors hover:text-navy">
                  {p}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* advantage */}
        <section className="bg-paper py-24">
          <div className="container-x">
            <Reveal>
              <p className="eyebrow">The Gateway advantage</p>
              <h2 className="h-section mt-4 max-w-2xl">Marketplace infrastructure built for <em className="grad-text">confidence</em></h2>
            </Reveal>
            <Stagger className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {ADVANTAGE.map((a) => (
                <motion.div key={a.title} variants={fadeUp} className="card card-hover p-6">
                  <span className="grid size-10 place-items-center rounded-xl bg-navy text-yellow">
                    <a.icon className="size-5" strokeWidth={1.8} />
                  </span>
                  <h3 className="mt-4 text-[15px] font-semibold text-ink">{a.title}</h3>
                  <p className="mt-2.5 text-[13px] leading-relaxed text-body">{a.desc}</p>
                </motion.div>
              ))}
            </Stagger>
          </div>
        </section>

        {/* workflow — 5 steps */}
        <section className="border-y border-line bg-paper-2/50 py-24">
          <div className="container-x">
            <Reveal>
              <p className="eyebrow">Our RFQ workflows</p>
              <h2 className="h-section mt-4 max-w-2xl">A seamless end-to-end experience</h2>
              <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-body">
                Every project follows a standardized, tracking-validated flow designed to preserve
                sample integrity and guarantee transparent delivery.
              </p>
            </Reveal>
            <div className="relative mt-14">
              <div className="absolute left-[22px] top-0 h-full w-px bg-line lg:left-0 lg:top-[22px] lg:h-px lg:w-full" />
              <Stagger className="grid gap-8 lg:grid-cols-5">
                {STEPS.map((s, i) => (
                  <motion.div key={s.title} variants={fadeUp} className="relative pl-14 lg:pl-0 lg:pt-14">
                    <span className="absolute left-0 top-0 grid size-11 place-items-center rounded-full border-2 border-white bg-navy text-white shadow-lg lg:left-0">
                      <s.icon className="size-5" strokeWidth={1.8} />
                    </span>
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-blue">Step {i + 1}</p>
                    <h3 className="mt-1.5 font-display text-[16px] font-medium text-ink">{s.title}</h3>
                    <p className="mt-2 text-[12.5px] leading-relaxed text-body">{s.desc}</p>
                  </motion.div>
                ))}
              </Stagger>
            </div>
          </div>
        </section>

        {/* analysis tiers */}
        <section id="tiers" className="bg-paper py-24">
          <div className="container-x">
            <Reveal>
              <p className="eyebrow">Bioinformatics</p>
              <h2 className="h-section mt-4 max-w-2xl">Choose your level of analysis</h2>
              <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-body">
                Every service can pair with one of three analysis packages — specify the tier in your
                RFQ and providers quote accordingly.
              </p>
            </Reveal>
            <Stagger className="mt-12 grid gap-5 lg:grid-cols-3">
              {TIERS.map((t) => (
                <motion.div
                  key={t.name}
                  variants={fadeUp}
                  className={cn("card relative flex flex-col p-7", t.badge && "border-2 !border-navy shadow-xl shadow-navy/10")}
                >
                  {t.badge && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-navy px-3.5 py-1 text-[10.5px] font-semibold uppercase tracking-wider text-yellow">
                      {t.badge}
                    </span>
                  )}
                  <h3 className="font-display text-[19px] font-medium text-ink">{t.name}</h3>
                  <p className="mt-2 text-[12.5px] italic leading-relaxed text-muted">{t.best}</p>
                  <ul className="mt-5 flex-1 space-y-2.5">
                    {t.items.map((it) => (
                      <li key={it} className="flex items-start gap-2.5 text-[13px] text-body">
                        <CircleCheck className="mt-0.5 size-4 shrink-0 text-blue" /> {it}
                      </li>
                    ))}
                  </ul>
                  <span className="btn-wrap mt-6">
                    <Link href="/biogateway" className={cn("w-full justify-center", t.badge ? "btn-primary" : "btn-secondary")}>
                      Request this tier
                    </Link>
                  </span>
                </motion.div>
              ))}
            </Stagger>
            <Reveal delay={2} className="mt-10">
              <div className="card p-6">
                <p className="text-[12px] font-semibold uppercase tracking-wider text-muted">Included with every tier</p>
                <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {INCLUDED.map((i) => (
                    <p key={i} className="flex items-center gap-2 text-[13px] text-body">
                      <CircleCheck className="size-4 shrink-0 text-blue" /> {i}
                    </p>
                  ))}
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        {/* resources */}
        <section className="border-t border-line bg-surface py-24">
          <div className="container-x">
            <Reveal>
              <p className="eyebrow">Resources & programs</p>
              <h2 className="h-section mt-4">Learn the <em className="grad-text">Gateway</em></h2>
            </Reveal>
            <Stagger className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {RESOURCES.map((r) => (
                <motion.div key={r.title} variants={fadeUp}>
                  <Link href={r.href} className="card card-hover group flex h-full flex-col p-6">
                    <r.icon className="size-6 text-navy-2" strokeWidth={1.7} />
                    <h3 className="mt-4 text-[15px] font-semibold text-ink">{r.title}</h3>
                    <p className="mt-2 flex-1 text-[12.5px] leading-relaxed text-body">{r.desc}</p>
                    <span className="mt-4 inline-flex items-center gap-1.5 text-[13px] font-semibold text-blue group-hover:text-navy-2">
                      {r.cta} <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" />
                    </span>
                  </Link>
                </motion.div>
              ))}
            </Stagger>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="scroll-mt-28 border-t border-line bg-paper-2/50 py-24">
          <div className="container-x grid gap-12 lg:grid-cols-[0.9fr_1.4fr]">
            <Reveal>
              <p className="eyebrow">FAQs</p>
              <h2 className="h-section mt-4">Everything you need to plan your project</h2>
              <p className="mt-4 text-[14.5px] leading-relaxed text-body">
                Answers on RFQs, blind quoting, samples, turnaround and data handling.
                Still unsure? <Link href="/contact" className="font-medium text-blue hover:text-navy-2">Talk to our team</Link>.
              </p>
            </Reveal>
            <Reveal delay={1} className="space-y-3.5">
              <FaqList items={FAQS} />
            </Reveal>
          </div>
        </section>

        <CtaForm />
      </main>
      <Footer />
    </>
  );
}
