"use server";

import { prisma } from "@/lib/prisma";
import { PLANS, type PlanKey } from "@/lib/plans";
import type { Plan } from "@prisma/client";

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
        website: input.website,
        establishedYear: input.establishedYear,
        accreditations: input.accreditations,
        contactPerson: input.contactPerson,
        bio: input.bio,
      },
    });
    await prisma.subscription.create({
      data: { userId: input.userId, plan: planKey as Plan, priceUsd: PLANS[planKey].price },
    });
  } else if (input.role === "SUPPLIER") {
    await prisma.supplierProfile.create({
      data: {
        userId: input.userId,
        orgName: input.orgName,
        city: input.city,
        categories: input.categories ?? "",
        website: input.website,
        establishedYear: input.establishedYear,
        contactPerson: input.contactPerson,
        bio: input.bio,
      },
    });
    await prisma.subscription.create({
      data: { userId: input.userId, plan: planKey as Plan, priceUsd: PLANS[planKey].price },
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
  }
}
