export const instant = false

import { PageHead } from "@/components/portal/ui";
import { SeqCalculator } from "@/components/seq-calculator";
import { decodeEst, type EstInput } from "@/lib/coverage";

export const metadata = {
  title: "Coverage calculator — Laboratory portal",
};

export default async function LabCalculatorPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const initial: EstInput = decodeEst(await searchParams);
  return (
    <div>
      <PageHead
        title="Sequencing coverage estimator"
        sub="Check what an RFQ's coverage target means on your platforms — runs per sample and samples per run."
      />
      <SeqCalculator initial={initial} cta="none" />
    </div>
  );
}
