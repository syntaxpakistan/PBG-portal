export const instant = false

import { prisma } from "@/lib/prisma";
import { PageHead, StatusBadge } from "@/components/portal/ui";
import { Pagination, PAGE_SIZE } from "@/components/portal/pagination";
import { pkr } from "@/lib/constants";
import { ProductToggle } from "./toggle";
import { EnquiryMod } from "./enquiry-mod";

export default async function AdminMarketplacePage({ searchParams }: { searchParams: Promise<{ pp?: string; ep?: string }> }) {
  const sp = await searchParams;
  const pp = Math.max(1, Number(sp.pp ?? 1) || 1);
  const ep = Math.max(1, Number(sp.ep ?? 1) || 1);
  const [products, prodTotal, enquiries, enqTotal] = await Promise.all([
    prisma.product.findMany({
      include: { supplier: { select: { orgName: true, city: true } }, _count: { select: { enquiries: true } } },
      orderBy: { createdAt: "desc" },
      skip: (pp - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.product.count(),
    prisma.enquiry.findMany({
      include: { product: { select: { name: true } }, supplier: { select: { orgName: true } }, buyer: { select: { name: true, email: true } } },
      orderBy: { createdAt: "desc" },
      skip: (ep - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.enquiry.count(),
  ]);

  return (
    <>
      <PageHead title="Marketplace moderation" sub="Delist or re-activate supplier products. Only active listings appear to customers." />
      <div className="card overflow-hidden">
        <div className="overflow-x-auto"><table className="w-full min-w-[760px] text-left text-[13px]">
          <thead className="border-b border-line bg-paper-2 text-[11px] uppercase tracking-wider text-muted">
            <tr>
              <th className="px-5 py-3 font-semibold">Product</th>
              <th className="px-5 py-3 font-semibold">Supplier</th>
              <th className="px-5 py-3 font-semibold">Price</th>
              <th className="px-5 py-3 font-semibold">Enquiries</th>
              <th className="px-5 py-3 font-semibold">Status</th>
              <th className="px-5 py-3 font-semibold"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {products.map((p) => (
              <tr key={p.id} className={p.active ? "hover:bg-paper-2/60" : "bg-paper-2/40 opacity-70"}>
                <td className="px-5 py-3">
                  <div className="font-medium text-ink">{p.name}</div>
                  <div className="text-[11px] text-muted">{p.category}{p.spec ? ` · ${p.spec}` : ""}</div>
                </td>
                <td className="px-5 py-3 text-body">{p.supplier.orgName} · {p.supplier.city}</td>
                <td className="px-5 py-3 text-ink">{p.price != null ? pkr(p.price) : "—"}{p.unit ? `/${p.unit}` : ""}</td>
                <td className="px-5 py-3 text-body">{p._count.enquiries}</td>
                <td className="px-5 py-3">
                  <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium ${p.active ? "bg-(--st-green-bg) text-(--st-green-fg)" : "bg-(--st-red-bg) text-(--st-red-fg)"}`}>
                    {p.active ? "Live" : "Delisted"}
                  </span>
                </td>
                <td className="px-5 py-3"><ProductToggle id={p.id} active={p.active} /></td>
              </tr>
            ))}
            {products.length === 0 && <tr><td colSpan={6} className="px-5 py-8 text-center text-muted">No products listed yet.</td></tr>}
          </tbody>
        </table></div>
        <Pagination page={pp} total={prodTotal} base={`/admin/marketplace${sp.ep ? `?ep=${sp.ep}` : ""}`} param="pp" />
      </div>

      <h2 className="mb-3 mt-8 text-[15px] font-semibold text-ink">Product enquiries</h2>
      <div className="card overflow-hidden">
        <div className="overflow-x-auto"><table className="w-full min-w-[760px] text-left text-[13px]">
          <thead className="border-b border-line bg-paper-2 text-[11px] uppercase tracking-wider text-muted">
            <tr>
              <th className="px-5 py-3 font-semibold">Buyer</th>
              <th className="px-5 py-3 font-semibold">Product</th>
              <th className="px-5 py-3 font-semibold">Supplier</th>
              <th className="px-5 py-3 font-semibold">Offer</th>
              <th className="px-5 py-3 font-semibold">Status</th>
              <th className="px-5 py-3 font-semibold"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {enquiries.map((e) => (
              <tr key={e.id} className="hover:bg-paper-2/60">
                <td className="px-5 py-3">
                  <div className="font-medium text-ink">{e.buyer.name}</div>
                  <div className="text-[11px] text-muted">{e.buyer.email}</div>
                </td>
                <td className="px-5 py-3 text-body">{e.product.name} × {e.qty}</td>
                <td className="px-5 py-3 text-body">{e.supplier.orgName}</td>
                <td className="px-5 py-3 text-body">{e.quotedPrice != null ? pkr(e.quotedPrice) : "—"}{e.leadTimeDays != null ? ` · ${e.leadTimeDays}d` : ""}</td>
                <td className="px-5 py-3"><StatusBadge status={e.status} /></td>
                <td className="px-5 py-3"><EnquiryMod id={e.id} status={e.status} /></td>
              </tr>
            ))}
            {enquiries.length === 0 && <tr><td colSpan={6} className="px-5 py-8 text-center text-muted">No enquiries yet.</td></tr>}
          </tbody>
        </table></div>
        <Pagination page={ep} total={enqTotal} base={`/admin/marketplace${sp.pp ? `?pp=${sp.pp}` : ""}`} param="ep" />
      </div>
    </>
  );
}
