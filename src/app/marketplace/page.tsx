export const instant = false

import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { ServiceGrid, type ServiceCardData } from "@/components/marketplace/service-grid";
import { BadgeCheck, FlaskConical, Boxes, Search } from "lucide-react";
import { pkr } from "@/lib/constants";

export const metadata = {
  title: "Marketplace — Pakistan Biotechnology Gateway",
  description: "Browse sequencing & bioinformatics services and indigenous lab supplies from Syntax-verified providers.",
};

function priceLabel(vis: string, priceFrom: number | null, unit: string | null, isCustomer: boolean): string {
  if (priceFrom == null || vis === "QUOTE_ONLY") return "Request a quote";
  if (vis === "MEMBERS" && !isCustomer) return "Members-only price";
  return `${pkr(priceFrom)}${unit ? ` ${unit}` : ""}`;
}

export default async function MarketplacePage({ searchParams }: { searchParams: Promise<{ tab?: string; q?: string; cat?: string }> }) {
  const { tab, q, cat } = await searchParams;
  const session = await getSession();
  const role = (session?.user as { role?: string } | undefined)?.role;
  const isCustomer = role === "CUSTOMER";
  const view = tab === "supplies" ? "supplies" : "services";

  const services = view === "services"
    ? await prisma.serviceListing.findMany({
        where: {
          active: true,
          moderation: "APPROVED",
          provider: { status: "APPROVED" },
          ...(cat ? { category: cat } : {}),
          ...(q ? { OR: [{ name: { contains: q } }, { category: { contains: q } }, { platform: { contains: q } }, { provider: { orgName: { contains: q } } }] } : {}),
        },
        include: {
          provider: { select: { id: true, orgName: true, city: true, reviews: { select: { rating: true } } } },
        },
        orderBy: { createdAt: "desc" },
      })
    : [];

  const cards: ServiceCardData[] = services.map((s) => ({
    id: s.id,
    name: s.name,
    category: s.category,
    platform: s.platform,
    description: s.description,
    unit: s.unit,
    turnaroundDays: s.turnaroundDays,
    priceLabel: priceLabel(s.priceVisibility, s.priceFrom, s.unit, isCustomer),
    provider: {
      id: s.provider.id,
      orgName: s.provider.orgName,
      city: s.provider.city,
      rating: s.provider.reviews.length ? s.provider.reviews.reduce((n, r) => n + r.rating, 0) / s.provider.reviews.length : null,
    },
  }));

  const categories = view === "services"
    ? (await prisma.serviceListing.findMany({ where: { active: true, moderation: "APPROVED", provider: { status: "APPROVED" } }, select: { category: true }, distinct: ["category"] })).map((s) => s.category)
    : [];

  const products = view === "supplies"
    ? await prisma.product.findMany({
        where: {
          active: true,
          supplier: { status: "APPROVED" },
          ...(cat ? { category: cat } : {}),
          ...(q ? { OR: [{ name: { contains: q } }, { category: { contains: q } }, { supplier: { orgName: { contains: q } } }] } : {}),
        },
        include: { supplier: { select: { orgName: true, city: true } } },
        orderBy: { createdAt: "desc" },
        take: 60,
      })
    : [];
  const productCats = view === "supplies"
    ? (await prisma.product.findMany({ where: { active: true, supplier: { status: "APPROVED" } }, select: { category: true }, distinct: ["category"] })).map((p) => p.category)
    : [];

  const chips = view === "services" ? categories : productCats;
  const hrefFor = (t: string, c?: string) =>
    `/marketplace?tab=${t}${c ? `&cat=${encodeURIComponent(c)}` : ""}${q ? `&q=${encodeURIComponent(q)}` : ""}`;

  return (
    <main className="min-h-screen bg-paper">
      <Navbar />
      <section className="relative overflow-hidden bg-navy pb-12 pt-32">
        <Image
          src="/media/marketplace-hero.webp"
          alt=""
          fill
          priority
          sizes="100vw"
          className="pointer-events-none absolute inset-0 object-cover opacity-45"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-navy/70 via-navy/40 to-navy/85" />
        <div className="relative mx-auto max-w-6xl px-4 sm:px-6">
          <h1 className="h-display on-dark !text-[2.4rem]">Marketplace</h1>
          <p className="mt-2 max-w-2xl text-[14px] leading-relaxed text-[#9fb9cd]">
            Browse services from Syntax-verified laboratories and supplies from indigenous vendors.
            Request quotes from one facility — or compare several at once; every quote arrives sealed.
          </p>
          {/* tab switch */}
          <div className="mt-7 inline-flex rounded-full border border-white/15 bg-white/5 p-1">
            <Link href={hrefFor("services")} className={`flex items-center gap-2 rounded-full px-5 py-2 text-[13px] font-medium transition-colors ${view === "services" ? "bg-white text-navy" : "text-white/70 hover:text-white"}`}>
              <FlaskConical className="size-4" /> Lab services
            </Link>
            <Link href={hrefFor("supplies")} className={`flex items-center gap-2 rounded-full px-5 py-2 text-[13px] font-medium transition-colors ${view === "supplies" ? "bg-white text-navy" : "text-white/70 hover:text-white"}`}>
              <Boxes className="size-4" /> Supplies
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        {/* search + category chips */}
        <form className="mb-4 flex items-center gap-2">
          <input type="hidden" name="tab" value={view} />
          {cat && <input type="hidden" name="cat" value={cat} />}
          <div className="relative w-full max-w-md">
            <Search className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted" />
            <input name="q" defaultValue={q ?? ""} placeholder={view === "services" ? "Search services, platforms or facilities…" : "Search products, categories or suppliers…"} className="w-full rounded-full border border-line bg-surface py-2.5 pl-11 pr-5 text-[13.5px] text-ink outline-none focus:border-navy-3" />
          </div>
        </form>
        <div className="mb-8 flex flex-wrap gap-2">
          <Link href={hrefFor(view)} className={`rounded-full px-3.5 py-1.5 text-[12px] font-medium ${!cat ? "bg-ink text-paper" : "border border-line text-body hover:bg-paper-2"}`}>All</Link>
          {chips.map((c) => (
            <Link key={c} href={hrefFor(view, c)} className={`rounded-full px-3.5 py-1.5 text-[12px] font-medium ${cat === c ? "bg-ink text-paper" : "border border-line text-body hover:bg-paper-2"}`}>{c}</Link>
          ))}
        </div>

        {view === "services" ? (
          <>
            <ServiceGrid services={cards} mode={isCustomer ? "customer" : "public"} />
            <p className="mt-8 text-[11.5px] text-muted">
              Prices are starting rates set by each facility — final pricing is quoted per-RFQ and arrives sealed.
              Sign in to compare services side-by-side and send one request to multiple labs.
            </p>
          </>
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {products.map((p) => (
                <div key={p.id} className="card card-hover p-5">
                  <div className="flex items-start justify-between">
                    <span className="rounded-full bg-(--st-blue-bg) px-2.5 py-0.5 text-[10.5px] font-medium text-(--st-blue-fg)">{p.category}</span>
                  </div>
                  <h3 className="mt-3 text-[15px] font-semibold text-ink">{p.name}</h3>
                  {p.spec && <p className="mt-1 line-clamp-2 text-[12px] text-body">{p.spec}</p>}
                  <div className="mt-2 flex items-center justify-between">
                    {p.price != null ? <span className="font-display text-[15px] font-medium text-ink">{pkr(p.price)}{p.unit ? `/${p.unit}` : ""}</span> : <span className="text-[12px] text-muted">Price on enquiry</span>}
                    <span className="text-[11px] text-muted">{p.leadTimeDays ? `${p.leadTimeDays}d lead` : ""}</span>
                  </div>
                  <p className="mt-2 flex items-center gap-1.5 text-[11.5px] text-muted"><BadgeCheck className="size-3.5 text-green" />{p.supplier.orgName} · {p.supplier.city}</p>
                  <Link href="/login" className="btn-outline mt-3.5 w-full justify-center !py-2 text-[12.5px]">Sign in to enquire →</Link>
                </div>
              ))}
              {products.length === 0 && <p className="col-span-full py-12 text-center text-[13px] text-muted">No supplies match your filters.</p>}
            </div>
            <p className="mt-8 text-[11.5px] text-muted">Ordering is enquiry-based — sign in to contact suppliers directly.</p>
          </>
        )}
      </section>
      <Footer />
    </main>
  );
}
