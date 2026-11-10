"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { ArrowRight, FileText, GitCompareArrows, Package, ShieldCheck } from "lucide-react";
import { Reveal, Stagger, fadeUp } from "@/components/motion-primitives";

const WAYS = [
  {
    when: "When you need sequencing",
    title: "Customer Portal",
    desc: "Submit a structured RFQ — organism, sample count, target output, deadline — and let verified providers come to you with competing offers.",
    metric: "Minutes",
    metricLabel: "to submit a structured RFQ",
    icon: FileText,
    href: "/solutions/researchers",
  },
  {
    when: "When you run a facility",
    title: "Provider Portal",
    desc: "Get RFQs matched to your platforms and sample types. Quote blind — your pricing and terms stay invisible to competing labs. Always.",
    metric: "Blind",
    metricLabel: "quotation by design, not promise",
    icon: GitCompareArrows,
    href: "/solutions/labs",
  },
  {
    when: "When you supply the lab",
    title: "Supplier Marketplace",
    desc: "List reagents, sample-prep kits and consumables in a moderated national catalog. Receive direct enquiries from verified research buyers.",
    metric: "Direct",
    metricLabel: "enquiry workflow, no middlemen",
    icon: Package,
    href: "/solutions/suppliers",
  },
  {
    when: "When oversight matters",
    title: "Admin Governance",
    desc: "Provider verification, complaint handling, platform-fee tracking and a full audit trail — administered by Syntax, owned by no vendor.",
    metric: "100%",
    metricLabel: "of admin actions audit-logged",
    icon: ShieldCheck,
    href: "/solutions/admin",
  },
];

export function FourWays() {
  return (
    <section className="relative bg-paper py-24 sm:py-28">
      <div className="container-x">
        <Reveal>
          <p className="eyebrow">How it works</p>
          <h2 className="h-section mt-4 max-w-2xl">
            One integrated marketplace.
            <br />
            <em className="grad-text">Four flexible ways to engage.</em>
          </h2>
          <p className="mt-5 max-w-2xl text-[15.5px] leading-relaxed text-body">
            The Gateway connects demand with decentralized capacity — facilities keep full control of
            pricing, workflow and project acceptance. Syntax simply makes the connection trusted.
          </p>
        </Reveal>

        <Stagger className="mt-14 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {WAYS.map((w) => (
            <motion.div key={w.title} variants={fadeUp}>
              <Link href={w.href} className="card card-hover group flex h-full flex-col p-6">
                <p className="text-[12.5px] font-medium text-muted">{w.when}</p>
                <div className="mt-4 flex items-center gap-3">
                  <span className="grid size-10 place-items-center rounded-xl bg-navy/[0.05] text-ink">
                    <w.icon className="size-5" strokeWidth={1.8} />
                  </span>
                  <h3 className="font-display text-[17px] font-medium tracking-tight text-ink">{w.title}</h3>
                </div>
                <p className="mt-4 flex-1 text-[13.5px] leading-relaxed text-body">{w.desc}</p>
                <div className="mt-6 border-t border-line pt-5">
                  <p className="grad-text font-display text-[27px] font-medium tracking-tight">{w.metric}</p>
                  <p className="mt-1 text-[12px] text-muted">{w.metricLabel}</p>
                </div>
                <span className="mt-4 inline-flex items-center gap-1.5 text-[13px] font-medium text-ink transition-colors group-hover:text-blue">
                  Learn more <ArrowRight className="size-3.5 transition-transform duration-300 group-hover:translate-x-1" />
                </span>
              </Link>
            </motion.div>
          ))}
        </Stagger>
      </div>
    </section>
  );
}
