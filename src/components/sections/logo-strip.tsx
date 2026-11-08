import { Reveal } from "@/components/motion-primitives";

const SECTORS = [
  "University of Washington",
  "Washington University in St. Louis",
  "UCSF",
  "Gilead",
  "Amgen",
  "Eli Lilly",
  "Dana-Farber",
  "Genentech",
  "Ancestry",
  "Ascidian",
];

export function LogoStrip() {
  return (
    <section className="border-b border-line bg-surface py-12">
      <div className="container-x">
        <Reveal>
          <p className="text-center text-[12px] font-medium uppercase tracking-[0.22em] text-muted">
            Preferred by leading universities &amp; biopharma teams
          </p>
        </Reveal>
        <div className="relative mt-8 overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_12%,black_88%,transparent)]">
          <div className="flex w-max animate-marquee items-center gap-16 pr-16">
            {[...SECTORS, ...SECTORS].map((s, i) => (
              <span
                key={i}
                className="whitespace-nowrap font-display text-[17px] font-light tracking-tight text-muted transition-colors hover:text-navy"
              >
                {s}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
