export const instant = false

import { prisma } from "@/lib/prisma";
import { PageHead } from "@/components/portal/ui";

export default async function AuditPage({ searchParams }: { searchParams: Promise<{ q?: string; action?: string; entity?: string; actor?: string }> }) {
  const { q, action, entity, actor } = await searchParams;
  const logs = await prisma.auditLog.findMany({
    where: {
      ...(action ? { action: { contains: action.toUpperCase() } } : {}),
      ...(entity ? { entity: { contains: entity } } : {}),
      ...(actor ? { actor: { OR: [{ name: { contains: actor } }, { email: { contains: actor } }] } } : {}),
      ...(q ? { OR: [{ action: { contains: q.toUpperCase() } }, { entity: { contains: q } }, { meta: { contains: q } }] } : {}),
    },
    orderBy: { createdAt: "desc" },
    take: 100,
    include: { actor: { select: { name: true, email: true, role: true } } },
  });

  return (
    <>
      <PageHead title="Audit log" sub={`Immutable record of every administrative and workflow action — ${logs.length} shown (latest 100).`}
        action={<a href="/api/admin/export/audit" className="btn-outline !py-2 text-[12.5px]">Export CSV</a>}
      />
      <form className="mb-4 flex flex-wrap items-center gap-2">
        <input name="q" defaultValue={q ?? ""} placeholder="Search detail…" className="w-44 rounded-full border border-line bg-surface px-4 py-2 text-[12.5px] outline-none focus:border-navy-3" />
        <input name="action" defaultValue={action ?? ""} placeholder="Action e.g. QUOTE" className="w-40 rounded-full border border-line bg-surface px-4 py-2 text-[12.5px] outline-none focus:border-navy-3" />
        <input name="entity" defaultValue={entity ?? ""} placeholder="Entity e.g. Project" className="w-40 rounded-full border border-line bg-surface px-4 py-2 text-[12.5px] outline-none focus:border-navy-3" />
        <input name="actor" defaultValue={actor ?? ""} placeholder="Actor name/email" className="w-44 rounded-full border border-line bg-surface px-4 py-2 text-[12.5px] outline-none focus:border-navy-3" />
        <button type="submit" className="btn-outline !py-2 text-[12.5px]">Filter</button>
      </form>
      <div className="card overflow-hidden">
        <div className="overflow-x-auto"><table className="w-full min-w-[760px] text-left text-[12.5px]">
          <thead className="border-b border-line bg-paper-2 text-[11px] uppercase tracking-wider text-muted">
            <tr>
              <th className="px-5 py-3 font-semibold">When</th>
              <th className="px-5 py-3 font-semibold">Actor</th>
              <th className="px-5 py-3 font-semibold">Action</th>
              <th className="px-5 py-3 font-semibold">Entity</th>
              <th className="px-5 py-3 font-semibold">Detail</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {logs.map((l) => (
              <tr key={l.id} className="hover:bg-paper-2/60">
                <td className="whitespace-nowrap px-5 py-2.5 text-muted">{l.createdAt.toLocaleString()}</td>
                <td className="px-5 py-2.5">
                  <span className="font-medium text-ink">{l.actor.name}</span>
                  <span className="ml-1.5 text-[10.5px] text-muted">{l.actor.role}</span>
                </td>
                <td className="px-5 py-2.5"><code className="rounded bg-paper-2 px-1.5 py-0.5 text-[11px] text-navy-2">{l.action}</code></td>
                <td className="px-5 py-2.5 text-body">{l.entity}</td>
                <td className="px-5 py-2.5 text-muted">{l.meta ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table></div>
      </div>
    </>
  );
}
