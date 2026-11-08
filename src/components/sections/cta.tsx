"use client";

import Link from "next/link";
import { ArrowRight, Dna } from "lucide-react";
import { Reveal } from "@/components/motion-primitives";

export function Cta() {
  return (
    <section className="bg-paper py-24 sm:py-28">
      <div className="container-x">
        <Reveal>
          <div className="btn-wrap !block !rounded-[28px]">
            {/* static rainbow frame */}
            <div className="absolute -inset-px rounded-[28px] bg-[linear-gradient(120deg,var(--color-blue-bright),var(--color-mint)_30%,var(--color-green)_45%,var(--color-yellow-soft)_62%,var(--color-orange)_85%)]" />
            <div className="relative overflow-hidden rounded-[27px] bg-navy px-8 py-16 text-center sm:px-16 sm:py-20">
              <div className="grid-lines on-dark absolute inset-0" />
              <div className="glow-orb left-1/2 top-[-180px] size-[420px] -translate-x-1/2 bg-blue-bright/25" />
              <span className="relative mx-auto grid size-14 place-items-center rounded-2xl bg-yellow text-navy">
                <Dna className="size-7" strokeWidth={2} />
              </span>
              <h2 className="h-section on-dark relative mx-auto mt-7 max-w-2xl">
                Ready to connect with Pakistan&apos;s{" "}
                <em className="grad-text">biotech capacity</em>?
              </h2>
              <p className="relative mx-auto mt-5 max-w-xl text-[15.5px] leading-relaxed text-[#c5d2e1]">
                Join as a researcher, register your facility, or list your products.
                Verification is free — fairness is built in.
              </p>
              <div className="relative mt-9 flex flex-wrap items-center justify-center gap-4">
                <span className="btn-wrap">
                  <Link href="/biogateway" className="btn-primary">
                    Join the network <ArrowRight className="size-4" />
                  </Link>
                </span>
                <Link href="/contact" className="btn-ghost on-dark">
                  Talk to the team
                </Link>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
