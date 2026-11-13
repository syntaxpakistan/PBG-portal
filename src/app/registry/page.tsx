export const instant = false

import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { FlaskConical, MapPin, Cpu, TestTubes, BadgeCheck, Star, Sparkles } from "lucide-react";

export const metadata = { title: "National Facility Registry — Pakistan Biotechnology Gateway" };

const isFeatured = (sub: { plan: string; status: string; expiresAt: Date | null } | null | undefined) =>
  !!sub && sub.status === "ACTIVE" && (sub.plan === "PRO" || sub.plan === "CUSTOM");

export default async function RegistryPage({ searchParams }: { searchParams: Promise<{ q?: string; city?: string; cat?: string }> }) {
  const { q, city, cat } = await searchParams;
  const providers = await prisma.providerProfile.findMany({
    where: { status: "APPROVED" },
    include: {
      user: { select: { name: true, subscription: { select: { plan: true, status: true, expiresAt: true } } } },
      _count: { select: { projects: true, quotes: true, services: { where: { active: true, moderation: "APPROVED" } } } },
      reviews: { select: { rating: true } },
    },
    orderBy: { verifiedAt: "desc" },
  });
  const filtered = providers.filter((p) => {
    const text = `${p.orgName} ${p.city} ${p.platforms} ${p.sampleTypes} ${p.serviceCategories}`.toLowerCase();
    if (q && !text.includes(q.toLowerCase())) return false;
    if (city && !p.city.toLowerCase().includes(city.toLowerCase())) return false;
    if (cat && !p.serviceCategories.toLowerCase().includes(cat.toLowerCase())) return false;
    return true;
  });
  // featured (PRO/CUSTOM partners) rank first
  filtered.sort((a, b) => Number(isFeatured(b.user.subscription)) - Number(isFeatured(a.user.subscription)));
  const cities = [...new Set(providers.map((p) => p.city))];
  const cats = [...new Set(providers.flatMap((p) => p.serviceCategories.split(",").map((c) => c.trim())).filter(Boolean))];

  return (
    <main className="min-h-screen bg-paper">
      <Navbar />
      {/* header */}
      <section className="relative overflow-hidden bg-navy pb-14 pt-32">
        <Image
          src="/media/registry-hero.webp"
          alt=""
          fill
          priority
          sizes="100vw"
          className="pointer-events-none absolute inset-0 object-cover opacity-45"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-navy/70 via-navy/40 to-navy/85" />
        <div className="relative mx-auto max-w-6xl px-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-yellow">National facility registry</p>
          <h1 className="h-display on-dark mt-3 max-w-2xl !text-[2.6rem]">
            Pakistan&apos;s <em className="grad-text">verified sequencing capacity</em>
          </h1>
          <p className="mt-4 max-w-xl text-[14.5px] text-[#c5d2e1]">
            Every facility is reviewed by Syntax before listing. Badges are platform-level
            verification — explicitly non-governmental.
          </p>
          {/* search */}
          <form className="mt-8 flex flex-wrap gap-3">
            <input name="q" defaultValue={q ?? ""} placeholder="Search platforms, sample types, services…"
              className="w-full max-w-sm rounded-full border border-white/20 bg-white/10 px-5 py-3 text-[14px] text-white placeholder-white/50 outline-none focus:border-yellow" />
            <select name="city" defaultValue={city ?? ""} className="rounded-full border border-white/20 bg-white/10 px-4 py-3 text-[14px] text-white outline-none [&>option]:text-navy">
              <option value="">All cities</option>
              {cities.map((c) => <option key={c}>{c}</option>)}
            </select>
            <select name="cat" defaultValue={cat ?? ""} className="rounded-full border border-white/20 bg-white/10 px-4 py-3 text-[14px] text-white outline-none [&>option]:text-navy">
              <option value="">All categories</option>
              {cats.map((c) => <option key={c}>{c}</option>)}
            </select>
            <button type="submit" className="btn-white !py-3">Search</button>
          </form>
        </div>
      </section>

      {/* listing */}
      <section className="mx-auto max-w-6xl px-6 py-14">
        <p className="mb-5 text-[13px] text-muted">{filtered.length} verified facilit{filtered.length === 1 ? "y" : "ies"}</p>
        <div className="grid gap-5 md:grid-cols-2">
          {filtered.map((p) => {
            const avg = p.reviews.length ? p.reviews.reduce((n, r) => n + r.rating, 0) / p.reviews.length : null;
            const featured = isFeatured(p.user.subscription);
            return (
            <Link key={p.id} href={`/registry/${p.id}`} className="card card-hover block p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <span className="grid size-11 place-items-center rounded-xl bg-navy text-yellow">
                    <FlaskConical className="size-5" strokeWidth={1.8} />
                  </span>
                  <div>
                    <h2 className="text-[16px] font-semibold text-ink">{p.orgName}</h2>
                    <p className="flex items-center gap-2 text-[12px] text-muted">
                      <span className="flex items-center gap-1"><MapPin className="size-3" /> {p.city}</span>
                      {avg && <span className="flex items-center gap-0.5 text-(--st-gold)"><Star className="size-3 fill-(--st-gold)" />{avg.toFixed(1)}</span>}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1.5">
                  {featured && (
                    <span className="flex items-center gap-1 rounded-full bg-(--st-amber-bg) px-2.5 py-1 text-[10.5px] font-semibold text-(--st-amber-fg)">
                      <Sparkles className="size-3" /> Featured partner
                    </span>
                  )}
                  <span className="flex items-center gap-1 rounded-full border border-(--st-green-bd) bg-(--st-green-bg) px-2.5 py-1 text-[10.5px] font-semibold text-(--st-green-fg)">
                    <BadgeCheck className="size-3.5" /> Syntax-verified*
                  </span>
                </div>
              </div>
              {p.bio && <p className="mt-4 text-[13px] leading-relaxed text-body">{p.bio}</p>}
              <dl className="mt-4 space-y-2 border-t border-line pt-4 text-[12.5px]">
                <div className="flex gap-2"><dt className="w-28 shrink-0 font-medium text-muted">Platforms</dt><dd className="text-ink">{p.platforms}</dd></div>
                <div className="flex gap-2"><dt className="w-28 shrink-0 font-medium text-muted">Sample types</dt><dd className="text-ink">{p.sampleTypes}</dd></div>
                {p.hpcCapacity && <div className="flex gap-2"><dt className="w-28 shrink-0 font-medium text-muted">HPC</dt><dd className="flex items-center gap-1 text-ink"><Cpu className="size-3.5 text-muted" /> {p.hpcCapacity}</dd></div>}
                <div className="flex gap-2"><dt className="w-28 shrink-0 font-medium text-muted">Track record</dt><dd className="text-ink">{p._count.projects} projects · {p._count.quotes} quotes{p._count.services > 0 ? ` · ${p._count.services} listed services` : ""}</dd></div>
              </dl>
              <div className="mt-4 flex flex-wrap gap-1.5">
                {p.serviceCategories.split(",").map((c) => (
                  <span key={c} className="rounded-full bg-(--st-blue-bg) px-2.5 py-1 text-[11px] font-medium text-(--st-blue-fg)"><TestTubes className="mr-1 inline size-3" />{c.trim()}</span>
                ))}
              </div>
            </Link>
            );
          })}
          {filtered.length === 0 && (
            <div className="card col-span-full p-14 text-center text-[14px] text-muted">No facilities match — widen your filters.</div>
          )}
        </div>
        <p className="mt-8 text-[11.5px] text-muted">
          *Verification is a platform-level review by Syntax of Life — not a government accreditation or license.
        </p>
      </section>
      <Footer />
    </main>
  );
}
