import Link from "next/link";
import Image from "next/image";
import { FlaskConical, Package, Users, Check, BadgeCheck, TriangleAlert } from "lucide-react";
import { joinAction } from "@/lib/actions/auth-forms";
import { PLANS, SUPPLIER_FEATURES, planTermLabel, ORG_TYPES, type PlanKey } from "@/lib/plans";
import type { PlanPricing } from "@/lib/settings";

const ROLES = [
  { id: "CUSTOMER", icon: Users, title: "Customer", desc: "Researcher, university, hospital or industry, submit RFQs and compare blind quotes. Free." },
  { id: "PROVIDER", icon: FlaskConical, title: "Laboratory / Provider", desc: "Sequencing or bioinformatics facility, receive routed RFQs and quote on merit." },
  { id: "SUPPLIER", icon: Package, title: "Supplier", desc: "Reagents, kits & consumables vendor, list products in the moderated catalog." },
];

const input = "w-full rounded-lg border border-line bg-surface px-3.5 py-2.5 text-[14px] text-ink outline-none transition-colors focus:border-navy-3";

// No client state anywhere: role/plan are native radios, conditional sections
// open via CSS sibling selectors, and the form posts to a server action — the
// page works end-to-end on browsers that can't run the JS bundle (iOS <16.4).
export function JoinFlow({ pricing, error }: { pricing: Record<PlanKey, PlanPricing>; error?: string }) {
  return (
    <main className="relative grid min-h-screen lg:grid-cols-2">
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
        <div className="glow-orb right-[-100px] top-1/4 size-[400px] bg-mint/15" />
        <div className="relative flex h-full flex-col justify-between p-12">
          <Link href="/" className="inline-block">
            <Image src="/brand/pbg-logo-dark.webp" alt="Pakistan Biotechnology Gateway" width={1024} height={334} priority className="h-20 w-auto" />
          </Link>
          <div>
            <h1 className="h-display on-dark !text-[2.6rem]">
              Join Pakistan&apos;s First <em className="grad-text">Biotechnology Gateway</em>
            </h1>
            <p className="mt-5 max-w-sm text-[14.5px] leading-relaxed text-[#c5d2e1]">
              The verified network, your full profile is created at signup; labs and
              suppliers choose a plan, then the Gateway team verifies the organization before it goes live.
            </p>
            <div className="mt-6 space-y-2 text-[13px] text-[#9fb9cd]">
              <div className="flex items-center gap-2"><BadgeCheck className="size-4 text-yellow" /> Basic, PKR 50,000 / 1 yr · standard listing</div>
              <div className="flex items-center gap-2"><BadgeCheck className="size-4 text-yellow" /> Pro, PKR 144,000 / 3 yrs · priority routing</div>
              <div className="flex items-center gap-2"><BadgeCheck className="size-4 text-yellow" /> Elite, PKR 240,000 / 5 yrs · dedicated manager</div>
            </div>
          </div>
          <p className="text-[12px] text-[#7a97b0]">© 2026 PBG | Pakistan Biotechnology Gateway. All rights reserved.</p>
        </div>
        <div className="absolute bottom-10 right-10 flex items-center gap-3">
          <span className="text-[10.5px] font-medium uppercase tracking-[0.16em] text-white/50">Project by</span>
          <Image src="/brand/syntax-logo-dark.webp" alt="Syntax of Life" width={820} height={269} className="h-7 w-auto" />
        </div>
      </div>

      <div className="flex items-center justify-center bg-paper px-6 py-16">
        <form action={joinAction} className="w-full max-w-md">
          <h2 className="font-display text-[26px] font-medium tracking-tight text-ink">Create your account</h2>
          <p className="mt-2 text-[13.5px] text-body">Choose how you&apos;ll use the Gateway, then fill in your details.</p>

          {error && (
            <p className="mt-4 flex items-start gap-2 rounded-lg border border-(--st-red-bd) bg-(--st-red-bg) px-3.5 py-2.5 text-[12.5px] text-(--st-red-fg)">
              <TriangleAlert className="mt-0.5 size-4 shrink-0" /> {error}
            </p>
          )}

          {/* hidden radios drive all conditional UI via .jf-* CSS rules */}
          <input type="radio" name="role" value="CUSTOMER" id="jf-r-customer" className="jf-radio" />
          <input type="radio" name="role" value="PROVIDER" id="jf-r-provider" className="jf-radio" />
          <input type="radio" name="role" value="SUPPLIER" id="jf-r-supplier" className="jf-radio" />
          <input type="radio" name="plan" value="BASIC" id="jf-p-basic" className="jf-radio" />
          <input type="radio" name="plan" value="PRO" id="jf-p-pro" className="jf-radio" />
          <input type="radio" name="plan" value="CUSTOM" id="jf-p-custom" className="jf-radio" />

          <div className="jf-roles mt-6 space-y-3">
            {ROLES.map((r) => (
              <label key={r.id} htmlFor={`jf-r-${r.id.toLowerCase()}`} className="card card-hover flex cursor-pointer items-start gap-4 p-5">
                <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-navy text-yellow"><r.icon className="size-5" strokeWidth={1.8} /></span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[15px] font-semibold text-ink">{r.title}</span>
                  <span className="mt-1 block text-[12.5px] leading-snug text-body">{r.desc}</span>
                </span>
                <Check className="jf-check mt-1 size-5 shrink-0 text-navy" />
              </label>
            ))}
          </div>

          {/* scroll guides: appear after selection, native anchor jump (no JS) */}
          <a href="#jf-form" className="jf-continue-customer btn-secondary mt-5 w-full justify-center !py-3">
            Continue, your details below ↓
          </a>
          <a href="#jf-plans" className="jf-continue-org btn-secondary mt-5 w-full justify-center !py-3">
            Continue, choose a plan below ↓
          </a>

          {/* plans — only for labs & suppliers */}
          <div id="jf-plans" className="jf-plans mt-8">
            <h3 className="text-[15px] font-semibold text-ink">Choose your plan</h3>
            <p className="mt-1 text-[12.5px] text-body">Billed once per term after the Gateway team approves your organization, invoiced offline, no card needed now.</p>
            <div className="mt-4 space-y-3">
              {(Object.keys(PLANS) as PlanKey[]).map((k) => {
                const p = PLANS[k];
                return (
                  <label key={k} htmlFor={`jf-p-${k.toLowerCase()}`} className="card card-hover block cursor-pointer p-5">
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="flex items-center gap-2 text-[15px] font-semibold text-ink">
                        {p.label}
                        <Check className="jf-check size-5 shrink-0 text-navy" />
                      </span>
                      <span className="flex flex-wrap items-baseline justify-end gap-x-2 gap-y-0.5 text-right font-display text-[19px] font-medium text-ink">
                        {pricing[k].discount > 0 && <span className="text-[12px] font-normal text-muted line-through">PKR {pricing[k].price.toLocaleString()}</span>}
                        <span>PKR {pricing[k].final.toLocaleString()}<span className="text-[11px] font-normal text-muted"> / {planTermLabel(k)}</span></span>
                        {pricing[k].discount > 0 && <span className="rounded-full bg-(--st-green-bg) px-1.5 py-0.5 text-[10px] font-bold text-(--st-green-fg)">-{pricing[k].discount}%</span>}
                      </span>
                    </div>
                    <p className="mt-0.5 text-[12px] text-muted">{p.tagline}</p>
                    <ul className="mt-3 space-y-1.5">
                      {(SUPPLIER_FEATURES[k] ?? p.features).map((ft) => (
                        <li key={ft} className="flex items-center gap-2 text-[12.5px] text-body"><Check className="size-3.5 shrink-0 text-green" />{ft}</li>
                      ))}
                    </ul>
                  </label>
                );
              })}
            </div>
            <a href="#jf-form" className="jf-continue-plan btn-secondary mt-5 w-full justify-center !py-3">
              Continue, your details below ↓
            </a>
          </div>

          {/* details — visible once a role is chosen */}
          <div id="jf-form" className="jf-form mt-8 space-y-4">
            <Field label="Full name" name="name" required autoComplete="name" />
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Email" name="email" type="email" required autoComplete="email" />
              <Field label="Phone" name="phone" type="tel" autoComplete="tel" />
            </div>
            <Field label="Password (12+ chars)" name="password" type="password" required autoComplete="new-password" />

            <div className="jf-customer space-y-4 border-t border-line pt-4">
              <p className="text-[12px] font-semibold uppercase tracking-wider text-muted">Your organization (optional)</p>
              <Field label="Organization name" name="orgName" />
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-[12.5px] font-medium text-ink">Organization type</label>
                  <select name="orgType" className={input}>
                    <option value="">Select…</option>
                    {ORG_TYPES.map((t) => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <Field label="City" name="city" />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Department" name="department" />
                <Field label="Designation" name="designation" />
              </div>
              <Field label="Address" name="address" />
            </div>

            <div className="jf-provider space-y-4 border-t border-line pt-4">
              <p className="text-[12px] font-semibold uppercase tracking-wider text-muted">Organization details</p>
              <Field label="Lab / facility name" name="orgName" />
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="City" name="city" />
                <Field label="Established (year)" name="establishedYear" type="number" />
              </div>
              <Field label="Platforms (e.g. Illumina NovaSeq, ONT, PacBio)" name="platforms" />
              <Field label="Sample types (e.g. DNA, Tissue, RNA, cDNA)" name="sampleTypes" />
              <Field label="Service categories (e.g. WGS, RNA-Seq, Bioinformatics)" name="serviceCategories" />
              <Field label="HPC capacity (e.g. 16-node cluster)" name="hpcCapacity" />
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Accreditations" name="accreditations" />
                <Field label="Contact person" name="contactPerson" />
              </div>
              <Field label="Website" name="website" />
              <div>
                <label className="mb-1.5 block text-[12.5px] font-medium text-ink">Short bio</label>
                <textarea name="bio" rows={3} className={input} placeholder="What customers should know about you…" />
              </div>
            </div>

            <div className="jf-supplier space-y-4 border-t border-line pt-4">
              <p className="text-[12px] font-semibold uppercase tracking-wider text-muted">Organization details</p>
              <Field label="Company name" name="orgName" />
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="City" name="city" />
                <Field label="Established (year)" name="establishedYear" type="number" />
              </div>
              <Field label="Product categories (e.g. Reagents, Kits, Consumables)" name="categories" />
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Contact person" name="contactPerson" />
                <Field label="Website" name="website" />
              </div>
              <div>
                <label className="mb-1.5 block text-[12.5px] font-medium text-ink">Short bio</label>
                <textarea name="bio" rows={3} className={input} placeholder="What customers should know about you…" />
              </div>
            </div>

            <p className="jf-org-note rounded-lg border border-(--st-amber-bd) bg-(--st-amber-bg) px-3.5 py-2.5 text-[12.5px] text-(--st-amber-fg)">
              Your profile is created now and goes live after payment + Gateway verification, usually within 2 business days.
            </p>
            <p className="jf-customer-note rounded-lg border border-(--st-blue-bd) bg-(--st-blue-bg) px-3.5 py-2.5 text-[12.5px] text-(--st-blue-fg)">
              Free to join, no plan needed. Your portal unlocks once the Gateway team approves your registration, usually within 1 business day.
            </p>

            <button type="submit" className="btn-secondary w-full justify-center !py-3">Create account &amp; profile</button>
          </div>

          <p className="mt-6 text-center text-[13px] text-muted">
            Already registered? <Link href="/login" className="font-semibold text-blue hover:text-ink">Sign in</Link>
          </p>
        </form>
      </div>

      <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2.5 rounded-full border border-line bg-white px-3.5 py-2 shadow-md lg:hidden">
        <span className="text-[9px] font-medium uppercase tracking-[0.14em] text-[#5a6b80]">Project by</span>
        <Image src="/brand/syntax-logo.webp" alt="Syntax of Life" width={820} height={269} className="h-5 w-auto" />
      </div>
    </main>
  );
}

function Field({ label, name, type = "text", required, autoComplete }: {
  label: string; name: string; type?: string; required?: boolean; autoComplete?: string;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-[12.5px] font-medium text-ink">
        {label} {required && <span className="text-orange">*</span>}
      </label>
      <input name={name} type={type} required={required} className={input} autoComplete={autoComplete} />
    </div>
  );
}
