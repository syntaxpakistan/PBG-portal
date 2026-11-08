import { prisma } from "@/lib/prisma";
import { StatusBadge } from "@/components/portal/ui";
import { pkr } from "@/lib/constants";
import { EnquiryForm } from "./enquiry-form";

// supplies browse — shared by customers (/dashboard/marketplace) and providers (/lab/supplies)
export async function SuppliesBrowse({ q, cat, buyerId, basePath }: { q?: string; cat?: string; buyerId: string; basePath: string }) {
  const products = await prisma.product.findMany({
    where: {
      active: true,
      ...(cat ? { category: cat } : {}),
      ...(q ? { OR: [{ name: { contains: q } }, { category: { contains: q } }, { supplier: { orgName: { contains: q } } }] } : {}),
    },
    include: { supplier: { select: { orgName: true, city: true, status: true } } },
    orderBy: { createdAt: "desc" },
  });
  const categories = (await prisma.product.findMany({ where: { active: true }, select: { category: true }, distinct: ["category"] })).map((p) => p.category);
  const myEnquiries = await prisma.enquiry.findMany({
    where: { buyerId },
    include: { product: { select: { name: true } }, supplier: { select: { orgName: true } } },
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  return (
    <>
      {myEnquiries.length > 0 && (
        <div className="card mb-6 overflow-hidden">
          <div className="border-b border-line px-5 py-3.5"><h2 className="text-[14px] font-semibold text-ink">Your enquiries</h2></div>
          <div className="divide-y divide-line">
            {myEnquiries.map((e) => (
              <div key={e.id} className="px-5 py-3.5">
                <div className="flex items-center justify-between">
                  <div className="text-[13px] font-medium text-ink">{e.product.name} × {e.qty} <span className="font-normal text-muted">· {e.supplier.orgName} · sent {e.createdAt.toLocaleDateString()}</span></div>
                  <StatusBadge status={e.status} />
                </div>
                {e.message && e.message !== "—" && <p className="mt-1 text-[12px] text-muted">You: &ldquo;{e.message}&rdquo;</p>}
                {e.status === "QUOTED" && (
                  <div className="mt-2 rounded-lg bg-(--st-blue-bg) px-3.5 py-2.5 text-[12.5px] text-(--st-blue-fg)">
                    Offer: {e.quotedPrice != null ? `${pkr(e.quotedPrice)}` : "price on request"}
                    {e.leadTimeDays != null && ` · ${e.leadTimeDays}d lead time`}
                    {e.reply && <span className="block mt-1 text-(--st-blue-fg)">{e.reply}</span>}
                  </div>
                )}
                {e.status === "FULFILLED" && (
                  <div className="mt-2 rounded-lg bg-(--st-green-bg) px-3.5 py-2.5 text-[12.5px] text-(--st-green-fg)">
                    Delivered{e.quotedPrice != null ? ` — ${pkr(e.quotedPrice)}` : ""}.
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
      <form className="mb-3" action={basePath}>
        {cat && <input type="hidden" name="cat" value={cat} />}
        <input name="q" defaultValue={q ?? ""} placeholder="Search products, categories or suppliers…" className="w-full max-w-md rounded-full border border-line bg-surface px-5 py-2.5 text-[13.5px] outline-none focus:border-navy-3" />
      </form>
      <div className="mb-6 flex flex-wrap gap-2">
        <a href={q ? `${basePath}?q=${encodeURIComponent(q)}` : basePath} className={`rounded-full px-3.5 py-1.5 text-[12px] font-medium ${!cat ? "bg-ink text-paper" : "border border-line text-body hover:bg-paper-2"}`}>All</a>
        {categories.map((c) => (
          <a key={c} href={`${basePath}?cat=${encodeURIComponent(c)}${q ? `&q=${encodeURIComponent(q)}` : ""}`} className={`rounded-full px-3.5 py-1.5 text-[12px] font-medium ${cat === c ? "bg-ink text-paper" : "border border-line text-body hover:bg-paper-2"}`}>
            {c}
          </a>
        ))}
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {products.map((p) => (
          <div key={p.id} className="card card-hover p-5">
            <div className="flex items-start justify-between">
              <span className="rounded-full bg-(--st-blue-bg) px-2.5 py-0.5 text-[10.5px] font-medium text-(--st-blue-fg)">{p.category}</span>
              <StatusBadge status={p.stockStatus} />
            </div>
            <h3 className="mt-3 text-[15px] font-semibold text-ink">{p.name}</h3>
            {p.spec && <p className="mt-1 text-[12px] text-body">{p.spec}</p>}
            <div className="mt-2 flex items-center justify-between">
              {p.price != null ? <span className="font-display text-[15px] font-medium text-ink">{pkr(p.price)}{p.unit ? `/${p.unit}` : ""}</span> : <span className="text-[12px] text-muted">Price on enquiry</span>}
              <span className="text-[11px] text-muted">{p.catalogNo && `#${p.catalogNo} · `}{p.leadTimeDays ? `${p.leadTimeDays}d lead` : ""}</span>
            </div>
            <p className="mt-2 text-[11.5px] text-muted">{p.supplier.orgName} · {p.supplier.city} · <span className="text-green">Syntax-verified*</span></p>
            <EnquiryForm productId={p.id} />
          </div>
        ))}
        {products.length === 0 && <p className="col-span-full py-12 text-center text-[13px] text-muted">No products match.</p>}
      </div>
      <p className="mt-6 text-[11px] text-muted">*Verification is a platform-level review by Syntax — not a government accreditation.</p>
    </>
  );
}
