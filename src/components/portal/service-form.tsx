"use client";

import { useMemo, useState } from "react";
import {
  SERVICE_CATALOG, CONSULT_TOPICS, PRICE_UNITS,
  findCategory, findService, visibleFields, buildListingName,
} from "@/lib/service-catalog";
import { SubmitButton } from "@/components/portal/submit-button";

const KNOWN_PLATFORMS = [
  "Illumina NovaSeq X", "Illumina NextSeq", "Illumina MiSeq", "Illumina iSeq",
  "PacBio Revio", "PacBio Sequel IIe",
  "Oxford Nanopore PromethION", "Oxford Nanopore GridION", "Oxford Nanopore MinION",
  "MGI DNBSEQ",
  "Applied Biosystems 3500/3730 (Sanger)",
  "QuantStudio 5 / 7 Pro (qPCR)", "Bio-Rad CFX96 (qPCR)", "StepOnePlus (qPCR)",
  "Agilent Bioanalyzer", "Qubit", "Other",
];

export function ServiceForm({
  action,
  input,
  label,
  platforms = [],
}: {
  action: (formData: FormData) => void | Promise<void>;
  input: string;
  label: string;
  /** platforms the lab declared at onboarding — suggested in the instrument field */
  platforms?: string[];
}) {
  const [category, setCategory] = useState("");
  const [service, setService] = useState("");
  const [values, setValues] = useState<Record<string, string>>({});
  const [consultTopic, setConsultTopic] = useState("");
  const [pricingMode, setPricingMode] = useState<"FIXED" | "QUOTE">("FIXED");

  const cat = findCategory(category);
  const svc = cat && service ? findService(category, service) : undefined;

  // consultation route — a sequencing offering can switch this listing into a
  // design consultation with the topic preselected (per catalogue spec §5)
  const consultRouted =
    svc?.consultRoute && values[svc.consultRoute.key] === svc.consultRoute.value
      ? svc.consultRoute.topic
      : null;

  const fields = useMemo(() => (svc ? visibleFields(svc, values) : []), [svc, values]);

  // platform/instrument is optional *where relevant* — sequencing runs and qPCR (spec §1)
  const showPlatform = !!svc && !consultRouted && (category === "Sequencing" || svc.name === "qPCR");
  const platformOptions = [...platforms, ...KNOWN_PLATFORMS.filter((p) => !platforms.includes(p))];

  const optionValues = fields
    .map((f) => values[f.key])
    .filter((v): v is string => Boolean(v) && v !== svc?.consultRoute?.value);
  const namePreview = svc
    ? consultRouted
      ? buildListingName("Experimental design consultation", [consultTopic || consultRouted])
      : buildListingName(svc.name, optionValues)
    : "";

  // group services for optgroup rendering (bioinformatics analysis groups)
  const groups = useMemo(() => {
    if (!cat) return [];
    const map = new Map<string, string[]>();
    for (const s of cat.services) {
      const g = s.group ?? "";
      if (!map.has(g)) map.set(g, []);
      map.get(g)!.push(s.name);
    }
    return [...map.entries()];
  }, [cat]);

  const onCategory = (v: string) => {
    setCategory(v);
    setService("");
    setValues({});
    setConsultTopic("");
  };
  const onService = (v: string) => {
    setService(v);
    setValues({});
    setConsultTopic("");
  };
  const onField = (key: string, v: string) => {
    setValues((prev) => {
      const next = { ...prev, [key]: v };
      // clear dependent selections whose showIf no longer holds
      for (const f of svc?.fields ?? []) {
        if (f.showIf && next[f.showIf.key] !== f.showIf.value) delete next[f.key];
      }
      return next;
    });
    if (svc?.consultRoute?.key === key && v === svc.consultRoute.value) {
      setConsultTopic(svc.consultRoute.topic);
    } else if (svc?.consultRoute?.key === key) {
      setConsultTopic("");
    }
  };

  const sel = { required: true, className: input };

  return (
    <form action={action} className="space-y-4">
      <div>
        <label className={label}>Category *</label>
        <select name="category" value={category} onChange={(e) => onCategory(e.target.value)} {...sel}>
          <option value="" disabled>Select a category…</option>
          {SERVICE_CATALOG.map((c) => <option key={c.name} value={c.name}>{c.name}</option>)}
        </select>
      </div>

      {cat && (
        <div>
          <label className={label}>Service *</label>
          <select name="service" value={service} onChange={(e) => onService(e.target.value)} {...sel}>
            <option value="" disabled>Select a service…</option>
            {groups.map(([g, names]) =>
              g ? (
                <optgroup key={g} label={g}>
                  {names.map((n) => <option key={n} value={n}>{n}</option>)}
                </optgroup>
              ) : (
                names.map((n) => <option key={n} value={n}>{n}</option>)
              )
            )}
          </select>
        </div>
      )}

      {svc && !consultRouted &&
        fields.map((f) => (
          <div key={f.key}>
            <label className={label}>{f.label}{f.type === "select" ? " *" : ""}</label>
            {f.type === "select" ? (
              <select name={`spec_${f.key}`} value={values[f.key] ?? ""} onChange={(e) => onField(f.key, e.target.value)} {...sel}>
                <option value="" disabled>Select…</option>
                {f.options!.map((o) => <option key={o} value={o}>{o}</option>)}
              </select>
            ) : (
              <input name={`spec_${f.key}`} value={values[f.key] ?? ""} onChange={(e) => onField(f.key, e.target.value)} className={input} placeholder={f.placeholder} maxLength={80} />
            )}
          </div>
        ))}

      {consultRouted && (
        <div className="rounded-lg border border-navy-3/25 bg-(--st-blue-bg) p-3.5">
          <p className="text-[12px] font-medium text-(--st-blue-fg)">This listing becomes an experimental design consultation.</p>
          <label className={`${label} mt-2.5`}>Consultation topic *</label>
          <select name="consultTopic" value={consultTopic} onChange={(e) => setConsultTopic(e.target.value)} {...sel}>
            <option value="" disabled>Select…</option>
            {CONSULT_TOPICS.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
      )}

      {namePreview && (
        <div>
          <label className={label}>Listing name</label>
          <p className="rounded-lg border border-dashed border-line bg-paper px-3.5 py-2.5 text-[13.5px] font-medium text-ink">{namePreview}</p>
        </div>
      )}

      {showPlatform && (
        <div>
          <label className={label}>Platform or instrument</label>
          <input name="platform" list="svc-platforms" className={input} placeholder="e.g. Illumina NovaSeq X, QuantStudio 5" maxLength={80} />
          <datalist id="svc-platforms">
            {platformOptions.map((p) => <option key={p} value={p} />)}
          </datalist>
        </div>
      )}
      <div>
        <label className={label}>Turnaround time (days)</label>
        <input name="turnaroundDays" type="number" min={1} className={input} placeholder="14" />
      </div>

      <div>
        <label className={label}>Pricing *</label>
        <div className="grid grid-cols-2 gap-2">
          {(["FIXED", "QUOTE"] as const).map((m) => (
            <label
              key={m}
              className={`flex cursor-pointer items-center justify-center gap-2 rounded-lg border px-3 py-2.5 text-[12.5px] font-medium transition-colors ${
                pricingMode === m ? "border-navy-3 bg-(--st-blue-bg) text-ink" : "border-line bg-surface text-body hover:border-navy-3/50"
              }`}
            >
              <input type="radio" name="pricingMode" value={m} checked={pricingMode === m} onChange={() => setPricingMode(m)} className="sr-only" />
              {m === "FIXED" ? "Enter price (PKR)" : "By quote"}
            </label>
          ))}
        </div>
        {pricingMode === "FIXED" ? (
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <div>
              <label className={label}>Price (PKR) *</label>
              <input name="priceFrom" type="number" min={1} required className={input} placeholder="25000" />
            </div>
            <div>
              <label className={label}>Unit *</label>
              <select name="unit" defaultValue="" {...sel}>
                <option value="" disabled>Select…</option>
                {PRICE_UNITS.map((u) => <option key={u} value={u}>{u}</option>)}
              </select>
            </div>
          </div>
        ) : (
          <p className="mt-2 text-[11.5px] text-muted">No fixed price — buyers see “By quote” and send a request through the RFQ workflow.</p>
        )}
      </div>

      <div>
        <label className={label}>Description</label>
        <textarea name="description" rows={2} className={input} placeholder="Sample requirements, QC, included work and deliverables…" maxLength={600} />
      </div>

      <SubmitButton className="btn-primary !py-2.5">List service</SubmitButton>
    </form>
  );
}
