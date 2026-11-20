export const instant = false

import Link from "next/link";
import Image from "next/image";
import { TriangleAlert } from "lucide-react";
import { loginAction } from "@/lib/actions/auth-forms";
import { GoogleButton } from "@/components/google-button";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;

  return (
    <main className="relative grid min-h-screen lg:grid-cols-2">
      {/* left brand panel */}
      <div className="relative hidden overflow-hidden bg-navy lg:block">
        <Image
          src="/media/join-dna.webp"
          alt=""
          fill
          sizes="50vw"
          className="pointer-events-none absolute inset-0 object-cover opacity-30"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-navy/75 via-navy/50 to-navy/90" />
        <div className="grid-lines on-dark absolute inset-0" />
        <div className="glow-orb left-1/3 top-1/3 size-[400px] -translate-x-1/2 bg-blue-bright/20" />
        <div className="relative flex h-full flex-col justify-between p-12">
          <Link href="/" className="inline-block">
            <Image src="/brand/pbg-logo-dark.webp" alt="Pakistan Biotechnology Gateway" width={1024} height={334} priority className="h-20 w-auto" />
          </Link>
          <div>
            <h1 className="h-display on-dark !text-[2.6rem]">
              One gateway.<br /><em className="grad-text">Every role.</em>
            </h1>
            <p className="mt-5 max-w-sm text-[14.5px] leading-relaxed text-[#c5d2e1]">
              Customers submit RFQs. Verified labs quote blind and deliver results.
              Suppliers list products. the Gateway team governs it all.
            </p>
          </div>
          <p className="text-[12px] text-[#7a97b0]">© 2026 PBG | Pakistan Biotechnology Gateway. All rights reserved.</p>
        </div>
      </div>

      {/* right form — native POST to a server action, works without JS */}
      <div className="flex items-center justify-center bg-paper px-6 py-16">
        <div className="w-full max-w-sm">
          <Link href="/" className="mb-8 inline-block lg:hidden">
            <Image src="/brand/pbg-logo.webp" alt="Pakistan Biotechnology Gateway" width={1024} height={334} className="h-16 w-auto" />
          </Link>
          <h2 className="font-display text-[26px] font-medium tracking-tight text-ink">Sign in to your portal</h2>
          <p className="mt-2 text-[13.5px] text-body">Customer, lab or supplier, one account.</p>

          {error && (
            <p className="mt-4 flex items-start gap-2 rounded-lg border border-(--st-red-bd) bg-(--st-red-bg) px-3.5 py-2.5 text-[12.5px] text-(--st-red-fg)">
              <TriangleAlert className="mt-0.5 size-4 shrink-0" /> {error}
            </p>
          )}

          <form action={loginAction} className="mt-8 space-y-4">
            <div>
              <label className="mb-1.5 block text-[12.5px] font-medium text-ink">Email</label>
              <input
                name="email" type="email" required autoComplete="email"
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
                name="password" type="password" required autoComplete="current-password"
                className="w-full rounded-lg border border-line bg-surface px-3.5 py-2.5 text-[14px] text-ink outline-none transition-colors focus:border-navy-3"
                placeholder="••••••••"
              />
            </div>
            <button type="submit" className="btn-secondary w-full justify-center !py-3">Sign in</button>
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
