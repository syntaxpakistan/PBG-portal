import { postMessage } from "@/lib/actions/marketplace";
import { StatusBadge } from "./ui";
import { FileLink } from "./file-link";
import { MessageSquare, FileDown, Send } from "lucide-react";
import type { Message, StatusHistory, ResultFile, User } from "@prisma/client";

export function HistoryTimeline({ history }: { history: (StatusHistory & { changedBy: Pick<User, "name"> })[] }) {
  return (
    <div className="card p-5">
      <h3 className="mb-4 text-[14px] font-semibold text-ink">Status history</h3>
      <div className="space-y-0">
        {history.map((h, i) => (
          <div key={h.id} className="relative flex gap-3 pb-5 last:pb-0">
            {i < history.length - 1 && <div className="absolute left-[5px] top-4 h-full w-px bg-line" />}
            <span className="mt-1 size-[11px] shrink-0 rounded-full border-2 border-navy bg-yellow" />
            <div>
              <div className="flex items-center gap-2">
                <StatusBadge status={h.status} />
                <span className="text-[11px] text-muted">{h.createdAt.toLocaleString()}</span>
              </div>
              <div className="mt-1 text-[12px] text-body">
                {h.changedBy.name}{h.note ? ` — ${h.note}` : ""}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function MessageThread({
  projectId,
  messages,
  currentUserId,
}: {
  projectId: string;
  messages: (Message & { sender: Pick<User, "name" | "role"> })[];
  currentUserId: string;
}) {
  const bound = postMessage.bind(null, projectId);
  return (
    <div className="card flex flex-col p-5">
      <h3 className="mb-4 flex items-center gap-2 text-[14px] font-semibold text-ink">
        <MessageSquare className="size-4 text-muted" /> Project channel
        <span className="text-[11px] font-normal text-muted">customer · lab · Syntax only</span>
      </h3>
      <div className="mb-4 max-h-80 flex-1 space-y-3 overflow-y-auto">
        {messages.length === 0 && <p className="py-6 text-center text-[12.5px] text-muted">No messages yet.</p>}
        {messages.map((m) => {
          const mine = m.senderId === currentUserId;
          return (
            <div key={m.id} className={mine ? "text-right" : "text-left"}>
              <div
                className={`inline-block max-w-[85%] rounded-2xl px-4 py-2.5 text-left text-[13px] leading-relaxed ${
                  mine ? "bg-navy text-white" : m.sender.role === "ADMIN" ? "bg-(--st-amber-bg) text-ink" : "bg-paper-2 text-ink"
                }`}
              >
                <div className={`mb-0.5 text-[10px] font-semibold ${mine ? "text-yellow" : "text-muted"}`}>
                  {m.sender.name}{m.sender.role === "ADMIN" ? " · Syntax" : ""}
                </div>
                {m.body}
                {m.attachmentName && (
                  <span className="mt-1.5 flex items-center gap-1.5 text-[11px]">
                    <FileDown className="size-3" />
                    <FileLink storageKey={m.attachmentKey} filename={m.attachmentName} compact />
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
      <form action={bound} className="flex gap-2">
        <input
          name="body" required placeholder="Message the project channel…"
          className="flex-1 rounded-full border border-line bg-surface px-4 py-2.5 text-[13px] outline-none focus:border-navy-3"
        />
        <label className="grid size-10 cursor-pointer place-items-center rounded-full border border-line bg-surface text-muted transition-colors hover:border-navy-3" title="Attach document (≤25MB)">
          <FileDown className="size-4" />
          <input name="attachment" type="file" accept=".pdf,.doc,.docx,.csv,.png,.jpg" className="hidden" />
        </label>
        <button type="submit" className="grid size-10 place-items-center rounded-full bg-navy text-yellow transition-colors hover:bg-navy-2">
          <Send className="size-4" />
        </button>
      </form>
    </div>
  );
}

export function ResultFilesCard({ files, showDrafts }: { files: ResultFile[]; showDrafts?: boolean }) {
  const visible = showDrafts ? files : files.filter((f) => f.released);
  return (
    <div className="card p-5">
      <h3 className="mb-4 flex items-center gap-2 text-[14px] font-semibold text-ink">
        <FileDown className="size-4 text-muted" /> Result deliverables
      </h3>
      {visible.length === 0 ? (
        <p className="py-4 text-center text-[12.5px] text-muted">The lab uploads reports &amp; documents here.</p>
      ) : (
        <div className="space-y-2">
          {visible.map((f) => (
            <div key={f.id} className="flex items-center justify-between rounded-lg border border-line px-4 py-3">
              <div>
                <div className="flex items-center gap-1.5 text-[13px] font-medium text-ink">
                  {f.filename}
                  {f.version > 1 && <span className="rounded-full bg-paper-2 px-1.5 py-0.5 text-[10px] font-semibold text-muted">v{f.version}</span>}
                  {showDrafts && (
                    <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${f.released ? "bg-(--st-green-bg) text-(--st-green-fg)" : "bg-(--st-amber-bg) text-(--st-amber-fg)"}`}>
                      {f.released ? "Released" : "Draft"}
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-muted">
                  {(f.sizeBytes / 1024).toFixed(0)} KB{f.note ? ` · ${f.note}` : ""} · {(f.releasedAt ?? f.createdAt).toLocaleDateString()}
                </div>
              </div>
              {f.storageKey ? (
                <FileLink storageKey={f.storageKey} filename={f.filename} />
              ) : (
                <span className="text-[11px] text-muted">legacy record</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
