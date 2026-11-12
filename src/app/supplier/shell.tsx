import Link from "next/link";
import Image from "next/image";
import { SignOutButton } from "@/components/portal/signout";
import { ThemeToggle } from "@/components/theme-toggle";

export function SupplierShell({ title, name, children }: { title: string; name?: string | null; children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-paper-2">
      <header className="sticky top-0 z-40 border-b border-line bg-navy">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
          <div className="flex min-w-0 items-center gap-3">
            <Link href="/" className="flex shrink-0 items-center" aria-label="Syntax of Life home">
              <Image src="/brand/pbg-logo-dark.webp" alt="Pakistan Biotechnology Gateway" width={1024} height={334} className="h-11 w-auto" />
            </Link>
            <span className="hidden h-6 w-px shrink-0 bg-white/15 sm:block" />
            <span className="hidden text-[11px] font-semibold uppercase tracking-[0.14em] text-[#a2c1d7] md:block">{title}</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/supplier/billing" className="hidden rounded-full border border-white/20 px-3 py-1.5 text-[12px] font-medium text-white/90 hover:bg-white/10 sm:block">Billing</Link>
            <ThemeToggle onDark />
            <span className="hidden max-w-28 truncate text-[12px] text-[#9fb9cd] sm:block">{name}</span>
            <SignOutButton />
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-8">{children}</main>
    </div>
  );
}
