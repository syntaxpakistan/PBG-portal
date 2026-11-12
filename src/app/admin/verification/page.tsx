export const instant = false

import { prisma } from "@/lib/prisma";
import { PageHead, StatusBadge } from "@/components/portal/ui";
import { Pagination, PAGE_SIZE } from "@/components/portal/pagination";
import { VerifyButtons } from "./buttons";

export default async function VerificationPage({ searchParams }: { searchParams: Promise<{ lp?: string; sp?: string; cp?: string }> }) {
  const sp = await searchParams;
  const lp = Math.max(1, Number(sp.lp ?? 1) || 1);
  const spp = Math.max(1, Number(sp.sp ?? 1) || 1);
  const cp = Math.max(1, Number(sp.cp ?? 1) || 1);
  const [providers, provTotal, suppliers, supTotal, customers, custTotal] = await Promise.all([
    prisma.providerProfile.findMany({ include: { user: { select: { email: true, name: true } } }, orderBy: { createdAt: "asc" }, skip: (lp - 1) * PAGE_SIZE, take: PAGE_SIZE }),
    prisma.providerProfile.count(),
    prisma.supplierProfile.findMany({ include: { user: { select: { email: true, name: true } } }, orderBy: { createdAt: "asc" }, skip: (spp - 1) * PAGE_SIZE, take: PAGE_SIZE }),
    prisma.supplierProfile.count(),
    prisma.customerProfile.findMany({ include: { user: { select: { email: true, name: true } } }, orderBy: { createdAt: "asc" }, skip: (cp - 1) * PAGE_SIZE, take: PAGE_SIZE }),
    prisma.customerProfile.count(),
  ]);

  return (
    <>
      <PageHead
        title="Verification queue"
        sub="Approve, reject or suspend labs, suppliers and client accounts. Approved orgs receive the 'Syntax-verified' badge — explicitly non-governmental."
      />

      <h2 className="mb-3 text-[15px] font-semibold text-ink">Laboratories / providers ({provTotal})</h2>
      <div className="card mb-8 divide-y divide-line">
        {providers.map((p) => (
          <div key={p.id} className="px-5 py-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
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
        <Pagination page={lp} total={provTotal} base={`/admin/verification${sp.sp ? `?sp=${sp.sp}` : ""}`} param="lp" />
      </div>

      <h2 className="mb-3 text-[15px] font-semibold text-ink">Suppliers ({supTotal})</h2>
      <div className="card divide-y divide-line">
        {suppliers.length === 0 && <p className="px-5 py-8 text-center text-[13px] text-muted">No supplier applications.</p>}
        {suppliers.map((s) => (
          <div key={s.id} className="px-5 py-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
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
        <Pagination page={spp} total={supTotal} base={`/admin/verification${sp.lp ? `?lp=${sp.lp}` : ""}`} param="sp" />
      </div>

      <h2 className="mb-3 mt-8 text-[15px] font-semibold text-ink">Clients / customers ({custTotal})</h2>
      <div className="card divide-y divide-line">
        {customers.length === 0 && <p className="px-5 py-8 text-center text-[13px] text-muted">No client registrations yet.</p>}
        {customers.map((c) => (
          <div key={c.id} className="px-5 py-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
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
        <Pagination page={cp} total={custTotal} base={`/admin/verification${sp.lp ? `?lp=${sp.lp}` : ""}`} param="cp" />
      </div>
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
