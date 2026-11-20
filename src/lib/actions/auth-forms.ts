"use server";

import { headers, cookies } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { PLANS } from "@/lib/plans";
import { createOrgProfileFor } from "./onboarding";

const DEST: Record<string, string> = {
  ADMIN: "/admin",
  PROVIDER: "/lab",
  SUPPLIER: "/supplier",
  CUSTOMER: "/dashboard",
};

/** Copies auth cookies onto the server-action response so JS-free logins/signups get a session.
    Attributes are forwarded too — a __Secure- cookie without Secure is rejected by browsers. */
async function forwardCookies(resHeaders: Headers) {
  const list = typeof resHeaders.getSetCookie === "function"
    ? resHeaders.getSetCookie()
    : (resHeaders.get("set-cookie") ?? "").split(/,(?=\s*[^;,\s]+=)/);
  const jar = await cookies();
  for (const c of list) {
    const parts = c.split(";").map((s) => s.trim());
    const eq = parts[0].indexOf("=");
    if (eq < 1) continue;
    const maxAge = parts.find((p) => /^max-age=/i.test(p))?.split("=")[1];
    const sameSite = parts.find((p) => /^samesite=/i.test(p))?.split("=")[1]?.toLowerCase();
    const raw = parts[0].slice(eq + 1);
    let value = raw;
    try { value = decodeURIComponent(raw); } catch { /* keep raw */ }
    jar.set(parts[0].slice(0, eq), value, {
      path: "/",
      httpOnly: parts.some((p) => /^httponly$/i.test(p)),
      secure: parts.some((p) => /^secure$/i.test(p)),
      sameSite: (sameSite === "strict" || sameSite === "none" ? sameSite : "lax") as "lax" | "strict" | "none",
      ...(maxAge ? { maxAge: Number(maxAge) } : {}),
    });
  }
}

const err = (e: unknown, fallback: string) =>
  (e as { body?: { message?: string }; message?: string })?.body?.message ?? (e as Error)?.message ?? fallback;

export async function joinAction(formData: FormData) {
  const role = String(formData.get("role") ?? "");
  const plan = String(formData.get("plan") ?? "");
  const backTo = (errMsg: string) =>
    `/biogateway?role=${role}&plan=${plan}&error=${encodeURIComponent(errMsg)}`;
  if (!["CUSTOMER", "PROVIDER", "SUPPLIER"].includes(role)) redirect("/biogateway?error=Choose+how+you+will+use+the+Gateway");
  if (role !== "CUSTOMER" && !(plan in PLANS)) redirect(backTo("Please choose a plan"));

  const str = (k: string) => {
    const v = formData.get(k);
    const s = v ? String(v).trim() : "";
    return s || undefined;
  };
  const email = str("email") ?? "";
  const password = str("password") ?? "";
  if (role !== "CUSTOMER" && (!str("orgName") || !str("city"))) {
    redirect(backTo("Organization name and city are required"));
  }

  let res;
  try {
    res = await auth.api.signUpEmail({
      body: { name: str("name") ?? "", email, password, role, phone: str("phone") },
      headers: await headers(),
      returnHeaders: true,
    });
  } catch (e) {
    redirect(backTo(err(e, "Could not create account")));
  }

  const userId = (res.response as { user?: { id?: string } })?.user?.id;
  if (userId) {
    try {
      await createOrgProfileFor({
        userId,
        role,
        orgName: str("orgName") ?? "",
        city: str("city") ?? "",
        platforms: str("platforms"),
        sampleTypes: str("sampleTypes"),
        serviceCategories: str("serviceCategories"),
        hpcCapacity: str("hpcCapacity"),
        categories: str("categories"),
        bio: str("bio"),
        website: str("website"),
        establishedYear: str("establishedYear") ? Number(str("establishedYear")) : undefined,
        accreditations: str("accreditations"),
        contactPerson: str("contactPerson"),
        orgType: str("orgType"),
        department: str("department"),
        designation: str("designation"),
        address: str("address"),
        plan: plan || undefined,
      });
    } catch (e) {
      redirect(backTo(err(e, "Account created but profile setup failed, please sign in")));
    }
  }

  await forwardCookies(res.headers);
  redirect(DEST[role] ?? "/dashboard");
}

export async function loginAction(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  let res;
  try {
    res = await auth.api.signInEmail({
      body: { email, password },
      headers: await headers(),
      returnHeaders: true,
    });
  } catch (e) {
    redirect(`/login?error=${encodeURIComponent(err(e, "Invalid email or password"))}`);
  }

  await forwardCookies(res.headers);
  const resp = res.response as { twoFactorRedirect?: boolean; user?: { role?: string } };
  if (resp.twoFactorRedirect) redirect("/verify-2fa");
  redirect(DEST[resp.user?.role ?? "CUSTOMER"] ?? "/dashboard");
}

export async function forgotAction(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  try {
    await auth.api.requestPasswordReset({
      body: { email, redirectTo: "/reset-password" },
      headers: await headers(),
    });
  } catch {
    // never leak whether an account exists
  }
  redirect("/forgot-password?sent=1");
}
