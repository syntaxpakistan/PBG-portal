export const instant = false

import Link from "next/link";
import { redirect } from "next/navigation";
import { Bell, ArrowLeft, CheckCheck } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { markAllNotificationsRead, markNotificationRead } from "@/lib/actions/marketplace";
import { SubmitButton } from "@/components/portal/submit-button";

const HOME: Record<string, string> = { CUSTOMER: "/dashboard", PROVIDER: "/lab", SUPPLIER: "/supplier", ADMIN: "/admin" };

export default async function NotificationsPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  const items = await prisma.notification.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 60,
  });
  const unread = items.filter((n) => !n.readAt).length;
  const home = HOME[session.user.role ?? "CUSTOMER"] ?? "/dashboard";

  return (
    <main className="min-h-screen bg-paper-2">
      <div className="mx-auto max-w-3xl px-6 py-10">
        <Link href={home} className="inline-flex items-center gap-1.5 text-[12.5px] text-muted hover:text-ink">
          <ArrowLeft className="size-3.5" /> Back to portal
        </Link>
        <div className="mt-4 flex items-center justify-between">
          <div>
            <h1 className="font-display text-[26px] font-medium tracking-tight text-ink">Notifications</h1>
            <p className="mt-1 text-[13px] text-muted">{unread} unread · everything that happened on your account</p>
          </div>
          {unread > 0 && (
            <form action={markAllNotificationsRead}>
              <SubmitButton className="btn-outline flex items-center gap-1.5 !py-2 text-[12px]">
                <CheckCheck className="size-3.5" /> Mark all read
              </SubmitButton>
            </form>
          )}
        </div>

        <div className="card mt-6 divide-y divide-line overflow-hidden">
          {items.length === 0 && (
            <div className="flex flex-col items-center gap-2 px-6 py-16 text-center">
              <Bell className="size-8 text-line-strong" />
              <p className="text-[13.5px] text-muted">Nothing yet — quotes, awards, status updates and invoices land here.</p>
            </div>
          )}
          {items.map((n) => (
            <div key={n.id} className={`flex items-start justify-between gap-4 px-5 py-4 ${n.readAt ? "opacity-70" : "bg-(--st-blue-bg)/40"}`}>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  {!n.readAt && <span className="size-1.5 shrink-0 rounded-full bg-(--st-blue-fg)" />}
                  <span className="text-[13.5px] font-medium text-ink">{n.subject}</span>
                </div>
                <p className="mt-1 text-[12.5px] leading-relaxed text-body">{n.body}</p>
                <div className="mt-1.5 flex items-center gap-3 text-[11px] text-muted">
                  <span>{n.createdAt.toLocaleString()}</span>
                  {n.href && <Link href={n.href} className="font-medium text-(--st-blue-fg) hover:underline">Open →</Link>}
                </div>
              </div>
              {!n.readAt && (
                <form action={markNotificationRead.bind(null, n.id)}>
                  <SubmitButton className="btn-outline shrink-0 !px-2.5 !py-1 text-[10.5px]">Read</SubmitButton>
                </form>
              )}
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
