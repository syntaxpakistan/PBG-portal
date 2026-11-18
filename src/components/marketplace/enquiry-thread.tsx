"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Lock, Paperclip, SendHorizonal, X } from "lucide-react";
import { toast } from "sonner";
import { sendEnquiryMessage } from "@/lib/actions/marketplace";
import { cn } from "@/lib/utils";

export type EnquiryThreadMessage = {
  id: string;
  senderId: string;
  senderName: string;
  kind: string; // CHAT | EVENT
  body: string;
  attachmentName: string | null;
  attachmentKey: string | null;
  createdAt: string;
};

export function EnquiryThread({
  enquiryId,
  title,
  subtitle,
  messages,
  selfId,
  locked,
}: {
  enquiryId: string;
  title: string;
  subtitle?: string;
  messages: EnquiryThreadMessage[];
  selfId: string;
  locked: boolean;
}) {
  const router = useRouter();
  const [text, setText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [pending, startTransition] = useTransition();
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  function send() {
    const body = text.trim();
    if ((!body && !file) || pending) return;
    const fd = new FormData();
    fd.set("body", body);
    if (file) fd.set("attachment", file);
    startTransition(async () => {
      try {
        await sendEnquiryMessage(enquiryId, fd);
        setText("");
        setFile(null);
        if (fileRef.current) fileRef.current.value = "";
        router.refresh();
        requestAnimationFrame(() => scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight }));
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Failed to send");
      }
    });
  }

  return (
    <div className="card flex h-[560px] flex-col overflow-hidden">
      <div className="border-b border-line px-4 py-3">
        <p className="text-[13.5px] font-semibold text-ink">{title}</p>
        {subtitle && <p className="mt-0.5 text-[11.5px] text-muted">{subtitle}</p>}
      </div>
      <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto bg-paper-2/60 px-4 py-4">
        {messages.length === 0 && (
          <p className="py-10 text-center text-[12.5px] text-muted">No messages yet, start the conversation below.</p>
        )}
        {messages.map((m) => {
          if (m.kind === "EVENT") {
            return (
              <div key={m.id} className="flex justify-center">
                <p className="max-w-[85%] rounded-full border border-line bg-surface px-3.5 py-1.5 text-center text-[11px] font-medium text-muted">
                  {m.body}
                  <span className="ml-1.5 font-normal opacity-70">
                    {new Date(m.createdAt).toLocaleDateString("en-PK", { day: "numeric", month: "short" })}
                  </span>
                </p>
              </div>
            );
          }
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
                {m.attachmentKey && (
                  <a
                    href={`/api/files/${m.attachmentKey}?inline=1`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(
                      "mt-1.5 flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[11.5px] font-medium",
                      mine ? "bg-white/15 text-white hover:bg-white/25" : "bg-paper-2 text-blue hover:bg-paper-3"
                    )}
                  >
                    <Paperclip className="size-3" /> {m.attachmentName ?? "Attachment"}
                  </a>
                )}
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
            <Lock className="size-3.5" /> Enquiry closed, conversation locked.
          </p>
        ) : (
          <>
            {file && (
              <div className="mb-2 flex items-center gap-2 rounded-lg bg-paper-2 px-3 py-1.5 text-[12px] text-body">
                <Paperclip className="size-3.5" />
                <span className="flex-1 truncate">{file.name}</span>
                <button onClick={() => { setFile(null); if (fileRef.current) fileRef.current.value = ""; }} className="text-muted hover:text-ink" aria-label="Remove file">
                  <X className="size-3.5" />
                </button>
              </div>
            )}
            <div className="flex items-end gap-2">
              <input
                ref={fileRef}
                type="file"
                className="hidden"
                accept=".pdf,.doc,.docx,.xls,.xlsx,.zip,.csv,.txt,.html,.png,.jpg,.jpeg,.webp"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              />
              <button
                onClick={() => fileRef.current?.click()}
                disabled={pending}
                className="btn-outline !px-3 !py-2.5"
                aria-label="Attach file"
              >
                <Paperclip className="size-4" />
              </button>
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
                disabled={pending || (!text.trim() && !file)}
                className="btn-primary !px-3.5 !py-2.5 disabled:opacity-50"
                aria-label="Send message"
              >
                {pending ? <Loader2 className="size-4 animate-spin" /> : <SendHorizonal className="size-4" />}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
