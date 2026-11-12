"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { FlaskConical, Package, Users, Loader2, ArrowLeft, Check, BadgeCheck } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { GoogleButton } from "@/components/google-button";
import { createOrgProfile } from "@/lib/actions/onboarding";
import { PLANS, ORG_TYPES, type PlanKey } from "@/lib/plans";
import { toast } from "sonner";

const ROLES = [
  { id: "CUSTOMER", icon: Users, title: "Customer", desc: "Researcher, university, hospital or industry — submit RFQs and compare blind quotes. Free." },
  { id: "PROVIDER", icon: FlaskConical, title: "Laboratory / Provider", desc: "Sequencing or bioinformatics facility — receive routed RFQs and quote on merit." },
  { id: "SUPPLIER", icon: Package, title: "Supplier", desc: "Reagents, kits & consumables vendor — list products in the moderated catalog." },
];

const ROLE_DEST: Record<string, string> = {
  ADMIN: "/admin", PROVIDER: "/lab", SUPPLIER: "/supplier", CUSTOMER: "/dashboard",
};

const input = "w-full rounded-lg border border-line bg-surface px-3.5 py-2.5 text-[14px] text-ink outline-none transition-colors focus:border-navy-3";

export default function JoinPage() {
  const router = useRouter();
  const [role, setRole] = useState<string | null>(null);
  const [plan, setPlan] = useState<PlanKey | null>(null);
  const [loading, setLoading] = useState(false);
  const [f, setF] = useState<Record<string, string>>({});
  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setF((p) => ({ ...p, [k]: e.target.value }));

  const needsOrg = role === "PROVIDER" || role === "SUPPLIER";
  const needsPlan = needsOrg;
  const step = !role ? "role" : needsPlan && !plan ? "plan" : "form";

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!role) return;
    setLoading(true);
    const { data, error } = await authClient.signUp.email({
      name: f.name, email: f.email, password: f.password, role, phone: f.phone,
    } as Parameters<typeof authClient.signUp.email>[0]);
    if (error) {
      setLoading(false);
      toast.error(error.message ?? "Could not create account");
      return;
    }
    if (data?.user?.id) {
      await createOrgProfile({
        userId: data.user.id,
        role,
        orgName: f.orgName ?? "",
        city: f.city ?? "",
        platforms: f.platforms,
        sampleTypes: f.sampleTypes,
        serviceCategories: f.serviceCategories,
        categories: f.categories,
        bio: f.bio,
        website: f.website,
        establishedYear: f.establishedYear ? Number(f.establishedYear) : undefined,
        accreditations: f.accreditations,
        contactPerson: f.contactPerson,
        orgType: f.orgType,
        department: f.department,
        designation: f.designation,
        address: f.address,
        plan: plan ?? undefined,
      });
    }
    setLoading(false);
    if (needsOrg) {
      toast.success(`Account created on the ${PLANS[plan!].label} plan — Syntax will contact you about payment & verification.`);
    } else {
      toast.success("Account created — your portal unlocks once Syntax approves your registration.");
    }
    router.push(ROLE_DEST[role] ?? "/dashboard");
    router.refresh();
  }

  return (
    <main className="relative grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden overflow-hidden bg-navy lg:block">
        <div className="grid-lines on-dark absolute inset-0" />
        <div className="glow-orb right-[-100px] top-1/4 size-[400px] bg-mint/15" />
        <div className="relative flex h-full flex-col justify-between p-12">
          <Link href="/" className="inline-block">
            <Image src="/brand/pbg-logo-dark.webp" alt="Pakistan Biotechnology Gateway" width={1024} height={334} className="h-20 w-auto" />
          </Link>
          <div>
            <h1 className="h-display on-dark !text-[2.6rem]">
              Join Pakistan&apos;s First <em className="grad-text">Biotechnology Gateway</em>
            </h1>
            <p className="mt-5 max-w-sm text-[14.5px] leading-relaxed text-[#c5d2e1]">
              The verified network — your full profile is created at signup; labs and
              suppliers choose a plan, then Syntax verifies the organization before it goes live.
            </p>
            <div className="mt-6 space-y-2 text-[13px] text-[#9fb9cd]">
              <div className="flex items-center gap-2"><BadgeCheck className="size-4 text-yellow" /> Basic — $100/mo · standard listing</div>
              <div className="flex items-center gap-2"><BadgeCheck className="size-4 text-yellow" /> Pro — $300/mo · priority routing</div>
              <div className="flex items-center gap-2"><BadgeCheck className="size-4 text-yellow" /> Custom — $500/mo · dedicated manager</div>
            </div>
          </div>
          <p className="text-[12px] text-[#7a97b0]">© 2026 PBG | Pakistan Biotechnology Gateway. All rights reserved.</p>
        </div>
        <div className="absolute bottom-10 right-10 flex items-center gap-3">
          <span className="text-[13px] font-medium uppercase tracking-[0.16em] text-white/50">Powered by</span>
          <Image src="/brand/syntax-logo-dark.webp" alt="Syntax of Life" width={820} height={269} className="h-16 w-auto" />
        </div>
      </div>

      <div className="flex items-center justify-center bg-paper px-6 py-16">
        <div className="w-full max-w-md">
          {step === "role" && (
            <>
              <h2 className="font-display text-[26px] font-medium tracking-tight text-ink">Create your account</h2>
              <p className="mt-2 text-[13.5px] text-body">Choose how you&apos;ll use the Gateway.</p>
              <div className="mt-8 space-y-3">
                {ROLES.map((r) => (
                  <button key={r.id} onClick={() => setRole(r.id)} className="card card-hover group flex w-full items-start gap-4 p-5 text-left">
                    <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-navy text-yellow"><r.icon className="size-5" strokeWidth={1.8} /></span>
                    <span>
                      <span className="block text-[15px] font-semibold text-ink">{r.title}</span>
                      <span className="mt-1 block text-[12.5px] leading-snug text-body">{r.desc}</span>
                    </span>
                  </button>
                ))}
              </div>
              <p className="mt-6 text-center text-[13px] text-muted">
                Already registered? <Link href="/login" className="font-semibold text-blue hover:text-ink">Sign in</Link>
              </p>
              <GoogleButton />
            </>
          )}

          {step === "plan" && (
            <>
              <button onClick={() => setRole(null)} className="mb-5 inline-flex items-center gap-1.5 text-[13px] text-muted hover:text-ink">
                <ArrowLeft className="size-3.5" /> Back to roles
              </button>
              <h2 className="font-display text-[26px] font-medium tracking-tight text-ink">Choose your plan</h2>
              <p className="mt-2 text-[13.5px] text-body">Billed monthly after Syntax approves your organization — invoiced offline, no card needed now.</p>
              <div className="mt-7 space-y-3">
                {(Object.keys(PLANS) as PlanKey[]).map((k) => {
                  const p = PLANS[k];
                  return (
                    <button key={k} onClick={() => setPlan(k)} className="card card-hover group w-full p-5 text-left">
                      <div className="flex items-baseline justify-between">
                        <span className="text-[15px] font-semibold text-ink">{p.label}</span>
                        <span className="font-display text-[22px] font-medium text-ink">${p.price}<span className="text-[12px] font-normal text-muted">/mo</span></span>
                      </div>
                      <p className="mt-0.5 text-[12px] text-muted">{p.tagline}</p>
                      <ul className="mt-3 space-y-1.5">
                        {p.features.map((ft) => (
                          <li key={ft} className="flex items-center gap-2 text-[12.5px] text-body"><Check className="size-3.5 shrink-0 text-green" />{ft}</li>
                        ))}
                      </ul>
                    </button>
                  );
                })}
              </div>
            </>
          )}

          {step === "form" && role && (
            <>
              <button onClick={() => (needsPlan ? setPlan(null) : setRole(null))} className="mb-5 inline-flex items-center gap-1.5 text-[13px] text-muted hover:text-ink">
                <ArrowLeft className="size-3.5" /> Back
              </button>
              <h2 className="font-display text-[26px] font-medium tracking-tight text-ink">
                {ROLES.find((r) => r.id === role)?.title} profile
                {plan && <span className="ml-2 rounded-full bg-navy px-3 py-1 align-middle text-[11px] font-semibold text-yellow">{PLANS[plan].label} ${PLANS[plan].price}/mo</span>}
              </h2>
              {needsOrg ? (
                <p className="mt-2 rounded-lg border border-(--st-amber-bd) bg-(--st-amber-bg) px-3.5 py-2.5 text-[12.5px] text-(--st-amber-fg)">
                  Your profile is created now and goes live after payment + Syntax verification — usually within 2 business days.
                </p>
              ) : (
                <p className="mt-2 rounded-lg border border-(--st-blue-bd) bg-(--st-blue-bg) px-3.5 py-2.5 text-[12.5px] text-(--st-blue-fg)">
                  Free to join — no plan needed. Your portal unlocks once Syntax approves your registration, usually within 1 business day.
                </p>
              )}
              <form onSubmit={onSubmit} className="mt-7 space-y-4">
                <Field label="Full name" value={f.name} onChange={set("name")} required />
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Email" type="email" value={f.email} onChange={set("email")} required />
                  <Field label="Phone" value={f.phone} onChange={set("phone")} />
                </div>
                <Field label="Password (8+ chars)" type="password" value={f.password} onChange={set("password")} required />

                <div className="border-t border-line pt-4">
                  <p className="text-[12px] font-semibold uppercase tracking-wider text-muted">
                    {role === "CUSTOMER" ? "Your organization (optional)" : "Organization details"}
                  </p>
                </div>

                {role === "CUSTOMER" && (
                  <>
                    <Field label="Organization name" value={f.orgName} onChange={set("orgName")} />
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className="mb-1.5 block text-[12.5px] font-medium text-ink">Organization type</label>
                        <select value={f.orgType ?? ""} onChange={set("orgType")} className={input}>
                          <option value="">Select…</option>
                          {ORG_TYPES.map((t) => <option key={t}>{t}</option>)}
                        </select>
                      </div>
                      <Field label="City" value={f.city} onChange={set("city")} />
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <Field label="Department" value={f.department} onChange={set("department")} />
                      <Field label="Designation" value={f.designation} onChange={set("designation")} />
                    </div>
                    <Field label="Address" value={f.address} onChange={set("address")} />
                  </>
                )}

                {role === "PROVIDER" && (
                  <>
                    <Field label="Lab / facility name" value={f.orgName} onChange={set("orgName")} required />
                    <div className="grid gap-4 sm:grid-cols-2">
                      <Field label="City" value={f.city} onChange={set("city")} required />
                      <Field label="Established (year)" type="number" value={f.establishedYear} onChange={set("establishedYear")} />
                    </div>
                    <Field label="Platforms (e.g. Illumina NovaSeq, ONT, PacBio)" value={f.platforms} onChange={set("platforms")} />
                    <Field label="Sample types (e.g. DNA, Tissue, RNA, cDNA)" value={f.sampleTypes} onChange={set("sampleTypes")} />
                    <Field label="Service categories (e.g. WGS, RNA-Seq, Bioinformatics)" value={f.serviceCategories} onChange={set("serviceCategories")} />
                    <Field label="HPC capacity (e.g. 16-node cluster)" value={f.hpcCapacity} onChange={set("hpcCapacity")} />
                    <div className="grid gap-4 sm:grid-cols-2">
                      <Field label="Accreditations" value={f.accreditations} onChange={set("accreditations")} />
                      <Field label="Contact person" value={f.contactPerson} onChange={set("contactPerson")} />
                    </div>
                    <Field label="Website" type="text" value={f.website} onChange={set("website")} />
                    <BioField value={f.bio} onChange={set("bio")} />
                  </>
                )}

                {role === "SUPPLIER" && (
                  <>
                    <Field label="Company name" value={f.orgName} onChange={set("orgName")} required />
                    <div className="grid gap-4 sm:grid-cols-2">
                      <Field label="City" value={f.city} onChange={set("city")} required />
                      <Field label="Established (year)" type="number" value={f.establishedYear} onChange={set("establishedYear")} />
                    </div>
                    <Field label="Product categories (e.g. Reagents, Kits, Consumables)" value={f.categories} onChange={set("categories")} />
                    <div className="grid gap-4 sm:grid-cols-2">
                      <Field label="Contact person" value={f.contactPerson} onChange={set("contactPerson")} />
                      <Field label="Website" type="text" value={f.website} onChange={set("website")} />
                    </div>
                    <BioField value={f.bio} onChange={set("bio")} />
                  </>
                )}

                <button type="submit" disabled={loading} className="btn-secondary w-full justify-center !py-3">
                  {loading ? <Loader2 className="size-4 animate-spin" /> : "Create account & profile"}
                </button>
              </form>
            </>
          )}
        </div>
      </div>

      <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2.5 rounded-full border border-line bg-white px-3.5 py-2 shadow-md lg:hidden">
        <span className="text-[10.5px] font-medium uppercase tracking-[0.16em] text-[#5a6b80]">Powered by</span>
        <Image src="/brand/syntax-logo.webp" alt="Syntax of Life" width={820} height={269} className="h-8 w-auto" />
      </div>
    </main>
  );
}

function Field({ label, type = "text", value, onChange, required }: {
  label: string; type?: string; value?: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; required?: boolean;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-[12.5px] font-medium text-ink">
        {label} {required && <span className="text-orange">*</span>}
      </label>
      <input
        type={type} value={value ?? ""} onChange={onChange} required={required} className={input}
        autoComplete={type === "email" ? "email" : type === "password" ? "new-password" : type === "tel" ? "tel" : undefined}
      />
    </div>
  );
}

function BioField({ value, onChange }: { value?: string; onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void }) {
  return (
    <div>
      <label className="mb-1.5 block text-[12.5px] font-medium text-ink">Short bio</label>
      <textarea rows={3} value={value ?? ""} onChange={onChange} className={input} placeholder="What customers should know about you…" />
    </div>
  );
}
