"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";

function ResetForm() {
  const params = useSearchParams();
  const token = params.get("token") ?? "";
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirm) {
      toast.error("Passwords do not match");
      return;
    }
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    setLoading(true);
    const { error } = await authClient.resetPassword({ newPassword: password, token });
    setLoading(false);
    if (error) {
      toast.error(error.message ?? "Reset failed — the link may have expired");
      return;
    }
    setDone(true);
  }

  if (!token) {
    return (
      <div className="text-center">
        <h2 className="font-display text-[24px] font-medium tracking-tight text-ink">Invalid reset link</h2>
        <p className="mt-3 text-[13.5px] text-body">This link is missing its token. Request a new one.</p>
        <Link href="/forgot-password" className="btn-secondary mt-6 inline-flex !py-2.5 text-[13px]">Request reset link</Link>
      </div>
    );
  }

  if (done) {
    return (
      <div className="text-center">
        <h2 className="font-display text-[24px] font-medium tracking-tight text-ink">Password updated</h2>
        <p className="mt-3 text-[13.5px] text-body">You can now sign in with your new password.</p>
        <Link href="/login" className="btn-primary mt-6 inline-flex !py-2.5 text-[13px]">Sign in</Link>
      </div>
    );
  }

  return (
    <>
      <h2 className="font-display text-[24px] font-medium tracking-tight text-ink">Choose a new password</h2>
      <form onSubmit={onSubmit} className="mt-8 space-y-4">
        <div>
          <label className="mb-1.5 block text-[12.5px] font-medium text-ink">New password</label>
          <input
            type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg border border-line bg-surface px-3.5 py-2.5 text-[14px] text-ink outline-none transition-colors focus:border-navy-3"
            placeholder="At least 8 characters"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-[12.5px] font-medium text-ink">Confirm password</label>
          <input
            type="password" required minLength={8} value={confirm} onChange={(e) => setConfirm(e.target.value)}
            className="w-full rounded-lg border border-line bg-surface px-3.5 py-2.5 text-[14px] text-ink outline-none transition-colors focus:border-navy-3"
            placeholder="Repeat password"
          />
        </div>
        <button type="submit" disabled={loading} className="btn-secondary w-full justify-center !py-3">
          {loading ? <Loader2 className="size-4 animate-spin" /> : "Update password"}
        </button>
      </form>
    </>
  );
}

export default function ResetPasswordPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-paper px-6 py-16">
      <div className="w-full max-w-sm">
        <Link href="/" className="mb-8 inline-block">
          <img src="/brand/logo-light.png" alt="Syntax of Life" className="h-14 w-auto" />
        </Link>
        <Suspense fallback={<div className="text-center text-[13px] text-muted">Loading…</div>}>
          <ResetForm />
        </Suspense>
      </div>
    </main>
  );
}
