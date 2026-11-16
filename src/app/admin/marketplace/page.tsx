export const instant = false

import { prisma } from "@/lib/prisma";
import { PageHead, StatusBadge } from "@/components/portal/ui";
import { Pagination, PAGE_SIZE } from "@/components/portal/pagination";
import { pkr } from "@/lib/constants";
import { ProductImage } from "@/components/marketplace/product-image";
import { setProductModeration } from "@/lib/actions/admin";
import { SubmitButton } from "@/components/portal/submit-button";
import { ProductToggle } from "./toggle";
import { EnquiryMod } from "./enquiry-mod";

async function productDecision(productId: string, fd: FormData) {
  "use server";
  await setProductModeration(productId, String(fd.get("decision")) as "APPROVED" | "REJECTED", String(fd.get("note") || "") || undefined);
}

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
                  <div className="flex items-center gap-3">
                    {p.imageKey
                      ? <ProductImage imageKey={p.imageKey} alt={p.name} className="size-11 shrink-0" imgClass="size-11 object-cover" hideExpand />
                      : <span className="grid size-11 shrink-0 place-items-center rounded-lg border border-line bg-paper-2 text-[10px] font-medium text-muted">no img</span>}
                    <div className="min-w-0">
                      <div className="font-medium text-ink">{p.name}</div>
                      <div className="text-[11px] text-muted"><span className="font-mono font-semibold">{p.prodNo}</span> · {p.category}{p.spec ? ` · ${p.spec}` : ""}</div>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-3 text-body">{p.supplier.orgName} · {p.supplier.city}</td>
                <td className="px-5 py-3 text-ink">{p.price != null ? pkr(p.price) : "—"}{p.unit ? `/${p.unit}` : ""}</td>
                <td className="px-5 py-3 text-body">{p._count.enquiries}</td>
                <td className="px-5 py-3">
                  <div className="flex flex-col gap-1">
                    <span className={`w-fit rounded-full px-2.5 py-0.5 text-[11px] font-medium ${p.active ? "bg-(--st-green-bg) text-(--st-green-fg)" : "bg-(--st-red-bg) text-(--st-red-fg)"}`}>
                      {p.active ? "Live" : "Delisted"}
                    </span>
                    {p.moderation !== "APPROVED" && (
                      <span className={`w-fit rounded-full px-2.5 py-0.5 text-[10.5px] font-medium ${p.moderation === "PENDING" ? "bg-(--st-amber-bg) text-(--st-amber-fg)" : "bg-(--st-red-bg) text-(--st-red-fg)"}`}>
                        {p.moderation === "PENDING" ? "In review" : "Rejected"}
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-5 py-3">
                  {p.moderation === "PENDING" ? (
                    <form action={productDecision.bind(null, p.id)} className="flex items-center gap-1.5">
                      <input name="note" placeholder="Note" className="w-24 rounded-lg border border-line bg-surface px-2 py-1.5 text-[11px] text-ink outline-none focus:border-navy-3" />
                      <SubmitButton name="decision" value="APPROVED" className="rounded-lg bg-(--st-green-bg) px-2.5 py-1.5 text-[11px] font-semibold text-(--st-green-fg) hover:brightness-95">Approve</SubmitButton>
                      <SubmitButton name="decision" value="REJECTED" className="rounded-lg bg-(--st-red-bg) px-2.5 py-1.5 text-[11px] font-semibold text-(--st-red-fg) hover:brightness-95">Reject</SubmitButton>
                    </form>
                  ) : (
                    <ProductToggle id={p.id} active={p.active} />
                  )}
                </td>
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
                <td className="px-5 py-3 text-body"><span className="font-mono text-[11.5px] font-semibold text-muted">{e.enquiryNo}</span> · {e.product.name} × {e.qty}</td>
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
