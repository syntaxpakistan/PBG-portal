import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { Role } from "@prisma/client";

export const getSession = cache(async () => {
  const session = await auth.api.getSession({ headers: await headers() });
  return session;
});

export async function requireRole(...roles: Role[]) {
  const session = await getSession();
  if (!session) redirect("/login");
  const role = (session.user as { role?: string }).role as Role | undefined;
  if (!role || !roles.includes(role)) {
    // send each role to its own portal
    const dest =
      role === "ADMIN" ? "/admin" :
      role === "PROVIDER" ? "/lab" :
      role === "SUPPLIER" ? "/supplier" : "/dashboard";
    redirect(dest);
  }
  return session;
}

/** blocks customer actions until an admin approves the registration (verification queue) */
export async function assertCustomerApproved(userId: string) {
  const profile = await prisma.customerProfile.findUnique({ where: { userId }, select: { status: true } });
  if (!profile || profile.status !== "APPROVED") {
    throw new Error("Your account is awaiting admin approval — the client portal unlocks once Syntax verifies your registration.");
  }
}
