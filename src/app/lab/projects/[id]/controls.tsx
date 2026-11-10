"use client";

import { useState } from "react";
import { Loader2, Upload, Send } from "lucide-react";
import {
  advanceProjectStatus, addResultFile, acceptProject, declineProject,
  setWorkStage, addQcRecord, pauseProject, resumeProject, updateLabInternals, releaseResultFile,
} from "@/lib/actions/marketplace";
import { STAGE_LABELS, QC_STAGE_LABELS } from "@/lib/constants";
import { toast } from "sonner";
import type { ProjectStatus } from "@prisma/client";

export function StatusUpdateButtons({ projectId, nextStage }: { projectId: string; nextStage: ProjectStatus }) {
  const [loading, setLoading] = useState(false);
  const [note, setNote] = useState("");
  return (
    <div className="flex flex-wrap items-center gap-3">
      <input
        value={note} onChange={(e) => setNote(e.target.value)}
        placeholder="Note (optional)"
        className="w-56 rounded-lg border border-line px-3 py-2 text-[13px] outline-none focus:border-navy-3"
      />
      <button
        onClick={async () => {
          setLoading(true);
          try {
            await advanceProjectStatus(projectId, nextStage, note || undefined);
          } catch (e) {
            toast.error(e instanceof Error ? e.message : "Failed");
          }
          setLoading(false);
        }}
        disabled={loading}
        className="btn-primary !py-2.5"
      >
        {loading ? <Loader2 className="size-4 animate-spin" /> : `Mark "${STAGE_LABELS[nextStage]}"`}
      </button>
    </div>
  );
}

export function ResultUploadForm({ projectId }: { projectId: string }) {
  const [loading, setLoading] = useState(false);
  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
          await addResultFile(projectId, new FormData(e.currentTarget));
          (e.target as HTMLFormElement).reset();
          toast.success("Draft uploaded — release it when ready for the customer.");
        } catch (err) {
          toast.error(err instanceof Error ? err.message : "Upload failed");
        }
        setLoading(false);
      }}
      className="flex flex-wrap items-end gap-3"
    >
      <div>
        <label className="mb-1 block text-[11.5px] font-medium text-ink">Result document *</label>
        <input name="file" type="file" required accept=".pdf,.doc,.docx,.xls,.xlsx,.zip,.csv,.txt,.png,.jpg,.html" className="w-72 rounded-lg border border-line bg-surface px-3 py-1.5 text-[12.5px] file:mr-3 file:rounded-full file:border-0 file:bg-navy file:px-3 file:py-1 file:text-[11px] file:font-medium file:text-yellow" />
      </div>
      <div>
        <label className="mb-1 block text-[11.5px] font-medium text-ink">Note</label>
        <input name="note" placeholder="Final report" className="w-40 rounded-lg border border-line px-3 py-2 text-[13px] outline-none focus:border-navy-3" />
      </div>
      <button type="submit" disabled={loading} className="btn-secondary !py-2.5">
        {loading ? <Loader2 className="size-4 animate-spin" /> : <><Upload className="size-4" /> Register</>}
      </button>
    </form>
  );
}

// in-lab stage editor — start / complete / skip with operator + note
export function StageControls({ projectId, stageKey, status }: { projectId: string; stageKey: string; status: string }) {
  const [loading, setLoading] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [operator, setOperator] = useState("");
  if (status === "DONE" || status === "SKIPPED") return null;

  const run = async (st: string) => {
    setLoading(st);
    try {
      const fd = new FormData();
      fd.set("status", st);
      fd.set("note", note);
      fd.set("operator", operator);
      await setWorkStage(projectId, stageKey, fd);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    }
    setLoading(null);
  };

  return (
    <div className="mt-1.5 flex flex-wrap items-center gap-2">
      {status === "ACTIVE" && (
        <>
          <input value={operator} onChange={(e) => setOperator(e.target.value)} placeholder="Tech / instrument" className="w-32 rounded-lg border border-line bg-surface px-2.5 py-1.5 text-[11.5px] text-ink outline-none focus:border-navy-3" />
          <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Note" className="w-40 rounded-lg border border-line bg-surface px-2.5 py-1.5 text-[11.5px] text-ink outline-none focus:border-navy-3" />
        </>
      )}
      <button onClick={() => run(status === "PENDING" ? "ACTIVE" : "DONE")} disabled={loading !== null}
        className="btn-outline !px-3 !py-1.5 text-[11px]">
        {loading ? <Loader2 className="size-3 animate-spin" /> : status === "PENDING" ? "Start" : "Mark done"}
      </button>
      {status === "ACTIVE" && (
        <button onClick={() => run("SKIPPED")} disabled={loading !== null}
          className="rounded-lg px-2.5 py-1.5 text-[11px] font-medium text-muted hover:text-ink">Skip</button>
      )}
    </div>
  );
}

// structured QC capture — metrics + pass/fail gate
export function QcForm({ projectId, stages }: { projectId: string; stages: string[] }) {
  const [loading, setLoading] = useState(false);
  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
          await addQcRecord(projectId, new FormData(e.currentTarget));
          (e.target as HTMLFormElement).reset();
          toast.success("QC record logged.");
        } catch (err) {
          toast.error(err instanceof Error ? err.message : "Failed");
        }
        setLoading(false);
      }}
      className="mt-3 space-y-3"
    >
      <div className="flex flex-wrap gap-2">
        <select name="stage" required className="rounded-lg border border-line bg-surface px-3 py-2 text-[12.5px] text-ink outline-none focus:border-navy-3">
          {stages.map((s) => <option key={s} value={s}>{QC_STAGE_LABELS[s] ?? s}</option>)}
        </select>
        <select name="result" required className="rounded-lg border border-line bg-surface px-3 py-2 text-[12.5px] text-ink outline-none focus:border-navy-3">
          <option value="PASS">Pass</option>
          <option value="PARTIAL">Partial — customer decision</option>
          <option value="FAIL">Fail — customer decision</option>
        </select>
        <input name="instrument" placeholder="Qubit 4 / BioAnalyzer…" className="w-44 rounded-lg border border-line bg-surface px-3 py-2 text-[12.5px] text-ink outline-none focus:border-navy-3" />
      </div>
      <div className="flex flex-wrap gap-2">
        <input name="concentration" type="number" step="0.01" placeholder="Conc. ng/µL" className="w-32 rounded-lg border border-line bg-surface px-3 py-2 text-[12.5px] text-ink outline-none focus:border-navy-3" />
        <input name="rin" type="number" step="0.1" min={0} max={10} placeholder="RIN / DV200" className="w-32 rounded-lg border border-line bg-surface px-3 py-2 text-[12.5px] text-ink outline-none focus:border-navy-3" />
        <input name="ratio" type="number" step="0.01" placeholder="260/280" className="w-28 rounded-lg border border-line bg-surface px-3 py-2 text-[12.5px] text-ink outline-none focus:border-navy-3" />
        <input name="note" placeholder="QC note" className="w-48 rounded-lg border border-line bg-surface px-3 py-2 text-[12.5px] text-ink outline-none focus:border-navy-3" />
      </div>
      <button type="submit" disabled={loading} className="btn-secondary !py-2 text-[12px]">
        {loading ? <Loader2 className="size-3.5 animate-spin" /> : "Log QC record"}
      </button>
    </form>
  );
}

// SLA pause clock — lab pauses, names whose time it is
export function PauseControls({ projectId, paused }: { projectId: string; paused: boolean }) {
  const [loading, setLoading] = useState(false);
  const [reason, setReason] = useState("");
  const [waitingOn, setWaitingOn] = useState("CUSTOMER");
  if (paused) {
    return (
      <button
        onClick={async () => { setLoading(true); try { await resumeProject(projectId); } catch (e) { toast.error(e instanceof Error ? e.message : "Failed"); } setLoading(false); }}
        disabled={loading} className="btn-primary !py-2 text-[12px]"
      >
        {loading ? <Loader2 className="size-3.5 animate-spin" /> : "Resume work — restart clock"}
      </button>
    );
  }
  return (
    <div className="flex flex-wrap items-center gap-2">
      <select value={waitingOn} onChange={(e) => setWaitingOn(e.target.value)} className="rounded-lg border border-line bg-surface px-3 py-2 text-[12.5px] text-ink outline-none focus:border-navy-3">
        <option value="CUSTOMER">Waiting on customer</option>
        <option value="LAB">Internal hold</option>
      </select>
      <input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Reason (e.g. more material needed)" className="w-56 rounded-lg border border-line bg-surface px-3 py-2 text-[12.5px] text-ink outline-none focus:border-navy-3" />
      <button
        onClick={async () => {
          setLoading(true);
          try {
            const fd = new FormData();
            fd.set("pausedFor", waitingOn);
            fd.set("reason", reason);
            await pauseProject(projectId, fd);
          } catch (e) { toast.error(e instanceof Error ? e.message : "Failed"); }
          setLoading(false);
        }}
        disabled={loading} className="btn-outline !py-2 text-[12px]"
      >
        {loading ? <Loader2 className="size-3.5 animate-spin" /> : "Pause clock"}
      </button>
    </div>
  );
}

// staged result release — lab publishes a draft deliverable to the customer
export function ReleaseButton({ fileId }: { fileId: string }) {
  const [loading, setLoading] = useState(false);
  return (
    <button
      onClick={async () => {
        setLoading(true);
        try { await releaseResultFile(fileId); toast.success("Released to customer."); }
        catch (e) { toast.error(e instanceof Error ? e.message : "Failed"); }
        setLoading(false);
      }}
      disabled={loading} className="btn-primary !px-3 !py-1.5 text-[11px]"
    >
      {loading ? <Loader2 className="size-3 animate-spin" /> : <><Send className="size-3" /> Release</>}
    </button>
  );
}

// lab-only fields — internal accession ref, storage, disposal
export function InternalsForm({ projectId, defaults }: { projectId: string; defaults: { internalId: string | null; storageLoc: string | null; disposalAt: Date | null } }) {
  const [loading, setLoading] = useState(false);
  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        setLoading(true);
        try { await updateLabInternals(projectId, new FormData(e.currentTarget)); toast.success("Saved."); }
        catch (err) { toast.error(err instanceof Error ? err.message : "Failed"); }
        setLoading(false);
      }}
      className="mt-3 flex flex-wrap items-end gap-2"
    >
      <input name="internalId" defaultValue={defaults.internalId ?? ""} placeholder="Internal / LIMS ref" className="w-36 rounded-lg border border-line bg-surface px-3 py-2 text-[12.5px] text-ink outline-none focus:border-navy-3" />
      <input name="storageLoc" defaultValue={defaults.storageLoc ?? ""} placeholder="Storage (e.g. −80°C F2-B3)" className="w-44 rounded-lg border border-line bg-surface px-3 py-2 text-[12.5px] text-ink outline-none focus:border-navy-3" />
      <input name="disposalAt" type="date" defaultValue={defaults.disposalAt ? defaults.disposalAt.toISOString().slice(0, 10) : ""} className="rounded-lg border border-line bg-surface px-3 py-2 text-[12.5px] text-ink outline-none focus:border-navy-3" />
      <button type="submit" disabled={loading} className="btn-outline !py-2 text-[12px]">
        {loading ? <Loader2 className="size-3.5 animate-spin" /> : "Save"}
      </button>
    </form>
  );
}

export function AwardDecision({ projectId }: { projectId: string }) {
  const [loading, setLoading] = useState<"accept" | "decline" | null>(null);
  const [reason, setReason] = useState("");
  return (
    <div className="card border-(--st-blue-bd) bg-(--st-blue-bg)/60 p-5">
      <h3 className="text-[14px] font-semibold text-ink">You were selected for this project</h3>
      <p className="mb-4 mt-1 text-[12px] text-body">
        Accept to confirm you can take it on — the work stages unlock. Decline if you can&apos;t; the RFQ reopens and the customer picks another offer (your name stays private until award).
      </p>
      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={async () => {
            setLoading("accept");
            try { await acceptProject(projectId); toast.success("Award accepted — project is live."); }
            catch (e) { toast.error(e instanceof Error ? e.message : "Failed"); }
            setLoading(null);
          }}
          disabled={loading !== null}
          className="btn-primary !py-2.5"
        >
          {loading === "accept" ? <Loader2 className="size-4 animate-spin" /> : "Accept project"}
        </button>
        <input
          value={reason} onChange={(e) => setReason(e.target.value)}
          placeholder="Decline reason (optional)"
          className="w-56 rounded-lg border border-line bg-surface px-3 py-2 text-[13px] text-ink outline-none focus:border-navy-3"
        />
        <button
          onClick={async () => {
            if (!confirm("Decline this award? The customer will be asked to select another offer.")) return;
            setLoading("decline");
            try { await declineProject(projectId, reason || undefined); }
            catch (e) { toast.error(e instanceof Error ? e.message : "Failed"); setLoading(null); }
          }}
          disabled={loading !== null}
          className="rounded-lg border border-(--st-red-bd) px-4 py-2.5 text-[13px] font-medium text-(--st-red-fg) hover:bg-(--st-red-bg)"
        >
          {loading === "decline" ? <Loader2 className="size-4 animate-spin" /> : "Decline award"}
        </button>
      </div>
    </div>
  );
}
