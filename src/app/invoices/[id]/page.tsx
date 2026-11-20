export const instant = false

import Image from "next/image";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { getPaymentInstructions } from "@/lib/settings";
import { FileLink } from "@/components/portal/file-link";
import { PrintButton } from "./print-button";

const HOME: Record<string, string> = { CUSTOMER: "/dashboard/billing", PROVIDER: "/lab/billing", SUPPLIER: "/supplier/billing", ADMIN: "/admin/finance" };
const METHOD: Record<string, string> = { BANK_TRANSFER: "Bank transfer", JAZZCASH: "JazzCash", EASYPAISA: "EasyPaisa", CARD: "Card", CASH: "Cash", OTHER: "Other" };
const money = (n: number, cur: string) => `${cur} ${n.toLocaleString()}`;

export default async function InvoicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSession();
  if (!session) redirect("/login");

  const inv = await prisma.invoice.findUnique({
    where: { id },
    include: {
      items: true,
      payments: { orderBy: { createdAt: "asc" } },
      billedUser: { select: { name: true, email: true, role: true, customerProfile: { select: { orgNo: true } }, providerProfile: { select: { orgNo: true } }, supplierProfile: { select: { orgNo: true } } } },
      milestones: { select: { title: true, project: { select: { refNo: true } } } },
      transactions: { select: { txnNo: true, project: { select: { refNo: true } } } },
      enquiry: { select: { enquiryNo: true, product: { select: { name: true } } } },
      subscription: { select: { plan: true } },
    },
  });
  if (!inv) notFound();

  // access: billed party, issuer's org member, or admin
  let isIssuer = false;
  if (inv.issuerType === "PROVIDER" && inv.issuerId) {
    const p = await prisma.providerProfile.findUnique({ where: { id: inv.issuerId }, select: { userId: true } });
    isIssuer = p?.userId === session.user.id;
  } else if (inv.issuerType === "SUPPLIER" && inv.issuerId) {
    const s = await prisma.supplierProfile.findUnique({ where: { id: inv.issuerId }, select: { userId: true } });
    isIssuer = s?.userId === session.user.id;
  } else if (inv.issuerType === "PLATFORM") {
    isIssuer = session.user.role === "ADMIN";
  }
  if (inv.billedUserId !== session.user.id && !isIssuer && session.user.role !== "ADMIN") redirect("/login");

  // resolve issuer display
  let issuerName = "Syntax of Life (Pvt) Ltd";
  let issuerSub = "Pakistan Biotechnology Gateway · biotechnologygateway.com";
  let issuerRef = "";
  if (inv.issuerType === "PROVIDER" && inv.issuerId) {
    const p = await prisma.providerProfile.findUnique({ where: { id: inv.issuerId }, select: { orgName: true, orgNo: true, city: true } });
    issuerName = p?.orgName ?? "Provider";
    issuerSub = `Laboratory partner${p?.city ? ` · ${p.city}` : ""}`;
    issuerRef = p?.orgNo ?? "";
  } else if (inv.issuerType === "SUPPLIER" && inv.issuerId) {
    const s = await prisma.supplierProfile.findUnique({ where: { id: inv.issuerId }, select: { orgName: true, orgNo: true, city: true } });
    issuerName = s?.orgName ?? "Supplier";
    issuerSub = `Supply partner${s?.city ? ` · ${s.city}` : ""}`;
    issuerRef = s?.orgNo ?? "";
  }

  const billedRef = inv.billedUser.customerProfile?.orgNo ?? inv.billedUser.providerProfile?.orgNo ?? inv.billedUser.supplierProfile?.orgNo ?? "";
  const purpose =
    inv.milestones[0] ? `Project milestone, ${inv.milestones[0].project.refNo} · ${inv.milestones[0].title}` :
    inv.transactions[0] ? `Platform fee, ${inv.transactions[0].txnNo}${inv.transactions[0].project ? ` · ${inv.transactions[0].project.refNo}` : ""}` :
    inv.enquiry ? `Supply order, ${inv.enquiry.enquiryNo} · ${inv.enquiry.product.name}` :
    inv.subscription ? `Gateway subscription, ${inv.subscription.plan} plan` :
    "Marketplace services";
  const escrowed = inv.milestones.length > 0 || !!inv.enquiry;

  const confirmed = inv.payments.filter((p) => p.status === "CONFIRMED").reduce((s, p) => s + p.amount, 0);
  const balance = Math.max(0, inv.total - confirmed);
  const payTo = await getPaymentInstructions();
  const back = HOME[session.user.role ?? "CUSTOMER"] ?? "/";

  return (
    <main className="min-h-screen bg-paper-2 py-10 print:bg-white print:py-0">
      <div className="mx-auto max-w-3xl px-6">
        <div className="mb-4 flex items-center justify-between print:hidden">
          <Link href={back} className="inline-flex items-center gap-1.5 text-[12.5px] text-muted hover:text-ink">
            <ArrowLeft className="size-3.5" /> Back to billing
          </Link>
          <PrintButton />
        </div>

        <div className="overflow-hidden rounded-2xl border border-line bg-surface shadow-sm print:rounded-none print:border-0 print:shadow-none">
          {/* header */}
          <div className="flex items-start justify-between border-b-2 border-navy px-8 py-6">
            <div className="flex items-center gap-3">
              <Image src="/brand/pbg-logo-dark.webp" alt="Pakistan Biotechnology Gateway" width={1024} height={334} priority className="h-11 w-auto" />
            </div>
            <div className="text-right">
              <div className="font-display text-[24px] font-semibold uppercase tracking-wide text-ink">Invoice</div>
              <div className="font-mono text-[13px] font-semibold text-navy">{inv.number}</div>
              <div className={`mt-1 inline-block rounded-full px-2.5 py-0.5 text-[10.5px] font-bold uppercase tracking-wider ${inv.status === "PAID" ? "bg-green-100 text-green-800" : inv.status === "VOID" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-800"}`}>
                {inv.status.replace("_", " ")}
              </div>
            </div>
          </div>

          {/* parties */}
          <div className="grid gap-6 px-8 py-6 sm:grid-cols-2">
            <div>
              <div className="text-[10.5px] font-bold uppercase tracking-wider text-muted">From</div>
              <div className="mt-1.5 text-[15px] font-semibold text-ink">{issuerName}</div>
              <div className="mt-0.5 text-[12.5px] text-body">{issuerSub}</div>
              {issuerRef && <div className="mt-0.5 font-mono text-[11.5px] text-muted">{issuerRef}</div>}
            </div>
            <div className="sm:text-right">
              <div className="text-[10.5px] font-bold uppercase tracking-wider text-muted">Billed to</div>
              <div className="mt-1.5 text-[15px] font-semibold text-ink">{inv.billedOrg}</div>
              <div className="mt-0.5 text-[12.5px] text-body">{inv.billedUser.name} · {inv.billedEmail}</div>
              {billedRef && <div className="mt-0.5 font-mono text-[11.5px] text-muted">{billedRef}</div>}
            </div>
          </div>

          {/* meta */}
          <div className="grid grid-cols-3 gap-4 border-y border-line bg-paper-2 px-8 py-3.5 text-[12px] print:bg-white">
            <div><span className="text-muted">Issued</span><div className="mt-0.5 font-medium text-ink">{inv.issuedAt.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}</div></div>
            <div><span className="text-muted">Due</span><div className="mt-0.5 font-medium text-ink">{inv.dueAt ? inv.dueAt.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }) : "On receipt"}</div></div>
            <div><span className="text-muted">Purpose</span><div className="mt-0.5 font-medium text-ink">{purpose}</div></div>
          </div>

          {/* line items */}
          <div className="px-8 py-6">
            <table className="w-full text-left text-[13px]">
              <thead>
                <tr className="border-b border-line text-[10.5px] uppercase tracking-wider text-muted">
                  <th className="pb-2 font-semibold">Description</th>
                  <th className="pb-2 text-right font-semibold">Qty</th>
                  <th className="pb-2 text-right font-semibold">Unit price</th>
                  <th className="pb-2 text-right font-semibold">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {inv.items.map((it) => (
                  <tr key={it.id}>
                    <td className="py-3 pr-4 text-ink">{it.description}</td>
                    <td className="py-3 text-right text-body">{it.qty}</td>
                    <td className="py-3 text-right text-body">{money(it.unitPrice, inv.currency)}</td>
                    <td className="py-3 text-right font-medium text-ink">{money(it.amount, inv.currency)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="mt-4 flex justify-end">
              <div className="w-64 space-y-1.5 text-[13px]">
                <div className="flex justify-between"><span className="text-muted">Subtotal</span><span className="text-body">{money(inv.subtotal, inv.currency)}</span></div>
                {inv.taxAmount > 0 && <div className="flex justify-between"><span className="text-muted">Tax</span><span className="text-body">{money(inv.taxAmount, inv.currency)}</span></div>}
                <div className="flex justify-between border-t border-line pt-2 text-[15px] font-semibold"><span className="text-ink">Total</span><span className="text-ink">{money(inv.total, inv.currency)}</span></div>
                {confirmed > 0 && <div className="flex justify-between text-[12.5px]"><span className="text-muted">Paid</span><span className="font-medium text-green-700">−{money(confirmed, inv.currency)}</span></div>}
                {inv.status !== "VOID" && balance > 0 && <div className="flex justify-between text-[14px] font-semibold"><span className="text-ink">Balance due</span><span className="text-amber-700">{money(balance, inv.currency)}</span></div>}
              </div>
            </div>
          </div>

          {/* payments received */}
          {inv.payments.length > 0 && (
            <div className="border-t border-line px-8 py-5">
              <div className="mb-2 text-[10.5px] font-bold uppercase tracking-wider text-muted">Payments received</div>
              <div className="space-y-1.5">
                {inv.payments.map((p) => (
                  <div key={p.id} className="flex flex-wrap items-center gap-x-3 text-[12.5px] text-body">
                    <span className="font-mono font-semibold text-ink">{p.paymentNo}</span>
                    <span>{money(p.amount, inv.currency)}</span>
                    <span>{METHOD[p.method] ?? p.method}{p.reference ? ` · ref ${p.reference}` : ""}</span>
                    <span className="text-muted">{p.createdAt.toLocaleDateString()}</span>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${p.status === "CONFIRMED" ? "bg-green-100 text-green-800" : p.status === "REJECTED" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-800"}`}>{p.status}</span>
                    {p.receiptKey && <FileLink storageKey={p.receiptKey} filename={p.receiptKey} label="receipt" />}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* pay-to */}
          {inv.status !== "PAID" && inv.status !== "VOID" && (
            <div className="border-t border-line bg-paper-2 px-8 py-5 print:bg-white">
              <div className="mb-2 text-[10.5px] font-bold uppercase tracking-wider text-muted">How to pay</div>
              <div className="grid gap-4 text-[12.5px] sm:grid-cols-2">
                <dl className="space-y-1.5">
                  <div className="flex gap-2"><dt className="w-24 shrink-0 text-muted">Account title</dt><dd className="font-medium text-ink">{payTo.accountTitle || "—"}</dd></div>
                  <div className="flex gap-2"><dt className="w-24 shrink-0 text-muted">Bank</dt><dd className="font-medium text-ink">{payTo.bankName || "—"}</dd></div>
                  <div className="flex gap-2"><dt className="w-24 shrink-0 text-muted">IBAN / A/C</dt><dd className="font-mono font-semibold text-ink">{payTo.iban || "—"}</dd></div>
                </dl>
                <p className="text-body">
                  {payTo.instructions || `Quote invoice ${inv.number} as the payment reference, then report the payment from your Billing page with the transfer receipt, Syntax confirms receipt and settles this invoice.`}
                  {escrowed && " Payments on this invoice are held in escrow by Syntax and released to the partner on confirmation."}
                </p>
              </div>
            </div>
          )}

          {/* terms */}
          <div className="border-t border-line px-8 py-5 text-[11px] leading-relaxed text-muted">
            <div className="mb-1.5 font-bold uppercase tracking-wider">Terms</div>
            <ol className="list-decimal space-y-1 pl-4">
              <li>This is a system-generated invoice from the Pakistan Biotechnology Gateway; no physical signature is required.</li>
              <li>Payment is due by the date shown. Unpaid invoices may suspend the related service, project milestone or subscription.</li>
              <li>Amounts are in Pakistani Rupees (PKR) and inclusive/exclusive of taxes as itemised above.</li>
              <li>Reported payments settle only after Syntax confirms receipt into the stated account. Keep your transfer receipt until this invoice shows PAID.</li>
              <li>Disputes must be raised through the portal&apos;s complaint channel within 7 days of issue, quoting {inv.number}.</li>
              <li>For questions contact <span className="font-medium text-ink">info@biotechnologygateway.com</span>.</li>
            </ol>
          </div>
        </div>
      </div>
    </main>
  );
}
