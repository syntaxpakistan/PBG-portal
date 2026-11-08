"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell } from "lucide-react";
import { cn } from "@/lib/utils";

export type NavItem = { href: string; label: string; icon: React.ReactNode };

function matchLen(pathname: string, href: string) {
  const base = href.split("#")[0];
  if (pathname === base) return base.length;
  const portalRoot = base.split("/").slice(0, 2).join("/");
  if (base !== portalRoot && pathname.startsWith(base + "/")) return base.length;
  return -1;
}

export function SideNav({ items, unread }: { items: NavItem[]; unread: number }) {
  const pathname = usePathname();
  const allItems: NavItem[] = [...items, { href: "/notifications", label: "Notifications", icon: <Bell className="size-4" /> }];
  const best = Math.max(0, ...allItems.map((it) => matchLen(pathname, it.href)));
  return (
    <nav className="flex-1 space-y-0.5 overflow-y-auto px-3">
      {allItems.map((it) => (
        <Link
          key={it.href}
          href={it.href}
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13.5px] transition-colors",
            matchLen(pathname, it.href) === best && best > 0
              ? "bg-white/10 font-medium text-white"
              : "text-[#9fb9cd] hover:bg-white/5 hover:text-white"
          )}
        >
          {it.icon}
          <span className="flex-1">{it.label}</span>
          {it.href === "/notifications" && unread > 0 && (
            <span className="rounded-full bg-yellow px-1.5 py-0.5 text-[9.5px] font-bold text-navy">{unread}</span>
          )}
        </Link>
      ))}
    </nav>
  );
}
