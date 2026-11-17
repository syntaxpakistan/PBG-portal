export const instant = false

import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";
import { StatusBadge, PageHead } from "@/components/portal/ui";
import { pkr } from "@/lib/constants";
import { respondEnquiry, fulfilEnquiry, declineEnquiry, sendEnquiryMessage } from "@/lib/actions/marketplace";
import { SubmitButton } from "@/components/portal/submit-button";

export default async function SupplierEnquiriesPage() {
  const session = await requireRole("SUPPLIER");
  const profile = await prisma.supplierProfile.findUnique({
    where: { userId: session.user.id },
    include: {
      enquiries: {
        include: {
          product: { select: { name: true, price: true, unit: true } },
          buyer: { select: { name: true, email: true, role: true, customerProfile: { select: { orgName: true, orgType: true } }, providerProfile: { select: { orgName: true } } } },
          messages: { include: { author: { select: { name: true, role: true } } }, orderBy: { createdAt: "asc" } },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });
  if (!profile) notFound();
  const open = profile.enquiries.filter((e) => ["OPEN", "QUOTED", "ANSWERED"].includes(e.status)).length;

  return (
    <>
      <PageHead title="Enquiries" sub={`${profile.enquiries.length} total · ${open} awaiting your action — buyers from customers and labs.`} />

      <div className="card divide-y divide-line">
        {profile.enquiries.length === 0 && <p className="px-5 py-8 text-center text-[13px] text-muted">Customer order requests appear here.</p>}
        {profile.enquiries.map((e) => {
          const buyerOrg = e.buyer.customerProfile?.orgName ?? e.buyer.providerProfile?.orgName;
          return (
          <div key={e.id} className="px-5 py-4">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-[13.5px] font-medium text-ink"><span className="font-mono text-[11.5px] font-semibold text-muted">{e.enquiryNo}</span> · {e.product.name} × {e.qty}</div>
                <div className="mt-0.5 text-[12px] text-muted">
                  {e.buyer.name}{buyerOrg ? ` · ${buyerOrg}` : ""} · {e.buyer.role === "PROVIDER" ? "laboratory" : "customer"} · {e.buyer.email} · received {e.createdAt.toLocaleDateString()}
                </div>
                {e.product.price != null && <div className="mt-0.5 text-[11px] text-muted">List price: {pkr(e.product.price)}{e.product.unit ? `/${e.product.unit}` : ""}</div>}
                {e.message && <p className="mt-1.5 text-[12.5px] text-body">&ldquo;{e.message}&rdquo;</p>}
              </div>
              <div className="flex shrink-0 items-center gap-3">
                <StatusBadge status={e.status} />
                <Link href={`/supplier/enquiries/${e.id}`} className="text-[12px] font-medium text-blue hover:underline">Open order →</Link>
              </div>
            </div>
            {e.status === "DELIVERED" && (
              <div className="mt-2.5 rounded-lg bg-(--st-green-bg) px-3.5 py-2.5 text-[12.5px] text-(--st-green-fg)">
                Delivered — the buyer confirmed receipt. Order complete.
              </div>
            )}
            {e.status === "QUOTED" && (
              <div className="mt-2.5 rounded-lg bg-(--st-blue-bg) px-3.5 py-2.5 text-[12.5px] text-(--st-blue-fg)">
                Your offer: {e.quotedPrice != null ? pkr(e.quotedPrice) : "price on request"}
                {e.leadTimeDays != null && ` · ${e.leadTimeDays}d lead`}
                {e.reply && <span className="mt-1 block">{e.reply}</span>}
              </div>
            )}
            {e.status === "INVOICED" && (
              <div className="mt-2.5 rounded-lg bg-(--st-amber-bg) px-3.5 py-2.5 text-[12.5px] text-(--st-amber-fg)">
                Order accepted — invoice raised. Payment clears through Syntax escrow; you&apos;ll be notified when verified.
              </div>
            )}
            {e.status === "CLOSED" && (
              <div className="mt-2.5 rounded-lg bg-paper-2 px-3.5 py-2.5 text-[12.5px] text-muted">
                Declined{e.declineReason ? ` — ${e.declineReason}` : ""}
              </div>
            )}
            {e.status === "PAID" && (
              <form action={fulfilEnquiry.bind(null, e.id)} className="mt-2.5 rounded-lg bg-(--st-green-bg) px-3.5 py-2.5">
                <p className="text-[12.5px] font-medium text-(--st-green-fg)">Payment verified by Syntax — ship the order and record the delivery details.</p>
                <div className="mt-2 flex flex-wrap items-end gap-2">
                  <input name="courier" placeholder="Courier (TCS, Leopards…)" className="w-44 rounded-lg border border-line bg-surface px-3 py-2 text-[12.5px] text-ink outline-none focus:border-navy-3" />
                  <input name="trackingNo" placeholder="Tracking / consignment #" className="w-48 rounded-lg border border-line bg-surface px-3 py-2 text-[12.5px] text-ink outline-none focus:border-navy-3" />
                  <SubmitButton className="rounded-md bg-(--st-green-fg) px-3 py-1.5 text-[11.5px] font-semibold text-white hover:opacity-90">Ship &amp; mark fulfilled</SubmitButton>
                </div>
              </form>
            )}
            {e.status === "FULFILLED" && (e.courier || e.trackingNo) && (
              <div className="mt-2.5 rounded-lg bg-(--st-green-bg) px-3.5 py-2.5 text-[12.5px] text-(--st-green-fg)">
                Shipped via {[e.courier, e.trackingNo].filter(Boolean).join(" · ")}
              </div>
            )}
            {(e.status === "OPEN" || e.status === "QUOTED" || e.status === "ANSWERED") && (
              <form action={respondEnquiry.bind(null, e.id)} className="mt-3 flex flex-wrap items-end gap-2 rounded-lg bg-paper-2 p-3">
                <input name="quotedPrice" type="number" min={0} placeholder="Price PKR" defaultValue={e.quotedPrice ?? ""} className="w-28 rounded-lg border border-line bg-surface px-3 py-2 text-[12.5px] text-ink outline-none focus:border-navy-3" />
                <input name="leadTimeDays" type="number" min={0} placeholder="Lead days" defaultValue={e.leadTimeDays ?? ""} className="w-24 rounded-lg border border-line bg-surface px-3 py-2 text-[12.5px] text-ink outline-none focus:border-navy-3" />
                <input name="reply" placeholder="Message to buyer" defaultValue={e.reply ?? ""} className="min-w-40 flex-1 rounded-lg border border-line bg-surface px-3 py-2 text-[12.5px] text-ink outline-none focus:border-navy-3" />
                <label className="text-[12px] text-muted file:font-semibold">
                  <input name="quoteFile" type="file" accept="application/pdf,image/png,image/jpeg" className="w-44 text-[11.5px] file:mr-2 file:rounded-full file:border-0 file:bg-navy file:px-3 file:py-1.5 file:text-[11px] file:text-yellow" />
                </label>
                <SubmitButton className="btn-primary !py-2 text-[12px]">{e.status === "OPEN" ? "Send offer" : "Update offer"}</SubmitButton>
                <SubmitButton formAction={declineEnquiry.bind(null, e.id)} className="btn-outline !py-2 text-[12px]">Decline</SubmitButton>
              </form>
            )}
            {e.quoteFileKey && (
              <a href={`/api/files/${e.quoteFileKey}?inline=1`} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex items-center gap-1.5 text-[12px] font-medium text-blue hover:underline">
                Your quotation file →
              </a>
            )}
            {/* clarification thread */}
            {e.messages.length > 0 && (
              <div className="mt-3 space-y-1.5 border-t border-line pt-3">
                {e.messages.slice(-4).map((m) =>
                  m.kind === "EVENT" ? (
                    <p key={m.id} className="text-[11px] italic text-muted">— {m.body}</p>
                  ) : (
                    <p key={m.id} className="text-[12px] leading-snug">
                      <span className="font-semibold text-ink">{m.author.role === "SUPPLIER" ? "You" : m.author.name ?? "Buyer"}:</span>{" "}
                      <span className="text-body">{m.body}</span>
                      <span className="ml-1.5 text-[10.5px] text-muted">{m.createdAt.toLocaleDateString()}</span>
                    </p>
                  )
                )}
                {e.messages.length > 4 && (
                  <Link href={`/supplier/enquiries/${e.id}`} className="block text-[11.5px] font-medium text-blue hover:underline">View full thread →</Link>
                )}
              </div>
            )}
            {e.status !== "CLOSED" && (
              <form action={sendEnquiryMessage.bind(null, e.id)} className="mt-2.5 flex gap-2">
                <input name="body" placeholder="Message the buyer…" className="flex-1 rounded-lg border border-line bg-surface px-3 py-2 text-[12.5px] text-ink outline-none focus:border-navy-3" />
                <SubmitButton className="btn-outline !py-2 text-[12px]">Send</SubmitButton>
              </form>
            )}
          </div>
          );
        })}
      </div>
    </>
  );
}
