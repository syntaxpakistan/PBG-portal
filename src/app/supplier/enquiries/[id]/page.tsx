export const instant = false

import { requireRole } from "@/lib/session";
import { EnquiryDetail } from "@/components/marketplace/enquiry-detail";

export default async function SupplierEnquiryDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await requireRole("SUPPLIER");
  return <EnquiryDetail id={id} self={{ id: session.user.id, role: "SUPPLIER" }} />;
}
