export const instant = false

import Link from "next/link";
import { notFound } from "next/navigation";
import { PackageCheck, Truck, Wallet, Hourglass } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";
import { PageHead } from "@/components/portal/ui";
import { pkr } from "@/lib/constants";

const SECTIONS = [
  { key: "paid", statuses: ["PAID"], title: "To ship", hint: "Payment verified in escrow, fulfil these now", icon: Wallet, accent: "text-(--st-green-fg)" },
  { key: "transit", statuses: ["FULFILLED"], title: "In transit", hint: "Shipped, waiting for the buyer to confirm receipt", icon: Truck, accent: "text-blue" },
  { key: "delivered", statuses: ["DELIVERED"], title: "Delivered", hint: "Receipt confirmed, complete orders", icon: PackageCheck, accent: "text-(--st-green-fg)" },
  { key: "awaiting", statuses: ["INVOICED"], title: "Awaiting payment", hint: "Offer accepted, invoice issued, escrow pending", icon: Hourglass, accent: "text-(--st-amber-fg)" },
];

export default async function SupplierOrdersPage() {
  const session = await requireRole("SUPPLIER");
  const profile = await prisma.supplierProfile.findUnique({
    where: { userId: session.user.id },
    include: {
      enquiries: {
        where: { status: { in: ["INVOICED", "PAID", "FULFILLED", "DELIVERED"] } },
        include: {
          product: { select: { name: true } },
          buyer: { select: { name: true, customerProfile: { select: { orgName: true } }, providerProfile: { select: { orgName: true } } } },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });
  if (!profile) notFound();
  const orders = profile.enquiries;
  const toShip = orders.filter((o) => o.status === "PAID").length;

  return (
    <>
      <PageHead title="Orders" sub={`${orders.length} confirmed orders · ${toShip} waiting to ship. Track each order on its detail page.`} />

      {orders.length === 0 && (
        <div className="card px-5 py-10 text-center text-[13px] text-muted">
          No orders yet, once a buyer accepts your offer and pays, the order appears here.
        </div>
      )}

      <div className="grid gap-5 lg:grid-cols-2">
        {SECTIONS.map((s) => {
          const list = orders.filter((o) => s.statuses.includes(o.status));
          if (list.length === 0) return null;
          return (
            <div key={s.key} className="card overflow-hidden">
              <div className="flex items-center gap-2 border-b border-line px-5 py-3">
                <s.icon className={`size-4 ${s.accent}`} />
                <h2 className="text-[13.5px] font-semibold text-ink">{s.title} <span className="text-muted font-normal">({list.length})</span></h2>
                <span className="ml-auto text-[11px] text-muted">{s.hint}</span>
              </div>
              <div className="divide-y divide-line">
                {list.map((o) => {
                  const buyerOrg = o.buyer.customerProfile?.orgName ?? o.buyer.providerProfile?.orgName;
                  return (
                    <Link key={o.id} href={`/supplier/enquiries/${o.id}`} className="flex items-center justify-between gap-3 px-5 py-3 hover:bg-paper-2/60">
                      <div className="min-w-0">
                        <p className="truncate text-[13px] font-medium text-ink">
                          <span className="font-mono text-[11px] font-semibold text-muted">{o.enquiryNo}</span> · {o.product.name} × {o.qty}
                        </p>
                        <p className="mt-0.5 truncate text-[11.5px] text-muted">
                          {buyerOrg ?? o.buyer.name}
                          {o.quotedPrice != null && ` · ${pkr(o.quotedPrice * o.qty)}`}
                          {o.trackingNo && ` · #${o.trackingNo}`}
                          {` · ${o.createdAt.toLocaleDateString("en-PK", { day: "numeric", month: "short" })}`}
                        </p>
                      </div>
                      <span className="shrink-0 text-[12px] font-medium text-blue">Open →</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
