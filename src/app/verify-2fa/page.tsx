"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShieldCheck, Loader2 } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";

export default function Verify2FAPage() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [useBackup, setUseBackup] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      if (useBackup) {
        await authClient.twoFactor.verifyBackupCode({ code });
      } else {
        await authClient.twoFactor.verifyTotp({ code });
      }
      const { data } = await authClient.getSession();
      const role = (data?.user as { role?: string })?.role ?? "CUSTOMER";
      router.push(role === "ADMIN" ? "/admin" : role === "PROVIDER" ? "/lab" : role === "SUPPLIER" ? "/supplier" : "/dashboard");
      router.refresh();
    } catch {
      toast.error("Invalid code — try again.");
      setLoading(false);
    }
  }

  return (
    <main className="grid min-h-screen place-items-center bg-navy px-6">
      <div className="card w-full max-w-sm p-8">
        <span className="grid size-12 place-items-center rounded-full bg-navy text-yellow"><ShieldCheck className="size-6" /></span>
        <h1 className="mt-4 font-display text-[22px] font-medium tracking-tight text-ink">Two-factor verification</h1>
        <p className="mt-1.5 text-[13px] text-body">Enter the 6-digit code from your authenticator app.</p>
        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <input
            value={code} onChange={(e) => setCode(e.target.value.trim())}
            inputMode="numeric" autoComplete="one-time-code" required
            placeholder={useBackup ? "Backup code" : "123456"}
            className="w-full rounded-lg border border-line px-4 py-3 text-center font-mono text-[18px] tracking-[0.3em] outline-none focus:border-navy-3"
          />
          <button type="submit" disabled={loading} className="btn-secondary w-full justify-center !py-3">
            {loading ? <Loader2 className="size-4 animate-spin" /> : "Verify"}
          </button>
        </form>
        <button onClick={() => { setUseBackup(!useBackup); setCode(""); }} className="mt-4 text-[12.5px] text-blue hover:underline">
          {useBackup ? "Use authenticator code instead" : "Lost your device? Use a backup code"}
        </button>
        <p className="mt-5 text-center text-[12px] text-muted"><Link href="/login" className="hover:text-ink">← Back to sign in</Link></p>
      </div>
    </main>
  );
}
