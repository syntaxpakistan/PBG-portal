export const instant = false

import { prisma } from "@/lib/prisma";
import { PageHead, StatusBadge } from "@/components/portal/ui";
import { Pagination, PAGE_SIZE, pageOf, qs } from "@/components/portal/pagination";

const ROLE_LABEL: Record<string, string> = {
  CUSTOMER: "Customer",
  PROVIDER: "Provider",
  SUPPLIER: "Supplier",
  ADMIN: "Admin",
};

export default async function UsersPage({ searchParams }: { searchParams: Promise<{ q?: string; role?: string; page?: string }> }) {
  const sp = await searchParams;
  const { q, role } = sp;
  const page = pageOf(sp);
  const where = {
    ...(role ? { role: role as "CUSTOMER" | "PROVIDER" | "SUPPLIER" | "ADMIN" } : {}),
    ...(q ? {
      OR: [
        { name: { contains: q } },
        { email: { contains: q } },
        { providerProfile: { orgName: { contains: q } } },
        { supplierProfile: { orgName: { contains: q } } },
        { customerProfile: { orgName: { contains: q } } },
      ],
    } : {}),
  };
  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: { providerProfile: { select: { orgName: true, orgNo: true, status: true } }, supplierProfile: { select: { orgName: true, orgNo: true, status: true } }, customerProfile: { select: { orgName: true, orgNo: true } } },
    }),
    prisma.user.count({ where }),
  ]);

  return (
    <>
      <PageHead title="Users & organizations" sub={`Every account on the Gateway — ${total} total.`} />
      <form className="mb-4 flex flex-wrap items-center gap-2">
        <input name="q" defaultValue={q ?? ""} placeholder="Search name, email or org…" className="w-full max-w-xs rounded-full border border-line bg-surface px-4 py-2 text-[13px] outline-none focus:border-navy-3" />
        <select name="role" defaultValue={role ?? ""} className="rounded-full border border-line bg-surface px-4 py-2 text-[13px] outline-none focus:border-navy-3">
          <option value="">All roles</option>
          <option value="CUSTOMER">Customers</option>
          <option value="PROVIDER">Providers</option>
          <option value="SUPPLIER">Suppliers</option>
          <option value="ADMIN">Admins</option>
        </select>
        <button type="submit" className="btn-outline !py-2 text-[12.5px]">Filter</button>
      </form>
      <div className="card overflow-hidden">
        <div className="overflow-x-auto"><table className="w-full min-w-[760px] text-left text-[13px]">
          <thead className="border-b border-line bg-paper-2 text-[11px] uppercase tracking-wider text-muted">
            <tr>
              <th className="px-5 py-3 font-semibold">User</th>
              <th className="px-5 py-3 font-semibold">Role</th>
              <th className="px-5 py-3 font-semibold">Organization</th>
              <th className="px-5 py-3 font-semibold">Status</th>
              <th className="px-5 py-3 font-semibold">Joined</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {users.map((u) => {
              const orgNo = u.providerProfile?.orgNo ?? u.supplierProfile?.orgNo ?? u.customerProfile?.orgNo;
              const orgName = u.providerProfile?.orgName ?? u.supplierProfile?.orgName ?? u.customerProfile?.orgName;
              const orgStatus = u.providerProfile?.status ?? u.supplierProfile?.status;
              return (
                <tr key={u.id} className="cursor-pointer hover:bg-paper-2/60" onClick={undefined}>
                  <td className="px-5 py-3">
                    <a href={`/admin/users/${u.id}`} className="block">
                      <div className="font-medium text-ink hover:text-blue">{u.name}</div>
                      <div className="text-[11.5px] text-muted">{u.email}</div>
                    </a>
                  </td>
                  <td className="px-5 py-3 text-body">{ROLE_LABEL[u.role] ?? u.role}</td>
                  <td className="px-5 py-3 text-body">
                    {orgNo && <span className="mr-1.5 font-mono text-[11.5px] font-semibold text-muted">{orgNo}</span>}
                    {orgName ?? "—"}
                  </td>
                  <td className="px-5 py-3">{orgStatus ? <StatusBadge status={orgStatus} /> : <span className="text-[11.5px] text-muted">—</span>}</td>
                  <td className="px-5 py-3 text-muted">{u.createdAt.toLocaleDateString()}</td>
                </tr>
              );
            })}
            {users.length === 0 && <tr><td colSpan={5} className="px-5 py-8 text-center text-muted">No users match this filter.</td></tr>}
          </tbody>
        </table></div>
        <Pagination page={page} total={total} base={`/admin/users${qs({ q, role })}`} />
      </div>
    </>
  );
}
