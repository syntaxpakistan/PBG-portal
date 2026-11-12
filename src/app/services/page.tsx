export const instant = false

import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import {
  ArrowRight, ChevronDown, Cpu, Dna, SearchCheck, ShieldCheck, TestTubes,
} from "lucide-react";
import { PANELS } from "./data";

export const metadata = {
  title: "Services — Pakistan Biotechnology Gateway",
  description:
    "Molecular biology, sequencing and bioinformatics services from verified laboratories across Pakistan — request a quote and compare offers.",
};


export default function ServicesPage() {
  return (
    <main className="min-h-screen bg-paper">
      <Navbar />

      {/* hero */}
      <section className="relative overflow-hidden bg-navy pb-16 pt-36 sm:pt-40">
        <div className="grid-lines on-dark absolute inset-0" />
        <div className="glow-orb right-[-120px] top-[-80px] size-[380px] bg-mint/15" />
        <div className="container-x relative">
          <div className="max-w-3xl">
            <p className="eyebrow on-dark">Service catalogue</p>
            <h1 className="h-display on-dark mt-5 !text-[2.4rem] sm:!text-[3rem]">
              Sequencing, molecular biology &amp; <em className="grad-text">bioinformatics services.</em>
            </h1>
            <p className="mt-5 max-w-2xl text-[15.5px] leading-relaxed text-[#c5d2e1]">
              Everything a project needs — from DNA extraction to publication-ready analysis —
              provided by verified laboratories across Pakistan. Browse the catalogue, then post a
              request for quotes and compare offers side by side.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <span className="btn-wrap">
                <Link href="/biogateway" className="btn-white">Request a quote</Link>
              </span>
              <Link href="/registry" className="group inline-flex items-center gap-2 text-[14px] font-medium text-white/90 hover:text-white">
                Browse verified labs <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* service panels — one dropdown per category */}
      <section className="bg-paper py-16 sm:py-20">
        <div className="container-x max-w-4xl">
          <div className="space-y-5">
            {PANELS.map((panel, i) => (
              <details key={panel.title} open={i === 0} className="group card overflow-hidden">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-6 py-5 [&::-webkit-details-marker]:hidden">
                  <div className="flex items-center gap-4">
                    <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-navy text-yellow">
                      {i === 0 ? <TestTubes className="size-5" /> : i === 1 ? <Dna className="size-5" /> : <Cpu className="size-5" />}
                    </span>
                    <div>
                      <h2 className="font-display text-[17px] font-semibold text-ink">{panel.title}</h2>
                      <p className="mt-0.5 text-[12px] text-muted">{panel.items.length} services</p>
                    </div>
                  </div>
                  <ChevronDown className="size-5 shrink-0 text-muted transition-transform duration-200 group-open:rotate-180" />
                </summary>
                <div className="border-t border-line px-6 pb-6 pt-4">
                  <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                    <p className="max-w-2xl text-[13.5px] leading-relaxed text-body">{panel.intro}</p>
                    <Link
                      href={`/services/${panel.slug}`}
                      className="group inline-flex shrink-0 items-center gap-1.5 text-[12.5px] font-semibold text-blue transition-colors hover:text-navy"
                    >
                      Full detail <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
                    </Link>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    {panel.items.map((s) => (
                      <div key={s.name} className="rounded-xl border border-line bg-surface p-5">
                        <div className="flex items-center gap-2.5">
                          <s.icon className="size-4.5 shrink-0 text-blue" />
                          <h3 className="text-[14px] font-semibold text-ink">{s.name}</h3>
                        </div>
                        <p className="mt-2.5 text-[12.5px] leading-relaxed text-body">{s.desc}</p>
                        <div className="mt-3.5 flex flex-wrap gap-1.5">
                          {s.tags.map((t) => (
                            <span key={t} className="rounded-full border border-line bg-paper-2 px-2.5 py-0.5 text-[10.5px] font-medium text-body">
                              {t}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </details>
            ))}
          </div>

          {/* how procurement works */}
          <div className="card mt-10 grid gap-5 p-7 sm:grid-cols-3">
            {[
              { icon: SearchCheck, t: "Pick a service", d: "Open a panel, choose the sub-service that fits your project." },
              { icon: ShieldCheck, t: "Post your request", d: "Describe samples, organism and output — routed only to verified labs that declare the capability." },
              { icon: Dna, t: "Compare sealed quotes", d: "Labs quote independently — compare price, turnaround and scope side by side before awarding." },
            ].map((s) => (
              <div key={s.t} className="flex items-start gap-3">
                <s.icon className="mt-0.5 size-5 shrink-0 text-blue" />
                <div>
                  <p className="text-[13.5px] font-semibold text-ink">{s.t}</p>
                  <p className="mt-1 text-[12px] leading-relaxed text-body">{s.d}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* cta */}
      <section className="bg-navy py-16">
        <div className="container-x text-center">
          <h2 className="h-section on-dark">Not sure which service fits? <em className="grad-text">Consult an expert.</em></h2>
          <p className="mx-auto mt-4 max-w-xl text-[14px] leading-relaxed text-[#a2c1d7]">
            Get guidance on experimental design, sample requirements, sequencing platforms and
            bioinformatics before you start — then let verified labs compete for the work.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <span className="btn-wrap">
              <Link href="/biogateway" className="btn-white">Request a consultation</Link>
            </span>
            <Link href="/marketplace" className="group inline-flex items-center gap-2 text-[14px] font-medium text-white/90 hover:text-white">
              Open the marketplace <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
