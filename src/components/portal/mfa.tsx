"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, KeyRound, ShieldOff } from "lucide-react";
import QRCode from "qrcode";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";

const input = "w-full rounded-lg border border-line px-3.5 py-2.5 text-[14px] outline-none focus:border-navy-3";

export function MfaSetup({ returnTo = "/" }: { returnTo?: string }) {
  const router = useRouter();
  const [step, setStep] = useState<"start" | "scan" | "backup">("start");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [qr, setQr] = useState("");
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  async function enable(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { data, error } = await authClient.twoFactor.enable({ password });
    setLoading(false);
    if (error) { toast.error(error.message ?? "Wrong password"); return; }
    if (!data || !("totpURI" in data)) { toast.error("Could not start TOTP setup"); return; }
    setBackupCodes(data.backupCodes ?? []);
    setQr(await QRCode.toDataURL(data.totpURI, { margin: 1, width: 200 }));
    setStep("scan");
  }

  async function verify(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { error } = await authClient.twoFactor.verifyTotp({ code });
    setLoading(false);
    if (error) { toast.error(error.message ?? "Invalid code"); return; }
    toast.success("MFA enabled.");
    setStep("backup");
    router.refresh();
  }

  if (step === "start") {
    return (
      <form onSubmit={enable} className="mt-6 border-t border-line pt-5">
        <label className="mb-1.5 block text-[12.5px] font-medium text-ink">Confirm your password to begin</label>
        <div className="flex gap-3">
          <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className={input} placeholder="••••••••" />
          <button type="submit" disabled={loading} className="btn-secondary shrink-0 !py-2.5">
            {loading ? <Loader2 className="size-4 animate-spin" /> : "Set up MFA"}
          </button>
        </div>
      </form>
    );
  }
  if (step === "scan") {
    return (
      <div className="mt-6 border-t border-line pt-5">
        <ol className="space-y-2 text-[13px] text-body">
          <li><strong>1.</strong> Scan this QR with an authenticator app (Google Authenticator, Aegis, 1Password…)</li>
          <li><strong>2.</strong> Enter the 6-digit code it shows:</li>
        </ol>
        {qr && <img src={qr} alt="TOTP QR" className="mt-4 rounded-lg border border-line" />}
        <form onSubmit={verify} className="mt-4 flex gap-3">
          <input required inputMode="numeric" value={code} onChange={(e) => setCode(e.target.value.trim())} placeholder="123456" className={input} />
          <button type="submit" disabled={loading} className="btn-secondary shrink-0 !py-2.5">
            {loading ? <Loader2 className="size-4 animate-spin" /> : "Verify & enable"}
          </button>
        </form>
      </div>
    );
  }
  return (
    <div className="mt-6 border-t border-line pt-5">
      <h3 className="text-[14px] font-semibold text-ink">Save your backup codes</h3>
      <p className="mt-1 text-[12.5px] text-body">Each works once if you lose your device. Store them somewhere safe, they won&apos;t be shown again.</p>
      <div className="mt-3 grid grid-cols-2 gap-2 rounded-lg bg-paper-2 p-4 font-mono text-[12.5px]">
        {backupCodes.map((c) => <code key={c}>{c}</code>)}
      </div>
      <button onClick={() => router.push(returnTo)} className="btn-primary mt-4 !py-2.5">Done, back to portal</button>
    </div>
  );
}

export function MfaManage() {
  const router = useRouter();
  const [action, setAction] = useState<"none" | "codes" | "disable">("none");
  const [password, setPassword] = useState("");
  const [codes, setCodes] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    if (action === "codes") {
      const { data, error } = await authClient.twoFactor.generateBackupCodes({ password });
      setLoading(false);
      if (error) { toast.error(error.message ?? "Wrong password"); return; }
      setCodes(data?.backupCodes ?? []);
      setPassword("");
      toast.success("New backup codes generated, old ones are invalid now.");
    } else {
      const { error } = await authClient.twoFactor.disable({ password });
      setLoading(false);
      if (error) { toast.error(error.message ?? "Wrong password"); return; }
      toast.success("MFA disabled.");
      setAction("none");
      router.refresh();
    }
  }

  if (action === "none") {
    return (
      <div className="mt-6 flex flex-wrap gap-3 border-t border-line pt-5">
        <button onClick={() => setAction("codes")} className="btn-secondary inline-flex items-center gap-2 !py-2.5">
          <KeyRound className="size-4" /> Regenerate backup codes
        </button>
        <button onClick={() => setAction("disable")} className="inline-flex items-center gap-2 rounded-full border border-(--st-red-bd) px-5 py-2.5 text-[13px] font-semibold text-(--st-red-fg) hover:bg-(--st-red-bg)">
          <ShieldOff className="size-4" /> Disable MFA
        </button>
      </div>
    );
  }
  return (
    <div className="mt-6 border-t border-line pt-5">
      <form onSubmit={submit} className="flex gap-3">
        <input type="password" required autoFocus value={password} onChange={(e) => setPassword(e.target.value)} className={input} placeholder="Confirm your password" />
        <button type="submit" disabled={loading} className="btn-secondary shrink-0 !py-2.5">
          {loading ? <Loader2 className="size-4 animate-spin" /> : action === "codes" ? "Generate" : "Disable"}
        </button>
        <button type="button" onClick={() => { setAction("none"); setCodes([]); }} className="text-[13px] text-muted hover:text-ink">Cancel</button>
      </form>
      {codes.length > 0 && (
        <div className="mt-4">
          <p className="text-[12.5px] text-body">New backup codes, each works once. Store them safely:</p>
          <div className="mt-3 grid grid-cols-2 gap-2 rounded-lg bg-paper-2 p-4 font-mono text-[12.5px]">
            {codes.map((c) => <code key={c}>{c}</code>)}
          </div>
        </div>
      )}
    </div>
  );
}
