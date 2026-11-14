export const instant = false

import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PageHead, StatusBadge } from "@/components/portal/ui";
import { Pagination, PAGE_SIZE } from "@/components/portal/pagination";
import { VerifyButtons } from "./buttons";

type Tab = "labs" | "suppliers" | "customers";
type St = "PENDING" | "APPROVED" | "SUSPENDED" | "REJECTED" | "ALL";

const STATUS_FILTERS: { key: St; label: string }[] = [
  { key: "PENDING", label: "Pending" },
  { key: "APPROVED", label: "Approved" },
  { key: "SUSPENDED", label: "Suspended" },
  { key: "REJECTED", label: "Rejected" },
  { key: "ALL", label: "All" },
];

export default async function VerificationPage({ searchParams }: { searchParams: Promise<{ tab?: string; st?: string; lp?: string; sp?: string; cp?: string }> }) {
  const sp = await searchParams;
  const tab: Tab = sp.tab === "suppliers" || sp.tab === "customers" ? sp.tab : "labs";
  const st: St = STATUS_FILTERS.some((s) => s.key === sp.st) ? (sp.st as St) : "PENDING";
  const where = st === "ALL" ? {} : { status: st as "PENDING" | "APPROVED" | "SUSPENDED" | "REJECTED" };
  const lp = Math.max(1, Number(sp.lp ?? 1) || 1);
  const spp = Math.max(1, Number(sp.sp ?? 1) || 1);
  const cp = Math.max(1, Number(sp.cp ?? 1) || 1);
  const [providers, provCount, suppliers, supCount, customers, custCount, provPending, supPending, custPending] = await Promise.all([
    prisma.providerProfile.findMany({ where, include: { user: { select: { email: true, name: true } } }, orderBy: { createdAt: "asc" }, skip: (lp - 1) * PAGE_SIZE, take: PAGE_SIZE }),
    prisma.providerProfile.count({ where }),
    prisma.supplierProfile.findMany({ where, include: { user: { select: { email: true, name: true } } }, orderBy: { createdAt: "asc" }, skip: (spp - 1) * PAGE_SIZE, take: PAGE_SIZE }),
    prisma.supplierProfile.count({ where }),
    prisma.customerProfile.findMany({ where, include: { user: { select: { email: true, name: true } } }, orderBy: { createdAt: "asc" }, skip: (cp - 1) * PAGE_SIZE, take: PAGE_SIZE }),
    prisma.customerProfile.count({ where }),
    prisma.providerProfile.count({ where: { status: "PENDING" } }),
    prisma.supplierProfile.count({ where: { status: "PENDING" } }),
    prisma.customerProfile.count({ where: { status: "PENDING" } }),
  ]);

  const tabs: { key: Tab; label: string; count: number }[] = [
    { key: "labs", label: "Laboratories / providers", count: provPending },
    { key: "suppliers", label: "Suppliers", count: supPending },
    { key: "customers", label: "Clients / customers", count: custPending },
  ];

  return (
    <>
      <PageHead
        title="Verification queue"
        sub="Approve, reject or suspend labs, suppliers and client accounts. Approved orgs receive the 'Syntax-verified' badge — explicitly non-governmental."
      />

      {/* entity tabs — underline tab strip */}
      <div className="mb-5 flex flex-wrap gap-x-1 border-b border-line">
        {tabs.map((t) => (
          <Link
            key={t.key}
            href={`/admin/verification?tab=${t.key}`}
            className={`-mb-px flex items-center gap-2 border-b-2 px-4 py-2.5 text-[13.5px] font-semibold transition-colors ${
              tab === t.key
                ? "border-yellow text-ink"
                : "border-transparent text-muted hover:text-ink"
            }`}
          >
            {t.label}
            <span className={`grid min-w-6 place-items-center rounded-full px-1.5 py-0.5 text-[11.5px] font-bold ${
              tab === t.key ? "bg-yellow text-navy" : "bg-paper-2 text-muted"
            }`}>
              {t.count}
            </span>
          </Link>
        ))}
      </div>

      {/* status filter — segmented control */}
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <span className="text-[11.5px] font-semibold uppercase tracking-[0.1em] text-muted">Status</span>
        <div className="inline-flex flex-wrap items-center gap-0.5 rounded-lg border border-line bg-paper-2 p-1">
          {STATUS_FILTERS.map((s) => (
            <Link
              key={s.key}
              href={`/admin/verification?tab=${tab}&st=${s.key}`}
              className={`rounded-md px-3 py-1.5 text-[12px] font-semibold transition-colors ${
                st === s.key
                  ? "bg-surface text-ink shadow-sm ring-1 ring-line"
                  : "text-muted hover:text-ink"
              }`}
            >
              {s.label}
            </Link>
          ))}
        </div>
      </div>

      {tab === "labs" && (
        <div className="card divide-y divide-line">
          {providers.length === 0 && <p className="px-5 py-8 text-center text-[13px] text-muted">No labs with this status.</p>}
          {providers.map((p) => (
            <div key={p.id} className="px-5 py-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[12px] font-semibold text-muted">{p.orgNo}</span>
                    <span className="text-[14px] font-semibold text-ink">{p.orgName}</span>
                    <StatusBadge status={p.status} />
                  </div>
                  <div className="mt-1 text-[12px] text-muted">
                    {p.city} · {p.user.name} · {p.user.email}
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1.5 text-[11px]">
                    {p.platforms.split(",").map((s) => <Chip key={s}>{s.trim()}</Chip>)}
                    {p.serviceCategories.split(",").map((s) => <Chip key={s} accent>{s.trim()}</Chip>)}
                  </div>
                  {p.statusNote && <div className="mt-2 text-[11.5px] text-(--st-red-fg)">Note: {p.statusNote}</div>}
                </div>
                <VerifyButtons id={p.id} kind="provider" status={p.status} />
              </div>
            </div>
          ))}
          <Pagination page={lp} total={provCount} base={`/admin/verification?tab=labs&st=${st}`} param="lp" />
        </div>
      )}

      {tab === "suppliers" && (
        <div className="card divide-y divide-line">
          {suppliers.length === 0 && <p className="px-5 py-8 text-center text-[13px] text-muted">No suppliers with this status.</p>}
          {suppliers.map((s) => (
            <div key={s.id} className="px-5 py-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[12px] font-semibold text-muted">{s.orgNo}</span>
                    <span className="text-[14px] font-semibold text-ink">{s.orgName}</span>
                    <StatusBadge status={s.status} />
                  </div>
                  <div className="mt-1 text-[12px] text-muted">{s.city} · {s.user.name} · {s.user.email}</div>
                  <div className="mt-2 flex flex-wrap gap-1.5 text-[11px]">
                    {s.categories.split(",").map((c) => <Chip key={c} accent>{c.trim()}</Chip>)}
                  </div>
                </div>
                <VerifyButtons id={s.id} kind="supplier" status={s.status} />
              </div>
            </div>
          ))}
          <Pagination page={spp} total={supCount} base={`/admin/verification?tab=suppliers&st=${st}`} param="sp" />
        </div>
      )}

      {tab === "customers" && (
        <div className="card divide-y divide-line">
          {customers.length === 0 && <p className="px-5 py-8 text-center text-[13px] text-muted">No clients with this status.</p>}
          {customers.map((c) => (
            <div key={c.id} className="px-5 py-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[12px] font-semibold text-muted">{c.orgNo}</span>
                    <span className="text-[14px] font-semibold text-ink">{c.orgName || c.user.name}</span>
                    <StatusBadge status={c.status} />
                  </div>
                  <div className="mt-1 text-[12px] text-muted">
                    {c.user.name} · {c.user.email}{[c.orgType, c.city].filter(Boolean).length > 0 && ` · ${[c.orgType, c.city].filter(Boolean).join(" · ")}`}
                  </div>
                  {(c.department || c.designation) && (
                    <div className="mt-2 flex flex-wrap gap-1.5 text-[11px]">
                      {c.department && <Chip>{c.department}</Chip>}
                      {c.designation && <Chip accent>{c.designation}</Chip>}
                    </div>
                  )}
                  {c.statusNote && <div className="mt-2 text-[11.5px] text-(--st-red-fg)">Note: {c.statusNote}</div>}
                </div>
                <VerifyButtons id={c.id} kind="customer" status={c.status} />
              </div>
            </div>
          ))}
          <Pagination page={cp} total={custCount} base={`/admin/verification?tab=customers&st=${st}`} param="cp" />
        </div>
      )}
    </>
  );
}

function Chip({ children, accent }: { children: React.ReactNode; accent?: boolean }) {
  return (
    <span className={`rounded-full border px-2.5 py-0.5 ${accent ? "border-blue/30 bg-(--st-blue-bg) text-(--st-blue-fg)" : "border-line bg-paper-2 text-body"}`}>
      {children}
    </span>
  );
}
