export const instant = false

import { requireRole } from "@/lib/session";
import { PageHead } from "@/components/portal/ui";
import { SuppliesBrowse } from "@/components/marketplace/supplies";

export default async function LabSuppliesPage({ searchParams }: { searchParams: Promise<{ q?: string; cat?: string }> }) {
  const { q, cat } = await searchParams;
  const session = await requireRole("PROVIDER");
  return (
    <>
      <PageHead
        title="Supplies marketplace"
        sub="Verified indigenous suppliers — reagents, kits and consumables for your lab. Send an enquiry; the supplier replies with a price and lead time."
      />
      <SuppliesBrowse q={q} cat={cat} buyerId={session.user.id} basePath="/lab/supplies" />
    </>
  );
}
