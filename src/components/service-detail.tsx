"use client";

import Link from "next/link";
import {
  ArrowRight, CircleCheck, FileSearch, PackageCheck, BarChart3, Radar,
  GitCompareArrows, ChevronDown,
} from "lucide-react";
import { Reveal, Stagger, fadeUp, AnimatedCounter } from "@/components/motion-primitives";
import { motion } from "motion/react";
import { FaqList } from "@/components/faq-item";
import { SERVICE_PAGES, type ServicePage } from "@/lib/service-pages";

const STEP_ICONS = [FileSearch, PackageCheck, Radar, GitCompareArrows, BarChart3];

function StatValue({ v }: { v: string }) {
  const m = v.match(/^([>~+]*)([\d,]+)(.*)$/);
  if (!m) return <>{v}</>;
  const n = parseInt(m[2].replace(/,/g, ""), 10);
  if (n > 99999) return <>{v}</>;
  return <>{m[1]}<AnimatedCounter value={n} />{m[3]}</>;
}

function MarqueeRow({ items, reverse = false }: { items: string[]; reverse?: boolean }) {
  return (
    <div className={`flex w-max animate-marquee items-center gap-3 pr-3 hover:[animation-play-state:paused] ${reverse ? "[animation-direction:reverse]" : ""}`}>
      {[...items, ...items].map((d, i) => (
        <p key={i} className="card flex items-center gap-2.5 whitespace-nowrap px-4 py-3 text-[13px] text-body">
          <CircleCheck className="size-4 shrink-0 text-blue" /> {d}
        </p>
      ))}
    </div>
  );
}

export function ServiceDetail({ s }: { s: ServicePage }) {
  const sec = s.sections ?? {};
  const related = s.related ?? SERVICE_PAGES.filter((p) => p.slug !== s.slug).slice(0, 6)
    .map((p) => ({ href: `/services/${p.slug}`, eyebrow: p.eyebrow, title: p.title }));
  return (
    <>
      {/* hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-navy-2 via-navy to-navy pb-20 pt-[185px]">
        <div className="grid-lines on-dark absolute inset-0" />
        <div className="glow-orb left-[10%] top-[-200px] size-[500px] bg-blue-bright/15" />
        <div className="glow-orb right-[5%] bottom-[-150px] size-[350px] bg-mint/10" />
        <div className="container-x relative">
          <Link href={sec.backHref ?? "/services"} className="inline-flex items-center gap-1.5 text-[12.5px] font-medium text-[#a2c1d7] transition-colors hover:text-white">
            <ChevronDown className="size-3.5 rotate-90" /> {sec.backLabel ?? "All services"}
          </Link>
          <Reveal>
            <p className="mt-5 inline-block rounded-full border border-white/25 px-4 py-1.5 text-[10.5px] font-medium uppercase tracking-[0.14em] text-[#c5d2e1]">
              {s.eyebrow}
            </p>
            <h1 className="h-display on-dark mt-5 max-w-3xl">{s.title}</h1>
            <p className="mt-6 max-w-2xl text-[16px] leading-relaxed text-[#c5d2e1]">{s.tagline}</p>
          </Reveal>
          {s.stats && (
            <Reveal delay={1}>
              <div className="mt-9 grid max-w-2xl grid-cols-2 gap-px overflow-hidden rounded-2xl border border-white/15 bg-white/10 sm:grid-cols-4">
                {s.stats.map((st) => (
                  <div key={st.label} className="bg-navy-2/60 p-4">
                    <p className="font-display text-[22px] font-medium tracking-tight text-yellow"><StatValue v={st.value} /></p>
                    <p className="mt-1 text-[11px] leading-snug text-[#a2c1d7]">{st.label}</p>
                  </div>
                ))}
              </div>
            </Reveal>
          )}
          <Reveal delay={1} className="mt-9 flex flex-wrap items-center gap-5">
            <span className="btn-wrap">
              <Link href="/dashboard/rfqs/new" className="btn-white">Request a quote</Link>
            </span>
            <Link href="/contact" className="group inline-flex items-center gap-2.5 text-[14.5px] font-medium text-white/90 hover:text-white">
              Contact a scientist <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </Reveal>
        </div>
      </section>

      {/* sub-services */}
      <section className="bg-paper py-24">
        <div className="container-x">
          <Reveal>
            <p className="eyebrow">{sec.subsEyebrow ?? "Service options"}</p>
            <h2 className="h-section mt-4 max-w-2xl">{sec.subsTitle ?? "Choose the workflow that fits"}</h2>
            <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-body">
              {sec.subsDesc ?? "Not sure which option matches your project? A complimentary technical consultation helps you pick based on sample quality, input and objectives."}
            </p>
          </Reveal>
          <Stagger className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {s.subs.map((sub) => (
              <motion.div key={sub.title} variants={fadeUp} className="card card-hover flex flex-col p-6">
                <h3 className="font-display text-[17px] font-medium tracking-tight text-ink">{sub.title}</h3>
                <p className="mt-2.5 text-[13.5px] leading-relaxed text-body">{sub.desc}</p>
                {sub.points && (
                  <ul className="mt-3.5 flex-1 space-y-2">
                    {sub.points.map((pt) => (
                      <li key={pt} className="flex items-start gap-2 text-[12.5px] leading-relaxed text-body">
                        <CircleCheck className="mt-0.5 size-3.5 shrink-0 text-blue" /> {pt}
                      </li>
                    ))}
                  </ul>
                )}
                {!sub.points && <div className="flex-1" />}
                {sub.note && <p className="mt-4 rounded-lg bg-paper-2/70 px-3 py-2 text-[12px] font-medium text-ink">{sub.note}</p>}
                <Link href="/dashboard/rfqs/new" className="mt-5 inline-flex items-center gap-1.5 text-[13px] font-semibold text-blue hover:text-ink">
                  Request this service <ArrowRight className="size-3.5" />
                </Link>
              </motion.div>
            ))}
          </Stagger>
        </div>
      </section>

      {/* advantages */}
      <section className="border-y border-line bg-paper-2/50 py-24">
        <div className="container-x">
          <Reveal>
            <p className="eyebrow">{sec.featuresEyebrow ?? "The Gateway advantage"}</p>
            <h2 className="h-section mt-4 max-w-2xl">{sec.featuresTitle ?? "Workflow performance & technical excellence"}</h2>
          </Reveal>
          <Stagger className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {s.features.map((f) => (
              <motion.div key={f.title} variants={fadeUp} className="card card-hover p-6">
                <h3 className="text-[15px] font-semibold text-ink">{f.title}</h3>
                <p className="mt-2.5 text-[13px] leading-relaxed text-body">{f.desc}</p>
              </motion.div>
            ))}
          </Stagger>
        </div>
      </section>

      {/* workflow */}
      <section className="bg-paper py-24">
        <div className="container-x">
          <Reveal>
            <p className="eyebrow">{sec.stepsEyebrow ?? "Laboratory workflow & QA"}</p>
            <h2 className="h-section mt-4 max-w-2xl">{sec.stepsTitle ?? "A transparent, five-step process"}</h2>
          </Reveal>
          <div className="relative mt-14">
            <div className="absolute left-[22px] top-0 h-full w-px bg-line lg:left-0 lg:top-[22px] lg:h-px lg:w-full" />
            <Stagger className="grid gap-8 lg:grid-cols-5">
              {s.steps.map((st, i) => {
                const Icon = STEP_ICONS[i % STEP_ICONS.length];
                return (
                  <motion.div key={st.title} variants={fadeUp} className="relative pl-14 lg:pl-0 lg:pt-14">
                    <span className="absolute left-0 top-0 grid size-11 place-items-center rounded-full border-2 border-white bg-navy text-white shadow-lg">
                      <Icon className="size-5" strokeWidth={1.8} />
                    </span>
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-blue">Step {i + 1}</p>
                    <h3 className="mt-1.5 font-display text-[16px] font-medium text-ink">{st.title}</h3>
                    <p className="mt-2 text-[12.5px] leading-relaxed text-body">{st.desc}</p>
                  </motion.div>
                );
              })}
            </Stagger>
          </div>
        </div>
      </section>

      {/* deliverables */}
      <section className="border-y border-line bg-surface py-24">
        <div className="container-x grid gap-12 lg:grid-cols-[0.9fr_1.4fr]">
          <Reveal>
            <p className="eyebrow">Beyond the FASTQ</p>
            <h2 className="h-section mt-4">{s.deliverablesTitle}</h2>
            <p className="mt-4 text-[14.5px] leading-relaxed text-body">{s.deliverablesDesc}</p>
          </Reveal>
          <Reveal delay={1} className="min-w-0">
            <p className="text-[12px] font-semibold uppercase tracking-wider text-muted">Deliverables include</p>
            <div className="mt-4 space-y-3 overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]">
              <MarqueeRow items={s.deliverables.slice(0, Math.ceil(s.deliverables.length / 2))} />
              <MarqueeRow items={s.deliverables.slice(Math.ceil(s.deliverables.length / 2))} reverse />
            </div>
            <p className="mt-3 text-[12px] text-muted">Figures &amp; files delivered with every project — hover to pause</p>
          </Reveal>
        </div>
      </section>

      {/* applications */}
      {s.applications && (
        <section className="bg-paper py-24">
          <div className="container-x">
            <Reveal>
              <p className="eyebrow">Applications</p>
              <h2 className="h-section mt-4 max-w-2xl">Where this service delivers</h2>
            </Reveal>
            <Stagger className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {s.applications.map((a) => (
                <motion.div key={a.title} variants={fadeUp} className="card card-hover p-6">
                  <h3 className="text-[15px] font-semibold text-ink">{a.title}</h3>
                  <p className="mt-2.5 text-[13px] leading-relaxed text-body">{a.desc}</p>
                </motion.div>
              ))}
            </Stagger>
          </div>
        </section>
      )}

      {/* faqs */}
      {s.faqs && (
        <section className="border-t border-line bg-paper-2/50 py-24">
          <div className="container-x grid gap-12 lg:grid-cols-[0.9fr_1.4fr]">
            <Reveal>
              <p className="eyebrow">FAQs</p>
              <h2 className="h-section mt-4">Plan your project</h2>
            </Reveal>
            <Reveal delay={1} className="space-y-3.5">
              <FaqList items={s.faqs} />
            </Reveal>
          </div>
        </section>
      )}

      {/* resources */}
      {s.resources && (
        <section className="border-t border-line bg-surface py-24">
          <div className="container-x">
            <Reveal>
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <p className="eyebrow">Resources &amp; insights</p>
                  <h2 className="h-section mt-4">Go deeper</h2>
                </div>
                <Link href="/resources/documents" className="inline-flex items-center gap-1.5 text-[14px] font-medium text-ink hover:text-blue">
                  More resources <ArrowRight className="size-4" />
                </Link>
              </div>
            </Reveal>
            <Stagger className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {s.resources.map((r) => (
                <motion.div key={r.title} variants={fadeUp}>
                  <Link href="/resources/documents" className="card card-hover group flex h-full flex-col p-6">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-blue">{r.tag}</p>
                    <h3 className="mt-3 flex-1 text-[15px] font-semibold leading-snug text-ink group-hover:text-ink">{r.title}</h3>
                    <p className="mt-2 text-[12.5px] leading-relaxed text-body">{r.desc}</p>
                  </Link>
                </motion.div>
              ))}
            </Stagger>
          </div>
        </section>
      )}

      {/* related services */}
      <section className="bg-paper py-24">
        <div className="container-x">
          <Reveal>
            <p className="eyebrow">{sec.relatedEyebrow ?? "Explore related sequencing solutions"}</p>
            <h2 className="h-section mt-4">{sec.relatedTitle ?? "More from the network"}</h2>
          </Reveal>
          <Stagger className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((r) => (
              <motion.div key={r.href} variants={fadeUp}>
                <Link href={r.href} className="card card-hover group flex items-center justify-between gap-4 p-5">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">{r.eyebrow}</p>
                    <p className="mt-1 text-[14.5px] font-semibold text-ink group-hover:text-ink">{r.title}</p>
                  </div>
                  <ArrowRight className="size-4 shrink-0 text-ink transition-transform group-hover:translate-x-1" />
                </Link>
              </motion.div>
            ))}
          </Stagger>
        </div>
      </section>

      {/* service-specific CTA */}
      {s.ctaTitle && (
        <section className="border-t border-line bg-surface py-20">
          <div className="container-x">
            <Reveal>
              <div className="overflow-hidden rounded-[28px] bg-navy p-9 sm:p-12">
                <div className="grid gap-8 lg:grid-cols-[1.2fr_1fr] lg:items-center">
                  <div>
                    <h2 className="h-section on-dark">{s.ctaTitle}</h2>
                    <p className="mt-4 max-w-xl text-[14.5px] leading-relaxed text-[#c5d2e1]">{s.ctaDesc}</p>
                  </div>
                  <div>
                    <ul className="space-y-3">
                      {s.ctaPoints?.map((p) => (
                        <li key={p} className="flex items-center gap-3 text-[13.5px] text-[#c5d2e1]">
                          <CircleCheck className="size-4.5 shrink-0 text-mint" /> {p}
                        </li>
                      ))}
                    </ul>
                    <span className="btn-wrap mt-7 inline-block">
                      <Link href="/dashboard/rfqs/new" className="btn-white">Request a quote</Link>
                    </span>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </section>
      )}
    </>
  );
}
