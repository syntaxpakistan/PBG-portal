import Link from "next/link";
import { ArrowRight, BadgeCheck } from "lucide-react";
import { Reveal } from "@/components/motion-primitives";

const PLATFORMS = ["Illumina", "PacBio", "10x Genomics", "BD Rhapsody", "Takara", "Olink", "Visium", "Xenium"];

export function VerifiedBanner() {
  return (
    <section className="border-y border-line bg-surface py-14">
      <div className="container-x">
        <Reveal>
          <div className="flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-center">
            <div className="flex items-start gap-4">
              <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-navy text-yellow">
                <BadgeCheck className="size-6" strokeWidth={1.8} />
              </span>
              <div>
                <h3 className="font-display text-[19px] font-medium tracking-tight text-ink">
                  Certified service programs
                </h3>
                <p className="mt-1 max-w-md text-[13.5px] leading-relaxed text-body">
                  In-house, validated workflows across the platforms you rely on — and every
                  facility clears Syntax verification before it can quote.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
              {PLATFORMS.map((p) => (
                <span key={p} className="font-display text-[15px] font-medium tracking-tight text-muted transition-colors hover:text-navy">
                  {p}
                </span>
              ))}
            </div>
            <Link href="/platform/verification" className="btn-ghost shrink-0 !py-2.5 !text-[13px]">
              Learn more <ArrowRight className="size-3.5" />
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
