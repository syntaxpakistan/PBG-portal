import { AnimatedCounter, Reveal } from "@/components/motion-primitives";

const STATS = [
  { value: 4, suffix: "", label: "role-based portals", sub: "Customer · Provider · Supplier · Admin" },
  { value: 8, suffix: "", label: "tracked project stages", sub: "RFQ submitted → results delivered" },
  { value: 100, suffix: "%", label: "blind quote isolation", sub: "enforced at the database layer" },
  { value: 0, suffix: "", label: "raw genomic files hosted", sub: "FASTQ/BAM stay at the lab — always" },
];

export function Stats() {
  return (
    <section className="border-y border-line bg-surface py-20">
      <div className="container-x">
        <Reveal>
          <p className="eyebrow">Designed for trust</p>
          <h2 className="h-section mt-4">
            Trusted connections. <em className="grad-text">Verified capacity.</em>
          </h2>
          <p className="mt-5 max-w-2xl text-[15.5px] leading-relaxed text-body">
            Every provider is verified against Syntax criteria before they can quote. Every quote is
            blind. Every admin action is logged. That&apos;s the operating standard — not a feature list.
          </p>
        </Reveal>

        <div className="mt-14 grid grid-cols-2 gap-x-8 gap-y-12 lg:grid-cols-4">
          {STATS.map((s, i) => (
            <Reveal key={s.label} delay={i}>
              <p className="font-display text-[54px] font-light leading-none tracking-tight text-ink sm:text-[62px]">
                <AnimatedCounter value={s.value} suffix={s.suffix} />
              </p>
              <p className="mt-3 text-[14.5px] font-medium text-ink">{s.label}</p>
              <p className="mt-1.5 text-[12.5px] leading-relaxed text-muted">{s.sub}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
