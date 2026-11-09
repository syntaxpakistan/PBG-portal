export const instant = false

import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";
import { PageHead, StatusBadge, StatCard } from "@/components/portal/ui";
import {
  ConfirmPaymentButton, RejectPaymentButton, AdminRecordPaymentForm,
  VoidInvoiceButton, PayoutForm, PayoutStatusButtons,
} from "@/components/portal/billing-buttons";

const METHOD_LABELS: Record<string, string> = {
  BANK_TRANSFER: "Bank", JAZZCASH: "JazzCash", EASYPAISA: "EasyPaisa",
  CARD: "Card", CASH: "Cash", OTHER: "Other",
};
const money = (n: number, c = "PKR") => c === "USD" ? `$${n.toLocaleString()}` : `PKR ${n.toLocaleString()}`;

export default async function FinancePage() {
  await requireRole("ADMIN");
  const [pendingPayments, invoices, payouts, providers, suppliers] = await Promise.all([
    prisma.payment.findMany({
      where: { status: "PENDING" },
      include: { invoice: { include: { billedUser: { select: { name: true, email: true, role: true } } } } },
      orderBy: { createdAt: "asc" },
    }),
    prisma.invoice.findMany({
      include: { items: true, payments: true, billedUser: { select: { name: true, email: true, role: true } } },
      orderBy: { createdAt: "desc" },
      take: 150,
    }),
    prisma.payout.findMany({ orderBy: { createdAt: "desc" }, take: 100 }),
    prisma.providerProfile.findMany({ where: { status: "APPROVED" }, select: { id: true, orgName: true }, orderBy: { orgName: "asc" } }),
    prisma.supplierProfile.findMany({ where: { status: "APPROVED" }, select: { id: true, orgName: true }, orderBy: { orgName: "asc" } }),
  ]);

  const collected = invoices.reduce((n, i) => n + i.payments.filter((p) => p.status === "CONFIRMED").reduce((s, p) => s + p.amount, 0), 0);
  const billed = invoices.filter((i) => i.status !== "VOID").reduce((n, i) => n + i.total, 0);
  const outstanding = invoices.reduce((n, i) => {
    if (i.status === "PAID" || i.status === "VOID") return n;
    const paid = i.payments.filter((p) => p.status === "CONFIRMED").reduce((s, p) => s + p.amount, 0);
    return n + Math.max(0, i.total - paid);
  }, 0);

  const payees = [
    ...providers.map((p) => ({ type: "PROVIDER", id: p.id, org: p.orgName })),
    ...suppliers.map((p) => ({ type: "SUPPLIER", id: p.id, org: p.orgName })),
  ];

  return (
    <>
      <PageHead title="Finance" sub="Billing ledger — invoices, payments, platform fees and partner payouts." />
      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Billed" value={money(billed)} sub={`${invoices.filter((i) => i.status !== "VOID").length} invoices`} />
        <StatCard label="Collected" value={money(collected)} sub="confirmed payments" />
        <StatCard label="Outstanding" value={money(outstanding)} sub="open balance" />
        <StatCard label="Pending verification" value={pendingPayments.length} sub="payments awaiting confirm" />
      </div>

      {/* pending payments */}
      <h3 className="mb-3 text-[15px] font-semibold text-ink">Payments to verify</h3>
      <div className="card mb-8 divide-y divide-line">
        {pendingPayments.length === 0 && <p className="px-5 py-8 text-center text-[13px] text-muted">Nothing awaiting confirmation.</p>}
        {pendingPayments.map((p) => (
          <div key={p.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5">
            <div className="text-[13px]">
              <span className="font-mono font-semibold text-ink">{p.invoice.number}</span>
              <span className="ml-2 text-body">{p.invoice.billedOrg} ({p.invoice.billedUser.email})</span>
              <span className="ml-2 text-muted">{money(p.amount, p.invoice.currency)} · {METHOD_LABELS[p.method] ?? p.method}{p.reference ? ` · ${p.reference}` : ""} · {p.createdAt.toLocaleDateString()}</span>
              {p.receiptKey && <a href={`/api/files/${p.receiptKey}`} className="ml-2 text-blue hover:underline">receipt</a>}
            </div>
            <div className="flex gap-2">
              <ConfirmPaymentButton paymentId={p.id} label="Confirm receipt" />
              <RejectPaymentButton paymentId={p.id} />
            </div>
          </div>
        ))}
      </div>

      {/* invoices */}
      <h3 className="mb-3 text-[15px] font-semibold text-ink">Invoices</h3>
      <div className="card mb-8 overflow-hidden">
        <div className="overflow-x-auto"><table className="w-full min-w-[900px] text-left text-[13px]">
          <thead className="border-b border-line bg-paper-2 text-[11px] uppercase tracking-wider text-muted">
            <tr>
              <th className="px-5 py-3 font-semibold">Invoice</th>
              <th className="px-5 py-3 font-semibold">Billed to</th>
              <th className="px-5 py-3 font-semibold">Issued by</th>
              <th className="px-5 py-3 font-semibold">Total</th>
              <th className="px-5 py-3 font-semibold">Status</th>
              <th className="px-5 py-3 font-semibold">Payments</th>
              <th className="px-5 py-3 font-semibold"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {invoices.map((inv) => {
              const confirmed = inv.payments.filter((p) => p.status === "CONFIRMED").reduce((s, p) => s + p.amount, 0);
              const out = Math.max(0, inv.total - confirmed);
              const open = inv.status !== "PAID" && inv.status !== "VOID";
              return (
                <tr key={inv.id} className="hover:bg-paper-2/60">
                  <td className="px-5 py-3">
                    <div className="font-mono text-[12px] font-semibold text-ink">{inv.number}</div>
                    <div className="text-[11px] text-muted">{inv.issuedAt.toLocaleDateString()}{inv.dueAt ? ` · due ${inv.dueAt.toLocaleDateString()}` : ""}</div>
                  </td>
                  <td className="px-5 py-3">
                    <div className="font-medium text-ink">{inv.billedOrg}</div>
                    <div className="text-[11px] text-muted">{inv.billedUser.email}</div>
                  </td>
                  <td className="px-5 py-3 text-body">{inv.issuerType === "PLATFORM" ? "Syntax" : inv.issuerType.toLowerCase()}</td>
                  <td className="px-5 py-3 font-medium text-ink">{money(inv.total, inv.currency)}</td>
                  <td className="px-5 py-3"><StatusBadge status={inv.status} /></td>
                  <td className="px-5 py-3 text-[12px] text-body">
                    {inv.payments.length === 0 ? "—" : (
                      <>
                        {money(confirmed, inv.currency)} confirmed
                        {inv.payments.some((p) => p.status === "PENDING") && <span className="ml-1 text-(--st-amber-fg)">· {inv.payments.filter((p) => p.status === "PENDING").length} pending</span>}
                        {out > 0 && <span className="ml-1 text-muted">· {money(out, inv.currency)} due</span>}
                      </>
                    )}
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex flex-wrap items-center gap-2">
                      {open && <AdminRecordPaymentForm invoiceId={inv.id} outstanding={out || inv.total} currency={inv.currency} />}
                      {open && inv.payments.every((p) => p.status !== "CONFIRMED") && <VoidInvoiceButton invoiceId={inv.id} />}
                    </div>
                  </td>
                </tr>
              );
            })}
            {invoices.length === 0 && <tr><td colSpan={7} className="px-5 py-8 text-center text-muted">No invoices yet.</td></tr>}
          </tbody>
        </table></div>
      </div>

      {/* payouts */}
      <h3 className="mb-3 text-[15px] font-semibold text-ink">Partner payouts</h3>
      <div className="card mb-6 p-5">
        <PayoutForm payees={payees} />
      </div>
      <div className="card divide-y divide-line">
        {payouts.length === 0 && <p className="px-5 py-8 text-center text-[13px] text-muted">No payouts scheduled.</p>}
        {payouts.map((p) => (
          <div key={p.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5">
            <div className="text-[13px]">
              <span className="font-medium text-ink">{p.payeeOrg}</span>
              <span className="ml-2 rounded-full bg-paper-2 px-2 py-0.5 text-[10.5px] font-semibold text-body">{p.payeeType.toLowerCase()}</span>
              <span className="ml-2 text-muted">{p.periodStart.toLocaleDateString()} → {p.periodEnd.toLocaleDateString()}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[12px] text-body">gross {p.grossAmount.toLocaleString()} − fees {p.feeAmount.toLocaleString()}</span>
              <span className="font-display text-[16px] font-medium text-ink">{p.netAmount.toLocaleString()} PKR</span>
              <StatusBadge status={p.status} />
              <PayoutStatusButtons id={p.id} status={p.status} />
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
