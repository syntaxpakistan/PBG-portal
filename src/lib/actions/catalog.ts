"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getSession, assertCustomerApproved } from "@/lib/session";
import { notify } from "@/lib/notify";
import { rateLimit } from "@/lib/rate-limit";
import { getEnquiryRateLimit } from "@/lib/settings";

export async function createEnquiry(productId: string, formData: FormData) {
  const session = await getSession();
  if (!session || !["CUSTOMER", "PROVIDER"].includes(session.user.role ?? "")) redirect("/login");
  if (session.user.role === "CUSTOMER") await assertCustomerApproved(session.user.id);
  if (!rateLimit(`enquiry:${session.user.id}`, await getEnquiryRateLimit(), 24 * 3600e3)) {
    throw new Error("Too many enquiries — please try again tomorrow.");
  }
  const product = await prisma.product.findUniqueOrThrow({
    where: { id: productId },
    include: { supplier: { select: { userId: true } } },
  });
  const qty = Number(formData.get("qty") || 1);
  const message = String(formData.get("message") || "") || "—";
  // buyer org for context — supplier replies to a named counterparty
  const org = session.user.role === "PROVIDER"
    ? (await prisma.providerProfile.findUnique({ where: { userId: session.user.id }, select: { orgName: true } }))?.orgName
    : (await prisma.customerProfile.findUnique({ where: { userId: session.user.id }, select: { orgName: true } }))?.orgName;
  await prisma.enquiry.create({
    data: { productId, supplierId: product.supplierId, buyerId: session.user.id, qty, message },
  });
  await prisma.auditLog.create({
    data: { actorId: session.user.id, action: "ENQUIRY_SENT", entity: "Product", entityId: productId, meta: product.name },
  });
  await notify({
    toUserId: product.supplier.userId,
    subject: `New enquiry: ${product.name} × ${qty}`,
    body: `${session.user.name}${org ? ` (${org})` : ""} enquired about ${qty} × ${product.name}: "${message}". Reply with an offer from your supplier portal.`,
    href: "/supplier",
  });
  revalidatePath("/dashboard/marketplace");
  revalidatePath("/lab/supplies");
}
