export const instant = false

import { LayoutDashboard, FileText, FilePlus2, FolderKanban, Package, UserRound, Flag, Wallet, BarChart3 } from "lucide-react";
import { PortalShell } from "@/components/portal/shell";
import { requireRole } from "@/lib/session";

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
  { href: "/dashboard/analytics", label: "Analytics", icon: <BarChart3 className="size-4" /> },
  { href: "/dashboard/complaints", label: "Complaints", icon: <Flag className="size-4" /> },
  { href: "/dashboard/billing", label: "Billing", icon: <Wallet className="size-4" /> },
  { href: "/dashboard/profile", label: "Profile", icon: <UserRound className="size-4" /> },
];

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  await requireRole("CUSTOMER");
  return <PortalShell title="Client portal" items={items}>{children}</PortalShell>;
}
