"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { GoogleButton } from "@/components/google-button";
import { toast } from "sonner";

const ROLE_DEST: Record<string, string> = {
  ADMIN: "/admin",
  PROVIDER: "/lab",
  SUPPLIER: "/supplier",
  CUSTOMER: "/dashboard",
};

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { data, error } = await authClient.signIn.email({ email, password });
    if (error) {
      setLoading(false);
      toast.error(error.message ?? "Invalid credentials");
      return;
    }
    // admins with MFA enrolled get a 2FA redirect before a session exists
    if ((data as { twoFactorRedirect?: boolean })?.twoFactorRedirect) {
      router.push("/verify-2fa");
      return;
    }
    setLoading(false);
    const role = (data?.user as { role?: string })?.role ?? "CUSTOMER";
    router.push(ROLE_DEST[role] ?? "/dashboard");
    router.refresh();
  }

  return (
    <main className="relative grid min-h-screen lg:grid-cols-2">
      {/* left brand panel */}
      <div className="relative hidden overflow-hidden bg-navy lg:block">
        <div className="grid-lines on-dark absolute inset-0" />
        <div className="glow-orb left-1/3 top-1/3 size-[400px] -translate-x-1/2 bg-blue-bright/20" />
        <div className="relative flex h-full flex-col justify-between p-12">
          <Link href="/" className="inline-block">
            <Image src="/brand/pbg-logo-dark.webp" alt="Pakistan Biotechnology Gateway" width={1024} height={334} className="h-20 w-auto" />
          </Link>
          <div>
            <h1 className="h-display on-dark !text-[2.6rem]">
              One gateway.<br /><em className="grad-text">Every role.</em>
            </h1>
            <p className="mt-5 max-w-sm text-[14.5px] leading-relaxed text-[#c5d2e1]">
              Customers submit RFQs. Verified labs quote blind and deliver results.
              Suppliers list products. Syntax governs it all.
            </p>
          </div>
          <p className="text-[12px] text-[#7a97b0]">© 2026 PBG | Pakistan Biotechnology Gateway. All rights reserved.</p>
        </div>
      </div>

      {/* right form */}
      <div className="flex items-center justify-center bg-paper px-6 py-16">
        <div className="w-full max-w-sm">
          <Link href="/" className="mb-8 inline-block lg:hidden">
            <Image src="/brand/pbg-logo.webp" alt="Pakistan Biotechnology Gateway" width={1024} height={334} className="h-16 w-auto" />
          </Link>
          <h2 className="font-display text-[26px] font-medium tracking-tight text-ink">Sign in to your portal</h2>
          <p className="mt-2 text-[13.5px] text-body">Customer, lab, supplier or admin — one account.</p>

          <form onSubmit={onSubmit} className="mt-8 space-y-4">
            <div>
              <label className="mb-1.5 block text-[12.5px] font-medium text-ink">Email</label>
              <input
                type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-line bg-surface px-3.5 py-2.5 text-[14px] text-ink outline-none transition-colors focus:border-navy-3"
                placeholder="you@lab.edu.pk"
              />
            </div>
            <div>
              <div className="flex items-center justify-between">
                <label className="mb-1.5 block text-[12.5px] font-medium text-ink">Password</label>
                <Link href="/forgot-password" className="mb-1.5 text-[12px] font-medium text-blue hover:text-ink">Forgot?</Link>
              </div>
              <input
                type="password" required autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-line bg-surface px-3.5 py-2.5 text-[14px] text-ink outline-none transition-colors focus:border-navy-3"
                placeholder="••••••••"
              />
            </div>
            <button type="submit" disabled={loading} className="btn-secondary w-full justify-center !py-3">
              {loading ? <Loader2 className="size-4 animate-spin" /> : "Sign in"}
            </button>
          </form>

          <GoogleButton />

          <p className="mt-6 text-center text-[13px] text-muted">
            New to the Gateway?{" "}
            <Link href="/biogateway" className="font-semibold text-blue hover:text-ink">Create an account</Link>
          </p>
        </div>
      </div>
    </main>
  );
}
