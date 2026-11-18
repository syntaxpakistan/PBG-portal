import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCircle2, Circle, FileText, PackageCheck, Truck } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { StatusBadge, PageHead } from "@/components/portal/ui";
import { SubmitButton } from "@/components/portal/submit-button";
import { pkr } from "@/lib/constants";
import {
  respondEnquiry,
  fulfilEnquiry,
  declineEnquiry,
  postShipmentUpdate,
  acceptEnquiryQuote,
  confirmEnquiryReceived,
} from "@/lib/actions/marketplace";
import { fileEnquiryComplaint } from "@/lib/actions/complaints";
import { EnquiryThread } from "./enquiry-thread";
import { ProductImage } from "./product-image";

const STEPS = [
  { key: "enquiry", label: "Enquiry" },
  { key: "offer", label: "Offer" },
  { key: "invoice", label: "Invoice" },
  { key: "paid", label: "Paid" },
  { key: "shipped", label: "Shipped" },
  { key: "delivered", label: "Delivered" },
];

const STEP_INDEX: Record<string, number> = {
  OPEN: 0,
  ANSWERED: 1,
  QUOTED: 1,
  INVOICED: 2,
  PAID: 3,
  FULFILLED: 4,
  DELIVERED: 5,
};

/**
 * Full order detail, shared by the supplier portal and both buyer portals.
 * Pipeline stepper on top, order/parties/money on the left, the
 * conversation + event timeline on the right.
 */
export async function EnquiryDetail({ id, self }: { id: string; self: { id: string; role: string } }) {
  const e = await prisma.enquiry.findUnique({
    where: { id },
    include: {
      product: { select: { name: true, price: true, unit: true, imageKey: true, prodNo: true } },
      supplier: { select: { id: true, orgName: true, city: true, userId: true } },
      buyer: {
        select: {
          name: true,
          email: true,
          role: true,
          customerProfile: { select: { orgName: true, orgType: true } },
          providerProfile: { select: { orgName: true } },
        },
      },
      invoice: { select: { id: true, number: true, status: true, total: true, currency: true } },
      complaints: { select: { id: true, ticketNo: true, status: true, filedById: true, subject: true }, orderBy: { createdAt: "desc" } },
      messages: { include: { author: { select: { name: true, role: true } } }, orderBy: { createdAt: "asc" } },
    },
  });
  if (!e) notFound();
  const isSupplier = e.supplier.userId === self.id;
  const isBuyer = e.buyerId === self.id;
  if (!isSupplier && !isBuyer && self.role !== "ADMIN") notFound();

  const buyerOrg = e.buyer.customerProfile?.orgName ?? e.buyer.providerProfile?.orgName;
  const stepIdx = STEP_INDEX[e.status] ?? 0;
  const declined = e.status === "CLOSED";
  const back = isSupplier ? "/supplier/enquiries" : self.role === "PROVIDER" ? "/lab/supplies" : "/dashboard/marketplace";
  const billing = self.role === "PROVIDER" ? "/lab/billing" : "/dashboard/billing";

  const msgs = e.messages.map((m) => ({
    id: m.id,
    senderId: m.authorId,
    senderName: m.author.role === "ADMIN" ? "Gateway" : m.authorId === e.supplier.userId ? e.supplier.orgName : m.author.name ?? "Buyer",
    kind: m.kind,
    body: m.body,
    attachmentName: m.attachmentName,
    attachmentKey: m.attachmentKey,
    createdAt: m.createdAt.toISOString(),
  }));

  return (
    <>
      <div className="mb-2">
        <Link href={back} className="text-[12.5px] text-blue hover:underline">← Back to {isSupplier ? "enquiries" : "supplies"}</Link>
      </div>
      <PageHead
        title={`${e.enquiryNo} · ${e.product.name} × ${e.qty}`}
        sub={`${isSupplier ? `From ${e.buyer.name}${buyerOrg ? ` · ${buyerOrg}` : ""}` : `From ${e.supplier.orgName} · ${e.supplier.city}`}, sent ${e.createdAt.toLocaleDateString("en-PK", { day: "numeric", month: "short", year: "numeric" })}`}
        action={<StatusBadge status={e.status} />}
      />

      {/* order pipeline */}
      {!declined ? (
        <div className="card mb-6 flex items-center overflow-x-auto px-5 py-4">
          {STEPS.map((s, i) => (
            <div key={s.key} className="flex min-w-0 flex-1 items-center last:flex-none">
              <div className="flex flex-col items-center">
                {i <= stepIdx ? (
                  <CheckCircle2 className={`size-5 ${i === stepIdx && i < STEPS.length - 1 ? "text-blue" : "text-green"}`} />
                ) : (
                  <Circle className="size-5 text-line" />
                )}
                <span className={`mt-1 whitespace-nowrap text-[10.5px] font-medium ${i <= stepIdx ? "text-ink" : "text-muted"}`}>{s.label}</span>
              </div>
              {i < STEPS.length - 1 && <div className={`mx-2 mb-4 h-px min-w-6 flex-1 ${i < stepIdx ? "bg-green" : "bg-line"}`} />}
            </div>
          ))}
        </div>
      ) : (
        <div className="card mb-6 bg-paper-2 px-5 py-3.5 text-[13px] text-muted">
          This enquiry was {e.declineReason ? "declined" : "closed"}{e.declineReason ? `, ${e.declineReason}` : "."}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="space-y-6 lg:col-span-2">
          {/* order card */}
          <div className="card p-5">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted">{isSupplier ? "Order" : "Your order"}</p>
            <div className="mt-3 flex gap-3">
              {e.product.imageKey && <ProductImage imageKey={e.product.imageKey} alt={e.product.name} className="size-20 shrink-0" imgClass="size-20 object-cover" />}
              <div className="min-w-0">
                <p className="text-[14px] font-semibold text-ink">{e.product.name}</p>
                <p className="mt-0.5 font-mono text-[11px] text-muted">{e.product.prodNo} · qty {e.qty}</p>
                {e.product.price != null && <p className="mt-0.5 text-[11.5px] text-muted">List {pkr(e.product.price)}{e.product.unit ? `/${e.product.unit}` : ""}</p>}
              </div>
            </div>
            {e.message && e.message !== "—" && <p className="mt-3 border-t border-line pt-3 text-[12.5px] text-body">&ldquo;{e.message}&rdquo;</p>}

            <div className="mt-3 border-t border-line pt-3 text-[12.5px]">
              <p className="font-medium text-ink">{isSupplier ? "Buyer" : "Supplier"}</p>
              {isSupplier ? (
                <p className="mt-1 text-body">{e.buyer.name}{buyerOrg ? ` · ${buyerOrg}` : ""} · <span className="text-muted">{e.buyer.role === "PROVIDER" ? "laboratory" : "customer"}</span><br /><span className="text-muted">{e.buyer.email}</span></p>
              ) : (
                <p className="mt-1 text-body">{e.supplier.orgName} · {e.supplier.city} · <Link href={`/suppliers/${e.supplier.id}`} className="text-blue hover:underline">storefront</Link></p>
              )}
            </div>

            {e.quotedPrice != null && (
              <div className="mt-3 border-t border-line pt-3">
                <p className="font-medium text-[12.5px] text-ink">{isSupplier ? "Your offer" : "Supplier's offer"}</p>
                <p className="mt-1 text-[13.5px] font-semibold text-ink">{pkr(e.quotedPrice)}{e.qty > 1 ? ` × ${e.qty} = ${pkr(e.quotedPrice * e.qty)}` : ""}</p>
                {e.leadTimeDays != null && <p className="text-[12px] text-muted">{e.leadTimeDays}d lead time</p>}
                {e.reply && <p className="mt-1 text-[12.5px] text-body">{e.reply}</p>}
                {e.quoteFileKey && (
                  <a href={`/api/files/${e.quoteFileKey}?inline=1`} target="_blank" rel="noopener noreferrer" className="mt-1.5 inline-flex items-center gap-1.5 text-[12px] font-medium text-blue hover:underline">
                    <FileText className="size-3.5" /> Formal quotation
                  </a>
                )}
              </div>
            )}

            {e.invoice && (
              <div className="mt-3 border-t border-line pt-3">
                <p className="font-medium text-[12.5px] text-ink">Invoice</p>
                <p className="mt-1 text-[12.5px] text-body">
                  <Link href={`/invoices/${e.invoice.id}`} className="font-mono font-semibold text-blue hover:underline">{e.invoice.number}</Link>{" "}
                  · {pkr(e.invoice.total)} {e.invoice.currency} · <StatusBadge status={e.invoice.status} />
                </p>
              </div>
            )}

            {(e.courier || e.trackingNo) && (
              <div className="mt-3 border-t border-line pt-3">
                <p className="flex items-center gap-1.5 font-medium text-[12.5px] text-ink"><Truck className="size-3.5" /> Shipping</p>
                <p className="mt-1 text-[12.5px] text-body">{[e.courier, e.trackingNo && `#${e.trackingNo}`].filter(Boolean).join(" · ")}</p>
              </div>
            )}
          </div>

          {/* role actions */}
          {isSupplier && ["OPEN", "QUOTED", "ANSWERED"].includes(e.status) && (
            <div className="card p-5">
              <p className="text-[13px] font-semibold text-ink">{e.status === "OPEN" ? "Send an offer" : "Update your offer"}</p>
              <form action={respondEnquiry.bind(null, e.id)} className="mt-3 space-y-2.5">
                <div className="flex gap-2">
                  <input name="quotedPrice" type="number" min={0} placeholder="Price PKR (unit)" defaultValue={e.quotedPrice ?? ""} className="w-36 rounded-lg border border-line bg-surface px-3 py-2 text-[12.5px] text-ink outline-none focus:border-navy-3" />
                  <input name="leadTimeDays" type="number" min={0} placeholder="Lead days" defaultValue={e.leadTimeDays ?? ""} className="w-28 rounded-lg border border-line bg-surface px-3 py-2 text-[12.5px] text-ink outline-none focus:border-navy-3" />
                </div>
                <input name="reply" placeholder="Message to buyer" defaultValue={e.reply ?? ""} className="w-full rounded-lg border border-line bg-surface px-3 py-2 text-[12.5px] text-ink outline-none focus:border-navy-3" />
                <label className="block text-[12px] text-muted">
                  Formal quotation (PDF/image)
                  <input name="quoteFile" type="file" accept="application/pdf,image/png,image/jpeg" className="mt-1 block w-full text-[11.5px] file:mr-2 file:rounded-full file:border-0 file:bg-navy file:px-3 file:py-1.5 file:text-[11px] file:text-yellow" />
                </label>
                <div className="flex gap-2 pt-1">
                  <SubmitButton className="btn-primary !py-2 text-[12px]">{e.status === "OPEN" ? "Send offer" : "Update offer"}</SubmitButton>
                  <SubmitButton formAction={declineEnquiry.bind(null, e.id)} className="btn-outline !py-2 text-[12px]">Decline enquiry</SubmitButton>
                </div>
              </form>
            </div>
          )}

          {isSupplier && e.status === "PAID" && (
            <div className="card p-5">
              <p className="flex items-center gap-1.5 text-[13px] font-semibold text-(--st-green-fg)"><PackageCheck className="size-4" /> Payment verified, ship the order</p>
              <form action={fulfilEnquiry.bind(null, e.id)} className="mt-3 space-y-2.5">
                <input name="courier" placeholder="Courier (TCS, Leopards…)" className="w-full rounded-lg border border-line bg-surface px-3 py-2 text-[12.5px] text-ink outline-none focus:border-navy-3" />
                <input name="trackingNo" placeholder="Tracking / consignment #" className="w-full rounded-lg border border-line bg-surface px-3 py-2 text-[12.5px] text-ink outline-none focus:border-navy-3" />
                <SubmitButton className="rounded-md bg-(--st-green-fg) px-3 py-2 text-[12px] font-semibold text-white hover:opacity-90">Ship &amp; mark fulfilled</SubmitButton>
              </form>
            </div>
          )}

          {isSupplier && ["PAID", "FULFILLED"].includes(e.status) && (
            <div className="card p-5">
              <p className="text-[13px] font-semibold text-ink">Post a shipment update</p>
              <form action={postShipmentUpdate.bind(null, e.id)} className="mt-3 space-y-2.5">
                <input name="note" placeholder="e.g. Packed, dispatched from warehouse…" className="w-full rounded-lg border border-line bg-surface px-3 py-2 text-[12.5px] text-ink outline-none focus:border-navy-3" />
                <div className="flex gap-2">
                  <input name="courier" placeholder="Courier" defaultValue={e.courier ?? ""} className="w-1/2 rounded-lg border border-line bg-surface px-3 py-2 text-[12.5px] text-ink outline-none focus:border-navy-3" />
                  <input name="trackingNo" placeholder="Tracking #" defaultValue={e.trackingNo ?? ""} className="w-1/2 rounded-lg border border-line bg-surface px-3 py-2 text-[12.5px] text-ink outline-none focus:border-navy-3" />
                </div>
                <SubmitButton className="btn-outline !py-2 text-[12px]">Post update</SubmitButton>
              </form>
            </div>
          )}

          {isBuyer && e.status === "QUOTED" && e.quotedPrice != null && (
            <div className="card border-blue/40 p-5">
              <p className="text-[13px] font-semibold text-ink">Accept this offer?</p>
              <p className="mt-1 text-[12.5px] text-muted">An escrow invoice is raised, Syntax holds your payment until the supplier fulfils.</p>
              <form action={acceptEnquiryQuote.bind(null, e.id)} className="mt-3">
                <SubmitButton className="btn-primary !py-2 text-[12px]">Accept &amp; get invoice</SubmitButton>
              </form>
            </div>
          )}

          {isBuyer && e.status === "INVOICED" && (
            <div className="card bg-(--st-amber-bg) p-5 text-[12.5px] text-(--st-amber-fg)">
              Invoice issued, pay through Billing and Syntax will verify it with the supplier.
              <Link href={billing} className="ml-1 font-semibold underline underline-offset-2">Go to Billing →</Link>
            </div>
          )}

          {isBuyer && e.status === "PAID" && (
            <div className="card bg-(--st-green-bg) p-5 text-[12.5px] text-(--st-green-fg)">
              Payment verified by Syntax, the supplier is fulfilling your order.
            </div>
          )}

          {isBuyer && e.status === "FULFILLED" && (
            <div className="card border-green/40 p-5">
              <p className="text-[13px] font-semibold text-ink">Order shipped</p>
              {(e.courier || e.trackingNo) && <p className="mt-1 text-[12.5px] text-body">Via {[e.courier, e.trackingNo && `#${e.trackingNo}`].filter(Boolean).join(" · ")}</p>}
              <p className="mt-1 text-[12.5px] text-muted">Confirm receipt to close the order, this tells Syntax the delivery is complete.</p>
              <form action={confirmEnquiryReceived.bind(null, e.id)} className="mt-3">
                <SubmitButton className="rounded-md bg-(--st-green-fg) px-3 py-2 text-[12px] font-semibold text-white hover:opacity-90">Confirm received</SubmitButton>
              </form>
            </div>
          )}

          {e.status === "DELIVERED" && (
            <div className="card bg-(--st-green-bg) p-5 text-[12.5px] text-(--st-green-fg)">
              <PackageCheck className="mb-1 inline size-4" /> Delivered, receipt confirmed by the buyer. Order complete.
            </div>
          )}

          {/* disputes, filed tickets + a private mediated complaint thread */}
          {(isSupplier || isBuyer) && (
            <div className="card p-5">
              <p className="text-[13px] font-semibold text-ink">Report a problem</p>
              <p className="mt-1 text-[12px] text-muted">Opens a mediated ticket, Gateway support can message you and the {isSupplier ? "buyer" : "supplier"} on separate private threads.</p>
              {e.complaints.map((c) => (
                <div key={c.id} className="mt-2.5 flex items-center justify-between gap-2 rounded-lg border border-line px-3 py-2 text-[12.5px]">
                  <span className="min-w-0 truncate text-ink"><span className="font-mono text-[11px] text-muted">{c.ticketNo}</span> · {c.subject}{c.filedById !== self.id && <span className="text-muted"> (by {isSupplier ? "buyer" : "supplier"})</span>}</span>
                  <Link href={`${isSupplier ? "/supplier" : self.role === "PROVIDER" ? "/lab" : "/dashboard"}/complaints/${c.id}`} className="shrink-0 font-medium text-blue hover:underline">Open <StatusBadge status={c.status} /></Link>
                </div>
              ))}
              <form action={fileEnquiryComplaint.bind(null, e.id)} className="mt-3 space-y-2.5">
                <input name="subject" required maxLength={140} placeholder="Subject, e.g. order arrived damaged" className="w-full rounded-lg border border-line bg-surface px-3 py-2 text-[12.5px] text-ink outline-none focus:border-navy-3" />
                <textarea name="details" required rows={2} placeholder="What happened and what you need…" className="w-full resize-y rounded-lg border border-line bg-surface px-3 py-2 text-[12.5px] text-ink outline-none focus:border-navy-3" />
                <SubmitButton className="btn-outline !py-2 text-[12px]">File complaint</SubmitButton>
              </form>
            </div>
          )}
        </div>

        {/* conversation + timeline */}
        <div className="lg:col-span-3">
          <EnquiryThread
            enquiryId={e.id}
            title={isSupplier ? `You ↔ ${buyerOrg ?? e.buyer.name}` : `You ↔ ${e.supplier.orgName}`}
            subtitle="Order conversation, offers, shipment events and delivery all land here"
            messages={msgs}
            selfId={self.id}
            locked={e.status === "CLOSED"}
          />
        </div>
      </div>
    </>
  );
}
