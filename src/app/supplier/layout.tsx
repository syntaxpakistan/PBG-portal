export const instant = false

import { LayoutDashboard, Wallet } from "lucide-react";
import { PortalShell } from "@/components/portal/shell";
import { requireRole } from "@/lib/session";

const items = [
  { href: "/supplier", label: "Overview", icon: <LayoutDashboard className="size-4" /> },
  { href: "/supplier/billing", label: "Billing", icon: <Wallet className="size-4" /> },
];

export default async function SupplierLayout({ children }: { children: React.ReactNode }) {
  await requireRole("SUPPLIER");
  return <PortalShell title="Supplier portal" items={items}>{children}</PortalShell>;
}
