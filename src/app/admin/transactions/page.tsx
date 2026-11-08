export const instant = false

import { prisma } from "@/lib/prisma";
import { PageHead, StatusBadge } from "@/components/portal/ui";
import { pkr } from "@/lib/constants";
import { TxnButtons } from "./buttons";

export default async function TransactionsPage() {
  const txns = await prisma.transaction.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      project: {
        select: {
          id: true,
          refNo: true,
          customer: { select: { name: true } },
          provider: { select: { orgName: true } },
        },
      },
    },
  });
  const totals = txns.reduce(
    (acc, t) => ({
      volume: acc.volume + t.quotedValue,
      fees: acc.fees + t.feeAmount,
      pending: acc.pending + (t.status === "PENDING" ? t.feeAmount : 0),
    }),
    { volume: 0, fees: 0, pending: 0 }
  );

  return (
    <>
      <PageHead
        title="Transactions & platform fees"
        sub={`Total volume ${pkr(totals.volume)} · fees accrued ${pkr(totals.fees)} · ${pkr(totals.pending)} pending.`}
        action={<a href="/api/admin/export/transactions" className="btn-outline !py-2 text-[12.5px]">Export CSV</a>}
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
                  <a href={`/admin/projects/${t.project.id}`} className="hover:text-blue hover:underline">{t.project.refNo}</a>
                </td>
                <td className="px-5 py-3 text-body">{t.project.customer.name} → {t.project.provider.orgName}</td>
                <td className="px-5 py-3 font-medium text-ink">{pkr(t.quotedValue)}</td>
                <td className="px-5 py-3 text-body">{pkr(t.feeAmount)} ({t.feePercent}%)</td>
                <td className="px-5 py-3"><StatusBadge status={t.status} /></td>
                <td className="px-5 py-3"><TxnButtons id={t.id} status={t.status} /></td>
              </tr>
            ))}
            {txns.length === 0 && <tr><td colSpan={6} className="px-5 py-8 text-center text-muted">No transactions yet — they appear when quotes are awarded.</td></tr>}
          </tbody>
        </table></div>
      </div>
    </>
  );
}
