export const instant = false;

import { getAllPlanPricing } from "@/lib/settings";
import { JoinFlow } from "./join-flow";

export default async function BioGatewayPage() {
  const pricing = await getAllPlanPricing();
  return <JoinFlow pricing={pricing} />;
}
