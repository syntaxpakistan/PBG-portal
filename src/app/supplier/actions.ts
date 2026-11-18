"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { nextRef } from "@/lib/refs";
import { assertPartnerActive } from "@/lib/entitlements";
import { saveUpload } from "@/lib/files";
import { revalidatePath } from "next/cache";

async function uploadIfPresent(formData: FormData, field: string): Promise<string | null> {
  const file = formData.get(field);
  if (!(file instanceof File) || file.size === 0) return null;
  const saved = await saveUpload(file);
  return saved.key;
}

async function requireSupplier() {
  const session = await getSession();
  if (!session || session.user.role !== "SUPPLIER") throw new Error("Suppliers only");
  const profile = await prisma.supplierProfile.findUniqueOrThrow({ where: { userId: session.user.id } });
  if (profile.status !== "APPROVED") throw new Error("Not verified");
  await assertPartnerActive(session.user.id);
  return { session, profile };
}

function productData(formData: FormData) {
  return {
    name: String(formData.get("name")),
    category: String(formData.get("category")),
    spec: String(formData.get("spec") || "") || null,
    description: String(formData.get("description") || "") || null,
    brand: String(formData.get("brand") || "") || null,
    catalogNo: String(formData.get("catalogNo") || "") || null,
    price: formData.get("price") ? Number(formData.get("price")) : null,
    unit: String(formData.get("unit") || "") || null,
    stockStatus: String(formData.get("stockStatus") || "IN_STOCK"),
    leadTimeDays: formData.get("leadTimeDays") ? Number(formData.get("leadTimeDays")) : null,
  };
}

export async function addProduct(formData: FormData) {
  const { session, profile } = await requireSupplier();
  const imageKey = await uploadIfPresent(formData, "image");
  const datasheetKey = await uploadIfPresent(formData, "datasheet");
  await prisma.product.create({
    data: {
      prodNo: await nextRef("PRD"),
      supplierId: profile.id,
      ...productData(formData),
      imageKey,
      datasheetKey,
      moderation: "PENDING",
    },
  });
  await prisma.auditLog.create({
    data: { actorId: session.user.id, action: "PRODUCT_LISTED", entity: "Product", entityId: profile.id, meta: String(formData.get("name")) },
  });
  revalidatePath("/supplier");
  revalidatePath("/supplier/products");
}

export async function updateProduct(productId: string, formData: FormData) {
  const { session, profile } = await requireSupplier();
  const product = await prisma.product.findUniqueOrThrow({ where: { id: productId } });
  if (product.supplierId !== profile.id) throw new Error("Not your product");
  const imageKey = await uploadIfPresent(formData, "image");
  const datasheetKey = await uploadIfPresent(formData, "datasheet");
  const data = productData(formData);
  // content edits go back through moderation; price/stock-only tweaks stay live
  const contentChanged =
    data.name !== product.name || data.category !== product.category ||
    data.spec !== product.spec || data.description !== product.description ||
    data.brand !== product.brand || !!imageKey || !!datasheetKey;
  await prisma.product.update({
    where: { id: productId },
    data: {
      ...data,
      ...(imageKey ? { imageKey } : {}),
      ...(datasheetKey ? { datasheetKey } : {}),
      ...(contentChanged ? { moderation: "PENDING", moderationNote: null } : {}),
    },
  });
  await prisma.auditLog.create({
    data: { actorId: session.user.id, action: "PRODUCT_UPDATED", entity: "Product", entityId: productId, meta: data.name },
  });
  revalidatePath("/supplier");
  revalidatePath("/supplier/products");
}

// hide a listing without deleting its enquiry history; re-show restores it
// (returned to the live catalogue only if it was already approved)
export async function setProductActive(productId: string, active: boolean) {
  const { session, profile } = await requireSupplier();
  const product = await prisma.product.findUniqueOrThrow({ where: { id: productId } });
  if (product.supplierId !== profile.id) throw new Error("Not your product");
  await prisma.product.update({ where: { id: productId }, data: { active } });
  await prisma.auditLog.create({
    data: { actorId: session.user.id, action: active ? "PRODUCT_REACTIVATED" : "PRODUCT_HIDDEN", entity: "Product", entityId: productId, meta: product.name },
  });
  revalidatePath("/supplier");
  revalidatePath("/supplier/products");
}

// permanent delete, only when the product has no enquiry/order history
// (enquiries cascade on delete, so history-carrying products must be hidden instead)
export async function deleteProduct(productId: string) {
  const { session, profile } = await requireSupplier();
  const product = await prisma.product.findUniqueOrThrow({
    where: { id: productId },
    include: { _count: { select: { enquiries: true } } },
  });
  if (product.supplierId !== profile.id) throw new Error("Not your product");
  if (product._count.enquiries > 0) throw new Error("This product has enquiry/order history, hide it instead of deleting");
  await prisma.product.delete({ where: { id: productId } });
  await prisma.auditLog.create({
    data: { actorId: session.user.id, action: "PRODUCT_DELETED", entity: "Product", entityId: productId, meta: product.name },
  });
  revalidatePath("/supplier");
  revalidatePath("/supplier/products");
}
