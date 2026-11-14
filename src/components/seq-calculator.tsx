"use client";

import { useMemo, useState, useCallback } from "react";
import Link from "next/link";
import {
  ArrowRight, CheckCircle2, Download, FileText, Lock, Printer, Share2,
} from "lucide-react";
import {
  GROUP_LABELS, INSTRUMENTS, KITS, applyKit, encodeEst, estimate,
  fmt, fmtGb, kitsFor, lockedFields, resolveKit, visibleFields,
  type AppType, type EstInput,
} from "@/lib/coverage";
import { cn } from "@/lib/utils";

const TYPE_BUTTONS: { id: AppType; label: string }[] = [
  { id: "dna", label: "DNA Applications" },
  { id: "rna", label: "RNA Applications" },
  { id: "dnarna", label: "DNA and RNA Applications" },
];

const fieldCls =
  "w-full rounded-lg border border-line bg-surface px-3 py-2 text-[13.5px] text-ink outline-none transition-colors focus:border-navy-3";
const lockedCls =
  "w-full cursor-not-allowed rounded-lg border border-line bg-paper-2 px-3 py-2 text-[13.5px] text-muted";

export function SeqCalculator({ initial, cta }: { initial: EstInput; cta?: "rfq" | "none" }) {
  const [inp, setInp] = useState<EstInput>(initial);
  const [submitted, setSubmitted] = useState(false);
  const [copied, setCopied] = useState(false);

  const kit = KITS.find((k) => k.id === inp.kitId) ?? KITS[0];
  const rk = resolveKit(kit, inp.panelId);
  const visible = visibleFields(kit, inp.panelId);
  const locks = lockedFields(kit, inp.panelId);
  const kits = kitsFor(inp.type);
  const res = useMemo(() => estimate(inp), [inp]);

  const setType = useCallback((t: AppType) => {
    setInp((s) => applyKit({ ...s, type: t, coverage: 0 }, kitsFor(t)[0]));
    setSubmitted(false);
  }, []);

  const setKit = useCallback((kitId: string) => {
    const k = KITS.find((x) => x.id === kitId);
    if (!k) return;
    setInp((s) => applyKit(s, k));
    setSubmitted(false);
  }, []);

  const setPanel = useCallback((panelId: string) => {
    setInp((s) => {
      const k = KITS.find((x) => x.id === s.kitId);
      return k ? applyKit(s, k, panelId) : s;
    });
    setSubmitted(false);
  }, []);

  const num = (v: string) => (v === "" ? 0 : parseFloat(v));
  const setN = (k: keyof EstInput, v: string) => {
    setInp((s) => ({ ...s, [k]: num(v) }));
    setSubmitted(false);
  };

  const toggleInstrument = (id: string) => {
    setInp((s) => ({
      ...s,
      instrumentIds: s.instrumentIds.includes(id)
        ? s.instrumentIds.filter((x) => x !== id)
        : [...s.instrumentIds, id],
    }));
    setSubmitted(false);
  };

  const shareUrl = () => {
    const url = `${window.location.origin}/seq-calculator${encodeEst(inp)}`;
    navigator.clipboard.writeText(url);
    window.history.replaceState(null, "", encodeEst(inp));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadCsv = () => {
    const q = (s: string | number | null) => `"${String(s ?? "").replaceAll('"', '""')}"`;
    const L: string[] = [];
    L.push("PBG Sequencing Coverage Estimator — results");
    L.push(`Generated,${new Date().toISOString()}`);
    L.push("");
    L.push(`Application type,${TYPE_BUTTONS.find((t) => t.id === inp.type)?.label}`);
    L.push(`Product,${rk.label}`);
    if (visible.has("coverage")) L.push(`Coverage (x),${inp.coverage || ""}`);
    if (visible.has("minClustersM")) L.push(`Recommended clusters (M),${inp.minClustersM || ""}`);
    L.push(`Duplicates (%),${inp.duplicatesPct}`);
    if (visible.has("regionMb")) L.push(`Genome / region size (Mb),${inp.regionMb || ""}`);
    L.push(`Total read length (cycles),${inp.readCycles || ""}`);
    if (visible.has("onTargetPct")) L.push(`On target (%),${inp.onTargetPct}`);
    if (res.totalOutputRequiredGb != null)
      L.push(`Total output required per sample,${fmtGb(res.totalOutputRequiredGb)}`);
    if (res.requiredClustersM != null && rk.method !== "coverage")
      L.push(`Required clusters per sample (M),${res.requiredClustersM.toFixed(2)}`);
    L.push("");
    L.push("Instrument,Run type,Unit,Output per unit (Gb),Units per sample,Samples per unit,Notes");
    for (const r of res.rows)
      L.push([
        q(r.instrument.name), q(r.run.label), q(r.run.unit),
        r.outputPerUnitGb == null ? "" : r.outputPerUnitGb.toFixed(1),
        r.unitsPerSample == null ? "" : r.unitsPerSample.toFixed(3),
        r.samplesPerUnit ?? "",
        q(r.note ?? ""),
      ].join(","));
    const blob = new Blob([L.join("\n")], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "pbg-coverage-estimate.csv";
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const rfqHref = () => {
    const p = new URLSearchParams();
    const spec =
      rk.method === "coverage"
        ? `${rk.label} — ${inp.coverage}x on ${fmt(inp.regionMb)} Mb region, ${inp.readCycles} cycles, ${inp.onTargetPct}% on-target; ~${fmtGb(res.totalOutputRequiredGb)}/sample.`
        : rk.method === "minreads"
          ? `${rk.label} — ${inp.minClustersM}M recommended clusters/sample, ${rk.readCycles ?? inp.readCycles} cycles, ${inp.onTargetPct}% on-target.`
          : `${rk.label} — multiplexing plan per instrument table.`;
    const cat =
      inp.type === "rna" ? "RNA-Seq"
      : /exome/i.test(rk.label) ? "WES"
      : /panel|trusight|ampliseq|cardio|myeloid|cancer|enrichment|probe/i.test(rk.label) ? "Panels"
      : "WGS";
    p.set("cat", cat);
    p.set("title", `${rk.label} — sequencing run`);
    p.set("analysis", spec);
    return `/dashboard/rfqs/new?${p.toString()}`;
  };

  const groups = (["benchtop", "production", "longread"] as const).map((g) => ({
    g,
    items: INSTRUMENTS.filter((i) => i.group === g),
  }));

  return (
    <div className="mx-auto max-w-4xl">
      {/* step 1 — application type */}
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        {TYPE_BUTTONS.map((t) => (
          <button
            key={t.id}
            onClick={() => setType(t.id)}
            className={cn(
              "rounded-xl border px-4 py-3.5 text-[14px] font-semibold transition-colors",
              inp.type === t.id
                ? "border-navy bg-navy text-yellow"
                : "border-line bg-surface text-body hover:border-navy-3 hover:text-ink"
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* steps 2–4 */}
      <div className="card mt-6 overflow-hidden">
        {/* step 2 — product */}
        <div className="border-b border-line px-6 py-5">
          <label className="mb-1.5 block text-[12.5px] font-semibold text-ink">
            Application or product
          </label>
          <select value={inp.kitId} onChange={(e) => setKit(e.target.value)} className={fieldCls}>
            {kits.map((k) => <option key={k.id} value={k.id}>{k.label}</option>)}
          </select>
          {kit.panels && (
            <>
              <label className="mb-1.5 mt-4 block text-[12.5px] font-semibold text-ink">
                Enrichment panel
              </label>
              <select value={inp.panelId ?? kit.panels[0].id} onChange={(e) => setPanel(e.target.value)} className={fieldCls}>
                {kit.panels.map((p) => <option key={p.id} value={p.id}>{p.label}</option>)}
              </select>
            </>
          )}
          {(rk.note ?? kit.note) && <p className="mt-1.5 text-[11.5px] leading-snug text-muted">{rk.note ?? kit.note}</p>}
        </div>

        {/* step 3 — parameters */}
        <table className="w-full text-left">
          <tbody>
            {visible.has("coverage") && (
              <ParamRow label="Coverage" unit="×" help="coverage-based estimation"
                locked={locks.has("coverage")} value={inp.coverage}
                onChange={(v) => setN("coverage", v)} />
            )}
            {visible.has("minClustersM") && (
              <ParamRow label="Minimum clusters / reads (on-target)" unit="million" help="cluster-based estimation"
                locked={locks.has("minClustersM")} value={inp.minClustersM}
                onChange={(v) => setN("minClustersM", v)} />
            )}
            <ParamRow label="Duplicates" unit="%" help=""
              locked={locks.has("duplicatesPct")} value={inp.duplicatesPct}
              onChange={(v) => setN("duplicatesPct", v)} />
            {visible.has("regionMb") && (
              <ParamRow label="Genome or region size" unit="Mb" help="in million bases"
                locked={locks.has("regionMb")} value={inp.regionMb}
                onChange={(v) => setN("regionMb", v)} />
            )}
            <ParamRow label="Total read length" unit="cycles" help="e.g. 300 for 2×150"
              locked={locks.has("readCycles")} value={inp.readCycles}
              onChange={(v) => setN("readCycles", v)} />
            {visible.has("onTargetPct") && (
              <ParamRow label="On target" unit="%" help=""
                locked={locks.has("onTargetPct")} value={inp.onTargetPct}
                onChange={(v) => setN("onTargetPct", v)} />
            )}
          </tbody>
        </table>

        {/* step 4 — instruments */}
        <div className="border-t border-line px-6 py-5">
          <p className="mb-3 text-[12.5px] font-semibold text-ink">
            Instruments <span className="font-normal text-muted">— select for the estimate</span>
          </p>
          <div className="grid gap-6 sm:grid-cols-2">
            {groups.map(({ g, items }) => (
              <div key={g} className={g === "longread" ? "sm:col-span-2" : ""}>
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">
                  {GROUP_LABELS[g]}
                </p>
                <div className={cn("space-y-1", g === "longread" && "sm:grid sm:grid-cols-3 sm:gap-1.5 sm:space-y-0")}>
                  {items.map((i) => (
                    <label
                      key={i.id}
                      className="flex cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-[13px] text-ink transition-colors hover:bg-paper-2"
                    >
                      <input
                        type="checkbox"
                        checked={inp.instrumentIds.includes(i.id)}
                        onChange={() => toggleInstrument(i.id)}
                        className="accent-navy"
                      />
                      {i.name}
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* submit */}
        <div className="border-t border-line bg-paper-2 px-6 py-4">
          <button
            onClick={() => setSubmitted(true)}
            className="btn-primary !px-6 !py-2.5 text-[13.5px]"
          >
            Submit
          </button>
        </div>
      </div>

      {/* step 5 — results */}
      {submitted && (
        <div className="mt-8">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-display text-[18px] font-semibold text-ink">Estimation results</h2>
              <p className="mt-0.5 text-[12.5px] text-muted">
                {rk.label}
                {res.totalOutputRequiredGb != null && (
                  <> — total output required per sample: <b className="text-ink">{fmtGb(res.totalOutputRequiredGb)}</b></>
                )}
                {rk.method !== "coverage" && res.requiredClustersM != null && (
                  <> — required clusters per sample: <b className="text-ink">{res.requiredClustersM.toFixed(2)}M</b></>
                )}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button onClick={shareUrl} className="btn-outline !px-3.5 !py-1.5 text-[12px]">
                {copied ? <CheckCircle2 className="size-3.5" /> : <Share2 className="size-3.5" />} {copied ? "Copied" : "Share"}
              </button>
              <button onClick={downloadCsv} className="btn-outline !px-3.5 !py-1.5 text-[12px]">
                <Download className="size-3.5" /> Download CSV
              </button>
              <button onClick={() => window.print()} className="btn-outline !px-3.5 !py-1.5 text-[12px]">
                <Printer className="size-3.5" /> Print / PDF
              </button>
            </div>
          </div>

          <div className="card overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-[13px]">
              <thead>
                <tr className="border-b border-line bg-paper-2 text-[11px] uppercase tracking-wide text-muted">
                  <th className="px-5 py-3 font-medium">Instrument</th>
                  <th className="px-3 py-3 font-medium">Run type</th>
                  <th className="px-3 py-3 font-medium">Output per unit</th>
                  <th className="px-3 py-3 font-medium">Units needed per sample</th>
                  <th className="px-3 py-3 font-medium">Samples per unit</th>
                </tr>
              </thead>
              <tbody>
                {res.rows.map((r) => {
                  const noResult = r.unitsPerSample == null && r.samplesPerUnit == null;
                  return (
                    <tr key={`${r.instrument.id}-${r.run.kitCode}`} className={cn("border-b border-line/60 last:border-0", noResult && "text-muted")}>
                      <td className="px-5 py-3 font-medium text-ink">{r.instrument.name}</td>
                      <td className="px-3 py-3 text-body">
                        {r.run.label}
                        <span className="block text-[10.5px] text-muted">{r.run.unit}</span>
                      </td>
                      <td className="px-3 py-3 text-body">
                        {r.outputPerUnitGb != null ? fmtGb(r.outputPerUnitGb) : "—"}
                      </td>
                      <td className="px-3 py-3 font-medium text-ink">
                        {r.unitsPerSample != null ? fmt(r.unitsPerSample, r.unitsPerSample < 1 ? 2 : 1) : "—"}
                      </td>
                      <td className="px-3 py-3 font-medium text-ink">
                        {r.samplesPerUnit != null ? r.samplesPerUnit : "—"}
                        {r.note && <span className="block text-[10.5px] font-normal text-muted">{r.note}</span>}
                      </td>
                    </tr>
                  );
                })}
                {res.rows.length === 0 && (
                  <tr><td colSpan={5} className="px-5 py-8 text-center text-muted">Select at least one instrument above.</td></tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            {cta !== "none" && (
              <Link href={rfqHref()} className="btn-primary !px-5 !py-2.5 text-[13px]">
                Get quotes for this spec <ArrowRight className="size-4" />
              </Link>
            )}
            <p className="flex items-center gap-1.5 text-[11.5px] text-muted">
              <FileText className="size-3.5" /> {cta === "none" ? "Use these estimates when scoping incoming RFQs." : "Pre-fills an RFQ — verified labs quote against these exact numbers."}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

function ParamRow({
  label, unit, help, locked, value, onChange,
}: {
  label: string; unit: string; help: string;
  locked: boolean; value: number; onChange: (v: string) => void;
}) {
  return (
    <tr className="border-b border-line/70 last:border-0">
      <td className="w-[44%] px-6 py-3.5">
        <span className="text-[13.5px] font-medium text-ink">{label}</span>
        {help && <span className="block text-[11px] text-muted">{help}</span>}
      </td>
      <td className="px-3 py-3.5">
        <div className="relative max-w-[180px]">
          <input
            type="number" min={0} step="any"
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            disabled={locked}
            className={locked ? lockedCls : fieldCls}
          />
          {locked && <Lock className="absolute right-3 top-1/2 size-3.5 -translate-y-1/2 text-muted" />}
        </div>
      </td>
      <td className="px-6 py-3.5 text-[12.5px] text-muted">{unit}</td>
    </tr>
  );
}
