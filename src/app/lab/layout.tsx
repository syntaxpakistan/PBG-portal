export const instant = false

import { LayoutDashboard, Inbox, FolderKanban, UserRound, TestTubes, Boxes } from "lucide-react";
import { PortalShell } from "@/components/portal/shell";
import { requireRole } from "@/lib/session";

const items = [
  { href: "/lab", label: "Overview", icon: <LayoutDashboard className="size-4" /> },
  { href: "/lab/rfqs", label: "Incoming RFQs", icon: <Inbox className="size-4" /> },
  { href: "/lab/projects", label: "My projects", icon: <FolderKanban className="size-4" /> },
  { href: "/lab/services", label: "Service catalog", icon: <TestTubes className="size-4" /> },
  { href: "/lab/supplies", label: "Supplies", icon: <Boxes className="size-4" /> },
  { href: "/lab/profile", label: "Profile", icon: <UserRound className="size-4" /> },
];

export default async function LabLayout({ children }: { children: React.ReactNode }) {
  await requireRole("PROVIDER");
  return <PortalShell title="Laboratory portal" items={items}>{children}</PortalShell>;
}
