export const instant = false

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BookOpenCheck } from "lucide-react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { SeqCalculator } from "@/components/seq-calculator";
import { decodeEst, type EstInput } from "@/lib/coverage";

export const metadata = {
  title: "Sequencing Coverage Estimator — Pakistan Biotechnology Gateway",
  description:
    "Estimate the reagents and sequencing runs needed for your target coverage — same model as the Illumina coverage calculator — then send the spec to verified Pakistani labs for sealed quotes.",
};

export default async function SeqCalculatorPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const initial: EstInput = decodeEst(await searchParams);

  return (
    <main className="min-h-screen bg-paper">
      <Navbar />

      {/* hero */}
      <section className="relative overflow-hidden bg-navy pb-14 pt-36 sm:pt-40">
        <Image
          src="/media/seq-hero.webp"
          alt=""
          fill
          priority
          sizes="100vw"
          className="pointer-events-none object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-navy/80 via-navy/55 to-navy" />
        <div className="grid-lines on-dark absolute inset-0" />
        <div className="glow-orb right-[-120px] top-[-80px] size-[380px] bg-mint/15" />
        <div className="container-x relative">
          <div className="max-w-3xl">
            <p className="eyebrow on-dark">Planning tool</p>
            <h1 className="h-display on-dark mt-5 !text-[2.4rem] sm:!text-[3rem]">
              Sequencing coverage <em className="grad-text">estimator.</em>
            </h1>
            <p className="mt-5 max-w-2xl text-[15.5px] leading-relaxed text-[#c5d2e1]">
              This estimator helps determine the reagents and sequencing runs needed to reach
              the desired coverage for your experiment — then sends the spec to verified labs
              for sealed quotes.
            </p>
            <ol className="mt-6 max-w-2xl space-y-1.5 text-[13px] leading-relaxed text-[#c5d2e1]/90">
              <li>1. Click the button for your application type.</li>
              <li>2. Select the application or product from the dropdown menu.</li>
              <li>3. Enter the input parameters — gray fields are locked for that product.</li>
              <li>4. Select the instruments you want to estimate for, then Submit.</li>
              <li>5. The table shows the flow cells or lanes needed — download it as CSV.</li>
            </ol>
          </div>
        </div>
      </section>

      {/* estimator */}
      <section className="bg-paper py-12 sm:py-16">
        <div className="container-x">
          <SeqCalculator initial={initial} />
        </div>
      </section>

      {/* additional considerations — same notes Illumina publishes */}
      <section className="bg-paper-2 py-14">
        <div className="container-x max-w-4xl">
          <p className="eyebrow">Additional considerations</p>
          <ul className="mt-6 space-y-3 text-[13.5px] leading-relaxed text-body">
            <li className="flex gap-2.5"><BookOpenCheck className="mt-0.5 size-4 shrink-0 text-blue" />Output is an estimation based on recommended cluster density and read length — real output will vary.</li>
            <li className="flex gap-2.5"><BookOpenCheck className="mt-0.5 size-4 shrink-0 text-blue" />The estimator uses cluster counts passing filter typical of balanced genomes (e.g. PhiX, human). Unbalanced libraries may yield fewer passing clusters and lower output per unit.</li>
            <li className="flex gap-2.5"><BookOpenCheck className="mt-0.5 size-4 shrink-0 text-blue" />WGS, enrichment and some panels use <b>coverage-based</b> estimation; most panels use the <b>minimum number of clusters</b>; some products (e.g. TruSight Cancer) use a <b>defined number of samples</b> per instrument and kit.</li>
            <li className="flex gap-2.5"><BookOpenCheck className="mt-0.5 size-4 shrink-0 text-blue" />One cluster on a flow cell produces one read — even when sequencing paired-end. Cluster counts follow the published Illumina estimator tables; PacBio/ONT figures are typical per-cell outputs.</li>
          </ul>
        </div>
      </section>

      {/* cta */}
      <section className="bg-navy py-16">
        <div className="container-x text-center">
          <h2 className="h-section on-dark">Spec ready? <em className="grad-text">Let labs bid on it.</em></h2>
          <p className="mx-auto mt-4 max-w-xl text-[14px] leading-relaxed text-[#a2c1d7]">
            Post your estimated requirement as an RFQ — verified labs across Pakistan quote
            against the exact product, coverage and instrument plan you built here.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <span className="btn-wrap">
              <Link href="/dashboard/rfqs/new" className="btn-white">Submit an RFQ</Link>
            </span>
            <Link href="/registry" className="group inline-flex items-center gap-2 text-[14px] font-medium text-white/90 hover:text-white">
              Browse verified labs <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </section>

      <Footer />

      {/* print rules */}
      <style>{`
        @media print {
          header, footer, video, .glow-orb, .grid-lines { display: none !important; }
          main { background: #fff !important; }
          section { padding: 0.5rem 0 !important; }
          .card, .card-dark { box-shadow: none !important; }
          .card-dark { background: #fff !important; border: 1px solid #ddd !important; }
          .card-dark * { color: #111 !important; }
        }
      `}</style>
    </main>
  );
}
