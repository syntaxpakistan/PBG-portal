"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bell, CheckCheck, Loader2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { markAllNotificationsRead, markNotificationRead } from "@/lib/actions/marketplace";
import { PushMiniOptIn } from "./push-opt-in";

type Item = {
  id: string;
  subject: string;
  body: string;
  href: string | null;
  createdAt: string;
  readAt: string | null;
};

export function NotificationsBell({ unread }: { unread: number }) {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<Item[] | null>(null);
  const router = useRouter();

  const load = async () => {
    try {
      const res = await fetch("/api/notifications");
      if (res.ok) setItems(await res.json());
    } catch {
      /* keep previous items */
    }
  };

  const toggle = () => {
    if (!open) void load();
    setOpen((o) => !o);
  };

  // close on Escape only — backdrop click also closes (below)
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const openItem = async (n: Item) => {
    if (!n.readAt) {
      setItems((s) => s?.map((i) => (i.id === n.id ? { ...i, readAt: new Date().toISOString() } : i)) ?? s);
      await markNotificationRead(n.id);
    }
    setOpen(false);
    router.refresh();
    if (n.href) router.push(n.href);
  };

  const markAll = async () => {
    setItems((s) => s?.map((i) => ({ ...i, readAt: i.readAt ?? new Date().toISOString() })) ?? s);
    await markAllNotificationsRead();
    router.refresh();
  };

  return (
    <>
      <button
        type="button"
        onClick={toggle}
        aria-label="Notifications"
        className="relative grid size-9 shrink-0 place-items-center rounded-full text-white/80 transition-colors hover:bg-white/10"
      >
        <Bell className="size-4.5" />
        {unread > 0 && (
          <span className="absolute -right-0.5 -top-0.5 grid min-w-4 place-items-center rounded-full bg-yellow px-0.5 py-0.5 text-[8.5px] font-bold leading-none text-navy">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
          {/* backdrop */}
          <button
            type="button"
            aria-label="Close notifications"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-navy/60 backdrop-blur-sm"
          />
          {/* centered window */}
          <div className="relative flex max-h-[80vh] w-full max-w-md flex-col overflow-hidden rounded-xl border border-line bg-surface shadow-2xl shadow-navy/30">
            <div className="flex items-center justify-between border-b border-line px-4 py-3">
              <span className="text-[14px] font-semibold text-ink">Notifications</span>
              <div className="flex items-center gap-2">
                {items?.some((n) => !n.readAt) && (
                  <button
                    type="button"
                    onClick={markAll}
                    className="flex items-center gap-1 text-[11px] font-medium text-(--st-blue-fg) hover:underline"
                  >
                    <CheckCheck className="size-3.5" /> Mark all read
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label="Close"
                  className="grid size-7 place-items-center rounded-full text-muted hover:bg-paper-2 hover:text-ink"
                >
                  <X className="size-4" />
                </button>
              </div>
            </div>

            <div className="min-h-0 flex-1 divide-y divide-line overflow-y-auto">
              {items === null && (
                <div className="flex items-center justify-center gap-2 px-4 py-10 text-[12.5px] text-muted">
                  <Loader2 className="size-4 animate-spin" /> Loading…
                </div>
              )}
              {items?.length === 0 && (
                <div className="flex flex-col items-center gap-2 px-6 py-10 text-center">
                  <Bell className="size-7 text-line-strong" />
                  <p className="text-[12.5px] text-muted">Nothing yet — quotes, awards and updates land here.</p>
                </div>
              )}
              {items?.map((n) => (
                <button
                  key={n.id}
                  type="button"
                  onClick={() => void openItem(n)}
                  className={cn(
                    "block w-full px-4 py-3 text-left transition-colors hover:bg-paper-2",
                    !n.readAt && "bg-(--st-blue-bg)/40"
                  )}
                >
                  <div className="flex items-center gap-2">
                    {!n.readAt && <span className="size-1.5 shrink-0 rounded-full bg-(--st-blue-fg)" />}
                    <span className="truncate text-[13px] font-medium text-ink">{n.subject}</span>
                  </div>
                  <p className="mt-0.5 line-clamp-2 text-[12px] leading-relaxed text-body">{n.body}</p>
                  <span className="mt-1 block text-[10.5px] text-muted">
                    {new Date(n.createdAt).toLocaleString()}
                  </span>
                </button>
              ))}
            </div>

            <PushMiniOptIn />
            <Link
              href="/notifications"
              onClick={() => setOpen(false)}
              className="block border-t border-line px-4 py-2.5 text-center text-[12px] font-medium text-(--st-blue-fg) hover:bg-paper-2"
            >
              View all notifications →
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
