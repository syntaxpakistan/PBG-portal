export const instant = false

import { notFound, redirect } from "next/navigation";
import { Clock3 } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";
import { StatusBadge, PageHead, StatCard } from "@/components/portal/ui";
import { pkr } from "@/lib/constants";
import { respondEnquiry, fulfilEnquiry } from "@/lib/actions/marketplace";
import { SubscriptionCard } from "@/components/portal/subscription-card";
import { SupplierProfileForm } from "./profile-form";
import { ProductForm, ProductRow } from "./product-form";

export default async function SupplierPage() {
  const session = await requireRole("SUPPLIER");
  const profile = await prisma.supplierProfile.findUnique({
    where: { userId: session.user.id },
    include: {
      products: { orderBy: { createdAt: "desc" } },
      enquiries: {
        include: {
          product: { select: { name: true, price: true, unit: true } },
          buyer: { select: { name: true, email: true, role: true, customerProfile: { select: { orgName: true, orgType: true } }, providerProfile: { select: { orgName: true } } } },
        },
        orderBy: { createdAt: "desc" },
      },
      user: { select: { subscription: true } },
    },
  });
  if (!profile) notFound();
  const approved = profile.status === "APPROVED";
  const openEnq = profile.enquiries.filter((e) => e.status === "OPEN").length;
  const quotedEnq = profile.enquiries.filter((e) => e.status === "QUOTED").length;
  const fulfilledEnq = profile.enquiries.filter((e) => e.status === "FULFILLED").length;
  const lowStock = profile.products.filter((p) => p.stockStatus === "LOW_STOCK" || p.stockStatus === "OUT_OF_STOCK").length;

  return (
    <Shell title="Supplier portal" name={session.user.name} email={session.user.email}>
      <PageHead title={profile.orgName} sub={`${profile.city} · ${profile.categories}`} action={<StatusBadge status={profile.status} />} />
      {profile.status !== "APPROVED" && (
        <div className="mb-6 flex items-center gap-2.5 rounded-xl border border-(--st-amber-bd) bg-(--st-amber-bg) px-4 py-3 text-[13px] font-medium text-(--st-amber-fg)">
          <Clock3 className="size-4" /> {profile.status === "PENDING" ? "Verification in progress — you'll be able to list products once approved." : `Status: ${profile.status}${profile.statusNote ? ` — ${profile.statusNote}` : ""}`}
        </div>
      )}
      <div className="mb-8 grid gap-4 sm:grid-cols-5">
        <StatCard label="Products listed" value={profile.products.length} sub={lowStock ? `${lowStock} low/out of stock` : undefined} />
        <StatCard label="New enquiries" value={openEnq} />
        <StatCard label="Offers sent" value={quotedEnq} />
        <StatCard label="Fulfilled" value={fulfilledEnq} />
        <StatCard label="Conversion" value={profile.enquiries.length ? `${Math.round((fulfilledEnq / profile.enquiries.length) * 100)}%` : "—"} />
      </div>

      <div className="mb-6 grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="card p-5">
          <h3 className="mb-4 text-[14px] font-semibold text-ink">Company profile</h3>
          <SupplierProfileForm profile={profile} />
        </div>
        <SubscriptionCard sub={profile.user.subscription} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card p-5">
          <h3 className="mb-4 text-[14px] font-semibold text-ink">List a product</h3>
          {approved ? <ProductForm /> : <p className="text-[12.5px] text-muted">Available after verification.</p>}
        </div>
        <div className="card overflow-hidden">
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

      <h3 className="mb-3 mt-8 text-[15px] font-semibold text-ink">Enquiries</h3>
      <div className="card divide-y divide-line">
        {profile.enquiries.length === 0 && <p className="px-5 py-8 text-center text-[13px] text-muted">Customer order requests appear here.</p>}
        {profile.enquiries.map((e) => {
          const buyerOrg = e.buyer.customerProfile?.orgName ?? e.buyer.providerProfile?.orgName;
          return (
          <div key={e.id} className="px-5 py-4">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-[13.5px] font-medium text-ink">{e.product.name} × {e.qty}</div>
                <div className="mt-0.5 text-[12px] text-muted">
                  {e.buyer.name}{buyerOrg ? ` · ${buyerOrg}` : ""} · {e.buyer.role === "PROVIDER" ? "laboratory" : "customer"} · {e.buyer.email} · received {e.createdAt.toLocaleDateString()}
                </div>
                {e.product.price != null && <div className="mt-0.5 text-[11px] text-muted">List price: {pkr(e.product.price)}{e.product.unit ? `/${e.product.unit}` : ""}</div>}
                {e.message && <p className="mt-1.5 text-[12.5px] text-body">&ldquo;{e.message}&rdquo;</p>}
              </div>
              <StatusBadge status={e.status} />
            </div>
            {e.status === "QUOTED" && (
              <div className="mt-2.5 rounded-lg bg-(--st-blue-bg) px-3.5 py-2.5 text-[12.5px] text-(--st-blue-fg)">
                Your offer: {e.quotedPrice != null ? pkr(e.quotedPrice) : "price on request"}
                {e.leadTimeDays != null && ` · ${e.leadTimeDays}d lead`}
                {e.reply && <span className="mt-1 block">{e.reply}</span>}
              </div>
            )}
            {(e.status === "OPEN" || e.status === "QUOTED") && (
              <form action={respondEnquiry.bind(null, e.id)} className="mt-3 flex flex-wrap items-end gap-2 rounded-lg bg-paper-2 p-3">
                <input name="quotedPrice" type="number" min={0} placeholder="Price PKR" defaultValue={e.quotedPrice ?? ""} className="w-28 rounded-lg border border-line bg-surface px-3 py-2 text-[12.5px] text-ink outline-none focus:border-navy-3" />
                <input name="leadTimeDays" type="number" min={0} placeholder="Lead days" defaultValue={e.leadTimeDays ?? ""} className="w-24 rounded-lg border border-line bg-surface px-3 py-2 text-[12.5px] text-ink outline-none focus:border-navy-3" />
                <input name="reply" placeholder="Message to buyer" defaultValue={e.reply ?? ""} className="min-w-40 flex-1 rounded-lg border border-line bg-surface px-3 py-2 text-[12.5px] text-ink outline-none focus:border-navy-3" />
                <button type="submit" className="btn-primary !py-2 text-[12px]">{e.status === "OPEN" ? "Send offer" : "Update offer"}</button>
                {e.status === "QUOTED" && (
                  <button formAction={fulfilEnquiry.bind(null, e.id)} type="submit" className="btn-outline !py-2 text-[12px]">Mark fulfilled</button>
                )}
              </form>
            )}
          </div>
          );
        })}
      </div>
    </Shell>
  );
}

// lightweight shell reuse — supplier is a single-screen portal for MVP
import Link from "next/link";
import { SignOutButton } from "@/components/portal/signout";
import { ThemeToggle } from "@/components/theme-toggle";
import { PlatformMarkText } from "@/components/platform-mark";

function Shell({ title, name, email, children }: { title: string; name?: string | null; email: string; children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-paper-2">
      <header className="sticky top-0 z-40 border-b border-line bg-navy">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
          <div className="flex min-w-0 items-center gap-3">
            <Link href="/" className="flex shrink-0 items-center" aria-label="Syntax of Life home">
              <img src="/brand/logo-dark.png" alt="Syntax of Life" className="h-10 w-auto sm:h-11" />
            </Link>
            <span className="hidden h-6 w-px shrink-0 bg-white/15 sm:block" />
            <PlatformMarkText className="hidden shrink-0 sm:block" />
            <span className="hidden text-[11px] font-semibold uppercase tracking-[0.14em] text-[#5c7a95] md:block">{title}</span>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle onDark />
            <span className="hidden max-w-28 truncate text-[12px] text-[#9fb9cd] sm:block">{name}</span>
            <SignOutButton />
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-8">{children}</main>
    </div>
  );
}
