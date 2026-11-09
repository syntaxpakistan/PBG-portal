"use client";

import { ArrowRight, CircleCheck, MapPin } from "lucide-react";
import { Reveal } from "@/components/motion-primitives";

const BENEFITS = [
  "Expert-guided study design & service matching",
  "Competitive quotes, adaptable turnaround times",
  "End-to-end bioinformatics & reporting",
  "Run by accredited facilities across the nationwide network",
];

export function CtaForm() {
  return (
    <section className="bg-paper py-24 sm:py-28">
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
                    Ready to launch your <em className="grad-text">study</em>?
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
                <p className="text-[13px] font-semibold uppercase tracking-wider text-yellow">Request a quote</p>
                <form className="mt-6 space-y-4" action="/biogateway">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="First name" required />
                    <Field label="Last name" required />
                  </div>
                  <Field label="Organization" required />
                  <Field label="Work email" type="email" required />
                  <div>
                    <label className="mb-1.5 block text-[12px] font-medium text-[#a2c1d7]">
                      Area of interest <span className="text-yellow">*</span>
                    </label>
                    <select
                      required
                      className="w-full rounded-lg border border-white/15 bg-navy-2 px-3.5 py-2.5 text-[13.5px] text-white outline-none transition-colors focus:border-mint/60"
                      defaultValue=""
                    >
                      <option value="" disabled>Please select</option>
                      <option>Whole Genome Services</option>
                      <option>Whole Exome Services</option>
                      <option>RNA-Seq Services</option>
                      <option>Single-cell Services</option>
                      <option>Spatial Services</option>
                      <option>Long-Read Services</option>
                      <option>Epigenomics Services</option>
                      <option>Immune Repertoire Services</option>
                      <option>Oncology and Targeted Panel Services</option>
                      <option>Sequencing Only Services (Illumina, PacBio)</option>
                      <option>Reagents / kits / consumables</option>
                      <option>Register as a provider or supplier</option>
                    </select>
                  </div>
                  <button type="submit" className="btn-primary w-full justify-center !py-3.5">
                    Request a quote <ArrowRight className="size-4" />
                  </button>
                  <p className="text-center text-[11px] leading-relaxed text-[#7a97b0]">
                    No raw genomic data is ever uploaded — documents only (≤25MB).
                  </p>
                </form>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function Field({ label, type = "text", required }: { label: string; type?: string; required?: boolean }) {
  return (
    <div>
      <label className="mb-1.5 block text-[12px] font-medium text-[#a2c1d7]">
        {label} {required && <span className="text-yellow">*</span>}
      </label>
      <input
        type={type}
        required={required}
        className="w-full rounded-lg border border-white/15 bg-navy-2 px-3.5 py-2.5 text-[13.5px] text-white outline-none transition-colors placeholder:text-[#5c7391] focus:border-mint/60"
      />
    </div>
  );
}
