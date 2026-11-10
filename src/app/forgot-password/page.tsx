"use client";

import { useState } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { error } = await authClient.requestPasswordReset({
      email,
      redirectTo: "/reset-password",
    });
    setLoading(false);
    if (error) {
      toast.error(error.message ?? "Could not send reset link");
      return;
    }
    setSent(true);
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-paper px-6 py-16">
      <div className="w-full max-w-sm">
        <Link href="/" className="mb-8 inline-block">
          <img src="/brand/logo-light.png" alt="Syntax of Life" className="h-14 w-auto" />
        </Link>
        {sent ? (
          <>
            <h2 className="font-display text-[24px] font-medium tracking-tight text-ink">Check your email</h2>
            <p className="mt-3 text-[13.5px] leading-relaxed text-body">
              If an account exists for <strong>{email}</strong>, we&apos;ve sent a password reset link.
              It expires shortly — check your spam folder if it doesn&apos;t arrive.
            </p>
            <Link href="/login" className="mt-6 inline-block text-[13px] font-semibold text-blue hover:text-ink">Back to sign in</Link>
          </>
        ) : (
          <>
            <h2 className="font-display text-[24px] font-medium tracking-tight text-ink">Reset your password</h2>
            <p className="mt-2 text-[13.5px] text-body">Enter your account email and we&apos;ll send a reset link.</p>
            <form onSubmit={onSubmit} className="mt-8 space-y-4">
              <div>
                <label className="mb-1.5 block text-[12.5px] font-medium text-ink">Email</label>
                <input
                  type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-lg border border-line bg-surface px-3.5 py-2.5 text-[14px] text-ink outline-none transition-colors focus:border-navy-3"
                  placeholder="you@lab.edu.pk"
                />
              </div>
              <button type="submit" disabled={loading} className="btn-secondary w-full justify-center !py-3">
                {loading ? <Loader2 className="size-4 animate-spin" /> : "Send reset link"}
              </button>
            </form>
            <p className="mt-6 text-center text-[13px] text-muted">
              Remembered it? <Link href="/login" className="font-semibold text-blue hover:text-ink">Sign in</Link>
            </p>
          </>
        )}
      </div>
    </main>
  );
}
