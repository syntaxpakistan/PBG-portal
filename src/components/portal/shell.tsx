import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { SignOutButton } from "./signout";
import { ThemeToggle } from "@/components/theme-toggle";
import { SideNav, type NavItem } from "./side-nav";
import { PortalMobileNav } from "./mobile-nav";

export type { NavItem };

export async function PortalShell({
  title,
  items,
  children,
}: {
  title: string;
  items: NavItem[];
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  const user = session.user;
  const unread = await prisma.notification.count({ where: { userId: user.id, readAt: null } });

  return (
    <div className="flex min-h-screen flex-col bg-paper-2 lg:flex-row">
      {/* mobile top bar + drawer */}
      <PortalMobileNav title={title} items={items} unread={unread} name={user.name} email={user.email} />
      {/* sidebar — desktop only */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-60 flex-col border-r border-line bg-navy lg:flex">
        <div className="px-5 pt-5">
          <Link href="/" className="inline-block" aria-label="Pakistan Biotechnology Gateway home">
            <Image src="/brand/pbg-logo-dark.webp" alt="Pakistan Biotechnology Gateway" width={1024} height={334} className="h-16 w-auto" />
          </Link>
        </div>
        <div className="px-5 pb-3 pt-5 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#a2c1d7]">
          {title}
        </div>
        <SideNav items={items} unread={unread} />
        <div className="border-t border-white/10 p-4">
          <div className="mb-3 flex items-center gap-2.5">
            <span className="grid size-8 place-items-center rounded-full bg-yellow/20 text-[12px] font-semibold text-yellow">
              {user.name?.charAt(0) ?? "U"}
            </span>
            <div className="min-w-0">
              <div className="truncate text-[13px] font-medium text-white">{user.name}</div>
              <div className="truncate text-[11px] text-[#a2c1d7]">{user.email}</div>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <SignOutButton />
            <ThemeToggle onDark />
          </div>
        </div>
      </aside>
      {/* content */}
      <main className="flex-1 p-4 sm:p-6 lg:ml-60 lg:p-8">{children}</main>
    </div>
  );
}
