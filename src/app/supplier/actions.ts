"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { assertPartnerActive } from "@/lib/entitlements";

export async function addProduct(formData: FormData) {
  const session = await getSession();
  if (!session || session.user.role !== "SUPPLIER") throw new Error("Suppliers only");
  const profile = await prisma.supplierProfile.findUniqueOrThrow({ where: { userId: session.user.id } });
  if (profile.status !== "APPROVED") throw new Error("Not verified");
  await assertPartnerActive(session.user.id);
  await prisma.product.create({
    data: {
      supplierId: profile.id,
      name: String(formData.get("name")),
      category: String(formData.get("category")),
      spec: String(formData.get("spec") || "") || null,
      catalogNo: String(formData.get("catalogNo") || "") || null,
      price: formData.get("price") ? Number(formData.get("price")) : null,
      unit: String(formData.get("unit") || "") || null,
      stockStatus: String(formData.get("stockStatus") || "IN_STOCK"),
      leadTimeDays: formData.get("leadTimeDays") ? Number(formData.get("leadTimeDays")) : null,
    },
  });
  await prisma.auditLog.create({
    data: { actorId: session.user.id, action: "PRODUCT_LISTED", entity: "Product", entityId: profile.id, meta: String(formData.get("name")) },
  });
}

function productData(formData: FormData) {
  return {
    name: String(formData.get("name")),
    category: String(formData.get("category")),
    spec: String(formData.get("spec") || "") || null,
    catalogNo: String(formData.get("catalogNo") || "") || null,
    price: formData.get("price") ? Number(formData.get("price")) : null,
    unit: String(formData.get("unit") || "") || null,
    stockStatus: String(formData.get("stockStatus") || "IN_STOCK"),
    leadTimeDays: formData.get("leadTimeDays") ? Number(formData.get("leadTimeDays")) : null,
  };
}

export async function updateProduct(productId: string, formData: FormData) {
  const session = await getSession();
  if (!session || session.user.role !== "SUPPLIER") throw new Error("Suppliers only");
  const profile = await prisma.supplierProfile.findUniqueOrThrow({ where: { userId: session.user.id } });
  await assertPartnerActive(session.user.id);
  const product = await prisma.product.findUniqueOrThrow({ where: { id: productId } });
  if (product.supplierId !== profile.id) throw new Error("Not your product");
  await prisma.product.update({ where: { id: productId }, data: productData(formData) });
  await prisma.auditLog.create({
    data: { actorId: session.user.id, action: "PRODUCT_UPDATED", entity: "Product", entityId: productId, meta: String(formData.get("name")) },
  });
}
