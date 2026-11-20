import Link from "next/link";
import Image from "next/image";
import { FlaskConical, Package, Users, ArrowLeft, Check, BadgeCheck, TriangleAlert } from "lucide-react";
import { joinAction } from "@/lib/actions/auth-forms";
import { PLANS, SUPPLIER_FEATURES, planTermLabel, ORG_TYPES, type PlanKey } from "@/lib/plans";
import type { PlanPricing } from "@/lib/settings";

const ROLES = [
  { id: "CUSTOMER", icon: Users, title: "Customer", desc: "Researcher, university, hospital or industry, submit RFQs and compare blind quotes. Free." },
  { id: "PROVIDER", icon: FlaskConical, title: "Laboratory / Provider", desc: "Sequencing or bioinformatics facility, receive routed RFQs and quote on merit." },
  { id: "SUPPLIER", icon: Package, title: "Supplier", desc: "Reagents, kits & consumables vendor, list products in the moderated catalog." },
];

const VALID_ROLES = new Set(ROLES.map((r) => r.id));
const input = "w-full rounded-lg border border-line bg-surface px-3.5 py-2.5 text-[14px] text-ink outline-none transition-colors focus:border-navy-3";

// Step-by-step wizard driven by the URL (?role=&plan=), so each step is a real
// page that works without any client JS (iOS <16.4) and supports back links.
export function JoinFlow({
  pricing,
  role: rawRole,
  plan: rawPlan,
  error,
}: {
  pricing: Record<PlanKey, PlanPricing>;
  role?: string;
  plan?: string;
  error?: string;
}) {
  const role = rawRole && VALID_ROLES.has(rawRole) ? rawRole : undefined;
  const plan = rawPlan && rawPlan in PLANS ? (rawPlan as PlanKey) : undefined;
  const needsPlan = role === "PROVIDER" || role === "SUPPLIER";
  const step = !role ? "role" : needsPlan && !plan ? "plan" : "form";

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
              {(Object.keys(PLANS) as PlanKey[]).map((k) => (
                <div key={k} className="flex items-center gap-2">
                  <BadgeCheck className="size-4 shrink-0 text-yellow" />
                  <span>
                    {PLANS[k].label}, PKR {pricing[k].final.toLocaleString()} / {planTermLabel(k)} · {PLANS[k].tagline}
                    {pricing[k].discount > 0 && (
                      <span className="ml-1.5 rounded-full bg-yellow/15 px-1.5 py-0.5 text-[10px] font-bold text-yellow">-{pricing[k].discount}%</span>
                    )}
                  </span>
                </div>
              ))}
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
        <div className="w-full max-w-md">
          {error && (
            <p className="mb-5 flex items-start gap-2 rounded-lg border border-(--st-red-bd) bg-(--st-red-bg) px-3.5 py-2.5 text-[12.5px] text-(--st-red-fg)">
              <TriangleAlert className="mt-0.5 size-4 shrink-0" /> {error}
            </p>
          )}

          {step === "role" && (
            <>
              <h2 className="font-display text-[26px] font-medium tracking-tight text-ink">Create your account</h2>
              <p className="mt-2 text-[13.5px] text-body">Choose how you&apos;ll use the Gateway.</p>
              <div className="mt-8 space-y-3">
                {ROLES.map((r) => (
                  <Link key={r.id} href={`/biogateway?role=${r.id}`} className="card card-hover group flex w-full items-start gap-4 p-5 text-left">
                    <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-navy text-yellow"><r.icon className="size-5" strokeWidth={1.8} /></span>
                    <span>
                      <span className="block text-[15px] font-semibold text-ink">{r.title}</span>
                      <span className="mt-1 block text-[12.5px] leading-snug text-body">{r.desc}</span>
                    </span>
                  </Link>
                ))}
              </div>
              <p className="mt-6 text-center text-[13px] text-muted">
                Already registered? <Link href="/login" className="font-semibold text-blue hover:text-ink">Sign in</Link>
              </p>
            </>
          )}

          {step === "plan" && role && (
            <>
              <Link href="/biogateway" className="mb-5 inline-flex items-center gap-1.5 text-[13px] text-muted hover:text-ink">
                <ArrowLeft className="size-3.5" /> Back to roles
              </Link>
              <h2 className="font-display text-[26px] font-medium tracking-tight text-ink">Choose your plan</h2>
              <p className="mt-2 text-[13.5px] text-body">Billed once per term after the Gateway team approves your organization, invoiced offline, no card needed now.</p>
              <div className="mt-7 space-y-3">
                {(Object.keys(PLANS) as PlanKey[]).map((k) => {
                  const p = PLANS[k];
                  return (
                    <Link key={k} href={`/biogateway?role=${role}&plan=${k}`} className="card card-hover group block w-full p-5 text-left">
                      <div className="flex items-baseline justify-between gap-2">
                        <span className="text-[15px] font-semibold text-ink">{p.label}</span>
                        <span className="flex flex-wrap items-baseline justify-end gap-x-2 gap-y-0.5 text-right font-display text-[19px] font-medium text-ink">
                          {pricing[k].discount > 0 && <span className="text-[12px] font-normal text-muted line-through">PKR {pricing[k].price.toLocaleString()}</span>}
                          <span>PKR {pricing[k].final.toLocaleString()}<span className="text-[11px] font-normal text-muted"> / {planTermLabel(k)}</span></span>
                          {pricing[k].discount > 0 && <span className="rounded-full bg-(--st-green-bg) px-1.5 py-0.5 text-[10px] font-bold text-(--st-green-fg)">-{pricing[k].discount}%</span>}
                        </span>
                      </div>
                      <p className="mt-0.5 text-[12px] text-muted">{p.tagline}</p>
                      <ul className="mt-3 space-y-1.5">
                        {(role === "SUPPLIER" ? SUPPLIER_FEATURES[k] : p.features).map((ft) => (
                          <li key={ft} className="flex items-center gap-2 text-[12.5px] text-body"><Check className="size-3.5 shrink-0 text-green" />{ft}</li>
                        ))}
                      </ul>
                    </Link>
                  );
                })}
              </div>
            </>
          )}

          {step === "form" && role && (
            <>
              <Link href={needsPlan ? `/biogateway?role=${role}` : "/biogateway"} className="mb-5 inline-flex items-center gap-1.5 text-[13px] text-muted hover:text-ink">
                <ArrowLeft className="size-3.5" /> Back
              </Link>
              <h2 className="font-display text-[26px] font-medium tracking-tight text-ink">
                {ROLES.find((r) => r.id === role)?.title} profile
                {plan && <span className="ml-2 rounded-full bg-navy px-3 py-1 align-middle text-[11px] font-semibold text-yellow">{PLANS[plan].label} PKR {pricing[plan].final.toLocaleString()} · {planTermLabel(plan)}</span>}
              </h2>
              {needsPlan ? (
                <p className="mt-2 rounded-lg border border-(--st-amber-bd) bg-(--st-amber-bg) px-3.5 py-2.5 text-[12.5px] text-(--st-amber-fg)">
                  Your profile is created now and goes live after payment + Gateway verification, usually within 2 business days.
                </p>
              ) : (
                <p className="mt-2 rounded-lg border border-(--st-blue-bd) bg-(--st-blue-bg) px-3.5 py-2.5 text-[12.5px] text-(--st-blue-fg)">
                  Free to join, no plan needed. Your portal unlocks once the Gateway team approves your registration, usually within 1 business day.
                </p>
              )}

              <form action={joinAction} className="mt-7 space-y-4">
                <input type="hidden" name="role" value={role} />
                {plan && <input type="hidden" name="plan" value={plan} />}

                <Field label="Full name" name="name" required autoComplete="name" />
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Email" name="email" type="email" required autoComplete="email" />
                  <Field label="Phone" name="phone" type="tel" autoComplete="tel" />
                </div>
                <Field label="Password (12+ chars)" name="password" type="password" required autoComplete="new-password" />

                <div className="border-t border-line pt-4">
                  <p className="text-[12px] font-semibold uppercase tracking-wider text-muted">
                    {role === "CUSTOMER" ? "Your organization (optional)" : "Organization details"}
                  </p>
                </div>

                {role === "CUSTOMER" && (
                  <>
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
                  </>
                )}

                {role === "PROVIDER" && (
                  <>
                    <Field label="Lab / facility name" name="orgName" required />
                    <div className="grid gap-4 sm:grid-cols-2">
                      <Field label="City" name="city" required />
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
                    <BioField />
                  </>
                )}

                {role === "SUPPLIER" && (
                  <>
                    <Field label="Company name" name="orgName" required />
                    <div className="grid gap-4 sm:grid-cols-2">
                      <Field label="City" name="city" required />
                      <Field label="Established (year)" name="establishedYear" type="number" />
                    </div>
                    <Field label="Product categories (e.g. Reagents, Kits, Consumables)" name="categories" />
                    <div className="grid gap-4 sm:grid-cols-2">
                      <Field label="Contact person" name="contactPerson" />
                      <Field label="Website" name="website" />
                    </div>
                    <BioField />
                  </>
                )}

                <button type="submit" className="btn-secondary w-full justify-center !py-3">Create account &amp; profile</button>
              </form>
            </>
          )}
        </div>
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

function BioField() {
  return (
    <div>
      <label className="mb-1.5 block text-[12.5px] font-medium text-ink">Short bio</label>
      <textarea name="bio" rows={3} className={input} placeholder="What customers should know about you…" />
    </div>
  );
}
