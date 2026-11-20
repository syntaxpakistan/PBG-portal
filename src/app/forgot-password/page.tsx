export const instant = false

import Link from "next/link";
import Image from "next/image";
import { forgotAction } from "@/lib/actions/auth-forms";

export default async function ForgotPasswordPage({ searchParams }: { searchParams: Promise<{ sent?: string }> }) {
  const { sent } = await searchParams;

  return (
    <main className="flex min-h-screen items-center justify-center bg-paper px-6 py-16">
      <div className="w-full max-w-sm">
        <Link href="/" className="mb-8 inline-block">
          <Image src="/brand/pbg-logo.webp" alt="Pakistan Biotechnology Gateway" width={1024} height={334} className="h-16 w-auto" />
        </Link>
        {sent ? (
          <>
            <h2 className="font-display text-[24px] font-medium tracking-tight text-ink">Check your email</h2>
            <p className="mt-3 text-[13.5px] leading-relaxed text-body">
              If an account exists for that email, we&apos;ve sent a password reset link.
              It expires shortly, check your spam folder if it doesn&apos;t arrive.
            </p>
            <Link href="/login" className="mt-6 inline-block text-[13px] font-semibold text-blue hover:text-ink">Back to sign in</Link>
          </>
        ) : (
          <>
            <h2 className="font-display text-[24px] font-medium tracking-tight text-ink">Reset your password</h2>
            <p className="mt-2 text-[13.5px] text-body">Enter your account email and we&apos;ll send a reset link.</p>
            <form action={forgotAction} className="mt-8 space-y-4">
              <div>
                <label className="mb-1.5 block text-[12.5px] font-medium text-ink">Email</label>
                <input
                  name="email" type="email" required autoComplete="email"
                  className="w-full rounded-lg border border-line bg-surface px-3.5 py-2.5 text-[14px] text-ink outline-none transition-colors focus:border-navy-3"
                  placeholder="you@lab.edu.pk"
                />
              </div>
              <button type="submit" className="btn-secondary w-full justify-center !py-3">Send reset link</button>
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
