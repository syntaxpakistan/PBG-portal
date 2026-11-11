export const instant = false;

import type { Metadata } from "next";
import { Landing } from "@/components/landing";
import { getPlanPrices } from "@/lib/settings";

export const metadata: Metadata = {
  title: "Pakistan Biotechnology Gateway — The national marketplace for biotech services",
  description:
    "A federated digital marketplace connecting Pakistan's researchers, universities, hospitals and agriculture sector with verified sequencing laboratories, bioinformatics providers and indigenous biotech suppliers — under one roof.",
};

export default async function GatewayLanding() {
  const prices = await getPlanPrices();
  return <Landing prices={prices} />;
}
