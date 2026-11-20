export const instant = false;

import { getAllPlanPricing } from "@/lib/settings";
import { JoinFlow } from "./join-flow";

export default async function BioGatewayPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const [pricing, sp] = await Promise.all([getAllPlanPricing(), searchParams]);
  return <JoinFlow pricing={pricing} error={sp.error} />;
}
