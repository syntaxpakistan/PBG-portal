import { PageHead, StatusBadge, StatCard } from "@/components/portal/ui";
import { FileLink } from "@/components/portal/file-link";
import { PLANS } from "@/lib/plans";
import { getPlanPrices } from "@/lib/settings";
import type { PartnerAccess } from "@/lib/entitlements";
import type { Invoice, Payment, Payout } from "@prisma/client";
import {
  ReportPaymentForm, ConfirmPaymentButton, RejectPaymentButton,
  AttachReceiptForm, PlanPicker,
} from "@/components/portal/billing-buttons";

export type InvoiceWithDetails = Invoice & {
  items: { id: string; description: string; qty: number; unitPrice: number; amount: number }[];
  payments: (Payment & { invoice?: { number: string } })[];
};

const METHOD_LABELS: Record<string, string> = {
  BANK_TRANSFER: "Bank", JAZZCASH: "JazzCash", EASYPAISA: "EasyPaisa",
  CARD: "Card", CASH: "Cash", OTHER: "Other",
};

function money(amount: number, currency: string) {
  return currency === "USD" ? `$${amount.toLocaleString()}` : `PKR ${amount.toLocaleString()}`;
}

function outstanding(inv: InvoiceWithDetails) {
  const confirmed = inv.payments.filter((p) => p.status === "CONFIRMED").reduce((n, p) => n + p.amount, 0);
  return Math.max(0, inv.total - confirmed);
}

export async function BillingView({
  access, payables, receivables, payouts, pendingForMe, canSubscribe = true,
}: {
  access: PartnerAccess;
  payables: InvoiceWithDetails[];
  receivables: InvoiceWithDetails[];
  payouts: Payout[];
  pendingForMe: { payment: Payment & { invoice: Invoice }; canConfirm: boolean }[];
  /** false for customers — subscriptions are partner-only; clients never pick a plan */
  canSubscribe?: boolean;
}) {
  const openPayables = payables.filter((i) => i.status !== "PAID" && i.status !== "VOID");
  const nextPayout = payouts.find((p) => p.status === "PLANNED" || p.status === "PROCESSING");

  // totals are grouped per currency — invoices mix USD (subscriptions) and PKR (marketplace)
  const sumByCurrency = (list: InvoiceWithDetails[], fn: (i: InvoiceWithDetails) => number) => {
    const map = new Map<string, number>();
    for (const i of list) map.set(i.currency, (map.get(i.currency) ?? 0) + fn(i));
    return [...map.entries()].sort(([a], [b]) => a.localeCompare(b));
  };
  const owedByCur = sumByCurrency(openPayables, outstanding);
  const paidByCur = sumByCurrency(payables.filter((i) => i.status === "PAID"), (i) => i.total);
  const collectedByCur = sumByCurrency(receivables.filter((i) => i.status === "PAID"), (i) => i.total);
  const planPrices = await getPlanPrices();
  const planOptions = (Object.keys(PLANS) as (keyof typeof PLANS)[]).map((k) => ({ key: k, label: PLANS[k].label, price: planPrices[k], tagline: PLANS[k].tagline }));

  return (
    <>
      <PageHead title="Billing & statements" sub="Invoices, payments and payouts — your account ledger on the Gateway." />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {owedByCur.length === 0
          ? <StatCard label="You owe" value="—" sub="no open invoices" />
          : owedByCur.map(([cur, amt]) => (
              <StatCard key={cur} label="You owe" value={money(amt, cur)} sub={`${openPayables.filter((i) => i.currency === cur).length} open invoice${openPayables.filter((i) => i.currency === cur).length === 1 ? "" : "s"}`} />
            ))}
        {paidByCur.map(([cur, amt]) => (
          <StatCard key={cur} label="Paid to Syntax" value={money(amt, cur)} sub="settled invoices" />
        ))}
        {collectedByCur.map(([cur, amt]) => (
          <StatCard key={cur} label="Collected" value={money(amt, cur)} sub="confirmed on your invoices" />
        ))}
        <StatCard label="Next payout" value={nextPayout ? `PKR ${nextPayout.netAmount.toLocaleString()}` : "—"} sub={nextPayout ? `${nextPayout.status.toLowerCase()} · ${nextPayout.periodEnd.toLocaleDateString()}` : "none scheduled"} />
      </div>

      {/* plan card */}
      {access.hasSubscription && access.plan && (
        <div className="card mb-6 p-5">
          <div className="flex items-baseline justify-between gap-3">
            <h3 className="text-[16px] font-semibold text-ink">{PLANS[access.plan].label} plan</h3>
            <span className="font-display text-[24px] font-medium text-ink">${access.priceUsd.toLocaleString()}<span className="text-[12px] font-normal text-muted">/mo</span></span>
          </div>
          <p className="mt-1 text-[12px] text-muted">
            Status: <span className="font-medium text-ink">{access.status?.toLowerCase().replace("_", " ")}</span>
            {access.expiresAt && <> · paid through {access.expiresAt.toLocaleDateString()}{access.daysLeft != null && access.daysLeft < 0 ? ` (${Math.abs(access.daysLeft)}d overdue)` : access.daysLeft != null ? ` (${access.daysLeft}d left)` : ""}</>}
            {access.inGrace && <span className="ml-1 font-medium text-(--st-amber-fg)">— grace period</span>}
          </p>
          <PlanPicker current={access.plan} plans={planOptions} />
          <p className="mt-2 text-[11.5px] text-muted">Plan changes are reviewed by Syntax and applied from the next billing cycle.</p>
        </div>
      )}

      {/* no subscription yet — partners pick a plan (creates sub + invoice) */}
      {canSubscribe && !access.hasSubscription && (
        <div className="card mb-6 p-5">
          <h3 className="text-[14px] font-semibold text-ink">Choose your plan</h3>
          <p className="mt-1 text-[12px] text-muted">
            {access.plan ? "" : "No subscription on file. Pick a plan to activate paid features — an invoice is issued immediately and your plan activates once payment is confirmed."}
          </p>
          <PlanPicker current="" plans={planOptions} />
        </div>
      )}

      {/* payments awaiting my confirmation (issuer side) */}
      {pendingForMe.length > 0 && (
        <div className="card mb-6 overflow-hidden">
          <div className="border-b border-line px-5 py-3.5"><h3 className="text-[14px] font-semibold text-ink">Payments to verify ({pendingForMe.length})</h3></div>
          <div className="divide-y divide-line">
            {pendingForMe.map(({ payment: p, canConfirm }) => (
              <div key={p.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5">
                <div className="text-[13px]">
                  <span className="font-medium text-ink">{p.invoice.number}</span>
                  <span className="ml-2 text-body">{p.invoice.billedOrg} · {money(p.amount, p.invoice.currency)}</span>
                  <span className="ml-2 text-[11.5px] text-muted">{METHOD_LABELS[p.method] ?? p.method}{p.reference ? ` · ref ${p.reference}` : ""}</span>
                  {p.receiptKey && <FileLink storageKey={p.receiptKey} filename={p.receiptKey} label="receipt" />}
                </div>
                {canConfirm && (
                  <div className="flex gap-2">
                    <ConfirmPaymentButton paymentId={p.id} label="Money received — confirm" />
                    <RejectPaymentButton paymentId={p.id} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* invoices billed to me */}
      <h3 className="mb-3 text-[15px] font-semibold text-ink">Invoices to pay</h3>
      <div className="card mb-6 divide-y divide-line">
        {payables.length === 0 && <p className="px-5 py-8 text-center text-[13px] text-muted">No invoices yet.</p>}
        {payables.map((inv) => {
          const out = outstanding(inv);
          return (
            <div key={inv.id} className="px-5 py-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[12.5px] font-semibold text-ink">{inv.number}</span>
                    <StatusBadge status={inv.status} />
                  </div>
                  <div className="mt-1 text-[12px] text-muted">
                    {inv.items.map((i) => i.description).join(" · ")} — issued {inv.issuedAt.toLocaleDateString()}
                    {inv.dueAt && ` · due ${inv.dueAt.toLocaleDateString()}`}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-display text-[18px] font-medium text-ink">{money(inv.total, inv.currency)}</div>
                  {out > 0 && inv.status !== "VOID" && <div className="text-[11.5px] text-(--st-amber-fg)">outstanding {money(out, inv.currency)}</div>}
                </div>
              </div>
              {inv.payments.length > 0 && (
                <div className="mt-2 space-y-1">
                  {inv.payments.map((p) => (
                    <div key={p.id} className="flex flex-wrap items-center gap-2 text-[12px] text-body">
                      <StatusBadge status={p.status} />
                      <span>{money(p.amount, inv.currency)} · {METHOD_LABELS[p.method] ?? p.method}{p.reference ? ` · ${p.reference}` : ""} · {p.createdAt.toLocaleDateString()}</span>
                      {p.receiptKey && <FileLink storageKey={p.receiptKey} filename={p.receiptKey} label="receipt" />}
                      {p.status === "PENDING" && p.recordedById && <AttachReceiptForm paymentId={p.id} />}
                    </div>
                  ))}
                </div>
              )}
              {out > 0 && inv.status !== "VOID" && <ReportPaymentForm invoiceId={inv.id} outstanding={out} currency={inv.currency} />}
            </div>
          );
        })}
      </div>

      {/* invoices I issued (lab/supplier receivables) */}
      {receivables.length > 0 && (
        <>
          <h3 className="mb-3 text-[15px] font-semibold text-ink">Invoices you issued</h3>
          <div className="card mb-6 divide-y divide-line">
            {receivables.map((inv) => (
              <div key={inv.id} className="px-5 py-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[12.5px] font-semibold text-ink">{inv.number}</span>
                      <StatusBadge status={inv.status} />
                    </div>
                    <div className="mt-1 text-[12px] text-muted">
                      {inv.billedOrg} · {inv.items.map((i) => i.description).join(" · ")} — {inv.issuedAt.toLocaleDateString()}
                    </div>
                  </div>
                  <div className="font-display text-[18px] font-medium text-ink">{money(inv.total, inv.currency)}</div>
                </div>
                {inv.payments.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {inv.payments.map((p) => (
                      <div key={p.id} className="flex flex-wrap items-center gap-2 text-[12px] text-body">
                        <StatusBadge status={p.status} />
                        <span>{money(p.amount, inv.currency)} · {METHOD_LABELS[p.method] ?? p.method}{p.reference ? ` · ${p.reference}` : ""} · {p.createdAt.toLocaleDateString()}</span>
                        {p.receiptKey && <FileLink storageKey={p.receiptKey} filename={p.receiptKey} label="receipt" />}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}

      {/* payouts */}
      <h3 className="mb-3 text-[15px] font-semibold text-ink">Payouts</h3>
      <div className="card divide-y divide-line">
        {payouts.length === 0 && <p className="px-5 py-8 text-center text-[13px] text-muted">No settlements yet — Syntax schedules payouts after collections clear.</p>}
        {payouts.map((p) => (
          <div key={p.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5">
            <div className="text-[13px]">
              <span className="font-medium text-ink">{p.payeeOrg}</span>
              <span className="ml-2 text-muted">{p.periodStart.toLocaleDateString()} → {p.periodEnd.toLocaleDateString()}</span>
              {p.reference && <span className="ml-2 text-[11.5px] text-muted">ref {p.reference}</span>}
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[12px] text-body">gross {p.grossAmount.toLocaleString()} − fees {p.feeAmount.toLocaleString()}</span>
              <span className="font-display text-[16px] font-medium text-ink">{p.netAmount.toLocaleString()} PKR</span>
              <StatusBadge status={p.status} />
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
