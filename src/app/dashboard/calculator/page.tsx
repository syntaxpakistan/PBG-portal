export const instant = false

import { PageHead } from "@/components/portal/ui";
import { SeqCalculator } from "@/components/seq-calculator";
import { decodeEst, type EstInput } from "@/lib/coverage";

export const metadata = {
  title: "Coverage calculator — Client portal",
};

export default async function DashboardCalculatorPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const initial: EstInput = decodeEst(await searchParams);
  return (
    <div>
      <PageHead
        title="Sequencing coverage estimator"
        sub="Work out the reads, output and run units your project needs — then send the spec straight into an RFQ."
      />
      <SeqCalculator initial={initial} cta="rfq" />
    </div>
  );
}
