"use client";

import Link from "next/link";
import {
  ArrowRight, Award, BadgeCheck, Briefcase, CircleCheck, Dna, FlaskConical,
  GraduationCap, Handshake, HeartPulse, Laptop, MapPin, Microscope, Sparkles,
} from "lucide-react";
import { Reveal, Stagger, fadeUp } from "@/components/motion-primitives";
import { motion } from "motion/react";

function Hero({ eyebrow, title, tagline, cta }: { eyebrow: string; title: string; tagline: string; cta?: { href: string; label: string } }) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-navy-2 via-navy to-navy pb-20 pt-[185px]">
      <div className="grid-lines on-dark absolute inset-0" />
      <div className="glow-orb left-[10%] top-[-200px] size-[500px] bg-blue-bright/15" />
      <div className="glow-orb right-[5%] bottom-[-150px] size-[350px] bg-mint/10" />
      <div className="container-x relative">
        <Reveal>
          <p className="mt-5 inline-block rounded-full border border-white/25 px-4 py-1.5 text-[10.5px] font-medium uppercase tracking-[0.14em] text-[#c5d2e1]">
            {eyebrow}
          </p>
          <h1 className="h-display on-dark mt-5 max-w-3xl">{title}</h1>
          <p className="mt-6 max-w-2xl text-[16px] leading-relaxed text-[#c5d2e1]">{tagline}</p>
        </Reveal>
        {cta && (
          <Reveal delay={1} className="mt-9">
            <span className="btn-wrap">
              <Link href={cta.href} className="btn-white">{cta.label}</Link>
            </span>
          </Reveal>
        )}
      </div>
    </section>
  );
}

/* ------------------------------ About ------------------------------ */

const VALUES = [
  { icon: Sparkles, title: "Forward thinking, rooted in science", desc: "Decisions are made on evidence — our workflows are built by scientists who have run the experiments themselves." },
  { icon: Handshake, title: "Collaboration that drives performance", desc: "Customers, labs and suppliers work as one network — shared standards, shared outcomes." },
  { icon: BadgeCheck, title: "Service defined by an ownership mindset", desc: "Every provider on the Gateway treats your project like their own — QC, deadlines and reporting included." },
  { icon: HeartPulse, title: "Dedicated to narrowing healthcare disparities", desc: "Local capacity and transparent pricing bring advanced genomics within reach of every Pakistani lab." },
];

const TEAM = [
  { role: "Chief Science Officer", focus: "Scientific direction, assay validation and multiomics study design across the network." },
  { role: "Chief Financial Officer", focus: "Sustainable marketplace economics and transparent pricing governance." },
  { role: "VP, Commercial & Partnerships", focus: "Provider onboarding, institutional partnerships and customer success." },
  { role: "Director, Research & Development", focus: "New service categories, platform evaluation and workflow optimization." },
  { role: "Director, Bioinformatics", focus: "Analysis pipelines, QC standards and publication-ready reporting." },
];

const TRUSTED = ["Universities", "Teaching Hospitals", "Research Institutes", "Pharma & Biotech", "CROs", "Diagnostic Labs", "Agri-genomics", "Public Health"];

export function AboutPage() {
  return (
    <>
      <Hero
        eyebrow="About"
        title="Revealing the biological signals that shape health and disease"
        tagline="The Pakistan Biotechnology Gateway — operated by Syntax of Life — is the country's first federated marketplace for multiomics. We connect researchers and clinicians with verified capacity across genomics, transcriptomics, proteomics, epigenomics and bioinformatics, so world-class experiments no longer require sending samples abroad."
      />

      {/* mission */}
      <section className="bg-paper py-24">
        <div className="container-x grid gap-12 lg:grid-cols-2">
          <Reveal>
            <p className="eyebrow">Who we are</p>
            <h2 className="h-section mt-4 max-w-lg">One network for the whole experiment</h2>
          </Reveal>
          <Reveal delay={1} className="space-y-5 text-[15px] leading-relaxed text-body">
            <p>
              Multiomics means integrating genomics, transcriptomics, proteomics, epigenomics and beyond into
              one coherent readout of biology. The Gateway brings those capabilities together under a single
              verified marketplace — matching every project to facilities whose platforms, sample types and
              service categories actually fit the work.
            </p>
            <p>
              Advanced bioinformatics and AI-assisted analysis turn complex datasets into clear biological
              patterns, while Syntax&rsquo;s independent verification keeps every provider accountable. The result:
              end-to-end solutions for drug discovery, translational research and precision medicine — built in
              Pakistan, benchmarked to international standards.
            </p>
          </Reveal>
        </div>
      </section>

      {/* leadership */}
      <section className="border-t border-line bg-surface py-24">
        <div className="container-x">
          <Reveal>
            <p className="eyebrow">Our team of experts</p>
            <h2 className="h-section mt-4">Leadership</h2>
            <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-body">
              A scientist-led team spanning wet-lab operations, computational biology and marketplace governance.
            </p>
          </Reveal>
          <Stagger className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {TEAM.map((t) => (
              <motion.div key={t.role} variants={fadeUp} className="card card-hover p-6">
                <span className="grid size-10 place-items-center rounded-xl bg-navy text-yellow">
                  <Microscope className="size-5" strokeWidth={1.8} />
                </span>
                <h3 className="mt-4 text-[15px] font-semibold text-ink">{t.role}</h3>
                <p className="mt-2.5 text-[13px] leading-relaxed text-body">{t.focus}</p>
              </motion.div>
            ))}
          </Stagger>
        </div>
      </section>

      {/* dna values */}
      <section className="bg-paper py-24">
        <div className="container-x">
          <Reveal>
            <p className="eyebrow">What&rsquo;s in our DNA</p>
            <h2 className="h-section mt-4 max-w-2xl">Makes the difference</h2>
          </Reveal>
          <Stagger className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {VALUES.map((v) => (
              <motion.div key={v.title} variants={fadeUp} className="card card-hover p-6">
                <span className="grid size-10 place-items-center rounded-xl bg-yellow text-navy">
                  <v.icon className="size-5" strokeWidth={1.8} />
                </span>
                <h3 className="mt-4 text-[14.5px] font-semibold leading-snug text-ink">{v.title}</h3>
                <p className="mt-2.5 text-[12.5px] leading-relaxed text-body">{v.desc}</p>
              </motion.div>
            ))}
          </Stagger>
        </div>
      </section>

      {/* story + partners */}
      <section className="border-t border-line bg-paper-2/50 py-24">
        <div className="container-x grid gap-12 lg:grid-cols-2">
          <Reveal>
            <p className="eyebrow">Why the Gateway exists</p>
            <h2 className="h-section mt-4">Listening for the signal</h2>
            <div className="mt-5 space-y-4 text-[15px] leading-relaxed text-body">
              <p>
                Biology is noisy. Buried inside every dataset are the signals that explain disease, reveal drug
                targets and guide precision medicine — but finding them takes platforms and expertise that no
                single institution can hold alone.
              </p>
              <p>
                The Gateway exists to make those signals reachable: verified facilities, transparent blind
                quoting, and bioinformatics support that carries a project from sample to publication — so the
                science stays local and the insight stays yours.
              </p>
            </div>
          </Reveal>
          <Reveal delay={1}>
            <p className="eyebrow">The network we serve</p>
            <h2 className="h-section mt-4">Built for Pakistan&rsquo;s research community</h2>
            <div className="mt-6 flex flex-wrap gap-3">
              {TRUSTED.map((t) => (
                <span key={t} className="rounded-full border border-line bg-surface px-4 py-2 text-[13px] font-medium text-body">
                  {t}
                </span>
              ))}
            </div>
            <div className="mt-8 flex items-center gap-3 text-[13.5px] text-body">
              <MapPin className="size-4.5 shrink-0 text-blue" />
              Karachi · Lahore · Islamabad — and providers nationwide
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}

/* ----------------------------- Careers ----------------------------- */

const PERKS = [
  { icon: HeartPulse, title: "Comprehensive health coverage", desc: "Medical coverage for you and your dependents." },
  { icon: Award, title: "Growth & equity participation", desc: "Share in the platform's growth as the network scales." },
  { icon: Laptop, title: "Flexible time off", desc: "Generous PTO plus paid holidays and sick leave." },
  { icon: GraduationCap, title: "Learning & conferences", desc: "Budget for courses, certifications and scientific conferences." },
  { icon: FlaskConical, title: "Cutting-edge platforms", desc: "Work hands-on with NovaSeq X Plus, PacBio Revio, 10x Genomics and Olink workflows across the network." },
  { icon: Dna, title: "Mission that matters", desc: "Your work directly supports research that advances human health in Pakistan." },
];

const ROLES = [
  {
    dept: "Lab & Science", loc: "Lahore", type: "Full-time",
    title: "NGS Research Associate",
    desc: "Prepare high-quality DNA and RNA sequencing libraries, operate next-generation sequencing platforms, and ensure accurate data generation across a wide range of research projects. Ideal for candidates with a strong molecular-biology background and hands-on Illumina workflow experience.",
  },
  {
    dept: "Bioinformatics", loc: "Karachi / Remote", type: "Full-time",
    title: "Business Development Manager — Multiomics",
    desc: "Own business development and revenue generation for your region during a period of rapid growth — helping democratize personalized medicine and cement the Gateway's position in genomics services.",
  },
  {
    dept: "Commercial", loc: "Islamabad", type: "Full-time",
    title: "Sales Enablement Specialist",
    desc: "Generate new business opportunities, manage customer relationships and drive revenue growth as an inside-sales representative. Suited to candidates who love science and technology and can qualify new opportunities end-to-end.",
  },
];

export function CareersPage() {
  return (
    <>
      <Hero
        eyebrow="Careers"
        title="Build the future of multiomics in Pakistan"
        tagline="Join a scientist-led team growing the country's first biotechnology gateway. We're looking for curious people who want their work to accelerate discovery and precision medicine."
        cta={{ href: "#open-roles", label: "See open roles" }}
      />

      {/* values strip */}
      <section className="border-b border-line bg-surface py-14">
        <div className="container-x">
          <Reveal>
            <p className="eyebrow">Life at the Gateway</p>
            <h2 className="h-section mt-3">What&rsquo;s in our DNA</h2>
          </Reveal>
          <Stagger className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {VALUES.map((v) => (
              <motion.div key={v.title} variants={fadeUp} className="flex items-start gap-3">
                <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-navy text-yellow">
                  <v.icon className="size-4.5" strokeWidth={1.8} />
                </span>
                <p className="pt-1.5 text-[13.5px] font-medium leading-snug text-ink">{v.title}</p>
              </motion.div>
            ))}
          </Stagger>
        </div>
      </section>

      {/* benefits */}
      <section className="bg-paper py-24">
        <div className="container-x">
          <Reveal>
            <p className="eyebrow">Benefits &amp; perks</p>
            <h2 className="h-section mt-4">We invest in our people</h2>
          </Reveal>
          <Stagger className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {PERKS.map((p) => (
              <motion.div key={p.title} variants={fadeUp} className="card card-hover p-6">
                <span className="grid size-10 place-items-center rounded-xl bg-yellow text-navy">
                  <p.icon className="size-5" strokeWidth={1.8} />
                </span>
                <h3 className="mt-4 text-[15px] font-semibold text-ink">{p.title}</h3>
                <p className="mt-2.5 text-[13px] leading-relaxed text-body">{p.desc}</p>
              </motion.div>
            ))}
          </Stagger>
        </div>
      </section>

      {/* open roles */}
      <section id="open-roles" className="scroll-mt-28 border-t border-line bg-paper-2/50 py-24">
        <div className="container-x">
          <Reveal>
            <p className="eyebrow">Open positions</p>
            <h2 className="h-section mt-4">Join the team</h2>
          </Reveal>
          <Stagger className="mt-12 space-y-5">
            {ROLES.map((r) => (
              <motion.div key={r.title} variants={fadeUp} className="card card-hover p-7">
                <div className="flex flex-wrap items-center gap-2.5 text-[11.5px] font-medium">
                  <span className="rounded-full bg-navy px-3 py-1 text-yellow">{r.dept}</span>
                  <span className="inline-flex items-center gap-1 rounded-full border border-line px-3 py-1 text-body"><MapPin className="size-3" /> {r.loc}</span>
                  <span className="rounded-full border border-line px-3 py-1 text-body"><Briefcase className="mr-1 inline size-3" />{r.type}</span>
                </div>
                <h3 className="mt-4 font-display text-[20px] font-medium tracking-tight text-ink">{r.title}</h3>
                <p className="mt-3 max-w-3xl text-[14px] leading-relaxed text-body">{r.desc}</p>
                <Link href="/biogateway" className="mt-5 inline-flex items-center gap-1.5 text-[13.5px] font-semibold text-blue hover:text-navy-2">
                  Apply now <ArrowRight className="size-4" />
                </Link>
              </motion.div>
            ))}
          </Stagger>
          <Reveal delay={1}>
            <div className="mt-10 overflow-hidden rounded-[28px] bg-navy p-8 sm:p-10">
              <div className="flex flex-wrap items-center justify-between gap-6">
                <div>
                  <h3 className="h-section on-dark">Don&rsquo;t see the right role?</h3>
                  <p className="mt-3 max-w-lg text-[14px] text-[#c5d2e1]">
                    We&rsquo;re always meeting talented scientists and engineers. Send us your resume and tell us how you&rsquo;d like to contribute.
                  </p>
                </div>
                <span className="btn-wrap">
                  <Link href="/biogateway" className="btn-white">Send your resume</Link>
                </span>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}

/* ---------------------------- Certified ---------------------------- */

const CERTS = [
  {
    name: "10x Genomics",
    desc: "Comprehensive single-cell and spatial multi-omics solutions for deep biological insight across diverse research applications.",
    points: [
      "Gene Expression (3′ GEX) — transcriptional profiles across thousands of cells",
      "Immune Profiling — BCR & TCR repertoires for immunology, vaccine and autoimmune research",
      "Multiome (ATAC + GEX) — chromatin accessibility and expression at single-cell resolution",
      "CITE-Seq & Cell Hashing — protein markers plus RNA for characterization and multiplexing",
      "Single-Nuclei Sequencing — frozen and archival tissues, ideal for neurological studies",
      "Visium — whole-transcriptome spatial profiling on FFPE or fresh-frozen tissue",
      "Xenium — sub-cellular, high-plex in situ transcript quantification",
    ],
    href: "/services/single-cell-sequencing", cta: "Explore 10x Genomics services",
  },
  {
    name: "Pacific Biosciences",
    desc: "Advanced long-read sequencing on PacBio HiFi — high-accuracy, publication-ready genomic data for human, plant, microbial and animal genomes.",
    points: [
      "De novo assembly & annotation — contiguous, accurate genome builds for complex or polyploid species",
      "Comprehensive variant detection — SNVs, Indels and large SVs with haplotype phasing",
      "Full-length isoform and methylation profiling in native context",
    ],
    href: "/services/long-read", cta: "Discover high-accuracy genome solutions",
  },
  {
    name: "Illumina",
    desc: "High-throughput, cost-effective sequencing delivering accurate data for diverse applications.",
    points: [
      "Premade library sequencing — WGS, WES, RNA-Seq, amplicon, bisulfite, TCR/BCR libraries to FASTQ",
      "RNA sequencing — mRNA, total RNA, low-input and FFPE with QC, alignment and DGE",
      "Whole-genome sequencing — NovaSeq X+ coverage for population studies and variant discovery",
      "Whole-exome sequencing — Agilent or Twist capture with calling, annotation and CNV analysis",
    ],
    href: "/services/premade-library-sequencing", cta: "Explore our sequencing services",
  },
  {
    name: "Olink",
    desc: "High-throughput, NGS-based proteomics with Olink Reveal — precise quantification of 1,000+ proteins from as little as 4 µL of plasma, serum or CSF.",
    points: [
      "Comprehensive biomarker profiling across inflammation, immunity and signaling pathways",
      "Low input, scalable throughput — built for large-cohort and multi-omics studies",
      "Integrated workflow — assay setup through Illumina sequencing and Olink Insight analysis",
      "Fast turnaround — results typically within ~4 weeks",
    ],
    href: "/services/proteomics", cta: "Know more about our proteomics services",
  },
  {
    name: "Twist Bioscience",
    desc: "Advanced NGS library prep with Twist technology for RNA, exome and whole-genome sequencing — exceptional uniformity, specificity and sensitivity.",
    points: [
      "Targeted sequencing — custom or pre-designed panels for oncology and rare-variant detection",
      "Whole-exome sequencing — uniform coding-region coverage for comprehensive discovery",
      "Whole-genome sequencing — consistent performance across GC-rich and challenging regions",
      "RNA sequencing — strand-specific profiling of coding and non-coding RNAs at low input",
    ],
    href: "/services/genomics", cta: "Know more",
  },
];

export function CertifiedPage() {
  return (
    <>
      <Hero
        eyebrow="Certified service provider"
        title="Trusted platforms. Certified expertise. Proven quality."
        tagline="Gateway providers are validated for 10x Genomics, Illumina, Olink, PacBio and Twist Bioscience workflows — guaranteeing precision, reliability and end-to-end quality across every genomic application."
      />
      <section className="bg-paper py-24">
        <div className="container-x space-y-6">
          {CERTS.map((c, i) => (
            <Reveal key={c.name} delay={i % 2}>
              <div className="card card-hover grid gap-8 p-8 lg:grid-cols-[0.9fr_1.4fr]">
                <div>
                  <h2 className="font-display text-[26px] font-medium tracking-tight text-ink">{c.name}</h2>
                  <p className="mt-3 text-[14px] leading-relaxed text-body">{c.desc}</p>
                  <Link href={c.href} className="mt-5 inline-flex items-center gap-1.5 text-[13.5px] font-semibold text-blue hover:text-navy-2">
                    {c.cta} <ArrowRight className="size-4" />
                  </Link>
                </div>
                <ul className="space-y-3 self-center">
                  {c.points.map((pt) => (
                    <li key={pt} className="flex items-start gap-3 text-[13.5px] leading-relaxed text-body">
                      <CircleCheck className="mt-0.5 size-4.5 shrink-0 text-mint" /> {pt}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          ))}
        </div>
      </section>
    </>
  );
}

/* ----------------------------- Grants ----------------------------- */

const GRANTS = [
  {
    name: "Spatial Transcriptomics Grant — Illumina StrataMap",
    status: "Applications open",
    desc: "A grant program built on Illumina's latest spatial platform giving researchers no-cost access to single-cell-resolution spatial transcriptomics — open to qualifying academic and translational projects.",
    points: ["Free StrataMap profiling for awarded projects", "Full analysis package included", "Academic & translational labs eligible"],
  },
  {
    name: "Xenium 5K Spatial Grant — with 10x Genomics",
    status: "Cycle completed · next round soon",
    desc: "Launched in collaboration with 10x Genomics, the Xenium 5K grant awards free access to the high-plex spatial gene-expression panel for researchers advancing single-cell spatial biology.",
    points: ["Xenium 5K panel access at no cost", "Targeted subcellular profiling", "Prior recipients already announced"],
  },
];

export function GrantsPage() {
  return (
    <>
      <Hero
        eyebrow="Grants"
        title="Funding programs for your next study"
        tagline="Competitive grant cycles that put cutting-edge platforms within reach — awarded projects receive free profiling, analysis and scientific support through the network."
        cta={{ href: "/biogateway", label: "Apply for a grant" }}
      />
      <section className="bg-paper py-24">
        <div className="container-x">
          <Stagger className="grid gap-6 lg:grid-cols-2">
            {GRANTS.map((g) => (
              <motion.div key={g.name} variants={fadeUp} className="card card-hover flex flex-col p-8">
                <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-yellow px-3 py-1 text-[11px] font-semibold text-navy">
                  <Award className="size-3.5" /> {g.status}
                </span>
                <h2 className="mt-4 font-display text-[22px] font-medium tracking-tight text-ink">{g.name}</h2>
                <p className="mt-3 flex-1 text-[14px] leading-relaxed text-body">{g.desc}</p>
                <ul className="mt-5 space-y-2.5">
                  {g.points.map((pt) => (
                    <li key={pt} className="flex items-start gap-2.5 text-[13px] text-body">
                      <CircleCheck className="mt-0.5 size-4 shrink-0 text-mint" /> {pt}
                    </li>
                  ))}
                </ul>
                <Link href="/biogateway" className="mt-6 inline-flex items-center gap-1.5 text-[13.5px] font-semibold text-blue hover:text-navy-2">
                  Apply now <ArrowRight className="size-4" />
                </Link>
              </motion.div>
            ))}
          </Stagger>

          <Reveal delay={1}>
            <div className="mt-16 grid gap-10 lg:grid-cols-[0.9fr_1.4fr]">
              <div>
                <p className="eyebrow">How it works</p>
                <h2 className="h-section mt-4">From application to award</h2>
              </div>
              <ol className="grid gap-4 sm:grid-cols-2">
                {[
                  "Submit your study — aims, sample types and platform fit",
                  "Scientific review — feasibility and impact scored by experts",
                  "Award announcement — recipients notified with a project plan",
                  "Run the project — profiling, analysis and reporting on us",
                ].map((s, i) => (
                  <li key={s} className="card flex items-start gap-3.5 p-5">
                    <span className="grid size-8 shrink-0 place-items-center rounded-full bg-navy font-display text-[13px] text-yellow">{i + 1}</span>
                    <span className="text-[13.5px] leading-relaxed text-body">{s}</span>
                  </li>
                ))}
              </ol>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
