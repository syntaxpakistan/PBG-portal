"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { NotificationsBell } from "./notifications-bell";

export type NavItem = { href?: string; label: string; icon: React.ReactNode; children?: NavItem[]; badge?: number };

function matchLen(pathname: string, href: string) {
  const base = href.split("#")[0];
  if (pathname === base) return base.length;
  const portalRoot = base.split("/").slice(0, 2).join("/");
  if (base !== portalRoot && pathname.startsWith(base + "/")) return base.length;
  return -1;
}

export function SideNav({ items, unread }: { items: NavItem[]; unread: number }) {
  const pathname = usePathname();
  const allItems: NavItem[] = items;
  const allHrefs = allItems.flatMap((it) => (it.children?.length ? it.children.map((c) => c.href!) : it.href ? [it.href] : []));
  const best = Math.max(0, ...allHrefs.map((h) => matchLen(pathname, h)));
  const [closed, setClosed] = useState<Record<string, boolean>>({});

  return (
    <nav className="flex-1 space-y-0.5 overflow-y-auto px-3">
      {allItems.map((it) => {
        if (it.children?.length) {
          const childActive = it.children.some((c) => c.href && matchLen(pathname, c.href) === best && best > 0);
          const open = !(closed[it.label] ?? false) || childActive;
          return (
            <div key={it.label}>
              <button
                type="button"
                onClick={() => setClosed((s) => ({ ...s, [it.label]: !open }))}
                className={cn(
                  "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-[13.5px] transition-colors",
                  childActive ? "bg-white/10 font-medium text-white" : "text-[#9fb9cd] hover:bg-white/5 hover:text-white"
                )}
              >
                {it.icon}
                <span className="flex-1 text-left">{it.label}</span>
                <ChevronDown className={cn("size-4 transition-transform", open && "rotate-180")} />
              </button>
              {open && (
                <div className="mt-0.5 space-y-0.5">
                  {it.children.map((c) => (
                    <Link
                      key={c.href}
                      href={c.href!}
                      className={cn(
                        "flex items-center gap-3 rounded-lg py-2 pl-9 pr-3 text-[13px] transition-colors",
                        c.href && matchLen(pathname, c.href) === best && best > 0
                          ? "bg-white/10 font-medium text-white"
                          : "text-[#9fb9cd] hover:bg-white/5 hover:text-white"
                      )}
                    >
                      {c.icon}
                      <span className="flex-1">{c.label}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          );
        }
        return (
          <Link
            key={it.href}
            href={it.href!}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13.5px] transition-colors",
              it.href && matchLen(pathname, it.href) === best && best > 0
                ? "bg-white/10 font-medium text-white"
                : "text-[#9fb9cd] hover:bg-white/5 hover:text-white"
            )}
          >
            {it.icon}
            <span className="flex-1">{it.label}</span>
            {!!it.badge && it.badge > 0 && (
              <span className="rounded-full bg-yellow px-1.5 py-0.5 text-[9.5px] font-bold text-navy">{it.badge > 99 ? "99+" : it.badge}</span>
            )}
          </Link>
        );
      })}
      <NotificationsBell unread={unread} variant="nav" />
    </nav>
  );
}
