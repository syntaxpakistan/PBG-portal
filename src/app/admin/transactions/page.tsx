export const instant = false

import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PageHead, StatusBadge } from "@/components/portal/ui";
import { Pagination, PAGE_SIZE, pageOf } from "@/components/portal/pagination";
import { pkr } from "@/lib/constants";
import { TxnButtons } from "./buttons";
import { IssueFeeButton } from "@/components/portal/billing-buttons";

export default async function TransactionsPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const sp = await searchParams;
  const page = pageOf(sp);
  const [txns, total, agg, pendingAgg] = await Promise.all([
    prisma.transaction.findMany({
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: {
      project: {
        select: {
          id: true,
          refNo: true,
          customer: { select: { name: true } },
          provider: { select: { orgName: true } },
        },
      },
      enquiry: {
        select: {
          id: true,
          qty: true,
          product: { select: { name: true } },
          buyer: { select: { name: true } },
          supplier: { select: { orgName: true } },
        },
      },
      invoice: { select: { id: true } },
      },
    }),
    prisma.transaction.count(),
    prisma.transaction.aggregate({ _sum: { quotedValue: true, feeAmount: true } }),
    prisma.transaction.aggregate({ where: { status: "PENDING" }, _sum: { feeAmount: true } }),
  ]);
  const totals = {
    volume: agg._sum.quotedValue ?? 0,
    fees: agg._sum.feeAmount ?? 0,
    pending: pendingAgg._sum.feeAmount ?? 0,
  };

  return (
    <>
      <PageHead
        title="Transactions & platform fees"
        sub={`Total volume ${pkr(totals.volume)} · fees accrued ${pkr(totals.fees)} · ${pkr(totals.pending)} pending.`}
        action={<Link href="/api/admin/export/transactions" className="btn-outline !py-2 text-[12.5px]">Export CSV</Link>}
      />
      <div className="card overflow-hidden">
        <div className="overflow-x-auto"><table className="w-full min-w-[760px] text-left text-[13px]">
          <thead className="border-b border-line bg-paper-2 text-[11px] uppercase tracking-wider text-muted">
            <tr>
              <th className="px-5 py-3 font-semibold">Project</th>
              <th className="px-5 py-3 font-semibold">Customer → Provider</th>
              <th className="px-5 py-3 font-semibold">Quoted value</th>
              <th className="px-5 py-3 font-semibold">Fee</th>
              <th className="px-5 py-3 font-semibold">Status</th>
              <th className="px-5 py-3 font-semibold"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {txns.map((t) => (
              <tr key={t.id} className="hover:bg-paper-2/60">
                <td className="px-5 py-3 font-medium text-ink">
                  {t.project ? (
                    <Link href={`/admin/projects/${t.project.id}`} className="hover:text-blue hover:underline">{t.project.refNo}</Link>
                  ) : (
                    <span className="text-body">Supply sale{t.enquiry ? ` · ${t.enquiry.product.name} × ${t.enquiry.qty}` : ""}</span>
                  )}
                </td>
                <td className="px-5 py-3 text-body">
                  {t.project
                    ? `${t.project.customer.name} → ${t.project.provider.orgName}`
                    : t.enquiry ? `${t.enquiry.buyer.name} → ${t.enquiry.supplier.orgName}` : "—"}
                </td>
                <td className="px-5 py-3 font-medium text-ink">{pkr(t.quotedValue)}</td>
                <td className="px-5 py-3 text-body">{pkr(t.feeAmount)} ({t.feePercent}%)</td>
                <td className="px-5 py-3"><StatusBadge status={t.status} /></td>
                <td className="px-5 py-3">
                  <div className="flex items-center gap-2">
                    {!t.invoice && t.status === "PENDING" && <IssueFeeButton transactionId={t.id} />}
                    <TxnButtons id={t.id} status={t.status} />
                  </div>
                </td>
              </tr>
            ))}
            {txns.length === 0 && <tr><td colSpan={6} className="px-5 py-8 text-center text-muted">No transactions yet — they appear when quotes are awarded.</td></tr>}
          </tbody>
        </table></div>
        <Pagination page={page} total={total} base="/admin/transactions" />
      </div>
    </>
  );
}
