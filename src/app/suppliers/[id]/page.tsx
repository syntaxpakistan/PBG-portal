export const instant = false

import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { BadgeCheck, MapPin, Globe, Boxes, FileText, ExternalLink } from "lucide-react";
import { ProductImage } from "@/components/marketplace/product-image";
import { pkr } from "@/lib/constants";

export default async function SupplierStorefrontPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supplier = await prisma.supplierProfile.findUnique({
    where: { id },
    include: {
      products: {
        where: { active: true, moderation: "APPROVED" },
        orderBy: { createdAt: "desc" },
      },
    },
  });
  if (!supplier || supplier.status !== "APPROVED") notFound();

  return (
    <main className="min-h-screen bg-paper">
      <Navbar />
      <section className="relative overflow-hidden bg-navy pb-12 pt-32">
        <div className="grid-lines on-dark absolute inset-0" />
        <div className="relative mx-auto max-w-6xl px-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-yellow">Verified supplier</p>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <h1 className="h-display on-dark !text-[2.4rem]">{supplier.orgName}</h1>
            <span className="flex items-center gap-1.5 rounded-full border border-(--st-green-bd) bg-(--st-green-bg) px-3 py-1.5 text-[11.5px] font-semibold text-(--st-green-fg)">
              <BadgeCheck className="size-4" /> Gateway-verified*
            </span>
          </div>
          <p className="mt-3 flex flex-wrap items-center gap-4 text-[13.5px] text-[#9fb9cd]">
            <span className="font-mono font-semibold">{supplier.orgNo}</span>
            <span className="flex items-center gap-1"><MapPin className="size-3.5" /> {supplier.city}</span>
            {supplier.website && (
              <a href={supplier.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-yellow hover:underline">
                <Globe className="size-3.5" /> Website <ExternalLink className="size-3" />
              </a>
            )}
          </p>
          <div className="mt-4 flex flex-wrap gap-1.5">
            {supplier.categories.split(",").map((c) => (
              <span key={c} className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11.5px] text-white/90">{c.trim()}</span>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-12">
        {supplier.bio && <p className="mb-8 max-w-3xl text-[14px] leading-relaxed text-body">{supplier.bio}</p>}

        <h2 className="mb-5 flex items-center gap-2 text-[16px] font-semibold text-ink">
          <Boxes className="size-5 text-blue" /> Catalogue <span className="text-[12.5px] font-normal text-muted">({supplier.products.length} products)</span>
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {supplier.products.map((p) => (
            <div key={p.id} className="card card-hover flex flex-col p-5">
              {p.imageKey && <div className="mb-3"><ProductImage imageKey={p.imageKey} alt={p.name} /></div>}
              <div className="flex items-start justify-between">
                <span className="rounded-full bg-(--st-blue-bg) px-2.5 py-0.5 text-[10.5px] font-medium text-(--st-blue-fg)">{p.category}</span>
                <span className="font-mono text-[10.5px] text-muted">{p.prodNo}</span>
              </div>
              <h3 className="mt-3 text-[15px] font-semibold text-ink">{p.name}</h3>
              {p.brand && <p className="mt-0.5 text-[11.5px] text-muted">{p.brand}{p.catalogNo ? ` · #${p.catalogNo}` : ""}</p>}
              {p.spec && <p className="mt-1 text-[12px] text-body">{p.spec}</p>}
              {p.description && <p className="mt-1.5 line-clamp-3 text-[12px] leading-relaxed text-body">{p.description}</p>}
              <div className="mt-auto pt-3">
                <div className="flex items-center justify-between">
                  {p.price != null ? <span className="font-display text-[15px] font-medium text-ink">{pkr(p.price)}{p.unit ? `/${p.unit}` : ""}</span> : <span className="text-[12px] text-muted">Price on enquiry</span>}
                  <span className="text-[11px] text-muted">{p.leadTimeDays ? `${p.leadTimeDays}d lead` : ""}</span>
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <Link href="/login" className="btn-outline flex-1 justify-center !py-2 text-[12.5px]">Sign in to enquire</Link>
                  {p.datasheetKey && (
                    <a href={`/api/files/${p.datasheetKey}?inline=1`} target="_blank" rel="noopener noreferrer" title="View datasheet"
                      className="rounded-full border border-line p-2 text-muted hover:bg-paper-2 hover:text-ink">
                      <FileText className="size-4" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
          {supplier.products.length === 0 && (
            <p className="col-span-full py-12 text-center text-[13px] text-muted">This supplier hasn&rsquo;t listed products yet.</p>
          )}
        </div>
        <p className="mt-8 text-[11.5px] text-muted">
          *Verification is a platform-level review by the Gateway team — not a government accreditation or license.
          Ordering is enquiry-based — sign in as an approved customer or lab to send an enquiry.
        </p>
      </section>
      <Footer />
    </main>
  );
}
