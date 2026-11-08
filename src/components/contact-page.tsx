"use client";

import Link from "next/link";
import { ArrowRight, Clock3, MapPin, MessagesSquare, PackageCheck, Users } from "lucide-react";
import { Reveal, Stagger, fadeUp } from "@/components/motion-primitives";
import { motion } from "motion/react";

const CHANNELS = [
  {
    icon: MessagesSquare, title: "Talk to a scientist",
    desc: "Project scoping, platform selection, sample requirements and turnaround — a PhD-level specialist replies within one business day.",
    cta: "Start a conversation", href: "/biogateway",
  },
  {
    icon: PackageCheck, title: "Request a quote",
    desc: "Submit a structured RFQ — organism, sample count, output, analysis type and deadline — and receive blind quotes from verified providers.",
    cta: "Open the Gateway", href: "/biogateway",
  },
  {
    icon: Users, title: "Partner with us",
    desc: "Labs and suppliers: join the verified network. Choose a plan and Syntax verifies your organization before it goes live.",
    cta: "Join as a provider", href: "/biogateway",
  },
];

const CITIES = ["Karachi — Head office", "Lahore — Provider hub", "Islamabad — Partner network"];

export function ContactPage() {
  return (
    <>
      {/* hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-navy-2 via-navy to-navy pb-20 pt-[185px]">
        <div className="grid-lines on-dark absolute inset-0" />
        <div className="glow-orb left-[10%] top-[-200px] size-[500px] bg-blue-bright/15" />
        <div className="container-x relative">
          <Reveal>
            <p className="mt-5 inline-block rounded-full border border-white/25 px-4 py-1.5 text-[10.5px] font-medium uppercase tracking-[0.14em] text-[#c5d2e1]">
              Contact
            </p>
            <h1 className="h-display on-dark mt-5 max-w-3xl">Let&rsquo;s talk about your project</h1>
            <p className="mt-6 max-w-2xl text-[16px] leading-relaxed text-[#c5d2e1]">
              Syntax of Life operates the Pakistan Biotechnology Gateway — reach the team through any channel below.
            </p>
          </Reveal>
        </div>
      </section>

      {/* channels */}
      <section className="bg-paper py-24">
        <div className="container-x">
          <Stagger className="grid gap-5 lg:grid-cols-3">
            {CHANNELS.map((c) => (
              <motion.div key={c.title} variants={fadeUp} className="card card-hover flex flex-col p-7">
                <span className="grid size-11 place-items-center rounded-xl bg-navy text-yellow">
                  <c.icon className="size-5" strokeWidth={1.8} />
                </span>
                <h2 className="mt-4 text-[17px] font-semibold text-ink">{c.title}</h2>
                <p className="mt-2.5 flex-1 text-[13.5px] leading-relaxed text-body">{c.desc}</p>
                <Link href={c.href} className="mt-5 inline-flex items-center gap-1.5 text-[13.5px] font-semibold text-blue hover:text-navy-2">
                  {c.cta} <ArrowRight className="size-4" />
                </Link>
              </motion.div>
            ))}
          </Stagger>
        </div>
      </section>

      {/* locations */}
      <section className="border-t border-line bg-surface py-24">
        <div className="container-x grid gap-12 lg:grid-cols-2">
          <Reveal>
            <p className="eyebrow">Company information</p>
            <h2 className="h-section mt-4">Syntax of Life (Pvt) Ltd</h2>
            <p className="mt-4 max-w-md text-[14.5px] leading-relaxed text-body">
              Independently operated, non-governmental. The Gateway stores metadata and documents only —
              raw genomic data always stays at the lab or moves through out-of-band secure links.
            </p>
          </Reveal>
          <Reveal delay={1}>
            <div className="card p-7">
              <p className="text-[12px] font-semibold uppercase tracking-wider text-muted">Locations</p>
              <ul className="mt-4 space-y-3.5">
                {CITIES.map((c) => (
                  <li key={c} className="flex items-center gap-3 text-[14px] text-body">
                    <MapPin className="size-4.5 shrink-0 text-blue" /> {c}
                  </li>
                ))}
              </ul>
              <p className="mt-6 flex items-center gap-3 border-t border-line pt-5 text-[13px] text-muted">
                <Clock3 className="size-4 shrink-0" /> Replies within one business day, Monday–Friday
              </p>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
