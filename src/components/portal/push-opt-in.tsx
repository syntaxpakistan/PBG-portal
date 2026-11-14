"use client";

import { useEffect, useState } from "react";
import { BellRing, BellOff, Loader2 } from "lucide-react";

type State = "loading" | "unsupported" | "denied" | "off" | "on";

const VAPID_PUBLIC = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

function urlBase64ToUint8Array(base64: string) {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const b64 = (base64 + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(b64);
  const arr = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) arr[i] = raw.charCodeAt(i);
  return arr;
}

function usePushState() {
  const [state, setState] = useState<State>(() => {
    if (typeof window === "undefined") return "loading";
    if (!VAPID_PUBLIC || !("serviceWorker" in navigator) || !("PushManager" in window)) return "unsupported";
    if (Notification.permission === "denied") return "denied";
    return "loading"; // subscription state resolved async below
  });
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (state !== "loading") return;
    let alive = true;
    navigator.serviceWorker
      .register("/sw.js")
      .then((reg) => reg.pushManager.getSubscription())
      .then((sub) => { if (alive) setState(sub ? "on" : "off"); })
      .catch(() => { if (alive) setState("unsupported"); });
    return () => { alive = false; };
  }, [state]);

  async function enable() {
    setBusy(true);
    try {
      const perm = await Notification.requestPermission();
      if (perm !== "granted") {
        setState(perm === "denied" ? "denied" : "off");
        return;
      }
      const reg = await navigator.serviceWorker.register("/sw.js");
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC!),
      });
      const res = await fetch("/api/push/subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sub.toJSON()),
      });
      if (!res.ok) throw new Error("save failed");
      setState("on");
    } catch {
      setState("off");
    } finally {
      setBusy(false);
    }
  }

  async function sendTest() {
    setBusy(true);
    try {
      await fetch("/api/push/test", { method: "POST" });
    } finally {
      setBusy(false);
    }
  }

  async function disable() {
    setBusy(true);
    try {
      const reg = await navigator.serviceWorker.getRegistration("/sw.js");
      const sub = await reg?.pushManager.getSubscription();
      if (sub) {
        await fetch("/api/push/subscription", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ endpoint: sub.endpoint }),
        });
        await sub.unsubscribe();
      }
      setState("off");
    } finally {
      setBusy(false);
    }
  }

  return { state, busy, enable, disable, sendTest };
}

// Compact row for the bell popover — only prompts when push is available and off
export function PushMiniOptIn() {
  const { state, busy, enable } = usePushState();
  if (state !== "off") return null;
  return (
    <button
      type="button"
      onClick={enable}
      disabled={busy}
      className="flex w-full items-center justify-center gap-1.5 border-t border-line bg-(--st-blue-bg)/50 px-4 py-2 text-[12px] font-medium text-(--st-blue-fg) hover:bg-(--st-blue-bg)"
    >
      {busy ? <Loader2 className="size-3.5 animate-spin" /> : <BellRing className="size-3.5" />}
      Enable push alerts on this device
    </button>
  );
}

export function PushOptIn() {
  const { state, busy, enable, disable, sendTest } = usePushState();

  if (state === "unsupported" || state === "loading") return null;

  return (
    <div className="card mt-4 flex flex-wrap items-center justify-between gap-3 px-5 py-3.5">
      <div className="flex items-center gap-3 text-[13px]">
        {state === "on" ? (
          <BellRing className="size-4.5 text-(--st-green-fg)" />
        ) : (
          <BellOff className="size-4.5 text-muted" />
        )}
        <div>
          <div className="font-medium text-ink">
            {state === "on" ? "Push alerts on — this device gets them even when the tab is closed" :
             state === "denied" ? "Push alerts blocked by the browser" :
             "Get push alerts on this device"}
          </div>
          <div className="text-[11.5px] text-muted">
            {state === "denied"
              ? "Re-enable notifications for this site in your browser's address-bar/site settings."
              : state === "on"
                ? "Quotes, awards, status changes, payments and complaint replies pop up here."
                : "Quotes, awards, status changes, payments and complaint replies — even with the tab closed."}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {state === "on" && (
          <button onClick={sendTest} disabled={busy} className="btn-outline !py-1.5 text-[12px]">
            Send test
          </button>
        )}
        {state !== "denied" && (
          <button
            onClick={state === "on" ? disable : enable}
            disabled={busy}
            className={state === "on" ? "btn-outline !py-1.5 text-[12px]" : "btn-primary !py-1.5 text-[12px]"}
          >
            {busy ? <Loader2 className="size-3.5 animate-spin" /> : state === "on" ? "Turn off" : "Enable"}
          </button>
        )}
      </div>
    </div>
  );
}
