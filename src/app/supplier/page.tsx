export const instant = false

import { notFound } from "next/navigation";
import { Clock3, Package, Inbox, Store, ArrowRight, BadgeCheck } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";
import { StatusBadge, PageHead, StatCard } from "@/components/portal/ui";
import { pkr } from "@/lib/constants";
import { getPartnerAccess } from "@/lib/entitlements";
import Link from "next/link";

export default async function SupplierPage() {
  const session = await requireRole("SUPPLIER");
  const profile = await prisma.supplierProfile.findUnique({
    where: { userId: session.user.id },
    include: {
      products: { orderBy: { createdAt: "desc" } },
      enquiries: {
        include: {
          product: { select: { name: true, price: true, unit: true } },
          buyer: { select: { name: true, role: true, customerProfile: { select: { orgName: true } }, providerProfile: { select: { orgName: true } } } },
        },
        orderBy: { createdAt: "desc" },
        take: 5,
      },
      user: { select: { subscription: true } },
    },
  });
  if (!profile) notFound();
  const approved = profile.status === "APPROVED";
  const access = await getPartnerAccess(session.user.id);
  const openEnq = profile.enquiries.filter((e) => e.status === "OPEN").length;
  const quotedEnq = profile.enquiries.filter((e) => e.status === "QUOTED").length;
  const fulfilledEnq = profile.enquiries.filter((e) => e.status === "FULFILLED").length;
  const lowStock = profile.products.filter((p) => p.stockStatus === "LOW_STOCK" || p.stockStatus === "OUT_OF_STOCK").length;
  const liveProducts = profile.products.filter((p) => p.moderation === "APPROVED" && p.active).length;
  const inReview = profile.products.filter((p) => p.moderation === "PENDING").length;

  const steps = [
    { done: approved, label: "Organization verified by the Gateway team", href: "/supplier/profile" },
    { done: access.active, label: "Subscription active (paid via invoice)", href: "/supplier/billing" },
    { done: profile.products.length > 0, label: "List your first product", href: "/supplier/products" },
    { done: liveProducts > 0, label: "Product live on the marketplace", href: "/supplier/products" },
  ];
  const allDone = steps.every((s) => s.done);

  return (
    <>
      <PageHead title={profile.orgName} sub={`${profile.city} · ${profile.categories}`} action={<StatusBadge status={profile.status} />} />
      {profile.status !== "APPROVED" && (
        <div className="mb-6 flex items-center gap-2.5 rounded-xl border border-(--st-amber-bd) bg-(--st-amber-bg) px-4 py-3 text-[13px] font-medium text-(--st-amber-fg)">
          <Clock3 className="size-4" /> {profile.status === "PENDING" ? "Verification in progress, you'll be able to list products once approved." : `Status: ${profile.status}${profile.statusNote ? `, ${profile.statusNote}` : ""}`}
        </div>
      )}
      {!access.active && (
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-(--st-red-bd) bg-(--st-red-bg) px-4 py-3 text-[13px] font-medium text-(--st-red-fg)">
          <span>
            Subscription {access.status === "PENDING_PAYMENT" ? "awaiting payment" : access.inGrace ? "expired, grace period" : "inactive"}.
            {" "}Product listings and enquiry responses are paused.
          </span>
          <Link href="/supplier/billing" className="rounded-full bg-navy px-3.5 py-1.5 text-[12px] font-semibold text-yellow hover:bg-navy-2">Go to billing</Link>
        </div>
      )}
      <div className="mb-8 grid gap-4 sm:grid-cols-5">
        <StatCard label="Products listed" value={profile.products.length} sub={lowStock ? `${lowStock} low/out of stock` : inReview ? `${inReview} in review` : undefined} />
        <StatCard label="New enquiries" value={openEnq} />
        <StatCard label="Offers sent" value={quotedEnq} />
        <StatCard label="Fulfilled" value={fulfilledEnq} />
        <StatCard label="Conversion" value={profile.enquiries.length ? `${Math.round((fulfilledEnq / profile.enquiries.length) * 100)}%` : "—"} />
      </div>

      {!allDone && (
        <div className="card mb-6 p-5">
          <h3 className="mb-3 text-[14px] font-semibold text-ink">Getting your storefront live</h3>
          <div className="space-y-2">
            {steps.map((s) => (
              <Link key={s.label} href={s.href} className="group flex items-center gap-2.5 text-[13px]">
                {s.done
                  ? <BadgeCheck className="size-4 shrink-0 text-(--st-green-fg)" />
                  : <span className="grid size-4 shrink-0 place-items-center rounded-full border border-line text-[9px] font-bold text-muted">{steps.indexOf(s) + 1}</span>}
                <span className={s.done ? "text-muted line-through" : "font-medium text-ink group-hover:text-blue"}>{s.label}</span>
                {!s.done && <ArrowRight className="size-3.5 text-muted transition-transform group-hover:translate-x-0.5" />}
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card overflow-hidden">
          <div className="flex items-center justify-between border-b border-line px-5 py-3.5">
            <h3 className="flex items-center gap-2 text-[14px] font-semibold text-ink"><Package className="size-4 text-blue" /> Recent products</h3>
            <Link href="/supplier/products" className="text-[12px] font-semibold text-blue hover:text-ink">Manage catalog →</Link>
          </div>
          <div className="divide-y divide-line">
            {profile.products.length === 0 && <p className="px-5 py-6 text-center text-[12.5px] text-muted">No products yet, list your first one.</p>}
            {profile.products.slice(0, 4).map((p) => (
              <div key={p.id} className="flex items-center justify-between px-5 py-3">
                <div>
                  <div className="text-[13px] font-medium text-ink">{p.name}</div>
                  <div className="font-mono text-[11px] text-muted">{p.prodNo} · {p.category}</div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${p.moderation === "APPROVED" ? "bg-(--st-green-bg) text-(--st-green-fg)" : p.moderation === "REJECTED" ? "bg-(--st-red-bg) text-(--st-red-fg)" : "bg-(--st-amber-bg) text-(--st-amber-fg)"}`}>
                    {p.moderation === "APPROVED" ? (p.active ? "Live" : "Hidden") : p.moderation === "REJECTED" ? "Rejected" : "In review"}
                  </span>
                  {p.price != null && <span className="text-[12.5px] font-medium text-ink">{pkr(p.price)}</span>}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card overflow-hidden">
          <div className="flex items-center justify-between border-b border-line px-5 py-3.5">
            <h3 className="flex items-center gap-2 text-[14px] font-semibold text-ink"><Inbox className="size-4 text-blue" /> Latest enquiries</h3>
            <Link href="/supplier/enquiries" className="text-[12px] font-semibold text-blue hover:text-ink">All enquiries →</Link>
          </div>
          <div className="divide-y divide-line">
            {profile.enquiries.length === 0 && <p className="px-5 py-6 text-center text-[12.5px] text-muted">Customer order requests appear here.</p>}
            {profile.enquiries.map((e) => (
              <Link key={e.id} href="/supplier/enquiries" className="flex items-center justify-between px-5 py-3 hover:bg-paper-2/60">
                <div>
                  <div className="text-[13px] font-medium text-ink"><span className="font-mono text-[11px] font-semibold text-muted">{e.enquiryNo}</span> · {e.product.name} × {e.qty}</div>
                  <div className="text-[11.5px] text-muted">{(e.buyer.customerProfile?.orgName ?? e.buyer.providerProfile?.orgName ?? e.buyer.name)} · {e.createdAt.toLocaleDateString()}</div>
                </div>
                <StatusBadge status={e.status} />
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 card flex items-center justify-between p-5">
        <div className="flex items-center gap-3">
          <Store className="size-5 text-blue" />
          <div>
            <p className="text-[13.5px] font-semibold text-ink">Your public storefront</p>
            <p className="text-[12px] text-muted">See how buyers find your catalogue on the marketplace.</p>
          </div>
        </div>
        {approved
          ? <a href={`/suppliers/${profile.id}`} target="_blank" rel="noopener noreferrer" className="btn-outline !py-2 text-[12.5px]">Open storefront →</a>
          : <span className="text-[12px] text-muted">Live after verification</span>}
      </div>
    </>
  );
}
