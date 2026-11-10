"use client";

import { useActionState } from "react";
import { ArrowRight, CircleCheck, Loader2, MapPin } from "lucide-react";
import { Reveal } from "@/components/motion-primitives";
import { submitLead, type LeadResult } from "@/lib/actions/leads";

const BENEFITS = [
  "Expert-guided study design & service matching",
  "Competitive quotes, adaptable turnaround times",
  "End-to-end bioinformatics & reporting",
  "Run by accredited facilities across the nationwide network",
];

export function CtaForm({ type = "quote" }: { type?: "quote" | "contact" }) {
  const isContact = type === "contact";
  const [state, action, pending] = useActionState<LeadResult | null, FormData>(submitLead, null);

  return (
    <section id="quote-form" className="bg-paper py-24 sm:py-28">
      <div className="container-x">
        <Reveal>
          <div className="overflow-hidden rounded-[28px] bg-navy">
            <div className="grid lg:grid-cols-2">
              {/* left copy */}
              <div className="relative p-9 sm:p-12">
                <div className="grid-lines on-dark absolute inset-0" />
                <div className="glow-orb left-[-100px] top-[-100px] size-[300px] bg-blue-bright/20" />
                <div className="relative">
                  <h2 className="h-section on-dark">
                    {isContact ? (
                      <>Talk to a <em className="grad-text">scientist</em></>
                    ) : (
                      <>Ready to launch your <em className="grad-text">study</em>?</>
                    )}
                  </h2>
                  <p className="mt-5 max-w-md text-[15px] leading-relaxed text-[#c5d2e1]">
                    Share your samples and goals — a doctoral-level scientist responds within one
                    business day with a study plan and competing blind quotes.
                  </p>
                  <ul className="mt-8 space-y-3.5">
                    {BENEFITS.map((b) => (
                      <li key={b} className="flex items-center gap-3 text-[13.5px] text-[#c5d2e1]">
                        <CircleCheck className="size-4.5 shrink-0 text-mint" /> {b}
                      </li>
                    ))}
                  </ul>
                  <p className="mt-8 flex items-center gap-2 text-[12px] text-[#7a97b0]">
                    <MapPin className="size-3.5" /> Administered by Syntax of Life Private Limited
                  </p>
                </div>
              </div>

              {/* right form */}
              <div className="border-t border-white/10 bg-white/[0.04] p-9 sm:p-12 lg:border-l lg:border-t-0">
                <p className="text-[13px] font-semibold uppercase tracking-wider text-yellow">
                  {isContact ? "Send us a message" : "Request a quote"}
                </p>

                {state?.ok ? (
                  <div className="mt-8 rounded-xl border border-mint/30 bg-mint/10 p-6 text-center">
                    <CircleCheck className="mx-auto size-8 text-mint" />
                    <p className="mt-3 text-[15px] font-semibold text-white">Message received</p>
                    <p className="mt-1.5 text-[13px] leading-relaxed text-[#a2c1d7]">
                      Thank you — a specialist will reply to your email within one business day.
                    </p>
                  </div>
                ) : (
                  <form className="mt-6 space-y-4" action={action}>
                    <input type="hidden" name="type" value={isContact ? "CONTACT" : "QUOTE"} />
                    {/* honeypot */}
                    <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />

                    <div className="grid gap-4 sm:grid-cols-2">
                      <Field label="First name" name="firstName" required />
                      <Field label="Last name" name="lastName" />
                    </div>
                    <Field label="Organization" name="org" />
                    <Field label="Work email" name="email" type="email" required />
                    <div>
                      <label className="mb-1.5 block text-[12px] font-medium text-[#a2c1d7]">
                        Area of interest
                      </label>
                      <select
                        name="interest"
                        className="w-full rounded-lg border border-white/15 bg-navy-2 px-3.5 py-2.5 text-[13.5px] text-white outline-none transition-colors focus:border-mint/60 [&>option]:text-navy"
                        defaultValue=""
                      >
                        <option value="">Please select (optional)</option>
                        <option>Whole-Genome Sequencing</option>
                        <option>Metagenomics &amp; Microbiome Profiling</option>
                        <option>Transcriptomics (RNA-Seq)</option>
                        <option>Epigenomics &amp; Methylation</option>
                        <option>Sanger Sequencing</option>
                        <option>Sequencing Only</option>
                        <option>Bioinformatics &amp; Data Analysis</option>
                        <option>Reagents / kits / consumables</option>
                        <option>Register as a provider or supplier</option>
                      </select>
                    </div>
                    <div>
                      <label className="mb-1.5 block text-[12px] font-medium text-[#a2c1d7]">
                        {isContact ? "Message" : "Project details"} {isContact && <span className="text-yellow">*</span>}
                      </label>
                      <textarea
                        name="message"
                        rows={3}
                        required={isContact}
                        placeholder={isContact ? "How can we help?" : "Organism, sample count, target output, deadline…"}
                        className="w-full resize-none rounded-lg border border-white/15 bg-navy-2 px-3.5 py-2.5 text-[13.5px] text-white outline-none transition-colors placeholder:text-[#5c7391] focus:border-mint/60"
                      />
                    </div>

                    {state?.error && (
                      <p className="rounded-lg border border-(--st-red-bd) bg-(--st-red-bg) px-3.5 py-2.5 text-[12.5px] font-medium text-(--st-red-fg)">
                        {state.error}
                      </p>
                    )}

                    <button
                      type="submit"
                      disabled={pending}
                      className="btn-primary w-full justify-center !py-3.5 disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      {pending ? <Loader2 className="size-4 animate-spin" /> : <ArrowRight className="size-4" />}
                      {pending ? "Sending…" : isContact ? "Send message" : "Request a quote"}
                    </button>
                    <p className="text-center text-[11px] leading-relaxed text-[#7a97b0]">
                      No raw genomic data is ever uploaded — documents only (≤25MB).
                    </p>
                  </form>
                )}
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function Field({
  label,
  name,
  type = "text",
  required,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-[12px] font-medium text-[#a2c1d7]">
        {label} {required && <span className="text-yellow">*</span>}
      </label>
      <input
        type={type}
        name={name}
        required={required}
        className="w-full rounded-lg border border-white/15 bg-navy-2 px-3.5 py-2.5 text-[13.5px] text-white outline-none transition-colors placeholder:text-[#5c7391] focus:border-mint/60"
      />
    </div>
  );
}
