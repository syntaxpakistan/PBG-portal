"use client";

import Link from "next/link";
import { motion } from "motion/react";
import {
  ArrowRight, BadgeCheck, Boxes, CircleCheck, Dna, Eye, FileText,
  FlaskConical, GraduationCap, Handshake, Landmark, Lock, Microscope,
  PackageCheck, Search, ShieldCheck, Stethoscope, Timer, Users, Workflow,
} from "lucide-react";
import { PLANS, type PlanKey } from "@/lib/plans";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Reveal, Stagger, fadeUp } from "@/components/motion-primitives";
import { SmoothScroll } from "@/components/smooth-scroll";

const HOW = [
  {
    icon: FileText, step: "01", title: "Post your request",
    desc: "Describe your project once — organism, sample count, analysis type, deadline and budget hint. Your RFQ is routed to providers whose declared capabilities match.",
  },
  {
    icon: Eye, step: "02", title: "Receive blind quotes",
    desc: "Verified laboratories quote independently and competitively — no lab ever sees another's price or terms. You compare sealed quotes side-by-side.",
  },
  {
    icon: Handshake, step: "03", title: "Award & escrow",
    desc: "Accept the best quote and pay into a protected escrow. Funds are only released to the provider as milestones are confirmed.",
  },
  {
    icon: PackageCheck, step: "04", title: "Results delivered",
    desc: "Track the project live, message the lab, exchange documents and receive staged deliverables — reports, figures and metadata — in one place.",
  },
];

const WHO = [
  {
    icon: GraduationCap, title: "Researchers & universities",
    desc: "Post structured RFQs, receive competitive quotes from verified national laboratories, and manage grants, projects and deliverables in one workspace.",
    list: ["Free to post requests", "Side-by-side quote comparison", "Publication-ready deliverables"],
  },
  {
    icon: FlaskConical, title: "Sequencing & bioinformatics labs",
    desc: "List your services once, receive matched project invitations, quote on your own terms and keep full control of pricing, workflow and acceptance.",
    list: ["You set prices & turnaround", "Accept or decline every invite", "Escrow-protected payment"],
  },
  {
    icon: Boxes, title: "Indigenous suppliers",
    desc: "Put reagents, kits, consumables and equipment in front of the entire national research community — receive enquiries and supply orders directly.",
    list: ["Product & service catalogue", "Direct buyer enquiries", "Invoice & payout tracking"],
  },
  {
    icon: Stethoscope, title: "Hospitals, agri & livestock",
    desc: "Clinical diagnostics, veterinary and agriculture programs get declared-capability providers, auditable delivery and strict confidentiality.",
    list: ["Chain-of-custody awareness", "Confidential project handling", "Verified facility profiles"],
  },
];

const WHY = [
  {
    icon: Eye, title: "Blind quoting",
    desc: "Competing laboratories never see each other's prices or quote details — every provider bids on merit, not on undercutting.",
  },
  {
    icon: BadgeCheck, title: "Verified providers",
    desc: "Every lab and supplier passes an admin review of declared capabilities before they can quote or sell — the registry stays honest.",
  },
  {
    icon: Landmark, title: "Escrow-protected payments",
    desc: "Payments sit in escrow and release as project milestones confirm. Nobody pays upfront into the void, nobody works unpaid.",
  },
  {
    icon: Workflow, title: "Structured delivery",
    desc: "Milestones, messaging, file exchange and staged result delivery are built into the project room — no scattered email threads.",
  },
  {
    icon: Lock, title: "Privacy by design",
    desc: "Raw genomic data (FASTQ/BAM/VCF) never lives on the platform — only documents and metadata. Samples and data move directly between parties.",
  },
  {
    icon: ShieldCheck, title: "Administered & auditable",
    desc: "Syntax of Life governs verification, moderation and disputes — with a full audit trail — while providers stay independent businesses.",
  },
];

const EXCHANGE = [
  { icon: Dna, title: "Sequencing services", desc: "WGS, amplicons, targeted panels, Sanger — matched to declared instrument capacity." },
  { icon: Microscope, title: "Bioinformatics", desc: "Downstream analysis, annotation and reporting as priced, optional add-ons." },
  { icon: Boxes, title: "Supplies catalogue", desc: "Reagents, kits, media, plasticware and equipment from national suppliers." },
  { icon: Search, title: "Facility registry", desc: "Browse verified laboratories and suppliers by capability, city and accreditation." },
];

export function Landing({ prices }: { prices: Record<PlanKey, number> }) {
  const TIERS = [
    {
      key: "CUSTOMER", icon: Users, label: "Customer", tagline: "For researchers, universities, hospitals & industry",
      price: 0, popular: false,
      features: [
        "Submit unlimited RFQs — free",
        "Compare sealed quotes side-by-side",
        "Escrow-protected award & milestones",
        "Track delivery in one workspace",
      ],
      cta: "Join as a customer",
    },
    ...(["BASIC", "PRO", "CUSTOM"] as const).map((key) => ({
      key, icon: key === "CUSTOM" ? Landmark : key === "PRO" ? Microscope : FlaskConical,
      label: PLANS[key].label, tagline: PLANS[key].tagline,
      price: prices[key], popular: key === "PRO",
      features: [...PLANS[key].features],
      cta: `Start with ${PLANS[key].label}`,
    })),
  ];

  return (
    <main className="min-h-screen bg-paper">
      <SmoothScroll />
      <Navbar />

      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-navy pb-24 pt-40 sm:pt-44">
        <div className="grid-lines on-dark absolute inset-0" />
        <div className="glow-orb right-[-120px] top-[-120px] size-[420px] bg-mint/15" />
        <div className="glow-orb left-[-140px] bottom-[-180px] size-[380px] bg-blue-bright/15" />
        <div className="container-x relative">
          <div className="mx-auto max-w-3xl text-center">
            <Reveal>
              <p className="eyebrow on-dark justify-center">A nationwide biotechnology marketplace</p>
              <h1 className="h-display on-dark mt-6">
                A National Platform for Sequencing in Pakistan —{" "}
                <em className="grad-text">Our Sample, Our Data, Our Discoveries.</em>
              </h1>
              <p className="mx-auto mt-6 max-w-2xl text-[16px] leading-relaxed text-[#c5d2e1] sm:text-[17.5px]">
                The <strong className="font-semibold text-white">Pakistan Biotechnology Gateway</strong> connects
                researchers, universities, hospitals and the agriculture sector with verified sequencing
                laboratories, bioinformatics providers and indigenous biotech suppliers — on a single,
                fairly-governed marketplace.
              </p>
              <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
                <span className="btn-wrap">
                  <Link href="/biogateway" className="btn-secondary">
                    Join the Gateway <ArrowRight className="size-4" />
                  </Link>
                </span>
                <Link href="/marketplace" className="group inline-flex items-center gap-2 text-[14.5px] font-medium text-white/90 hover:text-white">
                  Browse the marketplace <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
              <div className="mt-10 flex flex-wrap items-center justify-center gap-x-7 gap-y-3 text-[12.5px] text-[#7a97b0]">
                <span className="inline-flex items-center gap-1.5"><BadgeCheck className="size-4 text-mint" /> Verified nationwide network</span>
                <span className="inline-flex items-center gap-1.5"><Eye className="size-4 text-mint" /> Blind competitive quotes</span>
                <span className="inline-flex items-center gap-1.5"><Landmark className="size-4 text-mint" /> Escrow-protected payments</span>
                <span className="inline-flex items-center gap-1.5"><Lock className="size-4 text-mint" /> No raw genomic data hosted</span>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── The idea ─────────────────────────────────────────── */}
      <section className="bg-paper py-20 sm:py-24">
        <div className="container-x">
          <div className="mx-auto max-w-3xl text-center">
            <Reveal>
              <p className="eyebrow justify-center">The idea</p>
              <h2 className="h-section mt-4">
                One roof for the country&apos;s entire <em className="grad-text">biotech economy.</em>
              </h2>
              <p className="mt-5 text-[15.5px] leading-relaxed text-body">
                Today, getting a sample sequenced or a reagent sourced in Pakistan means cold emails,
                invisible pricing and weeks of uncertainty. The Gateway replaces that with a structured
                exchange: customers post what they need, verified providers and suppliers compete for the
                work — and every project runs inside a governed, auditable workflow.
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── How it works ─────────────────────────────────────── */}
      <section id="how" className="scroll-mt-24 bg-navy py-20 sm:py-24">
        <div className="container-x">
          <Reveal>
            <div className="max-w-2xl">
              <p className="eyebrow on-dark">How it works</p>
              <h2 className="h-section on-dark mt-4">From request to results in <em className="grad-text">four steps.</em></h2>
            </div>
          </Reveal>
          <Stagger className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {HOW.map((s) => (
              <motion.div key={s.step} variants={fadeUp} className="card-dark p-7">
                <div className="flex items-center justify-between">
                  <s.icon className="size-6 text-mint" />
                  <span className="font-mono text-[12px] text-[#5c7391]">{s.step}</span>
                </div>
                <h3 className="mt-5 text-[16px] font-semibold text-white">{s.title}</h3>
                <p className="mt-2.5 text-[13.5px] leading-relaxed text-[#a2c1d7]">{s.desc}</p>
              </motion.div>
            ))}
          </Stagger>
        </div>
      </section>

      {/* ── Who it's for ─────────────────────────────────────── */}
      <section id="who" className="scroll-mt-24 bg-paper py-20 sm:py-24">
        <div className="container-x">
          <Reveal>
            <div className="mx-auto max-w-2xl text-center">
              <p className="eyebrow justify-center">Who it&apos;s for</p>
              <h2 className="h-section mt-4">Built for <em className="grad-text">both sides</em> of the bench.</h2>
            </div>
          </Reveal>
          <Stagger className="mt-12 grid gap-5 md:grid-cols-2">
            {WHO.map((w) => (
              <motion.div key={w.title} variants={fadeUp} className="card card-hover p-8">
                <w.icon className="size-7 text-blue" />
                <h3 className="mt-5 text-[18px] font-semibold text-ink">{w.title}</h3>
                <p className="mt-2.5 text-[14px] leading-relaxed text-body">{w.desc}</p>
                <ul className="mt-5 space-y-2 border-t border-line pt-5">
                  {w.list.map((l) => (
                    <li key={l} className="flex items-center gap-2.5 text-[13px] text-body">
                      <CircleCheck className="size-4 shrink-0 text-(--st-green-fg)" /> {l}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </Stagger>
        </div>
      </section>

      {/* ── Why the Gateway ──────────────────────────────────── */}
      <section className="bg-paper-2 py-20 sm:py-24">
        <div className="container-x">
          <Reveal>
            <div className="mx-auto max-w-2xl text-center">
              <p className="eyebrow justify-center">Why the Gateway</p>
              <h2 className="h-section mt-4">A marketplace with <em className="grad-text">rules that protect everyone.</em></h2>
            </div>
          </Reveal>
          <Stagger className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {WHY.map((f) => (
              <motion.div key={f.title} variants={fadeUp} className="card card-hover p-7">
                <f.icon className="size-6 text-blue" />
                <h3 className="mt-4 text-[15.5px] font-semibold text-ink">{f.title}</h3>
                <p className="mt-2 text-[13.5px] leading-relaxed text-body">{f.desc}</p>
              </motion.div>
            ))}
          </Stagger>
        </div>
      </section>

      {/* ── The exchange ─────────────────────────────────────── */}
      <section className="bg-navy py-20 sm:py-24">
        <div className="container-x">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <Reveal>
              <p className="eyebrow on-dark">The exchange</p>
              <h2 className="h-section on-dark mt-4">
                Services and supplies — <em className="grad-text">one marketplace.</em>
              </h2>
              <p className="mt-5 text-[15px] leading-relaxed text-[#a2c1d7]">
                Sequencing runs and bioinformatics pipelines on one side; reagents, kits, consumables
                and equipment from indigenous suppliers on the other. Same verified network, same
                governed workflow.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <span className="btn-wrap">
                  <Link href="/marketplace" className="btn-white">Open the marketplace</Link>
                </span>
                <Link href="/registry" className="group inline-flex items-center gap-2 text-[14px] font-medium text-white/90 hover:text-white">
                  See the verified network <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            </Reveal>
            <Stagger className="grid gap-4 sm:grid-cols-2">
              {EXCHANGE.map((c) => (
                <motion.div key={c.title} variants={fadeUp} className="card-dark p-6">
                  <c.icon className="size-6 text-mint" />
                  <h3 className="mt-4 text-[15px] font-semibold text-white">{c.title}</h3>
                  <p className="mt-2 text-[12.5px] leading-relaxed text-[#a2c1d7]">{c.desc}</p>
                </motion.div>
              ))}
            </Stagger>
          </div>
        </div>
      </section>

      {/* ── Pricing ─────────────────────────────────────────── */}
      <section id="pricing" className="scroll-mt-24 bg-paper-2 py-20 sm:py-24">
        <div className="container-x">
          <Reveal>
            <div className="mx-auto max-w-2xl text-center">
              <p className="eyebrow justify-center">Pricing</p>
              <h2 className="h-section mt-4">Simple plans — <em className="grad-text">free to buy, fair to sell.</em></h2>
              <p className="mt-5 text-[15px] leading-relaxed text-body">
                Customers always join free. Laboratories and suppliers choose a monthly plan —
                billed after Syntax verifies your organization. No card needed to sign up.
              </p>
            </div>
          </Reveal>
          <Stagger className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {TIERS.map((t) => (
              <motion.div
                key={t.key}
                variants={fadeUp}
                className={`card card-hover relative flex flex-col p-7 ${t.popular ? "border-blue ring-1 ring-blue/40" : ""}`}
              >
                {t.popular && (
                  <span className="absolute -top-3 left-6 rounded-full bg-blue px-3 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-white">
                    Most popular
                  </span>
                )}
                <t.icon className="size-7 text-blue" />
                <h3 className="mt-4 text-[17px] font-semibold text-ink">{t.label}</h3>
                <p className="mt-1 min-h-9 text-[12.5px] leading-snug text-body">{t.tagline}</p>
                <p className="mt-4">
                  <span className="font-display text-[32px] font-semibold tracking-tight text-ink">
                    {t.price === 0 ? "Free" : `$${t.price}`}
                  </span>
                  {t.price > 0 && <span className="text-[13px] text-muted"> /mo</span>}
                </p>
                <ul className="mt-5 flex-1 space-y-2 border-t border-line pt-5">
                  {t.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-[12.5px] leading-snug text-body">
                      <CircleCheck className="mt-0.5 size-4 shrink-0 text-(--st-green-fg)" /> {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/biogateway"
                  className={`mt-6 inline-flex justify-center rounded-full px-5 py-2.5 text-[13px] font-semibold transition-colors ${
                    t.popular ? "bg-navy text-white hover:bg-navy-2" : "border border-line text-ink hover:border-navy hover:bg-surface"
                  }`}
                >
                  {t.cta}
                </Link>
              </motion.div>
            ))}
          </Stagger>
          <Reveal className="mt-8">
            <p className="text-center text-[12.5px] text-muted">
              A small platform fee applies to awarded projects — shown transparently on every invoice.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ── Governance ───────────────────────────────────────── */}
      <section className="bg-paper py-16 sm:py-20">
        <div className="container-x">
          <Reveal>
            <div className="mx-auto max-w-3xl rounded-2xl border border-line bg-surface p-8 sm:p-10">
              <div className="flex flex-wrap items-start gap-5">
                <ShieldCheck className="size-9 shrink-0 text-blue" />
                <div className="min-w-0 flex-1">
                  <h3 className="text-[17px] font-semibold text-ink">Independently operated, fairly governed</h3>
                  <p className="mt-3 text-[14px] leading-relaxed text-body">
                    The Gateway is administered by <strong className="text-ink">Syntax of Life Private Limited</strong> —
                    a private, non-governmental operator. We verify providers, moderate listings, govern
                    disputes and keep a full audit trail. We do not perform sequencing ourselves, and we do
                    not set provider prices — laboratories remain independent businesses in full control of
                    their work.
                  </p>
                  <p className="mt-3 flex items-center gap-2 text-[12.5px] text-muted">
                    <Timer className="size-4" /> Administered · audited · transparent by design
                  </p>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── Final CTA ────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-navy py-20 sm:py-24">
        <div className="grid-lines on-dark absolute inset-0" />
        <div className="glow-orb right-[-100px] bottom-[-160px] size-[360px] bg-mint/15" />
        <div className="container-x relative">
          <Reveal>
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="h-section on-dark">
                Join the national <em className="grad-text">biotech network.</em>
              </h2>
              <p className="mx-auto mt-5 max-w-xl text-[15px] leading-relaxed text-[#a2c1d7]">
                Whether you run a sequencing lab, supply reagents, or need analysis for your next
                project — the Gateway is where Pakistan&apos;s biotech community meets.
              </p>
              <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
                <span className="btn-wrap">
                  <Link href="/biogateway" className="btn-secondary">
                    Create your account <ArrowRight className="size-4" />
                  </Link>
                </span>
                <Link href="/login" className="group inline-flex items-center gap-2 text-[14.5px] font-medium text-white/90 hover:text-white">
                  Sign in <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <Footer />
    </main>
  );
}
