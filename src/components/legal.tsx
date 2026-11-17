import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";

export const POLICIES = [
  { label: "Terms of Service", href: "/legal" },
  { label: "Privacy Policy", href: "/legal/privacy" },
  { label: "Data & Research Ethics", href: "/legal/data" },
  { label: "Compliance & Standards", href: "/legal/compliance" },
];

export function Section({ n, title, children }: { n: string; title: string; children: React.ReactNode }) {
  return (
    <section className="mt-10">
      <h2 className="font-display text-[19px] font-medium text-ink">
        {n}. {title}
      </h2>
      <div className="mt-3 space-y-3 text-[14px] leading-relaxed text-body">{children}</div>
    </section>
  );
}

export function Sub({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-[14.5px] font-semibold text-ink">{title}</h3>
      <div className="mt-1.5 space-y-2.5">{children}</div>
    </div>
  );
}

export function LegalShell({
  eyebrow,
  title,
  lead,
  updated,
  children,
}: {
  eyebrow: string;
  title: string;
  lead: string;
  updated: string;
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen bg-paper">
      <Navbar />
      <div className="mx-auto max-w-3xl px-6 pb-20 pt-32">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-yellow">{eyebrow}</p>
        <h1 className="h-display mt-3 text-[2.4rem]">{title}</h1>
        <p className="mt-3 text-[13px] text-muted">{updated}</p>
        <p className="mt-4 text-[15px] leading-relaxed text-body">{lead}</p>

        <nav className="mt-8 flex flex-wrap gap-2 border-y border-line py-4">
          {POLICIES.map((p) => (
            <Link
              key={p.href}
              href={p.href}
              className="rounded-full border border-line bg-surface px-4 py-2 text-[12.5px] font-medium text-ink transition-colors hover:border-navy-3 hover:bg-paper-2"
            >
              {p.label}
            </Link>
          ))}
        </nav>

        {children}
      </div>
      <Footer />
    </main>
  );
}
