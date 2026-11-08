export const instant = false

import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { PageHead, StatusBadge } from "@/components/portal/ui";
import { pkr } from "@/lib/constants";
import { PLANS } from "@/lib/plans";

export default async function AdminUserPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      customerProfile: true,
      providerProfile: { include: { _count: { select: { quotes: true, projects: true } } } },
      supplierProfile: { include: { products: true, _count: { select: { enquiries: true } } } },
      subscription: true,
      rfqs: { select: { id: true, refNo: true, title: true, status: true }, orderBy: { createdAt: "desc" }, take: 8 },
      customerProjects: { select: { id: true, refNo: true, status: true }, orderBy: { createdAt: "desc" }, take: 8 },
    },
  });
  if (!user) notFound();

  const cp = user.customerProfile;
  const pp = user.providerProfile;
  const sp = user.supplierProfile;
  const sub = user.subscription;

  return (
    <>
      <Link href="/admin/users" className="mb-4 inline-flex items-center gap-1.5 text-[13px] text-muted hover:text-ink">
        <ArrowLeft className="size-3.5" /> All users
      </Link>
      <PageHead
        title={user.name}
        sub={`${user.email}${user.phone ? ` · ${user.phone}` : ""} · joined ${user.createdAt.toLocaleDateString()}`}
        action={<StatusBadge status={pp?.status ?? sp?.status ?? "APPROVED"} />}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        {/* identity + role profile */}
        <div className="space-y-6">
          <div className="card p-5">
            <h3 className="mb-4 text-[14px] font-semibold text-ink">
              {user.role === "PROVIDER" ? "Laboratory profile" : user.role === "SUPPLIER" ? "Supplier profile" : user.role === "CUSTOMER" ? "Customer profile" : "Account"}
            </h3>
            <dl className="space-y-2.5 text-[13px]">
              {pp && (
                <>
                  <Row k="Organization" v={pp.orgName} />
                  <Row k="City" v={pp.city} />
                  <Row k="Established" v={pp.establishedYear} />
                  <Row k="Platforms" v={pp.platforms} />
                  <Row k="Sample types" v={pp.sampleTypes} />
                  <Row k="Service categories" v={pp.serviceCategories} />
                  <Row k="HPC capacity" v={pp.hpcCapacity} />
                  <Row k="Accreditations" v={pp.accreditations} />
                  <Row k="Contact person" v={pp.contactPerson} />
                  <Row k="Website" v={pp.website} />
                  <Row k="Status note" v={pp.statusNote} />
                  {pp.bio && <p className="mt-3 rounded-lg bg-paper-2 p-3 text-[12.5px] leading-relaxed text-body">{pp.bio}</p>}
                </>
              )}
              {sp && (
                <>
                  <Row k="Organization" v={sp.orgName} />
                  <Row k="City" v={sp.city} />
                  <Row k="Established" v={sp.establishedYear} />
                  <Row k="Categories" v={sp.categories} />
                  <Row k="Contact person" v={sp.contactPerson} />
                  <Row k="Website" v={sp.website} />
                  <Row k="Products listed" v={sp.products.length} />
                  {sp.bio && <p className="mt-3 rounded-lg bg-paper-2 p-3 text-[12.5px] leading-relaxed text-body">{sp.bio}</p>}
                </>
              )}
              {user.role === "CUSTOMER" && (
                cp ? (
                  <>
                    <Row k="Organization" v={cp.orgName} />
                    <Row k="Type" v={cp.orgType} />
                    <Row k="City" v={cp.city} />
                    <Row k="Department" v={cp.department} />
                    <Row k="Designation" v={cp.designation} />
                    <Row k="Address" v={cp.address} />
                  </>
                ) : <p className="text-[12.5px] text-muted">No profile details yet.</p>
              )}
              <Row k="Role" v={user.role} />
              <Row k="Email verified" v={user.emailVerified ? "Yes" : "No"} />
            </dl>
          </div>
        </div>

        {/* subscription + activity */}
        <div className="space-y-6">
          {sub && (
            <div className="card p-5">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-[14px] font-semibold text-ink">Subscription</h3>
                <StatusBadge status={sub.status} />
              </div>
              <dl className="space-y-2 text-[13px]">
                <Row k="Plan" v={`${PLANS[sub.plan].label} — $${sub.priceUsd}/mo`} />
                <Row k="Since" v={sub.startedAt?.toLocaleDateString()} />
                <Row k="Renews until" v={sub.expiresAt?.toLocaleDateString()} />
              </dl>
            </div>
          )}
          {pp && (
            <div className="card p-5">
              <h3 className="mb-3 text-[14px] font-semibold text-ink">Activity</h3>
              <dl className="space-y-2 text-[13px]">
                <Row k="Quotes submitted" v={pp._count.quotes} />
                <Row k="Projects" v={pp._count.projects} />
              </dl>
            </div>
          )}
          {sp && (
            <div className="card p-5">
              <h3 className="mb-3 text-[14px] font-semibold text-ink">Activity</h3>
              <dl className="space-y-2 text-[13px]">
                <Row k="Products" v={sp.products.length} />
                <Row k="Enquiries received" v={sp._count.enquiries} />
              </dl>
            </div>
          )}
          {user.role === "CUSTOMER" && (
            <div className="card overflow-hidden">
              <div className="border-b border-line px-5 py-3.5"><h3 className="text-[14px] font-semibold text-ink">Recent RFQs & projects</h3></div>
              <div className="divide-y divide-line">
                {user.rfqs.map((r) => (
                  <div key={r.id} className="flex items-center justify-between px-5 py-2.5">
                    <span className="text-[12.5px] text-ink">{r.refNo} — {r.title}</span>
                    <StatusBadge status={r.status} />
                  </div>
                ))}
                {user.customerProjects.map((p) => (
                  <div key={p.id} className="flex items-center justify-between px-5 py-2.5">
                    <span className="text-[12.5px] text-ink">{p.refNo}</span>
                    <StatusBadge status={p.status} />
                  </div>
                ))}
                {user.rfqs.length === 0 && user.customerProjects.length === 0 && (
                  <p className="px-5 py-6 text-center text-[12.5px] text-muted">No activity yet.</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

function Row({ k, v }: { k: string; v: string | number | null | undefined }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="shrink-0 text-muted">{k}</dt>
      <dd className="text-right font-medium text-ink">{v ?? "—"}</dd>
    </div>
  );
}
