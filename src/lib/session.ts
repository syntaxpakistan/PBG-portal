import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import { auth } from "@/lib/auth";
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
