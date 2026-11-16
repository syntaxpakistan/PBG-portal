export const instant = false

import { LayoutDashboard, Wallet, BarChart3, MessageSquareWarning, Package, Inbox, Building2 } from "lucide-react";
import { PortalShell } from "@/components/portal/shell";
import { requireRole } from "@/lib/session";

const items = [
  { href: "/supplier", label: "Overview", icon: <LayoutDashboard className="size-4" /> },
  { href: "/supplier/products", label: "Products", icon: <Package className="size-4" /> },
  { href: "/supplier/enquiries", label: "Enquiries", icon: <Inbox className="size-4" /> },
  { href: "/supplier/profile", label: "Profile", icon: <Building2 className="size-4" /> },
  { href: "/supplier/analytics", label: "Analytics", icon: <BarChart3 className="size-4" /> },
  { href: "/supplier/complaints", label: "Complaints", icon: <MessageSquareWarning className="size-4" /> },
  { href: "/supplier/billing", label: "Billing", icon: <Wallet className="size-4" /> },
];

export default async function SupplierLayout({ children }: { children: React.ReactNode }) {
  await requireRole("SUPPLIER");
  return <PortalShell title="Supplier portal" items={items}>{children}</PortalShell>;
}
