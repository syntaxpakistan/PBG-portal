export type ComplaintChannel = "CUSTOMER" | "PROVIDER";

export const PROVIDER_ROLES = ["PROVIDER", "SUPPLIER"];

// who sits on each side of a complaint — the project's two parties, the
// enquiry's buyer + supplier, or the filer alone when nothing is attached
export function complaintParties(c: {
  projectId: string | null;
  enquiryId?: string | null;
  filedById: string;
  filerRole?: string | null;
  project?: { customerId: string; providerUserId: string } | null;
  enquiry?: { buyerId: string; supplierUserId: string } | null;
}) {
  const filerIsProvider = PROVIDER_ROLES.includes(c.filerRole ?? "");
  return {
    customerUserId: c.project?.customerId ?? c.enquiry?.buyerId ?? (filerIsProvider ? null : c.filedById),
    providerUserId: c.project?.providerUserId ?? c.enquiry?.supplierUserId ?? (filerIsProvider ? c.filedById : null),
  };
}
