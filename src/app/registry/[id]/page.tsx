export const instant = false

import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { FlaskConical, MapPin, Cpu, BadgeCheck, Star, Globe, UserRound, Award, ArrowLeft } from "lucide-react";
import { pkr } from "@/lib/constants";
import { getSession } from "@/lib/session";

export default async function ProviderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSession();
  const isCustomer = (session?.user as { role?: string } | undefined)?.role === "CUSTOMER";
  const p = await prisma.providerProfile.findUnique({
    where: { id },
    include: {
      services: { where: { active: true, moderation: "APPROVED" }, orderBy: { createdAt: "asc" } },
      reviews: { include: { customer: { select: { name: true } } }, orderBy: { createdAt: "desc" }, take: 10 },
      _count: { select: { projects: true, quotes: true } },
    },
  });
  if (!p || p.status !== "APPROVED") notFound();

  const avg = p.reviews.length ? p.reviews.reduce((n, r) => n + r.rating, 0) / p.reviews.length : null;

  return (
    <main className="min-h-screen bg-paper">
      <Navbar />
      <section className="bg-navy pb-12 pt-32">
        <div className="mx-auto max-w-5xl px-6">
          <Link href="/registry" className="inline-flex items-center gap-1.5 text-[12.5px] text-[#9fb9cd] hover:text-white">
            <ArrowLeft className="size-3.5" /> National registry
          </Link>
          <div className="mt-5 flex flex-wrap items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <span className="grid size-14 place-items-center rounded-2xl bg-white/10 text-yellow">
                <FlaskConical className="size-7" strokeWidth={1.6} />
              </span>
              <div>
                <h1 className="h-display on-dark !text-[2rem]">{p.orgName}</h1>
                <p className="mt-1 flex items-center gap-3 text-[13px] text-[#9fb9cd]">
                  <span className="font-mono font-semibold">{p.orgNo}</span>
                  <span className="flex items-center gap-1"><MapPin className="size-3.5" />{p.city}</span>
                  {p.establishedYear && <span>· est. {p.establishedYear}</span>}
                  {avg && <span className="flex items-center gap-1 text-yellow"><Star className="size-3.5 fill-yellow" />{avg.toFixed(1)} ({p.reviews.length})</span>}
                </p>
              </div>
            </div>
            <span className="flex items-center gap-1.5 rounded-full border border-(--st-green-bd)/40 bg-(--st-green-bg)/10 px-3 py-1.5 text-[11.5px] font-semibold text-[#a9e5cb]">
              <BadgeCheck className="size-4" /> Syntax-verified*
            </span>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 py-10">
        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          <div className="space-y-6">
            {p.bio && (
              <div className="card p-6">
                <h2 className="text-[15px] font-semibold text-ink">About</h2>
                <p className="mt-2 text-[13.5px] leading-relaxed text-body">{p.bio}</p>
              </div>
            )}

            {/* service catalog */}
            <div className="card overflow-hidden">
              <div className="border-b border-line px-6 py-4">
                <h2 className="text-[15px] font-semibold text-ink">Service catalog</h2>
                <p className="text-[12px] text-muted">Listed services &amp; starting prices — final quotes are submitted per-RFQ</p>
              </div>
              <div className="divide-y divide-line">
                {p.services.length === 0 && <p className="px-6 py-8 text-center text-[13px] text-muted">This facility hasn&apos;t listed fixed services yet — submit an RFQ for a custom quote.</p>}
                {p.services.map((s) => (
                  <div key={s.id} className="flex flex-wrap items-center justify-between gap-3 px-6 py-4">
                    <div className="min-w-0">
                      <div className="text-[14px] font-medium text-ink">{s.name}</div>
                      <div className="mt-0.5 text-[12px] text-muted">
                        {s.category}{s.platform ? ` · ${s.platform}` : ""}{s.turnaroundDays ? ` · ~${s.turnaroundDays}d` : ""}
                      </div>
                      {s.description && <p className="mt-1.5 text-[12.5px] leading-relaxed text-body">{s.description}</p>}
                    </div>
                    {s.priceFrom != null && s.priceVisibility !== "QUOTE_ONLY" && (s.priceVisibility === "PUBLIC" || isCustomer) ? (
                      <div className="text-right">
                        <div className="text-[11px] text-muted">from</div>
                        <div className="font-display text-[17px] font-medium text-ink">{pkr(s.priceFrom)}</div>
                        {s.unit && <div className="text-[10.5px] text-muted">{s.unit}</div>}
                      </div>
                    ) : (
                      <div className="text-right text-[11.5px] text-muted">
                        {s.priceVisibility === "MEMBERS" && s.priceFrom != null && !isCustomer ? "Members-only price" : "Quote on request"}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* reviews */}
            {p.reviews.length > 0 && (
              <div className="card overflow-hidden">
                <div className="border-b border-line px-6 py-4">
                  <h2 className="text-[15px] font-semibold text-ink">Customer reviews</h2>
                </div>
                <div className="divide-y divide-line">
                  {p.reviews.map((r) => (
                    <div key={r.id} className="px-6 py-4">
                      <div className="flex items-center justify-between">
                        <span className="text-[13px] font-medium text-ink">{r.customer.name}</span>
                        <span className="flex gap-0.5">
                          {Array.from({ length: 5 }, (_, i) => (
                            <Star key={i} className={`size-3.5 ${i < r.rating ? "fill-yellow text-yellow" : "text-line-strong"}`} />
                          ))}
                        </span>
                      </div>
                      {r.comment && <p className="mt-1.5 text-[12.5px] leading-relaxed text-body">{r.comment}</p>}
                      <div className="mt-1 text-[11px] text-muted">{r.createdAt.toLocaleDateString()}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* capability sidebar */}
          <div className="space-y-5">
            <div className="card p-5">
              <h3 className="text-[14px] font-semibold text-ink">Capabilities</h3>
              <dl className="mt-3 space-y-2.5 text-[12.5px]">
                <div><dt className="text-muted">Platforms</dt><dd className="mt-0.5 font-medium text-ink">{p.platforms}</dd></div>
                <div><dt className="text-muted">Sample types</dt><dd className="mt-0.5 font-medium text-ink">{p.sampleTypes}</dd></div>
                <div><dt className="text-muted">Service categories</dt><dd className="mt-0.5 font-medium text-ink">{p.serviceCategories}</dd></div>
                {p.hpcCapacity && <div><dt className="text-muted">HPC capacity</dt><dd className="mt-0.5 flex items-center gap-1 font-medium text-ink"><Cpu className="size-3.5" />{p.hpcCapacity}</dd></div>}
                {p.accreditations && <div><dt className="text-muted">Accreditations</dt><dd className="mt-0.5 flex items-center gap-1 font-medium text-ink"><Award className="size-3.5" />{p.accreditations}</dd></div>}
                <div><dt className="text-muted">Track record</dt><dd className="mt-0.5 font-medium text-ink">{p._count.projects} projects · {p._count.quotes} quotes</dd></div>
              </dl>
            </div>
            <div className="card p-5">
              <h3 className="text-[14px] font-semibold text-ink">Contact</h3>
              <dl className="mt-3 space-y-2.5 text-[12.5px]">
                {p.contactPerson && <div className="flex items-center gap-2"><UserRound className="size-3.5 text-muted" /><span className="text-ink">{p.contactPerson}</span></div>}
                {p.website && <div className="flex items-center gap-2"><Globe className="size-3.5 text-muted" /><a href={p.website} target="_blank" rel="noreferrer" className="text-(--st-blue-fg) hover:underline">{p.website.replace(/^https?:\/\//, "")}</a></div>}
                <div className="border-t border-line pt-3 text-[11.5px] text-muted">
                  To engage this facility, submit an RFQ — verified providers quote blind and you compare offers side-by-side.
                </div>
              </dl>
              <Link href="/dashboard/rfqs/new" className="btn-primary mt-4 w-full justify-center !py-2.5 text-[13px]">Submit an RFQ →</Link>
            </div>
          </div>
        </div>
        <p className="mt-8 text-[11.5px] text-muted">
          *Verification is a platform-level review by Syntax of Life — not a government accreditation or license.
        </p>
      </section>
      <Footer />
    </main>
  );
}
