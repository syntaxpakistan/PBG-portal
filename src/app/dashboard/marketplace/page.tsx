export const instant = false

import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";
import { PageHead } from "@/components/portal/ui";
import { pkr } from "@/lib/constants";
import { ServiceGrid, type ServiceCardData } from "@/components/marketplace/service-grid";
import { SuppliesBrowse } from "@/components/marketplace/supplies";

export default async function MarketplacePage({ searchParams }: { searchParams: Promise<{ q?: string; cat?: string; view?: string }> }) {
  const { q, cat, view } = await searchParams;
  const session = await requireRole("CUSTOMER");
  const isServices = view === "services";

  const categories = isServices
    ? (await prisma.serviceListing.findMany({ where: { active: true, moderation: "APPROVED", provider: { status: "APPROVED" } }, select: { category: true }, distinct: ["category"] })).map((s) => s.category)
    : [];

  const services = isServices
    ? await prisma.serviceListing.findMany({
        where: {
          active: true,
          moderation: "APPROVED",
          provider: { status: "APPROVED" },
          ...(cat ? { category: cat } : {}),
          ...(q ? { OR: [{ name: { contains: q } }, { category: { contains: q } }, { platform: { contains: q } }, { provider: { orgName: { contains: q } } }] } : {}),
        },
        include: { provider: { select: { id: true, orgName: true, city: true, reviews: { select: { rating: true } } } } },
        orderBy: { createdAt: "desc" },
      })
    : [];
  const serviceCards: ServiceCardData[] = services.map((s) => ({
    id: s.id,
    name: s.name,
    category: s.category,
    platform: s.platform,
    description: s.description,
    unit: s.unit,
    turnaroundDays: s.turnaroundDays,
    priceLabel: s.priceFrom == null || s.priceVisibility === "QUOTE_ONLY" ? "Request a quote" : `${pkr(s.priceFrom)}${s.unit ? ` ${s.unit}` : ""}`,
    provider: {
      id: s.provider.id,
      orgName: s.provider.orgName,
      city: s.provider.city,
      rating: s.provider.reviews.length ? s.provider.reviews.reduce((n, r) => n + r.rating, 0) / s.provider.reviews.length : null,
    },
  }));

  return (
    <>
      <PageHead title="Marketplace" sub="Lab services from verified providers + indigenous supplies. Compare labs side-by-side — quotes arrive sealed." />

      {/* view tabs */}
      <div className="mb-6 inline-flex rounded-full border border-line bg-surface p-1">
        <Link href="/dashboard/marketplace?view=services" className={`rounded-full px-5 py-2 text-[12.5px] font-medium transition-colors ${isServices ? "bg-ink text-paper" : "text-body hover:text-ink"}`}>Lab services</Link>
        <Link href="/dashboard/marketplace" className={`rounded-full px-5 py-2 text-[12.5px] font-medium transition-colors ${!isServices ? "bg-ink text-paper" : "text-body hover:text-ink"}`}>Supplies</Link>
      </div>

      {isServices ? (
        <>
          <form className="mb-3">
            <input type="hidden" name="view" value="services" />
            {cat && <input type="hidden" name="cat" value={cat} />}
            <input name="q" defaultValue={q ?? ""} placeholder="Search services, platforms or facilities…" className="w-full max-w-md rounded-full border border-line bg-surface px-5 py-2.5 text-[13.5px] outline-none focus:border-navy-3" />
          </form>
          <div className="mb-6 flex flex-wrap gap-2">
            <Link href={`/dashboard/marketplace?view=services${q ? `&q=${encodeURIComponent(q)}` : ""}`} className={`rounded-full px-3.5 py-1.5 text-[12px] font-medium ${!cat ? "bg-ink text-paper" : "border border-line text-body hover:bg-paper-2"}`}>All</Link>
            {categories.map((c) => (
              <Link key={c} href={`/dashboard/marketplace?view=services&cat=${encodeURIComponent(c)}${q ? `&q=${encodeURIComponent(q)}` : ""}`} className={`rounded-full px-3.5 py-1.5 text-[12px] font-medium ${cat === c ? "bg-ink text-paper" : "border border-line text-body hover:bg-paper-2"}`}>
                {c}
              </Link>
            ))}
          </div>
          <div className="pb-24">
            <ServiceGrid services={serviceCards} mode="customer" />
            <p className="mt-6 text-[11.5px] text-muted">Tick <b>Compare</b> on services to send one request to several labs — quotes arrive sealed. Starting prices are indicative; final pricing is quoted per-RFQ.</p>
          </div>
        </>
      ) : (
        <SuppliesBrowse q={q} cat={cat} buyerId={session.user.id} basePath="/dashboard/marketplace" />
      )}
    </>
  );
}
