import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-paper px-6 text-center">
      <p className="font-display text-[5rem] font-medium leading-none text-navy">404</p>
      <h1 className="mt-3 font-display text-[1.4rem] font-medium text-ink">Page not found</h1>
      <p className="mt-3 max-w-sm text-[14px] text-body">
        The page you&apos;re looking for doesn&apos;t exist or may have moved.
      </p>
      <div className="mt-8 flex gap-3">
        <Link href="/" className="btn-primary !py-2.5 text-[13px]">Go home</Link>
        <Link href="/marketplace" className="btn-secondary !py-2.5 text-[13px]">Browse marketplace</Link>
      </div>
    </main>
  );
}
