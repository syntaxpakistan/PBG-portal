import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { AnimatedCounter, Reveal } from "@/components/motion-primitives";

const STATS = [
  { value: 200, suffix: "+", label: "peer-reviewed papers" },
  { value: 1000, suffix: "+", label: "citations to network research" },
  { value: 250000, suffix: "+", label: "transcriptomes profiled" },
  { value: 500000, suffix: "+", label: "completed sequencing runs" },
  { value: 10, suffix: "M+", label: "single cells analyzed" },
  { value: 17, suffix: "M+", label: "unique variants discovered" },
];

export function WhoWeAre() {
  return (
    <section className="bg-paper py-24 sm:py-28">
      <div className="container-x">
        <div className="grid gap-12 lg:grid-cols-[1.1fr_1fr] lg:items-center">
          <Reveal>
            <p className="eyebrow">Who we are</p>
            <h2 className="h-section mt-4">
              Scientist-driven multiomics, <em className="grad-text">all in one place</em>
            </h2>
            <p className="mt-5 text-[15.5px] leading-relaxed text-body">
              We pair advanced technical infrastructure with deep biological expertise, reshaping
              how multi-omic research gets sourced. Doctoral-level scientists across the verified
              network supervise every step — maintaining strict quality control from initial
              library prep through the final bioinformatics report.
            </p>
            <div className="mt-7 flex flex-wrap gap-4">
              <span className="btn-wrap">
                <Link href="/company/about" className="btn-secondary">
                  About the Gateway
                </Link>
              </span>
              <Link href="/contact" className="btn-ghost">
                <MessageCircle className="size-4" /> Speak with a scientist
              </Link>
            </div>
          </Reveal>

          <Reveal delay={1}>
            <div className="card grid grid-cols-2 gap-px overflow-hidden !rounded-2xl bg-line sm:grid-cols-3">
              {STATS.map((s) => (
                <div key={s.label} className="bg-surface p-6">
                  <p className="font-display text-[34px] font-light tracking-tight text-navy">
                    <AnimatedCounter value={s.value} suffix={s.suffix} />
                  </p>
                  <p className="mt-1.5 text-[12px] leading-snug text-muted">{s.label}</p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
