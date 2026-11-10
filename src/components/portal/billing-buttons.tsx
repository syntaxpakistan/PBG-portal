"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Upload } from "lucide-react";
import { toast } from "sonner";
import {
  reportPayment, confirmPayment, rejectPayment, attachReceipt,
  requestPlanChange, adminRecordPayment, voidInvoice,
  createPayout, setPayoutStatus, issueFeeInvoice,
} from "@/lib/actions/billing";

const METHODS = ["BANK_TRANSFER", "JAZZCASH", "EASYPAISA", "CARD", "CASH", "OTHER"];
const input = "w-full rounded-lg border border-line bg-surface px-3 py-2 text-[12.5px] text-ink outline-none focus:border-navy-3";

function useAct() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  return {
    loading,
    async act(fn: () => Promise<unknown>, msg: string) {
      setLoading(true);
      try { await fn(); toast.success(msg); router.refresh(); }
      catch (e) { toast.error(e instanceof Error ? e.message : "Failed"); }
      setLoading(false);
    },
  };
}

const METHOD_LABELS: Record<string, string> = {
  BANK_TRANSFER: "Bank transfer", JAZZCASH: "JazzCash", EASYPAISA: "EasyPaisa",
  CARD: "Card", CASH: "Cash", OTHER: "Other",
};

export function ReportPaymentForm({ invoiceId, outstanding, currency }: { invoiceId: string; outstanding: number; currency: string }) {
  const { loading, act } = useAct();
  return (
    <form
      action={async (fd) => {
        await act(async () => { await reportPayment(invoiceId, fd); }, "Payment reported — awaiting confirmation.");
      }}
      className="mt-3 grid gap-2 rounded-lg bg-paper-2 p-3 sm:grid-cols-[1fr_1fr_1fr_auto]"
    >
      <input name="amount" type="number" step="0.01" min="0.01" max={outstanding} required placeholder={`Amount (${currency})`} className={input} />
      <select name="method" className={input} defaultValue="BANK_TRANSFER">
        {METHODS.map((m) => <option key={m} value={m}>{METHOD_LABELS[m]}</option>)}
      </select>
      <input name="reference" placeholder="Reference / txn ID" className={input} />
      <button type="submit" disabled={loading} className="btn-primary !py-2 text-[12px] justify-center">
        {loading ? <Loader2 className="size-3.5 animate-spin" /> : "Report payment"}
      </button>
      <input name="note" placeholder="Note (optional)" className={`${input} sm:col-span-4`} />
      <label className="flex cursor-pointer items-center gap-2 text-[12px] text-body sm:col-span-4">
        <Upload className="size-3.5" /> Attach receipt (PDF/image)
        <input name="receipt" type="file" className="hidden" />
      </label>
    </form>
  );
}

export function ConfirmPaymentButton({ paymentId, label = "Confirm" }: { paymentId: string; label?: string }) {
  const { loading, act } = useAct();
  return (
    <button disabled={loading} onClick={() => act(() => confirmPayment(paymentId), "Payment confirmed.")}
      className="rounded-full bg-navy px-3 py-1 text-[11.5px] font-medium text-yellow hover:bg-navy-2 disabled:opacity-50">
      {loading ? <Loader2 className="size-3 animate-spin" /> : label}
    </button>
  );
}

export function RejectPaymentButton({ paymentId }: { paymentId: string }) {
  const { loading, act } = useAct();
  return (
    <button disabled={loading}
      onClick={async () => {
        const note = prompt("Reason for rejection (optional)");
        if (note === null) return;
        const fd = new FormData();
        fd.set("note", note);
        await act(async () => { await rejectPayment(paymentId, fd); }, "Payment rejected.");
      }}
      className="rounded-full border border-line px-3 py-1 text-[11.5px] text-muted hover:bg-paper-2 disabled:opacity-50">
      Reject
    </button>
  );
}

export function AttachReceiptForm({ paymentId }: { paymentId: string }) {
  const { loading, act } = useAct();
  return (
    <form action={async (fd) => { await act(async () => { await attachReceipt(paymentId, fd); }, "Receipt attached."); }} className="flex items-center gap-2">
      <input name="receipt" type="file" required className="w-44 text-[11px] text-muted file:mr-2 file:rounded-full file:border-0 file:bg-navy file:px-3 file:py-1 file:text-[11px] file:text-white" />
      <button type="submit" disabled={loading} className="rounded-full border border-line px-3 py-1 text-[11.5px] font-medium text-ink hover:bg-paper-2">
        {loading ? <Loader2 className="size-3 animate-spin" /> : "Attach"}
      </button>
    </form>
  );
}

export function PlanRequestButtons({ current, plans }: { current: string; plans: { key: string; label: string; price: number }[] }) {
  const { loading, act } = useAct();
  return (
    <div className="mt-3 flex flex-wrap gap-2">
      {plans.filter((p) => p.key !== current).map((p) => (
        <button key={p.key} disabled={loading}
          onClick={() => act(() => requestPlanChange(p.key), `Switch to ${p.label} requested — Syntax will confirm.`)}
          className="rounded-full border border-line px-3 py-1 text-[11.5px] font-medium text-ink hover:bg-paper-2 disabled:opacity-50">
          Request {p.label} (${p.price}/mo)
        </button>
      ))}
    </div>
  );
}

// plan list with price pinned right — used on billing pages in every portal
export function PlanPicker({ current, plans }: { current: string; plans: { key: string; label: string; price: number; tagline?: string }[] }) {
  const { loading, act } = useAct();
  return (
    <div className="mt-3 divide-y divide-line rounded-lg border border-line">
      {plans.map((p) => (
        <div key={p.key} className="flex items-center justify-between gap-4 px-4 py-3">
          <div className="min-w-0">
            <span className="text-[13px] font-semibold text-ink">
              {p.label} plan
              {p.key === current && <span className="ml-2 rounded-full bg-(--st-green-bg) px-2 py-0.5 text-[10px] font-medium text-(--st-green-fg)">Current</span>}
            </span>
            {p.tagline && <div className="mt-0.5 truncate text-[11.5px] text-muted">{p.tagline}</div>}
          </div>
          <div className="flex shrink-0 items-center gap-3">
            <span className="font-display text-[18px] font-medium text-ink">${p.price.toLocaleString()}<span className="text-[11px] font-normal text-muted">/mo</span></span>
            {p.key !== current && (
              <button type="button" disabled={loading}
                onClick={() => act(() => requestPlanChange(p.key), `Switch to ${p.label} requested — Syntax will confirm.`)}
                className="rounded-full border border-line px-3 py-1 text-[11.5px] font-medium text-ink hover:bg-paper-2 disabled:opacity-50">
                {loading ? <Loader2 className="size-3 animate-spin" /> : "Request"}
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

export function AdminRecordPaymentForm({ invoiceId, outstanding, currency }: { invoiceId: string; outstanding: number; currency: string }) {
  const { loading, act } = useAct();
  return (
    <form action={async (fd) => { await act(async () => { await adminRecordPayment(invoiceId, fd); }, "Payment recorded."); }}
      className="flex flex-wrap items-center gap-2">
      <input name="amount" type="number" step="0.01" min="0.01" max={outstanding} required placeholder={`Amt ${currency}`} className="w-28 rounded-lg border border-line bg-surface px-2.5 py-1.5 text-[12px] text-ink outline-none focus:border-navy-3" />
      <select name="method" className="rounded-lg border border-line bg-surface px-2.5 py-1.5 text-[12px] text-ink outline-none">
        {METHODS.map((m) => <option key={m} value={m}>{METHOD_LABELS[m]}</option>)}
      </select>
      <input name="reference" placeholder="Ref" className="w-28 rounded-lg border border-line bg-surface px-2.5 py-1.5 text-[12px] text-ink outline-none" />
      <button type="submit" disabled={loading} className="rounded-full bg-navy px-3 py-1.5 text-[11.5px] font-medium text-yellow hover:bg-navy-2">
        {loading ? <Loader2 className="size-3 animate-spin" /> : "Record"}
      </button>
    </form>
  );
}

export function VoidInvoiceButton({ invoiceId }: { invoiceId: string }) {
  const { loading, act } = useAct();
  return (
    <button disabled={loading}
      onClick={async () => {
        const note = prompt("Void reason (optional)");
        if (note === null) return;
        const fd = new FormData();
        fd.set("note", note);
        await act(async () => { await voidInvoice(invoiceId, fd); }, "Invoice voided.");
      }}
      className="rounded-full border border-line px-3 py-1 text-[11.5px] text-muted hover:bg-paper-2">
      Void
    </button>
  );
}

export function IssueFeeButton({ transactionId }: { transactionId: string }) {
  const { loading, act } = useAct();
  return (
    <button disabled={loading} onClick={() => act(() => issueFeeInvoice(transactionId), "Fee invoice issued to provider.")}
      className="rounded-full border border-line px-3 py-1 text-[11.5px] font-medium text-ink hover:bg-paper-2">
      {loading ? <Loader2 className="size-3 animate-spin" /> : "Invoice fee"}
    </button>
  );
}

export function PayoutForm({ payees }: { payees: { type: string; id: string; org: string }[] }) {
  const { loading, act } = useAct();
  const [type, setType] = useState("PROVIDER");
  const filtered = payees.filter((p) => p.type === type);
  return (
    <form action={async (fd) => { await act(async () => { await createPayout(fd); }, "Payout scheduled."); }}
      className="grid gap-2 rounded-lg bg-paper-2 p-3 sm:grid-cols-3">
      <select name="payeeType" value={type} onChange={(e) => setType(e.target.value)} className={input}>
        <option value="PROVIDER">Provider / Lab</option>
        <option value="SUPPLIER">Supplier</option>
      </select>
      <select name="payeeId" required className={input}>
        <option value="">Select payee…</option>
        {filtered.map((p) => <option key={p.id} value={p.id}>{p.org}</option>)}
      </select>
      <input name="periodStart" type="date" required className={input} />
      <input name="periodEnd" type="date" required className={input} />
      <input name="grossAmount" type="number" step="0.01" min="0" required placeholder="Gross PKR" className={input} />
      <input name="feeAmount" type="number" step="0.01" min="0" placeholder="Fees PKR" className={input} />
      <input name="netAmount" type="number" step="0.01" min="0" required placeholder="Net PKR" className={input} />
      <input name="note" placeholder="Note" className={input} />
      <button type="submit" disabled={loading} className="btn-primary inline-flex items-center justify-center gap-1.5 !py-1.5 text-[12px] self-end">
        {loading ? <Loader2 className="size-3.5 animate-spin" /> : "Schedule payout"}
      </button>
    </form>
  );
}

export function PayoutStatusButtons({ id, status }: { id: string; status: string }) {
  const { loading, act } = useAct();
  if (status === "PAID" || status === "CANCELLED") return null;
  return (
    <div className="flex gap-2">
      {status === "PLANNED" && (
        <button disabled={loading} onClick={async () => {
          const fd = new FormData();
          await act(async () => { await setPayoutStatus(id, "PROCESSING", fd); }, "Marked processing.");
        }} className="rounded-full border border-line px-3 py-1 text-[11.5px] font-medium text-ink hover:bg-paper-2">Processing</button>
      )}
      <button disabled={loading} onClick={async () => {
        const reference = prompt("Settlement reference (bank/wallet txn ID)") ?? "";
        const fd = new FormData();
        fd.set("reference", reference);
        await act(async () => { await setPayoutStatus(id, "PAID", fd); }, "Payout marked paid.");
      }} className="rounded-full bg-navy px-3 py-1 text-[11.5px] font-medium text-yellow hover:bg-navy-2">Mark paid</button>
      <button disabled={loading} onClick={async () => {
        const fd = new FormData();
        await act(async () => { await setPayoutStatus(id, "CANCELLED", fd); }, "Payout cancelled.");
      }} className="rounded-full border border-line px-3 py-1 text-[11.5px] text-muted hover:bg-paper-2">Cancel</button>
    </div>
  );
}
