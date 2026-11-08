"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import {
  ArrowRight,
  FileText,
  GitCompareArrows,
  MessageSquareLock,
  Microscope,
  Radar,
  Boxes,
  Search,
  Package,
  ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Reveal } from "@/components/motion-primitives";

const TABS = [
  {
    id: "rfq",
    when: "When you need work done",
    headline: "From request to result — one auditable pipeline",
    icon: FileText,
    features: [
      {
        icon: FileText,
        title: "Structured RFQ Builder",
        desc: "Organism, sample count, requested output, analysis type, deadline and attachments — captured once, routed precisely.",
      },
      {
        icon: Radar,
        title: "Targeted Routing",
        desc: "Your RFQ reaches only approved providers whose platforms and sample types actually match the work.",
      },
      {
        icon: MessageSquareLock,
        title: "Private Project Channel",
        desc: "After selection, a scoped thread opens between you, your lab and admin — documents included.",
      },
    ],
  },
  {
    id: "quote",
    when: "When you provide capacity",
    headline: "Compete on merit. Quote blind. Win fairly.",
    icon: GitCompareArrows,
    features: [
      {
        icon: GitCompareArrows,
        title: "Blind Quotation Engine",
        desc: "Submit pricing, taxes, turnaround, platform and exclusions — invisible to every competing provider, enforced in the database.",
      },
      {
        icon: Microscope,
        title: "Verified Facility Profile",
        desc: "List sequencers, HPC capacity and sample types once — get matched to RFQs you can actually deliver.",
      },
      {
        icon: ShieldCheck,
        title: "Full Independence",
        desc: "Your pricing, your workflow, your acceptance decisions. Syntax administers the marketplace — never the lab.",
      },
    ],
  },
  {
    id: "supply",
    when: "When you sell or source supplies",
    headline: "Pakistan's moderated biotech product catalog",
    icon: Boxes,
    features: [
      {
        icon: Package,
        title: "Moderated Listings",
        desc: "Reagents, sample-prep kits and consumables — every listing reviewed before it reaches the catalog.",
      },
      {
        icon: Search,
        title: "Category Search & Filters",
        desc: "Find indigenous products by category, specification and supplier — no cold-calling required.",
      },
      {
        icon: MessageSquareLock,
        title: "Direct Enquiries",
        desc: "Order-request workflows connect buyers straight to suppliers. Cart and settlement arrive in later phases.",
      },
    ],
  },
];

export function PlatformTabs() {
  const [active, setActive] = useState(TABS[0].id);
  const tab = TABS.find((t) => t.id === active)!;

  return (
    <section className="relative bg-paper py-24 sm:py-28">
      <div className="container-x">
        <Reveal>
          <p className="eyebrow">A unified platform</p>
          <h2 className="h-section mt-4 max-w-3xl">
            Built for how <em className="grad-text">research teams</em> actually work
          </h2>
          <p className="mt-5 max-w-2xl text-[15.5px] leading-relaxed text-body">
            Whether you&apos;re submitting an RFQ, quoting as a lab, or sourcing supplies — the Gateway
            adapts to your role across every stage of the project.
          </p>
        </Reveal>

        {/* tab strip */}
        <Reveal delay={1} className="mt-12">
          <div className="flex flex-wrap gap-1 rounded-full border border-line bg-surface p-1.5">
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setActive(t.id)}
                className={cn(
                  "relative flex items-center gap-2 rounded-full px-5 py-2.5 text-[13.5px] font-medium transition-colors",
                  active === t.id ? "text-white" : "text-body hover:text-ink"
                )}
              >
                {active === t.id && (
                  <motion.span
                    layoutId="tab-pill"
                    className="absolute inset-0 rounded-full bg-navy"
                    transition={{ type: "spring", stiffness: 420, damping: 34 }}
                  />
                )}
                <t.icon className={cn("relative size-4", active === t.id ? "text-yellow" : "text-muted")} />
                <span className="relative">{t.when}</span>
              </button>
            ))}
          </div>
        </Reveal>

        {/* tab content */}
        <div className="mt-12">
          <AnimatePresence mode="wait">
            <motion.div
              key={tab.id}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            >
              <h3 className="max-w-xl font-display text-[22px] font-light tracking-tight text-ink sm:text-[26px]">
                {tab.headline}
              </h3>
              <div className="mt-8 grid gap-5 md:grid-cols-3">
                {tab.features.map((f) => (
                  <div key={f.title} className="card card-hover p-6">
                    <span className="grid size-10 place-items-center rounded-xl bg-navy/[0.05] text-navy-2">
                      <f.icon className="size-5" strokeWidth={1.8} />
                    </span>
                    <h4 className="mt-4 font-display text-[15.5px] font-medium tracking-tight text-ink">{f.title}</h4>
                    <p className="mt-2.5 text-[13.5px] leading-relaxed text-body">{f.desc}</p>
                    <Link
                      href="/platform"
                      className="mt-4 inline-flex items-center gap-1.5 text-[13px] font-medium text-blue hover:text-navy-2"
                    >
                      Learn more <ArrowRight className="size-3.5" />
                    </Link>
                  </div>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
