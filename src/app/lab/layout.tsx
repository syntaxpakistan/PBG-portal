export const instant = false

import { LayoutDashboard, Inbox, FolderKanban, UserRound, TestTubes, Boxes, Wallet, BarChart3, Calculator, Flag } from "lucide-react";
import { PortalShell } from "@/components/portal/shell";
import { requireRole } from "@/lib/session";
import { getPartnerAccess } from "@/lib/entitlements";
import { getGraceDays } from "@/lib/settings";
import Link from "next/link";

const items = [
  { href: "/lab", label: "Overview", icon: <LayoutDashboard className="size-4" /> },
  { href: "/lab/rfqs", label: "Incoming RFQs", icon: <Inbox className="size-4" /> },
  { href: "/lab/projects", label: "My projects", icon: <FolderKanban className="size-4" /> },
  { href: "/lab/services", label: "Service catalog", icon: <TestTubes className="size-4" /> },
  { href: "/lab/calculator", label: "Coverage calc", icon: <Calculator className="size-4" /> },
  { href: "/lab/supplies", label: "Supplies", icon: <Boxes className="size-4" /> },
  { href: "/lab/analytics", label: "Analytics", icon: <BarChart3 className="size-4" /> },
  { href: "/lab/complaints", label: "Complaints", icon: <Flag className="size-4" /> },
  { href: "/lab/billing", label: "Billing", icon: <Wallet className="size-4" /> },
  { href: "/lab/profile", label: "Profile", icon: <UserRound className="size-4" /> },
];

export default async function LabLayout({ children }: { children: React.ReactNode }) {
  const session = await requireRole("PROVIDER");
  const access = await getPartnerAccess(session.user.id);
  const graceSetting = await getGraceDays();
  const graceDays = access.daysLeft != null ? Math.max(0, access.daysLeft + graceSetting) : 0;
  return (
    <PortalShell title="Laboratory portal" items={items}>
      {!access.active && access.hasSubscription && (
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-(--st-red-bd) bg-(--st-red-bg) px-4 py-3 text-[13px] font-medium text-(--st-red-fg)">
          <span>
            Subscription {access.status === "PENDING_PAYMENT" ? "awaiting payment" : access.inGrace ? `expired — ${graceDays} day${graceDays === 1 ? "" : "s"} of grace left` : "inactive"}.
            {" "}Quoting, listings and supply responses are paused.
          </span>
          <Link href="/lab/billing" className="rounded-full bg-navy px-3.5 py-1.5 text-[12px] font-semibold text-yellow hover:bg-navy-2">Go to billing</Link>
        </div>
      )}
      {!access.hasSubscription && (
        <div className="mb-5 rounded-xl border border-(--st-amber-bd) bg-(--st-amber-bg) px-4 py-3 text-[13px] font-medium text-(--st-amber-fg)">
          No subscription on file — choose a plan to activate paid features.
        </div>
      )}
      {children}
    </PortalShell>
  );
}
