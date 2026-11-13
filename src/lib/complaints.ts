export type ComplaintChannel = "CUSTOMER" | "PROVIDER";

export const PROVIDER_ROLES = ["PROVIDER", "SUPPLIER"];

// who sits on each side of a complaint — the project's two parties, or the
// filer alone when no project is attached
export function complaintParties(c: {
  projectId: string | null;
  filedById: string;
  filerRole?: string | null;
  project?: { customerId: string; providerUserId: string } | null;
}) {
  const filerIsProvider = PROVIDER_ROLES.includes(c.filerRole ?? "");
  return {
    customerUserId: c.project?.customerId ?? (filerIsProvider ? null : c.filedById),
    providerUserId: c.project?.providerUserId ?? (filerIsProvider ? c.filedById : null),
  };
}
