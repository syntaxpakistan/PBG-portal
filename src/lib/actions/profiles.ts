"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getSession, assertCustomerApproved } from "@/lib/session";
import { normalizeUrl } from "@/lib/utils";

export async function updateCustomerProfile(formData: FormData) {
  const session = await getSession();
  if (!session || session.user.role !== "CUSTOMER") throw new Error("Customers only");
  await assertCustomerApproved(session.user.id);
  const g = (k: string) => (String(formData.get(k) || "") || null);
  await prisma.customerProfile.upsert({
    where: { userId: session.user.id },
    update: {
      orgName: g("orgName"), orgType: g("orgType"), city: g("city"),
      address: g("address"), department: g("department"), designation: g("designation"),
    },
    create: {
      userId: session.user.id,
      orgName: g("orgName"), orgType: g("orgType"), city: g("city"),
      address: g("address"), department: g("department"), designation: g("designation"),
    },
  });
  const name = g("name");
  if (name) await prisma.user.update({ where: { id: session.user.id }, data: { name } });
  const phone = g("phone");
  if (phone) await prisma.user.update({ where: { id: session.user.id }, data: { phone } });
  revalidatePath("/dashboard/profile");
}

export async function updateProviderProfile(formData: FormData) {
  const session = await getSession();
  if (!session || session.user.role !== "PROVIDER") throw new Error("Providers only");
  const g = (k: string) => (String(formData.get(k) || "") || null);
  await prisma.providerProfile.update({
    where: { userId: session.user.id },
    data: {
      orgName: String(formData.get("orgName")),
      city: String(formData.get("city")),
      platforms: g("platforms") ?? "", sampleTypes: g("sampleTypes") ?? "",
      serviceCategories: g("serviceCategories") ?? "", hpcCapacity: g("hpcCapacity"),
      website: normalizeUrl(g("website")), accreditations: g("accreditations"),
      contactPerson: g("contactPerson"), bio: g("bio"),
      establishedYear: formData.get("establishedYear") ? Number(formData.get("establishedYear")) : null,
    },
  });
  revalidatePath("/lab/profile");
}

export async function updateSupplierProfile(formData: FormData) {
  const session = await getSession();
  if (!session || session.user.role !== "SUPPLIER") throw new Error("Suppliers only");
  const g = (k: string) => (String(formData.get(k) || "") || null);
  await prisma.supplierProfile.update({
    where: { userId: session.user.id },
    data: {
      orgName: String(formData.get("orgName")),
      city: String(formData.get("city")),
      categories: g("categories") ?? "", website: normalizeUrl(g("website")),
      contactPerson: g("contactPerson"), bio: g("bio"),
      establishedYear: formData.get("establishedYear") ? Number(formData.get("establishedYear")) : null,
    },
  });
  revalidatePath("/supplier");
}
