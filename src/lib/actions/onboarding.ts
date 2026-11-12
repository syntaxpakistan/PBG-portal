"use server";

import { prisma } from "@/lib/prisma";
import { PLANS, type PlanKey } from "@/lib/plans";
import { issueInvoice } from "@/lib/actions/billing";
import { getInvoiceDueDays, getPlanPrice } from "@/lib/settings";
import type { Plan } from "@prisma/client";
import { normalizeUrl } from "@/lib/utils";
import { notifyAllAdmins } from "@/lib/notify";

export async function createOrgProfile(input: {
  userId: string;
  role: string;
  orgName: string;
  city: string;
  platforms?: string;
  sampleTypes?: string;
  serviceCategories?: string;
  hpcCapacity?: string;
  categories?: string;
  bio?: string;
  website?: string;
  establishedYear?: number;
  accreditations?: string;
  contactPerson?: string;
  orgType?: string;
  department?: string;
  designation?: string;
  address?: string;
  plan?: string;
}) {
  const planKey = (input.plan && input.plan in PLANS ? input.plan : "BASIC") as PlanKey;
  const planPrice = await getPlanPrice(planKey);
  const dueIn = (await getInvoiceDueDays()) * 864e5;

  if (input.role === "PROVIDER") {
    await prisma.providerProfile.create({
      data: {
        userId: input.userId,
        orgName: input.orgName,
        city: input.city,
        platforms: input.platforms ?? "",
        sampleTypes: input.sampleTypes ?? "",
        serviceCategories: input.serviceCategories ?? "",
        hpcCapacity: input.hpcCapacity,
        website: normalizeUrl(input.website),
        establishedYear: input.establishedYear,
        accreditations: input.accreditations,
        contactPerson: input.contactPerson,
        bio: input.bio,
      },
    });
    const sub = await prisma.subscription.create({
      data: { userId: input.userId, plan: planKey as Plan, priceUsd: planPrice },
    });
    await issueInvoice({
      billedUserId: input.userId,
      issuerType: "PLATFORM",
      subscriptionId: sub.id,
      currency: "USD",
      dueAt: new Date(Date.now() + dueIn),
      note: `${PLANS[planKey].label} plan — first billing cycle`,
      items: [{ description: `Gateway ${PLANS[planKey].label} subscription — monthly`, unitPrice: planPrice }],
    });
  } else if (input.role === "SUPPLIER") {
    await prisma.supplierProfile.create({
      data: {
        userId: input.userId,
        orgName: input.orgName,
        city: input.city,
        categories: input.categories ?? "",
        website: normalizeUrl(input.website),
        establishedYear: input.establishedYear,
        contactPerson: input.contactPerson,
        bio: input.bio,
      },
    });
    const sub = await prisma.subscription.create({
      data: { userId: input.userId, plan: planKey as Plan, priceUsd: planPrice },
    });
    await issueInvoice({
      billedUserId: input.userId,
      issuerType: "PLATFORM",
      subscriptionId: sub.id,
      currency: "USD",
      dueAt: new Date(Date.now() + dueIn),
      note: `${PLANS[planKey].label} plan — first billing cycle`,
      items: [{ description: `Gateway ${PLANS[planKey].label} subscription — monthly`, unitPrice: planPrice }],
    });
  } else if (input.role === "CUSTOMER") {
    await prisma.customerProfile.create({
      data: {
        userId: input.userId,
        orgName: input.orgName || null,
        orgType: input.orgType,
        city: input.city,
        address: input.address,
        department: input.department,
        designation: input.designation,
      },
    });
    // customers are free but must be approved by an admin before the portal unlocks
    await notifyAllAdmins(
      "New client registration — approval needed",
      `${input.orgName || "A new client"} signed up and is waiting in the verification queue.`,
      "/admin/verification"
    );
  }
}
