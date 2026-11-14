export const instant = false

import { LayoutDashboard, FileText, FilePlus2, FolderKanban, Package, UserRound, Flag, Wallet, BarChart3, Clock3, Calculator } from "lucide-react";
import { PortalShell } from "@/components/portal/shell";
import { requireRole } from "@/lib/session";
import { prisma } from "@/lib/prisma";

const items = [
  { href: "/dashboard", label: "Overview", icon: <LayoutDashboard className="size-4" /> },
  {
    label: "RFQs", icon: <FileText className="size-4" />,
    children: [
      { href: "/dashboard/rfqs", label: "My RFQs", icon: <FileText className="size-3.5" /> },
      { href: "/dashboard/rfqs/new", label: "New RFQ", icon: <FilePlus2 className="size-3.5" /> },
    ],
  },
  { href: "/dashboard/projects", label: "My projects", icon: <FolderKanban className="size-4" /> },
  { href: "/dashboard/marketplace", label: "Marketplace", icon: <Package className="size-4" /> },
  { href: "/dashboard/calculator", label: "Coverage calc", icon: <Calculator className="size-4" /> },
  { href: "/dashboard/analytics", label: "Analytics", icon: <BarChart3 className="size-4" /> },
  { href: "/dashboard/complaints", label: "Complaints", icon: <Flag className="size-4" /> },
  { href: "/dashboard/billing", label: "Billing", icon: <Wallet className="size-4" /> },
  { href: "/dashboard/profile", label: "Profile", icon: <UserRound className="size-4" /> },
];

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await requireRole("CUSTOMER");
  const profile = await prisma.customerProfile.findUnique({ where: { userId: session.user.id }, select: { status: true, statusNote: true } });

  if (profile?.status !== "APPROVED") {
    return (
      <PortalShell title="Client portal" items={items}>
        <div className="mx-auto mt-16 max-w-md">
          <div className="card p-8 text-center">
            <span className="mx-auto grid size-12 place-items-center rounded-full bg-(--st-amber-bg) text-(--st-amber-fg)"><Clock3 className="size-6" /></span>
            <h1 className="mt-4 font-display text-[22px] font-medium text-ink">
              {profile?.status === "REJECTED" ? "Registration not approved" :
               profile?.status === "SUSPENDED" ? "Account suspended" :
               "Awaiting admin approval"}
            </h1>
            <p className="mt-2 text-[13.5px] leading-relaxed text-body">
              {profile?.status === "REJECTED" || profile?.status === "SUSPENDED"
                ? `Your client account is ${profile.status.toLowerCase()}.${profile.statusNote ? ` Reason: ${profile.statusNote}.` : ""} Contact admin@syntaxlife.pk if you believe this is an error.`
                : "Your registration is in the review queue — Syntax approves every client account manually, usually within 1 business day. You'll get a notification the moment your portal unlocks."}
            </p>
          </div>
        </div>
      </PortalShell>
    );
  }

  return <PortalShell title="Client portal" items={items}>{children}</PortalShell>;
}
