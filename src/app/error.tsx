"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("[app error]", error);
  }, [error]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-paper px-6 text-center">
      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-yellow">Something went wrong</p>
      <h1 className="mt-3 font-display text-[2rem] font-medium text-ink">We hit an unexpected error</h1>
      <p className="mt-3 max-w-md text-[14px] text-body">
        The team has been notified. You can retry, or head back to safety.
      </p>
      <div className="mt-8 flex gap-3">
        <button onClick={reset} className="btn-primary !py-2.5 text-[13px]">Try again</button>
        <Link href="/" className="btn-secondary !py-2.5 text-[13px]">Go home</Link>
      </div>
    </main>
  );
}
