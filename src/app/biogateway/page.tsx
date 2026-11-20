export const instant = false;

import { getAllPlanPricing } from "@/lib/settings";
import { JoinFlow } from "./join-flow";

export default async function BioGatewayPage({ searchParams }: { searchParams: Promise<{ role?: string; plan?: string; error?: string }> }) {
  const [pricing, sp] = await Promise.all([getAllPlanPricing(), searchParams]);
  return <JoinFlow pricing={pricing} role={sp.role} plan={sp.plan} error={sp.error} />;
}
