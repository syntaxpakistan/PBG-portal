export const PROJECT_STAGES = [
  "OFFER_SELECTED",
  "SAMPLE_AWAITED",
  "SAMPLE_RECEIVED",
  "WORK_IN_PROGRESS",
  "RESULTS_AVAILABLE",
  "COMPLETED",
] as const;

export const STAGE_LABELS: Record<string, string> = {
  OFFER_SELECTED: "Offer selected",
  SAMPLE_AWAITED: "Sample awaited",
  SAMPLE_RECEIVED: "Sample received",
  WORK_IN_PROGRESS: "Work in progress",
  RESULTS_AVAILABLE: "Results available",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

export const STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-(--st-amber-bg) text-(--st-amber-fg) border-(--st-amber-bd)",
  APPROVED: "bg-(--st-green-bg) text-(--st-green-fg) border-(--st-green-bd)",
  REJECTED: "bg-(--st-red-bg) text-(--st-red-fg) border-(--st-red-bd)",
  SUSPENDED: "bg-(--st-orange-bg) text-(--st-orange-fg) border-(--st-orange-bd)",
  OPEN: "bg-(--st-blue-bg) text-(--st-blue-fg) border-(--st-blue-bd)",
  AWARDED: "bg-(--st-green-bg) text-(--st-green-fg) border-(--st-green-bd)",
  CANCELLED: "bg-(--st-red-bg) text-(--st-red-fg) border-(--st-red-bd)",
  CLOSED: "bg-paper-2 text-body border-line",
  SUBMITTED: "bg-(--st-blue-bg) text-(--st-blue-fg) border-(--st-blue-bd)",
  SELECTED: "bg-(--st-green-bg) text-(--st-green-fg) border-(--st-green-bd)",
  DECLINED: "bg-paper-2 text-body border-line",
  WITHDRAWN: "bg-paper-2 text-body border-line",
  IN_REVIEW: "bg-(--st-purple-bg) text-(--st-purple-fg) border-(--st-purple-bd)",
  RESOLVED: "bg-(--st-green-bg) text-(--st-green-fg) border-(--st-green-bd)",
  DISMISSED: "bg-paper-2 text-body border-line",
  PAID: "bg-(--st-green-bg) text-(--st-green-fg) border-(--st-green-bd)",
  INVOICED: "bg-(--st-blue-bg) text-(--st-blue-fg) border-(--st-blue-bd)",
  WAIVED: "bg-paper-2 text-body border-line",
  ANSWERED: "bg-(--st-green-bg) text-(--st-green-fg) border-(--st-green-bd)",
  ACTIVE: "bg-(--st-green-bg) text-(--st-green-fg) border-(--st-green-bd)",
  PLANNED: "bg-paper-2 text-body border-line",
  QUOTED: "bg-(--st-blue-bg) text-(--st-blue-fg) border-(--st-blue-bd)",
  FULFILLED: "bg-(--st-green-bg) text-(--st-green-fg) border-(--st-green-bd)",
  IN_STOCK: "bg-(--st-green-bg) text-(--st-green-fg) border-(--st-green-bd)",
  LOW_STOCK: "bg-(--st-amber-bg) text-(--st-amber-fg) border-(--st-amber-bd)",
  BACKORDER: "bg-(--st-orange-bg) text-(--st-orange-fg) border-(--st-orange-bd)",
  OUT_OF_STOCK: "bg-(--st-red-bg) text-(--st-red-fg) border-(--st-red-bd)",
  PASS: "bg-(--st-green-bg) text-(--st-green-fg) border-(--st-green-bd)",
  PARTIAL: "bg-(--st-amber-bg) text-(--st-amber-fg) border-(--st-amber-bd)",
  FAIL: "bg-(--st-red-bg) text-(--st-red-fg) border-(--st-red-bd)",
  PENDING_PAYMENT: "bg-(--st-amber-bg) text-(--st-amber-fg) border-(--st-amber-bd)",
  EXPIRED: "bg-(--st-red-bg) text-(--st-red-fg) border-(--st-red-bd)",
  DONE: "bg-(--st-green-bg) text-(--st-green-fg) border-(--st-green-bd)",
  SKIPPED: "bg-paper-2 text-body border-line",
  PAUSED: "bg-(--st-orange-bg) text-(--st-orange-fg) border-(--st-orange-bd)",
};

export function stageIndex(status: string) {
  const i = PROJECT_STAGES.indexOf(status as (typeof PROJECT_STAGES)[number]);
  return i === -1 ? (status === "CANCELLED" ? -2 : 0) : i;
}

export const pkr = (n: number) =>
  "PKR " + n.toLocaleString("en-PK", { maximumFractionDigits: 0 });

// turnaround SLA — days remaining vs quoted due date (paused projects freeze the clock)
export function slaInfo(dueAt: Date | null | undefined, status: string, pausedAt?: Date | null) {
  if (!dueAt || status === "COMPLETED" || status === "CANCELLED") return null;
  const ref = pausedAt ?? new Date();
  const days = Math.ceil((dueAt.getTime() - ref.getTime()) / 864e5);
  return { days, overdue: !pausedAt && days < 0, paused: !!pausedAt, dueAt };
}

export const STOCK_LABELS: Record<string, string> = {
  IN_STOCK: "In stock",
  LOW_STOCK: "Low stock",
  BACKORDER: "Backordered",
  OUT_OF_STOCK: "Out of stock",
};

// ---------- inside-the-lab pipeline (real sequencing-lab ladder) ----------

export const WORK_STAGES = [
  { key: "ACCESSIONING", label: "Accessioning", hint: "Sample login + lab IDs" },
  { key: "SAMPLE_QC", label: "Sample QC", hint: "Concentration · purity · integrity" },
  { key: "LIBRARY_PREP", label: "Library prep", hint: "Extraction → indexed libraries" },
  { key: "LIBRARY_QC", label: "Library QC", hint: "Size range · qPCR normalization" },
  { key: "SEQUENCING", label: "Sequencing run", hint: "Platform + flow cell" },
  { key: "DATA_PROCESSING", label: "Data processing", hint: "Demux · read QC (Q30, yield)" },
  { key: "ANALYSIS", label: "Bioinformatics", hint: "Alignment · calling · annotation" },
  { key: "REPORT_REVIEW", label: "Report review", hint: "Internal sign-off before release" },
] as const;

export const WORK_STAGE_LABELS: Record<string, string> = Object.fromEntries(WORK_STAGES.map((s) => [s.key, s.label]));

export const WORK_STAGE_KEYS = WORK_STAGES.map((s) => s.key);

export const QC_STAGE_LABELS: Record<string, string> = {
  SAMPLE_QC: "Sample QC",
  LIBRARY_QC: "Library QC",
};

export const QC_DECISION_LABELS: Record<string, string> = {
  PROCEED: "Proceeded (disclaimer signed)",
  RESEND: "Replacement samples requested",
  CANCEL: "Project cancelled",
};
