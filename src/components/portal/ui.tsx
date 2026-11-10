import { Check, CircleDashed, Loader2, SkipForward, PauseCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { PROJECT_STAGES, STAGE_LABELS, STATUS_COLORS, STOCK_LABELS, WORK_STAGES, stageIndex } from "@/lib/constants";

export function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-medium",
        STATUS_COLORS[status] ?? "bg-paper-2 text-body border-line"
      )}
    >
      {STAGE_LABELS[status] ?? STOCK_LABELS[status] ?? status.replaceAll("_", " ").toLowerCase().replace(/^\w/, (c) => c.toUpperCase())}
    </span>
  );
}

export function StageTracker({ status }: { status: string }) {
  const idx = stageIndex(status);
  if (status === "CANCELLED") {
    return (
      <div className="rounded-xl border border-(--st-red-bd) bg-(--st-red-bg) px-4 py-3 text-[13px] font-medium text-(--st-red-fg)">
        Project cancelled
      </div>
    );
  }
  return (
    <div className="flex items-center">
      {PROJECT_STAGES.map((s, i) => {
        const done = i < idx;
        const current = i === idx;
        return (
          <div key={s} className="flex flex-1 items-center last:flex-none">
            <div className="flex flex-col items-center">
              <span
                className={cn(
                  "grid size-7 place-items-center rounded-full border-2 text-[10px] font-semibold",
                  done && "border-(--st-green-bd) bg-(--st-green-bg) text-(--st-green-fg)",
                  current && "border-(--st-blue-bd) bg-(--st-blue-bg) text-(--st-blue-fg)",
                  !done && !current && "border-line bg-surface text-muted"
                )}
              >
                {done ? <Check className="size-3.5" /> : i + 1}
              </span>
              <span
                className={cn(
                  "mt-1.5 whitespace-nowrap text-[10.5px]",
                  current ? "font-semibold text-ink" : done ? "text-(--st-green-fg)" : "text-muted"
                )}
              >
                {STAGE_LABELS[s]}
              </span>
            </div>
            {i < PROJECT_STAGES.length - 1 && (
              <div className={cn("mx-1 mb-5 h-0.5 flex-1 rounded", done || current ? "bg-(--st-green-bd)" : "bg-line")} />
            )}
          </div>
        );
      })}
    </div>
  );
}

export function PageHead({ title, sub, action }: { title: string; sub?: string; action?: React.ReactNode }) {
  return (
    <div className="mb-7 flex flex-wrap items-start justify-between gap-x-6 gap-y-3">
      <div className="min-w-0">
        <h1 className="font-display text-[21px] font-medium tracking-tight text-ink sm:text-[24px]">{title}</h1>
        {sub && <p className="mt-1 text-[13px] text-body">{sub}</p>}
      </div>
      {action}
    </div>
  );
}

export function StatCard({ label, value, sub, icon, compact }: { label: string; value: string | number; sub?: string; icon?: React.ReactNode; compact?: boolean }) {
  if (compact) {
    return (
      <div className="card relative overflow-hidden px-3.5 py-2.5 transition-colors hover:border-line-strong">
        <div className="absolute inset-y-0 left-0 w-[3px] bg-gradient-to-b from-navy/60 to-green/60" />
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="truncate text-[10.5px] font-semibold uppercase tracking-[0.1em] text-muted">{label}</div>
            <div className="font-display mt-0.5 text-[19px] font-medium tracking-tight text-ink">{value}</div>
          </div>
          {sub && <div className="shrink-0 text-[10.5px] text-body">{sub}</div>}
        </div>
      </div>
    );
  }
  return (
    <div className="card relative overflow-hidden p-5">
      <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-navy/60 to-green/60" />
      <div className="flex items-start justify-between">
        <div className="text-[11.5px] font-semibold uppercase tracking-[0.1em] text-muted">{label}</div>
        {icon && <span className="text-muted/60">{icon}</span>}
      </div>
      <div className="font-display mt-2 text-[30px] font-light tracking-tight text-ink">{value}</div>
      {sub && <div className="mt-1 text-[12px] text-body">{sub}</div>}
    </div>
  );
}

// SLA compliance score ring — green ≥90, amber ≥70, red below
export function SlaScore({ pct }: { pct: number | null }) {
  if (pct == null) return <span className="text-muted">—</span>;
  const tone = pct >= 90 ? "var(--st-green-fg)" : pct >= 70 ? "var(--st-orange-fg)" : "var(--st-red-fg)";
  return (
    <div className="flex items-center gap-2.5">
      <div
        className="grid size-11 place-items-center rounded-full text-[11px] font-bold"
        style={{ background: `conic-gradient(${tone} ${pct * 3.6}deg, var(--color-line) 0deg)` }}
      >
        <span className="grid size-8 place-items-center rounded-full bg-surface" style={{ color: tone }}>{pct}%</span>
      </div>
    </div>
  );
}

// pure-CSS horizontal funnel bar (quote → win pipeline)
export function FunnelBar({ label, value, max, tone }: { label: string; value: number; max: number; tone: string }) {
  const w = max > 0 ? Math.max(6, Math.round((value / max) * 100)) : 0;
  return (
    <div className="flex items-center gap-3">
      <span className="w-28 shrink-0 text-right text-[11.5px] font-medium text-body">{label}</span>
      <div className="h-6 flex-1 rounded-md bg-paper-2">
        <div className={cn("flex h-6 items-center justify-end rounded-md px-2 text-[10.5px] font-semibold transition-all", tone)} style={{ width: `${w}%` }}>
          {value}
        </div>
      </div>
    </div>
  );
}

type StageLite = { key: string; status: string; note?: string | null; operator?: string | null; startedAt?: Date | null; doneAt?: Date | null };

// in-lab pipeline ladder — read-only; lab gets its own editor version
export function StageLadder({ stages, paused }: { stages: StageLite[]; paused?: boolean }) {
  const map = new Map(stages.map((s) => [s.key, s]));
  return (
    <ol className="space-y-0">
      {WORK_STAGES.map((def, i) => {
        const s = map.get(def.key);
        const status = s?.status ?? "PENDING";
        const last = i === WORK_STAGES.length - 1;
        return (
          <li key={def.key} className="relative flex gap-3 pb-5 last:pb-0">
            {!last && <span className={cn("absolute left-[11px] top-6 h-full w-0.5", status === "DONE" ? "bg-(--st-green-bd)" : "bg-line")} />}
            <span
              className={cn(
                "z-10 grid size-6 shrink-0 place-items-center rounded-full border-2",
                status === "DONE" && "border-(--st-green-bd) bg-(--st-green-bg) text-(--st-green-fg)",
                status === "ACTIVE" && (paused ? "border-(--st-orange-bd) bg-(--st-orange-bg) text-(--st-orange-fg)" : "border-(--st-blue-bd) bg-(--st-blue-bg) text-(--st-blue-fg)"),
                status === "SKIPPED" && "border-line bg-paper-2 text-muted",
                status === "PENDING" && "border-line bg-surface text-muted/50"
              )}
            >
              {status === "DONE" ? <Check className="size-3" />
                : status === "ACTIVE" ? (paused ? <PauseCircle className="size-3.5" /> : <Loader2 className="size-3.5" />)
                : status === "SKIPPED" ? <SkipForward className="size-3" />
                : <CircleDashed className="size-3" />}
            </span>
            <div className="min-w-0 pt-0.5">
              <div className={cn("text-[13px] font-medium", status === "ACTIVE" ? "text-ink" : status === "PENDING" ? "text-muted" : "text-ink")}>
                {def.label}
                {status === "ACTIVE" && <span className="ml-2 rounded-full bg-(--st-blue-bg) px-2 py-0.5 text-[10px] font-semibold text-(--st-blue-fg)">{paused ? "paused" : "in progress"}</span>}
              </div>
              <div className="text-[11px] text-muted">{def.hint}</div>
              {(s?.note || s?.operator || s?.doneAt) && (
                <div className="mt-0.5 text-[11px] text-body">
                  {s.operator && <span className="font-medium">{s.operator} · </span>}
                  {s.note && <span>{s.note} · </span>}
                  {s.doneAt && <span className="text-muted">{s.doneAt.toLocaleDateString()}</span>}
                </div>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
