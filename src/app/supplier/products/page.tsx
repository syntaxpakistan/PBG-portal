export const instant = false

import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";
import { StatusBadge, PageHead } from "@/components/portal/ui";
import { pkr } from "@/lib/constants";
import { ProductForm, ProductRow, StorefrontLink } from "../product-form";

export default async function SupplierProductsPage() {
  const session = await requireRole("SUPPLIER");
  const profile = await prisma.supplierProfile.findUnique({
    where: { userId: session.user.id },
    include: { products: { orderBy: { createdAt: "desc" } } },
  });
  if (!profile) notFound();
  const approved = profile.status === "APPROVED";

  return (
    <>
      <PageHead
        title="Products"
        sub={`${profile.products.length} listed, new products go live after a quick review by the Gateway team.`}
        action={approved ? <StorefrontLink supplierId={profile.id} /> : undefined}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card p-5">
          <h3 className="mb-4 text-[14px] font-semibold text-ink">List a product</h3>
          {approved
            ? <ProductForm />
            : <p className="text-[12.5px] text-muted">Available after verification, the Gateway team is reviewing your organization.</p>}
        </div>
        <div className="card overflow-hidden self-start">
          <div className="border-b border-line px-5 py-3.5"><h3 className="text-[14px] font-semibold text-ink">Your catalog</h3></div>
          <div className="divide-y divide-line">
            {profile.products.length === 0 && <p className="px-5 py-6 text-center text-[12.5px] text-muted">No products yet.</p>}
            {profile.products.map((p) => (
              <ProductRow key={p.id} product={p}
                stockBadge={<StatusBadge status={p.stockStatus} />}
                priceLabel={p.price != null ? <span className="text-[12.5px] font-medium text-ink">{pkr(p.price)}{p.unit ? `/${p.unit}` : ""}</span> : null}
              />
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
