"use server";

import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";
import { requireRole } from "@/lib/session";

/** Where public lead forms are delivered. */
const LEAD_INBOXES = {
  QUOTE: "info@syntaxpakistan.com",
  CONTACT: "contact@syntaxpakistan.com",
} as const;

export type LeadResult = { ok: boolean; error?: string };

export async function submitLead(_prev: LeadResult | null, formData: FormData): Promise<LeadResult> {
  const type = formData.get("type") === "CONTACT" ? "CONTACT" : "QUOTE";
  const firstName = String(formData.get("firstName") ?? "").trim();
  const lastName = String(formData.get("lastName") ?? "").trim();
  const org = String(formData.get("org") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const interest = String(formData.get("interest") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim();

  // honeypot — bots fill this hidden field
  if (String(formData.get("website") ?? "").trim()) return { ok: true };

  if (!firstName || !/^\S+@\S+\.\S+$/.test(email)) {
    return { ok: false, error: "Please provide your name and a valid work email." };
  }
  if (type === "CONTACT" && !message) {
    return { ok: false, error: "Please write a short message." };
  }

  const lead = await prisma.lead.create({
    data: { type, firstName, lastName: lastName || null, org: org || null, email, interest: interest || null, message: message || null },
  });

  const name = `${firstName} ${lastName}`.trim();
  const subject =
    type === "QUOTE"
      ? `Quote request — ${interest || "General enquiry"} — ${name}`
      : `Contact message — ${name}`;
  const body = [
    `New ${type === "QUOTE" ? "quote request" : "contact message"} on pbg-teal.vercel.app`,
    "",
    `Name:         ${name}`,
    `Email:        ${email}`,
    `Organization: ${org || "—"}`,
    `Interest:     ${interest || "—"}`,
    message ? `Message:\n${message}` : null,
    "",
    `Lead ID: ${lead.id} — view in /admin/leads`,
  ]
    .filter(Boolean)
    .join("\n");

  try {
    await sendEmail({ to: LEAD_INBOXES[type], subject, text: body });
  } catch (e) {
    console.error("[lead] email delivery failed:", e);
  }

  const admins = await prisma.user.findMany({ where: { role: "ADMIN" }, select: { id: true } });
  if (admins.length) {
    await prisma.notification.createMany({
      data: admins.map((a) => ({
        userId: a.id,
        subject,
        body: `${email}${org ? ` · ${org}` : ""}${interest ? ` · ${interest}` : ""}`,
        href: "/admin/leads",
      })),
    });
  }

  return { ok: true };
}

export async function markLeadHandled(leadId: string) {
  await requireRole("ADMIN");
  await prisma.lead.update({ where: { id: leadId }, data: { handled: true } });
}
