export const instant = false

import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PageHead, StatCard, StatusBadge } from "@/components/portal/ui";
import { pkr } from "@/lib/constants";

export default async function AdminPage() {
  const [pendingProviders, pendingSuppliers, openRfqs, activeProjects, txns, complaints, audit] = await Promise.all([
    prisma.providerProfile.count({ where: { status: "PENDING" } }),
    prisma.supplierProfile.count({ where: { status: "PENDING" } }),
    prisma.rfq.count({ where: { status: "OPEN" } }),
    prisma.project.count({ where: { status: { notIn: ["COMPLETED", "CANCELLED"] } } }),
    prisma.transaction.findMany({ orderBy: { createdAt: "desc" }, take: 6, include: { project: { select: { refNo: true } } } }),
    prisma.complaint.count({ where: { status: { in: ["OPEN", "IN_REVIEW"] } } }),
    prisma.auditLog.findMany({ orderBy: { createdAt: "desc" }, take: 8, include: { actor: { select: { name: true } } } }),
  ]);
  const feesPending = txns.filter((t) => t.status === "PENDING").reduce((n, t) => n + t.feeAmount, 0);

  return (
    <>
      <PageHead title="Platform overview" sub="Governance, verification and commercial health of the Gateway." />
      <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Pending verifications" value={pendingProviders + pendingSuppliers} sub={`${pendingProviders} labs · ${pendingSuppliers} suppliers`} />
        <StatCard label="Open RFQs" value={openRfqs} />
        <StatCard label="Active projects" value={activeProjects} />
        <StatCard label="Fees pending" value={pkr(feesPending)} sub={`${complaints} open complaints`} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card overflow-hidden">
          <div className="flex items-center justify-between border-b border-line px-5 py-3.5">
            <h3 className="text-[14px] font-semibold text-ink">Recent transactions</h3>
            <Link href="/admin/transactions" className="text-[12px] font-medium text-blue hover:underline">All →</Link>
          </div>
          <div className="divide-y divide-line">
            {txns.map((t) => (
              <div key={t.id} className="flex items-center justify-between px-5 py-3">
                <div>
                  <div className="text-[13px] font-medium text-ink">{t.project.refNo}</div>
                  <div className="text-[11.5px] text-muted">{pkr(t.quotedValue)} · fee {pkr(t.feeAmount)}</div>
                </div>
                <StatusBadge status={t.status} />
              </div>
            ))}
            {txns.length === 0 && <p className="px-5 py-6 text-center text-[12.5px] text-muted">No transactions yet.</p>}
          </div>
        </div>
        <div className="card overflow-hidden">
          <div className="flex items-center justify-between border-b border-line px-5 py-3.5">
            <h3 className="text-[14px] font-semibold text-ink">Latest activity</h3>
            <Link href="/admin/audit" className="text-[12px] font-medium text-blue hover:underline">Audit log →</Link>
          </div>
          <div className="divide-y divide-line">
            {audit.map((a) => (
              <div key={a.id} className="px-5 py-3">
                <div className="text-[12.5px] text-ink"><span className="font-medium">{a.actor.name}</span> · {a.action}</div>
                <div className="mt-0.5 text-[11px] text-muted">{a.entity} {a.entityId.slice(0, 8)}… · {a.createdAt.toLocaleString()}{a.meta ? ` · ${a.meta}` : ""}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
