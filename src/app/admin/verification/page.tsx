export const instant = false

import { prisma } from "@/lib/prisma";
import { PageHead, StatusBadge } from "@/components/portal/ui";
import { VerifyButtons } from "./buttons";

export default async function VerificationPage() {
  const [providers, suppliers] = await Promise.all([
    prisma.providerProfile.findMany({ include: { user: { select: { email: true, name: true } } }, orderBy: { createdAt: "asc" } }),
    prisma.supplierProfile.findMany({ include: { user: { select: { email: true, name: true } } }, orderBy: { createdAt: "asc" } }),
  ]);

  return (
    <>
      <PageHead
        title="Verification queue"
        sub="Approve, reject or suspend labs and suppliers. Approved orgs receive the 'Syntax-verified' badge — explicitly non-governmental."
      />

      <h2 className="mb-3 text-[15px] font-semibold text-ink">Laboratories / providers ({providers.length})</h2>
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
      </div>

      <h2 className="mb-3 text-[15px] font-semibold text-ink">Suppliers ({suppliers.length})</h2>
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
