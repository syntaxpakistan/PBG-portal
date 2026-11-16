export const instant = false

import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";
import { StatusBadge, PageHead } from "@/components/portal/ui";
import { SubscriptionCard } from "@/components/portal/subscription-card";
import { SupplierProfileForm } from "../profile-form";
import { StorefrontLink } from "../product-form";

export default async function SupplierProfilePage() {
  const session = await requireRole("SUPPLIER");
  const profile = await prisma.supplierProfile.findUnique({
    where: { userId: session.user.id },
    include: { user: { select: { subscription: true } } },
  });
  if (!profile) notFound();

  return (
    <>
      <PageHead
        title="Profile"
        sub="Your public storefront details, contact info and payout bank account."
        action={<div className="flex items-center gap-2"><StatusBadge status={profile.status} />{profile.status === "APPROVED" && <StorefrontLink supplierId={profile.id} />}</div>}
      />
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="card p-5">
          <h3 className="mb-4 text-[14px] font-semibold text-ink">Company profile</h3>
          <SupplierProfileForm profile={profile} />
        </div>
        <SubscriptionCard sub={profile.user.subscription} isSupplier />
      </div>
    </>
  );
}
