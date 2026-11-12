export const instant = false

import Link from "next/link";
import { notFound } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { ArrowRight, ArrowLeft, CircleCheck } from "lucide-react";
import { PANELS, panelBySlug } from "../data";

export function generateStaticParams() {
  return PANELS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const panel = panelBySlug(slug);
  if (!panel) return {};
  return {
    title: `${panel.title} — Pakistan Biotechnology Gateway`,
    description: panel.intro,
  };
}

export default async function ServiceCategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const panel = panelBySlug(slug);
  if (!panel) notFound();

  const others = PANELS.filter((p) => p.slug !== slug);

  return (
    <main className="min-h-screen bg-paper">
      <Navbar />

      {/* hero */}
      <section className="relative overflow-hidden bg-navy pb-16 pt-36 sm:pt-40">
        <div className="grid-lines on-dark absolute inset-0" />
        <div className="glow-orb left-[-120px] top-[-80px] size-[380px] bg-mint/15" />
        <div className="container-x relative">
          <div className="max-w-3xl">
            <Link href="/services" className="inline-flex items-center gap-1.5 text-[13px] font-medium text-[#9fb9cd] transition-colors hover:text-white">
              <ArrowLeft className="size-3.5" /> All services
            </Link>
            <h1 className="h-display on-dark mt-5 !text-[2.4rem] sm:!text-[3rem]">{panel.title}</h1>
            <p className="mt-5 max-w-2xl text-[15.5px] leading-relaxed text-[#c5d2e1]">{panel.intro}</p>
            <div className="mt-8 flex flex-wrap gap-4">
              <span className="btn-wrap">
                <Link href="/biogateway" className="btn-white">Request a quote</Link>
              </span>
              <Link href="/registry" className="group inline-flex items-center gap-2 text-[14px] font-medium text-white/90 hover:text-white">
                Find a provider <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* sub-services — full detail */}
      <section className="bg-paper py-16 sm:py-20">
        <div className="container-x max-w-5xl space-y-6">
          {panel.items.map((s, i) => (
            <article key={s.name} className="card p-7 sm:p-8">
              <div className="flex items-start gap-4">
                <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-navy text-yellow">
                  <s.icon className="size-5" />
                </span>
                <div className="min-w-0">
                  <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-muted">{String(i + 1).padStart(2, "0")}</p>
                  <h2 className="mt-1 font-display text-[20px] font-semibold text-ink">{s.name}</h2>
                </div>
              </div>
              <p className="mt-5 text-[14.5px] leading-relaxed text-body">{s.detail}</p>
              <div className="mt-5 flex flex-wrap gap-1.5">
                {s.tags.map((t) => (
                  <span key={t} className="rounded-full border border-blue/30 bg-(--st-blue-bg) px-2.5 py-0.5 text-[11px] font-medium text-(--st-blue-fg)">
                    {t}
                  </span>
                ))}
              </div>
              <div className="mt-6 grid gap-6 border-t border-line pt-6 sm:grid-cols-2">
                <div>
                  <p className="text-[11.5px] font-semibold uppercase tracking-[0.1em] text-muted">What the lab needs</p>
                  <ul className="mt-3 space-y-2">
                    {s.inputs.map((x) => (
                      <li key={x} className="flex items-start gap-2.5 text-[12.5px] leading-snug text-body">
                        <CircleCheck className="mt-0.5 size-4 shrink-0 text-(--st-green-fg)" /> {x}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-[11.5px] font-semibold uppercase tracking-[0.1em] text-muted">What you get back</p>
                  <ul className="mt-3 space-y-2">
                    {s.deliverables.map((x) => (
                      <li key={x} className="flex items-start gap-2.5 text-[12.5px] leading-snug text-body">
                        <CircleCheck className="mt-0.5 size-4 shrink-0 text-(--st-green-fg)" /> {x}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* cta + other categories */}
      <section className="bg-paper-2 py-16">
        <div className="container-x max-w-5xl">
          <div className="card-dark flex flex-col items-start justify-between gap-5 p-8 sm:flex-row sm:items-center">
            <div>
              <h2 className="font-display text-[20px] font-semibold text-white">Ready to post your request?</h2>
              <p className="mt-1.5 text-[13px] text-[#a2c1d7]">Verified labs quote independently — compare price, turnaround and scope side by side.</p>
            </div>
            <Link href="/biogateway" className="btn-white shrink-0">Request a quote</Link>
          </div>
          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            {others.map((o) => (
              <Link key={o.slug} href={`/services/${o.slug}`} className="card card-hover group flex items-center justify-between gap-4 p-5">
                <div>
                  <p className="text-[14.5px] font-semibold text-ink">{o.title}</p>
                  <p className="mt-0.5 text-[12px] text-muted">{o.items.length} services</p>
                </div>
                <ArrowRight className="size-4 shrink-0 text-muted transition-transform group-hover:translate-x-1" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
