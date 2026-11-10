export const instant = false

import Link from "next/link";
import { connection } from "next/server";
import {
  BadgeCheck, ShieldCheck, Landmark, Inbox, Flag, CreditCard,
  Banknote, ArrowRight, CircleCheck, TriangleAlert,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { PageHead, StatCard, StatusBadge } from "@/components/portal/ui";
import { pkr } from "@/lib/constants";
import { QuickAction, type QuickKind } from "./quick-actions";

type QItem = { key: string; label: string; meta: string; kind?: QuickKind; id?: string; href?: string };

export default async function AdminPage() {
  await connection();
  const monthStart = new Date(); monthStart.setDate(1); monthStart.setHours(0, 0, 0, 0);
  const stale = new Date(Date.now() - 3 * 86400e3);
  const weekAgo = new Date(Date.now() - 7 * 86400e3);
  const [
    pendingProviders, pendingSuppliers, boardQueue, listingQueue,
    pendingPayments, unhandledLeads, openComplaints, subQueue, payoutsDue,
    openRfqs, activeProjects, txns, complaintsCount, audit,
    staleRfqs, stalledProjects, monthFees, monthGmv, newUsers, monthQuotes, feesDueAgg,
  ] = await Promise.all([
    prisma.providerProfile.findMany({ where: { status: "PENDING" }, orderBy: { createdAt: "asc" }, take: 4, select: { id: true, orgName: true, city: true, createdAt: true } }),
    prisma.supplierProfile.findMany({ where: { status: "PENDING" }, orderBy: { createdAt: "asc" }, take: 4, select: { id: true, orgName: true, city: true, createdAt: true } }),
    prisma.rfq.findMany({ where: { visibility: "BOARD", moderation: "PENDING" }, orderBy: { createdAt: "asc" }, take: 3, select: { id: true, title: true } }),
    prisma.serviceListing.findMany({ where: { moderation: "PENDING" }, orderBy: { createdAt: "asc" }, take: 3, select: { id: true, name: true, provider: { select: { orgName: true } } } }),
    prisma.payment.findMany({ where: { status: "PENDING" }, orderBy: { createdAt: "asc" }, take: 4, select: { id: true, amount: true, method: true, invoice: { select: { number: true, billedOrg: true } } } }),
    prisma.lead.findMany({ where: { handled: false }, orderBy: { createdAt: "desc" }, take: 4, select: { id: true, firstName: true, lastName: true, org: true, type: true } }),
    prisma.complaint.findMany({ where: { status: { in: ["OPEN", "IN_REVIEW"] } }, orderBy: { createdAt: "asc" }, take: 4, select: { id: true, subject: true, status: true } }),
    prisma.subscription.findMany({
      where: { OR: [{ status: "PENDING_PAYMENT" }, { renewRequestedAt: { not: null } }, { planChangeRequestedAt: { not: null } }] },
      orderBy: { createdAt: "asc" }, take: 4, select: { id: true, plan: true, user: { select: { email: true } } },
    }),
    prisma.payout.aggregate({ where: { status: { in: ["PLANNED", "PROCESSING"] } }, _count: true, _sum: { netAmount: true } }),
    prisma.rfq.count({ where: { status: "OPEN" } }),
    prisma.project.count({ where: { status: { notIn: ["COMPLETED", "CANCELLED"] } } }),
    prisma.transaction.findMany({ orderBy: { createdAt: "desc" }, take: 12, include: { project: { select: { refNo: true } }, enquiry: { select: { product: { select: { name: true } } } } } }),
    prisma.complaint.count({ where: { status: { in: ["OPEN", "IN_REVIEW"] } } }),
    prisma.auditLog.findMany({ orderBy: { createdAt: "desc" }, take: 15, include: { actor: { select: { name: true } } } }),
    // ---- marketplace health ----
    prisma.rfq.findMany({
      where: { status: "OPEN", createdAt: { lt: stale }, quotes: { none: {} } },
      orderBy: { createdAt: "asc" }, take: 4, select: { id: true, title: true, createdAt: true },
    }),
    prisma.project.findMany({
      where: { status: "SAMPLE_AWAITED", createdAt: { lt: weekAgo } },
      orderBy: { createdAt: "asc" }, take: 4, select: { id: true, refNo: true, provider: { select: { orgName: true } } },
    }),
    prisma.transaction.aggregate({ where: { status: "PAID", createdAt: { gte: monthStart } }, _sum: { feeAmount: true } }),
    prisma.transaction.aggregate({ where: { status: { in: ["INVOICED", "PAID"] }, createdAt: { gte: monthStart } }, _sum: { quotedValue: true } }),
    prisma.user.count({ where: { createdAt: { gte: monthStart } } }),
    prisma.quote.count({ where: { createdAt: { gte: monthStart } } }),
    prisma.transaction.aggregate({ where: { status: { in: ["PENDING", "INVOICED"] } }, _sum: { feeAmount: true } }),
  ]);

  const verifyCount = pendingProviders.length + pendingSuppliers.length;
  const modCount = boardQueue.length + listingQueue.length;
  const feesPending = feesDueAgg._sum.feeAmount ?? 0;
  const actionTotal = verifyCount + modCount + pendingPayments.length + unhandledLeads.length + openComplaints.length + subQueue.length + (payoutsDue._count ?? 0) + staleRfqs.length + stalledProjects.length;

  const queues = [
    {
      icon: <BadgeCheck className="size-4.5" />,
      title: "Verifications",
      count: verifyCount,
      href: "/admin/verification",
      tone: "blue",
      items: [
        ...pendingProviders.map((p): QItem => ({ key: `p${p.id}`, label: p.orgName, meta: `Lab · ${p.city}`, kind: "provider", id: p.id })),
        ...pendingSuppliers.map((s): QItem => ({ key: `s${s.id}`, label: s.orgName, meta: `Supplier · ${s.city}`, kind: "supplier", id: s.id })),
      ].slice(0, 4),
    },
    {
      icon: <ShieldCheck className="size-4.5" />,
      title: "Content moderation",
      count: modCount,
      href: "/admin/moderation",
      tone: "purple",
      items: [
        ...boardQueue.map((r): QItem => ({ key: `r${r.id}`, label: r.title, meta: "RFQ board post", kind: "boardRfq", id: r.id })),
        ...listingQueue.map((s): QItem => ({ key: `s${s.id}`, label: s.name, meta: `Service · ${s.provider.orgName}`, kind: "listing", id: s.id })),
      ].slice(0, 4),
    },
    {
      icon: <Landmark className="size-4.5" />,
      title: "Payments to confirm",
      count: pendingPayments.length,
      href: "/admin/finance",
      tone: "amber",
      items: pendingPayments.map((p): QItem => ({
        key: p.id,
        label: `${p.invoice.number} · ${pkr(p.amount)}`,
        meta: `${p.invoice.billedOrg} · ${p.method.replaceAll("_", " ").toLowerCase()}`,
        kind: "payment", id: p.id,
      })),
    },
    {
      icon: <Inbox className="size-4.5" />,
      title: "New leads",
      count: unhandledLeads.length,
      href: "/admin/leads",
      tone: "green",
      items: unhandledLeads.map((l): QItem => ({
        key: l.id,
        label: `${l.firstName} ${l.lastName ?? ""}`.trim(),
        meta: `${l.type === "QUOTE" ? "Quote request" : "Contact"}${l.org ? ` · ${l.org}` : ""}`,
        kind: "lead", id: l.id,
      })),
    },
    {
      icon: <Flag className="size-4.5" />,
      title: "Open complaints",
      count: openComplaints.length,
      href: "/admin/complaints",
      tone: "red",
      items: openComplaints.map((c): QItem => ({ key: c.id, label: c.subject, meta: c.status.toLowerCase().replaceAll("_", " "), kind: "complaint", id: c.id })),
    },
    {
      icon: <CreditCard className="size-4.5" />,
      title: "Subscriptions",
      count: subQueue.length,
      href: "/admin/subscriptions",
      tone: "orange",
      items: subQueue.map((s): QItem => ({ key: s.id, label: `${s.plan} · ${s.user.email}`, meta: "awaiting payment / renewal", kind: "subscription", id: s.id })),
    },
    {
      icon: <Banknote className="size-4.5" />,
      title: "Payouts due",
      count: payoutsDue._count ?? 0,
      href: "/admin/finance",
      tone: "amber",
      items: (payoutsDue._count ?? 0) > 0 ? [{ key: "sum", label: `${pkr(payoutsDue._sum.netAmount ?? 0)} net`, meta: "scheduled partner settlements" }] : [],
    },
    {
      icon: <TriangleAlert className="size-4.5" />,
      title: "RFQs with no quotes",
      count: staleRfqs.length,
      href: "/admin/rfqs",
      tone: "amber",
      items: staleRfqs.map((r): QItem => ({
        key: r.id,
        label: r.title,
        meta: `open ${Math.floor((Date.now() - r.createdAt.getTime()) / 86400e3)}d · zero quotes — consider routing invites`,
        href: "/admin/rfqs",
      })),
    },
    {
      icon: <TriangleAlert className="size-4.5" />,
      title: "Stalled projects",
      count: stalledProjects.length,
      href: null,
      tone: "red",
      items: stalledProjects.map((p): QItem => ({
        key: p.id,
        label: p.refNo,
        meta: `awaiting samples 7d+ · ${p.provider.orgName}`,
        href: `/admin/projects/${p.id}`,
      })),
    },
  ];

  return (
    <>
      <PageHead title="Platform overview" sub="Governance, verification and commercial health of the Gateway." />

      <div className="mb-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Link href="/admin/verification"><StatCard compact label="Pending verifications" value={verifyCount} sub={`${pendingProviders.length} labs · ${pendingSuppliers.length} suppliers`} /></Link>
        <Link href="/admin/rfqs"><StatCard compact label="Open RFQs" value={openRfqs} /></Link>
        <Link href="/admin/transactions"><StatCard compact label="Active projects" value={activeProjects} /></Link>
        <Link href="/admin/finance"><StatCard compact label="Fees pending" value={pkr(feesPending)} sub={`${pendingPayments.length} payments to confirm`} /></Link>
      </div>

      {/* this month at a glance */}
      <div className="card mb-8 flex flex-wrap items-center gap-x-8 gap-y-2 px-5 py-3.5">
        <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">This month</span>
        <span className="text-[13px] text-body"><strong className="font-semibold text-ink">{pkr(monthFees._sum.feeAmount ?? 0)}</strong> fees collected</span>
        <span className="text-[13px] text-body"><strong className="font-semibold text-ink">{pkr(monthGmv._sum.quotedValue ?? 0)}</strong> marketplace volume</span>
        <span className="text-[13px] text-body"><strong className="font-semibold text-ink">{newUsers}</strong> new users</span>
        <span className="text-[13px] text-body"><strong className="font-semibold text-ink">{monthQuotes}</strong> quotes submitted</span>
      </div>

      {/* ---------- action queue ---------- */}
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-[15px] font-semibold text-ink">Needs your action</h2>
        {actionTotal > 0 && (
          <span className="rounded-full border border-(--st-amber-bd) bg-(--st-amber-bg) px-3 py-1 text-[11.5px] font-semibold text-(--st-amber-fg)">
            {actionTotal} items queued
          </span>
        )}
      </div>

      {actionTotal === 0 && (
        <div className="card mb-4 flex items-center gap-3 px-5 py-4">
          <CircleCheck className="size-5 shrink-0 text-(--st-green-fg)" />
          <p className="text-[13.5px] text-body">All clear — nothing is waiting on your approval right now.</p>
        </div>
      )}
      <div className="mb-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {queues.map((q) => (
            <div key={q.title} className="card flex flex-col overflow-hidden">
              <div className="flex items-center justify-between border-b border-line px-4.5 py-3">
                <span className="flex items-center gap-2 text-[13px] font-semibold text-ink">
                  <span className="text-(--st-blue-fg)">{q.icon}</span>{q.title}
                </span>
                {q.count > 0 ? (
                  <span className="grid min-w-7 place-items-center rounded-full bg-(--st-amber-bg) px-2 py-0.5 text-[12px] font-bold text-(--st-amber-fg)">{q.count}</span>
                ) : (
                  <CircleCheck className="size-4 text-(--st-green-fg)" />
                )}
              </div>
              <div className="flex-1 divide-y divide-line">
                {q.items.length === 0 && <p className="px-4.5 py-4 text-[12px] text-muted">Nothing pending — all clear.</p>}
                {q.items.slice(0, 3).map((it) => (
                  <div key={it.key} className="flex items-center justify-between gap-3 px-4.5 py-2.5">
                    <div className="min-w-0">
                      {it.href ? (
                        <Link href={it.href} className="block truncate text-[12.5px] font-medium text-ink hover:text-blue">{it.label}</Link>
                      ) : (
                        <p className="truncate text-[12.5px] font-medium text-ink">{it.label}</p>
                      )}
                      <p className="truncate text-[11px] text-muted">{it.meta}</p>
                    </div>
                    {it.kind && it.id && <QuickAction kind={it.kind} id={it.id} />}
                  </div>
                ))}
                {q.count > 3 && <p className="px-4.5 py-2 text-[11px] text-muted">+{q.count - 3} more…</p>}
              </div>
              {q.href && (
                <Link href={q.href} className="mt-auto flex items-center justify-between border-t border-line bg-paper-2 px-4.5 py-2.5 text-[12px] font-semibold text-blue transition-colors hover:text-ink">
                  Review queue <ArrowRight className="size-3.5" />
                </Link>
              )}
            </div>
          ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card overflow-hidden">
          <div className="flex items-center justify-between border-b border-line px-5 py-3.5">
            <h3 className="text-[14px] font-semibold text-ink">Recent transactions</h3>
            <Link href="/admin/transactions" className="text-[12px] font-medium text-blue hover:underline">All →</Link>
          </div>
          <div className="scroll-slim max-h-72 divide-y divide-line overflow-y-auto">
            {txns.map((t) => (
              <div key={t.id} className="flex items-center justify-between px-5 py-3">
                <div>
                  <div className="text-[13px] font-medium text-ink">{t.project?.refNo ?? t.enquiry?.product.name ?? "Supply sale"}</div>
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
          <div className="scroll-slim max-h-72 divide-y divide-line overflow-y-auto">
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
