"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Lock, SendHorizonal } from "lucide-react";
import { toast } from "sonner";
import { sendComplaintMessage, type ComplaintChannel } from "@/lib/actions/complaints";
import { cn } from "@/lib/utils";

export type ThreadMessage = {
  id: string;
  senderId: string;
  senderName: string;
  body: string;
  createdAt: string;
};

export function ComplaintThread({
  complaintId,
  channel,
  title,
  subtitle,
  messages,
  selfId,
  locked,
}: {
  complaintId: string;
  channel: ComplaintChannel;
  title: string;
  subtitle?: string;
  messages: ThreadMessage[];
  selfId: string;
  locked: boolean;
}) {
  const router = useRouter();
  const [text, setText] = useState("");
  const [pending, startTransition] = useTransition();
  const scrollRef = useRef<HTMLDivElement>(null);

  function send() {
    const body = text.trim();
    if (!body || pending) return;
    startTransition(async () => {
      try {
        await sendComplaintMessage(complaintId, channel, body);
        setText("");
        router.refresh();
        requestAnimationFrame(() => scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight }));
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Failed to send");
      }
    });
  }

  return (
    <div className="card flex h-[520px] flex-col overflow-hidden">
      <div className="border-b border-line px-4 py-3">
        <p className="text-[13.5px] font-semibold text-ink">{title}</p>
        {subtitle && <p className="mt-0.5 text-[11.5px] text-muted">{subtitle}</p>}
      </div>
      <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto bg-paper-2/60 px-4 py-4">
        {messages.length === 0 && (
          <p className="py-10 text-center text-[12.5px] text-muted">No messages yet — start the conversation below.</p>
        )}
        {messages.map((m) => {
          const mine = m.senderId === selfId;
          return (
            <div key={m.id} className={cn("flex flex-col", mine ? "items-end" : "items-start")}>
              <div
                className={cn(
                  "max-w-[82%] rounded-2xl px-3.5 py-2.5 text-[13px] leading-relaxed",
                  mine ? "rounded-br-sm bg-navy text-white" : "rounded-bl-sm border border-line bg-surface text-ink"
                )}
              >
                {!mine && <p className="mb-0.5 text-[10.5px] font-semibold uppercase tracking-wide text-muted">{m.senderName}</p>}
                <p className="whitespace-pre-wrap">{m.body}</p>
              </div>
              <span className="mt-1 px-1 text-[10px] text-muted">
                {new Date(m.createdAt).toLocaleString("en-PK", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" })}
              </span>
            </div>
          );
        })}
      </div>
      <div className="border-t border-line p-3">
        {locked ? (
          <p className="flex items-center justify-center gap-1.5 py-1 text-[12px] text-muted">
            <Lock className="size-3.5" /> Complaint closed — conversation locked.
          </p>
        ) : (
          <div className="flex items-end gap-2">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send();
                }
              }}
              rows={2}
              placeholder="Write a message… (Enter to send)"
              className="min-h-11 flex-1 resize-none rounded-lg border border-line bg-surface px-3 py-2.5 text-[13px] text-ink outline-none transition-colors focus:border-navy-3"
            />
            <button
              onClick={send}
              disabled={pending || !text.trim()}
              className="btn-primary !px-3.5 !py-2.5 disabled:opacity-50"
              aria-label="Send message"
            >
              {pending ? <Loader2 className="size-4 animate-spin" /> : <SendHorizonal className="size-4" />}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
