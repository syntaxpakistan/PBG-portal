"use client";

import Link from "next/link";
import {
  ArrowRight, Award, BadgeCheck, Bug, CircleCheck, Database, Dna,
  FlaskConical, GraduationCap, Handshake, Lock,
  Mail, MapPin, Microscope, Phone, ShieldCheck, Sprout, TestTubes, Timer,
  Wheat, Workflow,
} from "lucide-react";
import { Reveal, Stagger } from "@/components/motion-primitives";

/* ---------------------------------- data --------------------------------- */

const PARTNERS = [
  {
    id: "cas-ngs",
    num: "01",
    mark: "CAS-NGS",
    name: "CAS-NGS — Center for Advanced Studies in Agriculture and Food Security",
    category: "Sequencing · Genomics · Training",
    blurb:
      "In-house genomics platform at the University of Agriculture Faisalabad — subsidized WGS, RNA-seq, metagenomics and targeted sequencing.",
  },
  {
    id: "genexa",
    num: "02",
    mark: "Genexa",
    name: "Genexa Analytics",
    category: "Bioinformatics · Analysis services",
    blurb:
      "Specialist bioinformatics provider — genome assembly, RNA-seq, variant calling, metagenomics, GWAS and phylogenetics on demand.",
  },
];

const WHY_INHOUSE = [
  { t: "Reduce delays", d: "Faster sample processing and project turnaround within Pakistan." },
  { t: "Lower costs", d: "Affordable research rates with reduced dependence on international outsourcing." },
  { t: "Protect resources", d: "Local biological material, germplasm and pathogen data remain better protected." },
  { t: "Retain data ownership", d: "Sequencing data and analysis outputs stay with Pakistani scientists and institutions." },
  { t: "Build expertise", d: "Hands-on training develops local sequencing and bioinformatics capacity." },
];

const MILESTONES = [
  {
    icon: Wheat,
    title: "Cotton genome",
    points: [
      "First locally adapted/developed cotton variety sequenced and assembled",
      "Gap-free, high-quality genome assembly",
      "Foundation for crop improvement and functional genomics",
    ],
  },
  {
    icon: Sprout,
    title: "Hemp genome",
    points: [
      "Local hemp genomes successfully sequenced",
      "Supports comparative genomics, breeding and trait discovery",
      "Demonstrates capacity for non-model plant genomes",
    ],
  },
  {
    icon: Bug,
    title: "Microbial genomes",
    points: [
      "Microbial genomes successfully sequenced and assembled",
      "High-quality, no-gap genome assemblies",
      "Useful for pathogen surveillance, diagnostics and biodiversity",
    ],
  },
];

const WGS_ROWS = [
  { cat: "Microbial genomes", size: "≤ 10 Mb · 30–50× coverage", rate: "PKR 25,000", inc: "Genome assembly, annotation, QC report and phylogeny — free of cost" },
  { cat: "Small genomes", size: "≤ 1.0 Gb", rate: "PKR 50,000 – 100,000", inc: "Sequencing only · advanced bioinformatics optional (+PKR 20,000–50,000)" },
  { cat: "Medium genomes", size: "≤ 2.0 Gb", rate: "PKR 100,000 – 200,000", inc: "Sequencing only · advanced bioinformatics optional (+PKR 50,000–100,000)" },
  { cat: "Large genomes", size: "> 2.0 Gb", rate: "Quote-based", inc: "Priced by genome size, coverage and project scope" },
];

const META_ROWS = [
  { pkg: "Whole-genome shotgun", out: "3 Gb / sample", rate: "PKR 75,000 / sample", inc: "Sequencing output + taxonomic profiling & abundance · downstream analysis on demand (+PKR 10,000–30,000)" },
  { pkg: "Amplicon metagenomics", out: "> 25 samples", rate: "PKR 25,000 / sample", inc: "16S rRNA / ITS / 18S / COI · diversity & taxonomic analysis on demand (+PKR 5,000–15,000)" },
];

const TARGETED_TYPES = [
  { t: "Plant clone / diversity", d: "Intragenic detection · SNP identification · haplotyping" },
  { t: "Targeted gene sequencing", d: "Resistance genes · virulence genes · specific mutations" },
  { t: "Genome-wide variant", d: "SNP discovery · SV identification · genomic variation" },
  { t: "Custom solution projects", d: "ITS / 16S / COI · exome, GBS · CRISPR studies" },
];

const WORKFLOW = ["Consultation", "Sample QC", "Library preparation", "Sequencing", "Basecalling / QC", "Bioinformatics", "Report discussion"];

const AUDIENCES = [
  "Plant breeders", "Plant pathologists", "Microbiologists", "Biotechnology researchers",
  "Environmental scientists", "Biodiversity researchers", "Medical & public health researchers",
  "Industry R&D teams", "MS, MPhil and PhD scholars",
];

const TRAINING = [
  { t: "Experimental design", d: "Sample planning, sequencing strategy and project scope." },
  { t: "Quality control", d: "DNA/RNA quality, Qubit quantification and pre-library QC." },
  { t: "Sequencing workflows", d: "Library preparation, sequencing concepts and data generation." },
  { t: "Bioinformatics", d: "FASTQ QC, assembly, annotation, expression analysis and visualization." },
  { t: "Data interpretation", d: "Publication-ready outputs and biological interpretation." },
];

const GENEXA_SERVICES = [
  { icon: Dna, t: "Genome assembly", d: "High-quality de novo and reference-based genome assembly.", rate: "PKR 20,000 – 100,000" },
  { icon: FlaskConical, t: "RNA-Seq analysis", d: "Differential expression, transcript assembly and functional interpretation.", rate: "PKR 20,000 – 75,000" },
  { icon: Microscope, t: "Variant calling", d: "SNP, INDEL and structural variant detection with high accuracy.", rate: "PKR 5,000 – 50,000" },
  { icon: Bug, t: "Metagenomic analysis", d: "Taxonomic profiling, diversity analysis and functional characterization.", rate: "PKR 5,000 – 30,000" },
  { icon: Database, t: "GWAS analysis", d: "Genome-wide association studies for trait discovery and population genetics.", rate: "PKR 5,000 – 25,000" },
  { icon: Workflow, t: "Phylogenetic analysis", d: "Evolutionary relationships and phylogenetic tree construction.", rate: "PKR 5,000 – 15,000" },
  { icon: TestTubes, t: "Customized analysis", d: "Tailored analysis workflows to meet your specific research needs.", rate: "Quote on request" },
];

const GENEXA_WHY = [
  { icon: GraduationCap, t: "Expert bioinformatics team" },
  { icon: Timer, t: "Fast turnaround time" },
  { icon: Lock, t: "Confidential & secure data handling" },
  { icon: Award, t: "Publication-ready results" },
  { icon: BadgeCheck, t: "Competitive pricing" },
];

/* --------------------------------- helpers -------------------------------- */

function RateTable({ head, rows }: { head: string[]; rows: string[][] }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-line">
      <table className="w-full min-w-[560px] text-left text-[13px]">
        <thead>
          <tr className="bg-paper-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted">
            {head.map((h, i) => (
              <th key={h} className={`px-4 py-3 ${i === head.length - 1 ? "" : ""}`}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {rows.map((r, i) => (
            <tr key={i} className="bg-surface">
              {r.map((c, j) => (
                <td key={j} className={`px-4 py-3 align-top ${j === 0 ? "font-semibold text-ink" : j === r.length - 2 ? "font-semibold text-navy-2 whitespace-nowrap" : "text-body"}`}>
                  {c}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-line bg-surface px-3 py-1.5 text-[12px] font-medium text-body">
      {children}
    </span>
  );
}

/* ---------------------------------- page ---------------------------------- */

export function PartnersPage() {
  return (
    <>
      {/* hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-navy-2 via-navy to-navy pb-20 pt-[185px]">
        <div className="grid-lines on-dark absolute inset-0" />
        <div className="glow-orb left-[10%] top-[-200px] size-[500px] bg-blue-bright/15" />
        <div className="glow-orb right-[5%] bottom-[-150px] size-[350px] bg-mint/10" />
        <div className="container-x relative">
          <Reveal>
            <p className="mt-5 inline-block rounded-full border border-white/25 px-4 py-1.5 text-[10.5px] font-medium uppercase tracking-[0.14em] text-[#c5d2e1]">
              Partners
            </p>
            <h1 className="h-display on-dark mt-5 max-w-3xl">Meet our partners</h1>
            <p className="mt-6 max-w-2xl text-[16px] leading-relaxed text-[#c5d2e1]">
              The Gateway is operated by Syntax of Life — and powered by a growing network of
              independent partners: university genomics centers, bioinformatics teams and biotech
              suppliers who deliver services through the platform on their own terms.
            </p>
          </Reveal>
          <Reveal delay={1} className="mt-9 flex flex-wrap gap-3">
            <span className="btn-wrap">
              <Link href="/biogateway" className="btn-white">Become a partner</Link>
            </span>
            <Link href="/marketplace" className="btn-ghost">Browse services</Link>
          </Reveal>
        </div>
      </section>

      {/* partners index — directory of all partners */}
      <section className="border-b border-line bg-surface py-14">
        <div className="container-x">
          <Reveal>
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="eyebrow">Partner directory</p>
                <h2 className="mt-2 font-display text-[24px] font-semibold tracking-tight text-ink">
                  {PARTNERS.length} verified partners — and growing
                </h2>
              </div>
              <Link href="/biogateway" className="btn-outline !py-2 text-[13px]">Join the directory</Link>
            </div>
          </Reveal>
          <Stagger className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {PARTNERS.map((p) => (
              <a key={p.id} href={`#${p.id}`} className="card group flex flex-col p-6 transition-shadow hover:shadow-lg">
                <div className="flex items-start justify-between gap-4">
                  <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-navy px-1 text-center">
                    <span className="font-display text-[12px] font-bold leading-tight text-white">{p.mark}</span>
                  </span>
                  <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">Partner {p.num}</span>
                </div>
                <p className="mt-4 text-[16px] font-semibold text-ink">{p.name}</p>
                <p className="mt-0.5 text-[12.5px] font-medium text-blue">{p.category}</p>
                <p className="mt-2 flex-1 text-[12.5px] leading-relaxed text-muted">{p.blurb}</p>
                <span className="mt-4 inline-flex items-center gap-1.5 text-[13px] font-semibold text-navy-2 group-hover:text-blue">
                  View partner profile <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
                </span>
              </a>
            ))}
            {/* placeholder for future partners */}
            <Link href="/biogateway" className="group flex min-h-44 flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-line p-6 text-center transition-colors hover:border-blue">
              <span className="grid size-11 place-items-center rounded-full bg-(--st-mint-bg) text-(--st-mint-fg)">
                <Handshake className="size-5" />
              </span>
              <p className="text-[14px] font-semibold text-ink">Your organization here</p>
              <p className="text-[12px] text-muted">Apply to become a verified partner</p>
            </Link>
          </Stagger>
        </div>
      </section>

      {/* ------------------------------ CAS-NGS ------------------------------ */}
      <section id="cas-ngs" className="scroll-mt-28 bg-paper py-16 sm:py-20">
        <div className="container-x">
          <Reveal>
            <div className="flex flex-wrap items-start gap-6">
              <span className="grid size-20 shrink-0 place-items-center rounded-2xl bg-navy px-2 text-center sm:size-24">
                <span className="font-display text-[15px] font-bold leading-tight text-white sm:text-[17px]">CAS-NGS</span>
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-3">
                  <h2 className="font-display text-[30px] font-semibold tracking-tight text-ink sm:text-[36px]">CAS-NGS</h2>
                  <span className="rounded-full bg-yellow px-3 py-1 text-[10.5px] font-bold uppercase tracking-[0.1em] text-navy">
                    Limited-time subsidized rates
                  </span>
                </div>
                <p className="mt-1.5 text-[14px] font-medium text-body">
                  Center for Advanced Studies in Agriculture and Food Security (CAS-AFS)
                </p>
                <p className="text-[14px] text-muted">University of Agriculture Faisalabad</p>
                <p className="mt-4 max-w-3xl text-[14.5px] leading-relaxed text-body">
                  An in-house genomics platform built to provide accessible, reliable and locally available
                  sequencing and bioinformatics for Pakistani scientists — bridging the national gap in
                  end-to-end genomics from sample preparation to interpretation, training and capacity building.
                </p>
              </div>
            </div>
          </Reveal>

          {/* cover + who we are */}
          <div className="mt-10 grid items-start gap-8 lg:grid-cols-[1fr_1.15fr]">
            <Reveal>
              <img
                src="/partners/cas-ngs-cover.jpg"
                alt="CAS-NGS — subsidized sequencing services"
                className="w-full rounded-2xl border border-line object-cover shadow-lg"
              />
            </Reveal>
            <div>
              <p className="eyebrow">Why in-house sequencing matters</p>
              <p className="mt-2 text-[15px] font-medium text-ink">A national scientific capability, not just a service.</p>
              <Stagger className="mt-6 space-y-4">
                {WHY_INHOUSE.map((w, i) => (
                  <div key={w.t} className="flex gap-4">
                    <span className="grid size-8 shrink-0 place-items-center rounded-full bg-navy text-[13px] font-bold text-white">
                      {i + 1}
                    </span>
                    <div>
                      <p className="text-[14px] font-semibold text-ink">{w.t}</p>
                      <p className="mt-0.5 text-[13px] leading-relaxed text-muted">{w.d}</p>
                    </div>
                  </div>
                ))}
              </Stagger>
              <p className="mt-6 rounded-xl bg-navy px-5 py-3.5 text-[13.5px] font-medium text-white">
                Our Samples. Our Data. Our Discovery.
              </p>
            </div>
          </div>

          {/* success stories */}
          <div className="mt-14">
            <Reveal>
              <p className="eyebrow">Success stories</p>
              <h3 className="mt-2 font-display text-[24px] font-semibold tracking-tight text-ink">
                Proven genomics milestones from local capacity
              </h3>
            </Reveal>
            <Stagger className="mt-7 grid gap-5 md:grid-cols-3">
              {MILESTONES.map((m) => (
                <div key={m.title} className="card p-6">
                  <span className="grid size-11 place-items-center rounded-xl bg-(--st-mint-bg) text-(--st-mint-fg)">
                    <m.icon className="size-5.5" strokeWidth={1.8} />
                  </span>
                  <p className="mt-4 text-[15px] font-semibold text-ink">{m.title}</p>
                  <ul className="mt-3 space-y-2">
                    {m.points.map((pt) => (
                      <li key={pt} className="flex gap-2 text-[12.5px] leading-relaxed text-muted">
                        <CircleCheck className="mt-0.5 size-3.5 shrink-0 text-mint" /> {pt}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </Stagger>
          </div>

          {/* rate cards */}
          <div className="mt-14">
            <Reveal>
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <p className="eyebrow">Subsidized rate cards</p>
                  <h3 className="mt-2 font-display text-[24px] font-semibold tracking-tight text-ink">
                    Introductory commercial rates
                  </h3>
                </div>
                <Pill>Free DNA extraction till 30 Sep 2026</Pill>
              </div>
            </Reveal>

            <div className="mt-7 space-y-8">
              <Reveal>
                <div className="card p-6">
                  <div className="flex items-center gap-3">
                    <Dna className="size-5 text-blue" />
                    <p className="text-[15px] font-semibold text-ink">Whole Genome Sequencing (WGS)</p>
                  </div>
                  <div className="mt-4">
                    <RateTable
                      head={["Genome category", "Size / coverage", "Subsidized rate (PKR)", "Includes"]}
                      rows={WGS_ROWS.map((r) => [r.cat, r.size, r.rate, r.inc])}
                    />
                  </div>
                </div>
              </Reveal>

              <div className="grid gap-8 lg:grid-cols-2">
                <Reveal>
                  <div className="card h-full p-6">
                    <div className="flex items-center gap-3">
                      <FlaskConical className="size-5 text-blue" />
                      <p className="text-[15px] font-semibold text-ink">Transcriptome sequencing (RNA-seq)</p>
                    </div>
                    <div className="mt-4">
                      <RateTable
                        head={["Service", "Rate", "Notes"]}
                        rows={[
                          ["RNA-seq (>12 samples)", "PKR 60,000 / sample", "High-quality total RNA supplied by client"],
                          ["Downstream analysis", "+PKR 20,000 – 75,000", "RNA-seq, differential gene expression & functional analysis"],
                        ]}
                      />
                    </div>
                    <p className="mt-4 text-[12px] leading-relaxed text-muted">
                      Includes bioinformatics analysis, rRNA masking/subtraction, adapter removal, de-novo
                      transcriptome assembly, gene prediction, functional analysis (GO &amp; KEGG) and
                      expression analysis. RNA-stabilized tissue or fresh samples accepted — final quote
                      depends on submission option and project scope.
                    </p>
                  </div>
                </Reveal>

                <Reveal delay={1}>
                  <div className="card h-full p-6">
                    <div className="flex items-center gap-3">
                      <Bug className="size-5 text-blue" />
                      <p className="text-[15px] font-semibold text-ink">Metagenomics</p>
                    </div>
                    <div className="mt-4">
                      <RateTable
                        head={["Package", "Output / samples", "Rate", "Includes"]}
                        rows={META_ROWS.map((r) => [r.pkg, r.out, r.rate, r.inc])}
                      />
                    </div>
                    <p className="mt-4 text-[12px] leading-relaxed text-muted">
                      Deep shotgun metagenomics, advanced functional profiling, resistome/virome analysis,
                      MAG recovery and publication-level downstream analysis are charged separately.
                    </p>
                  </div>
                </Reveal>
              </div>

              <Reveal>
                <div className="card p-6">
                  <div className="flex items-center gap-3">
                    <TestTubes className="size-5 text-blue" />
                    <p className="text-[15px] font-semibold text-ink">Targeted sequencing — rapid &amp; cost-effective</p>
                  </div>
                  <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_1.3fr]">
                    <div className="space-y-3">
                      {TARGETED_TYPES.map((t) => (
                        <div key={t.t} className="rounded-lg border border-line bg-paper-2 p-3.5">
                          <p className="text-[13px] font-semibold text-ink">{t.t}</p>
                          <p className="mt-1 text-[12px] leading-relaxed text-muted">{t.d}</p>
                        </div>
                      ))}
                    </div>
                    <RateTable
                      head={["Package", "Samples", "Rate", "Includes"]}
                      rows={[
                        ["Custom targeted sequencing", "> 50 samples", "PKR 25,000 / sample", "PCR amplicon / target genes · customized bioinformatics (+PKR 5,000–20,000)"],
                      ]}
                    />
                  </div>
                </div>
              </Reveal>
            </div>

            <p className="mt-5 text-[12px] leading-relaxed text-muted">
              Rates are subsidized for a promotional period valid until September 30, 2026. Final pricing
              depends on genome size, number of samples, required depth/coverage or read count, and any
              additional downstream bioinformatics requested.
            </p>
          </div>

          {/* workflow + audiences + training */}
          <div className="mt-14 grid gap-8 lg:grid-cols-[1.2fr_1fr]">
            <Reveal>
              <div className="card h-full p-6">
                <p className="eyebrow">Complete service workflow</p>
                <div className="mt-5 flex flex-wrap items-center gap-2">
                  {WORKFLOW.map((s, i) => (
                    <span key={s} className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-navy px-3 py-1.5 text-[11.5px] font-medium text-white">
                        <span className="text-yellow">{i + 1}</span> {s}
                      </span>
                      {i < WORKFLOW.length - 1 && <ArrowRight className="size-3.5 text-muted" />}
                    </span>
                  ))}
                </div>
                <p className="mt-5 text-[13px] leading-relaxed text-muted">
                  Integrated experimental and computational support under one platform — sample preparation,
                  sequencing, bioinformatics pipelines and publication-ready outputs, instead of fragmented outsourcing.
                </p>
                <div className="mt-6 border-t border-line pt-5">
                  <p className="eyebrow">Training &amp; capacity building</p>
                  <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                    {TRAINING.map((t, i) => (
                      <li key={t.t} className="flex gap-3">
                        <span className="grid size-6 shrink-0 place-items-center rounded-full bg-(--st-blue-bg) text-[11px] font-bold text-(--st-blue-fg)">{i + 1}</span>
                        <div>
                          <p className="text-[13px] font-semibold text-ink">{t.t}</p>
                          <p className="mt-0.5 text-[12px] leading-relaxed text-muted">{t.d}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </Reveal>
            <Reveal delay={1}>
              <div className="flex h-full flex-col gap-8">
                <div className="card p-6">
                  <p className="eyebrow">Who can benefit</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {AUDIENCES.map((a) => <Pill key={a}>{a}</Pill>)}
                  </div>
                </div>
                <div className="card flex-1 bg-navy p-6 !border-navy">
                  <div className="flex items-center gap-2.5">
                    <ShieldCheck className="size-5 text-yellow" />
                    <p className="text-[14px] font-semibold text-white">Data ownership &amp; confidentiality</p>
                  </div>
                  <p className="mt-3 text-[13px] leading-relaxed text-[#a2c1d7]">
                    Project data, biological material information and analysis outputs remain the property
                    of the client or research team unless agreed otherwise through formal collaboration
                    or publication arrangements.
                  </p>
                  <p className="mt-4 text-[12.5px] font-medium text-white">
                    Generate domestically. Analyze domestically. Protect domestically.
                  </p>
                </div>
              </div>
            </Reveal>
          </div>

          {/* contact */}
          <Reveal className="mt-12">
            <div className="card flex flex-wrap items-center justify-between gap-5 p-6">
              <div>
                <p className="eyebrow">Contact CAS-NGS</p>
                <div className="mt-3 flex flex-wrap gap-x-6 gap-y-2 text-[13.5px] text-body">
                  <span className="inline-flex items-center gap-2"><Mail className="size-4 text-blue" /> cas.afs@uaf.edu.pk</span>
                  <span className="inline-flex items-center gap-2"><Phone className="size-4 text-blue" /> 041-9201919 · 041-9200161-71 ext 4241, 4244 · 0316-8662119</span>
                  <span className="inline-flex items-center gap-2"><MapPin className="size-4 text-blue" /> CAS-AFS, University of Agriculture Faisalabad</span>
                </div>
                <p className="mt-2 text-[12px] text-muted">Social: CAS_NGS · Cas-Ngs · cas_ngs · CAS-NGS</p>
              </div>
              <Link href="/biogateway" className="btn-primary">Request this partner</Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ---------------------------- Genexa Analytics ---------------------------- */}
      <section id="genexa" className="scroll-mt-28 border-t border-line bg-paper-2 py-16 sm:py-20">
        <div className="container-x">
          <Reveal>
            <div className="flex flex-wrap items-start justify-between gap-6">
              <div>
                <h2 className="font-display text-[30px] font-semibold tracking-tight text-ink sm:text-[36px]">
                  Genexa Analytics
                </h2>
                <p className="mt-2 max-w-2xl text-[15px] font-medium text-body">
                  Transforming complex biological data into useful insights.
                </p>
                <p className="mt-2 max-w-2xl text-[14px] leading-relaxed text-muted">
                  Professional bioinformatics analysis services — advanced computational solutions for
                  genomics, transcriptomics and metagenomics, from raw data to meaningful biological insight.
                </p>
              </div>
              <span className="rounded-full border border-line bg-surface px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted">
                Bioinformatics partner
              </span>
            </div>
          </Reveal>

          <div className="mt-10 grid gap-8 lg:grid-cols-[1.3fr_1fr]">
            <Stagger className="grid gap-4 sm:grid-cols-2">
              {GENEXA_SERVICES.map((s) => (
                <div key={s.t} className="card flex flex-col p-5">
                  <span className="grid size-10 place-items-center rounded-xl bg-(--st-blue-bg) text-(--st-blue-fg)">
                    <s.icon className="size-5" strokeWidth={1.8} />
                  </span>
                  <p className="mt-3.5 text-[14.5px] font-semibold text-ink">{s.t}</p>
                  <p className="mt-1 flex-1 text-[12.5px] leading-relaxed text-muted">{s.d}</p>
                  <p className="mt-3 text-[12.5px] font-bold text-navy-2">{s.rate}</p>
                </div>
              ))}
            </Stagger>
            <Reveal delay={1}>
              <div className="flex h-full flex-col gap-6">
                <img
                  src="/partners/genexa-art.jpg"
                  alt="Genomic data visualization"
                  className="w-full flex-1 rounded-2xl border border-line object-cover shadow-lg"
                />
                <img
                  src="/partners/genexa-banner.jpg"
                  alt="Why choose Genexa Analytics"
                  className="w-full rounded-2xl border border-line object-cover shadow-lg"
                />
              </div>
            </Reveal>
          </div>

          <Reveal className="mt-8">
            <div className="card flex flex-wrap items-center justify-between gap-5 p-6">
              <div>
                <p className="eyebrow">Why choose Genexa Analytics</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {GENEXA_WHY.map((w) => (
                    <span key={w.t} className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface px-3 py-1.5 text-[12px] font-medium text-body">
                      <w.icon className="size-3.5 text-blue" /> {w.t}
                    </span>
                  ))}
                </div>
                <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-[13.5px] text-body">
                  <span className="inline-flex items-center gap-2"><Mail className="size-4 text-blue" /> genexaanalytics@gmail.com</span>
                  <span className="inline-flex items-center gap-2"><Phone className="size-4 text-blue" /> +92 314 6272724 · +92 335 1311404</span>
                </div>
                <p className="mt-2 text-[12px] text-muted">
                  LinkedIn &amp; Facebook: Genexa Analytics · Instagram: @genexa_analytics
                </p>
              </div>
              <Link href="/biogateway" className="btn-primary">Request this partner</Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ------------------------------ join CTA ------------------------------ */}
      <section className="border-t border-line bg-paper py-16">
        <div className="container-x">
          <Reveal>
            <div className="relative overflow-hidden rounded-2xl bg-navy p-8 sm:p-12">
              <div className="grid-lines on-dark absolute inset-0" />
              <div className="glow-orb right-[-80px] top-[-80px] size-[320px] bg-mint/15" />
              <div className="relative flex flex-wrap items-center justify-between gap-6">
                <div className="max-w-xl">
                  <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-yellow">Join the network</p>
                  <h3 className="mt-3 font-display text-[24px] font-semibold tracking-tight text-white sm:text-[28px]">
                    Run a sequencing lab, bioinformatics team or biotech supply company?
                  </h3>
                  <p className="mt-3 text-[14px] leading-relaxed text-[#a2c1d7]">
                    Verified partners keep their own pricing, workflow and project decisions — the Gateway
                    routes demand, handles blind quoting and governs quality.
                  </p>
                </div>
                <span className="btn-wrap">
                  <Link href="/biogateway" className="btn-white">Apply to join</Link>
                </span>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
