import Link from "next/link";

export const PAGE_SIZE = 25;

/** Build "?a=b&c=d" from params — drops empties and `page`. */
export function qs(params: Record<string, string | undefined>) {
  const p = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) if (v && k !== "page") p.set(k, v);
  const s = p.toString();
  return s ? `?${s}` : "";
}

/** Parse ?page= from searchParams; always ≥1. */
export function pageOf(sp: { page?: string }) {
  const p = Number(sp.page ?? 1);
  return Number.isFinite(p) && p >= 1 ? Math.floor(p) : 1;
}

export function Pagination({
  page,
  total,
  base,
  param = "page",
}: {
  page: number;
  total: number;
  /** base href including existing query params, e.g. "/admin/users?q=ali" */
  base: string;
  /** query param name for this paginator (use when a page has multiple lists) */
  param?: string;
}) {
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  if (pages <= 1) return null;

  const sep = base.includes("?") ? "&" : "?";
  const href = (p: number) => `${base}${sep}${param}=${p}`;

  // page number window: ±2 around current
  const nums: number[] = [];
  for (let p = Math.max(1, page - 2); p <= Math.min(pages, page + 2); p++) nums.push(p);

  const btn = "grid min-w-8 place-items-center rounded-lg border border-line px-2 py-1 text-[11.5px] font-medium text-body transition-colors hover:bg-paper-2";

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line px-5 py-3">
      <p className="text-[11.5px] text-muted">
        Page {page} of {pages} · {total} total
      </p>
      <div className="flex items-center gap-1.5">
        {page > 1 && <Link href={href(page - 1)} className={btn}>←</Link>}
        {nums[0] > 1 && <span className="px-1 text-muted">…</span>}
        {nums.map((p) =>
          p === page ? (
            <span key={p} className="grid min-w-8 place-items-center rounded-lg bg-navy px-2 py-1 text-[11.5px] font-semibold text-yellow">{p}</span>
          ) : (
            <Link key={p} href={href(p)} className={btn}>{p}</Link>
          )
        )}
        {nums[nums.length - 1] < pages && <span className="px-1 text-muted">…</span>}
        {page < pages && <Link href={href(page + 1)} className={btn}>→</Link>}
      </div>
    </div>
  );
}

/** GET search bar — submits ?q= (keeps any extra hidden params). */
export function SearchBar({
  q,
  placeholder = "Search…",
  extra,
}: {
  q?: string;
  placeholder?: string;
  extra?: Record<string, string | undefined>;
}) {
  return (
    <form className="mb-4 flex flex-wrap items-center gap-2">
      {Object.entries(extra ?? {}).map(([k, v]) => (v ? <input key={k} type="hidden" name={k} value={v} /> : null))}
      <input
        name="q"
        defaultValue={q ?? ""}
        placeholder={placeholder}
        className="w-64 max-w-full rounded-full border border-line bg-surface px-4 py-2 text-[12.5px] text-ink outline-none focus:border-navy-3"
      />
      <button type="submit" className="btn-outline !py-2 text-[12.5px]">Search</button>
      {q && <Link href="?" className="text-[12px] text-muted hover:text-ink">clear</Link>}
    </form>
  );
}
