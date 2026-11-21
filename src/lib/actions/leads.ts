"use server";

import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";
import { nextRef } from "@/lib/refs";
import { requireRole } from "@/lib/session";
import { rateLimit } from "@/lib/rate-limit";

/** Where public lead forms are delivered. */
const LEAD_INBOXES = {
  QUOTE: "info@biotechnologygateway.com",
  CONTACT: "contact@biotechnologygateway.com",
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

  // honeypot, bots fill this hidden field
  if (String(formData.get("website") ?? "").trim()) return { ok: true };
  // spam brake, a few submissions per address per day is plenty
  if (email && !rateLimit(`lead:${email}`, 3, 24 * 3600e3)) {
    return { ok: false, error: "Too many submissions, please try again later or email us directly." };
  }

  if (!firstName || !/^\S+@\S+\.\S+$/.test(email)) {
    return { ok: false, error: "Please provide your name and a valid work email." };
  }
  if (type === "CONTACT" && !message) {
    return { ok: false, error: "Please write a short message." };
  }

  const lead = await prisma.lead.create({
    data: { leadNo: await nextRef("LED"), type, firstName, lastName: lastName || null, org: org || null, email, interest: interest || null, message: message || null },
  });

  const name = `${firstName} ${lastName}`.trim();
  const subject =
    type === "QUOTE"
      ? `Quote request, ${interest || "General enquiry"}, ${name}`
      : `Contact message, ${name}`;
  const body = [
    `New ${type === "QUOTE" ? "quote request" : "contact message"} on pbg-teal.vercel.app`,
    "",
    `Name:         ${name}`,
    `Email:        ${email}`,
    `Organization: ${org || "—"}`,
    `Interest:     ${interest || "—"}`,
    message ? `Message:\n${message}` : null,
    "",
    `Lead ID: ${lead.id}, view in /admin/leads`,
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
        href: `/admin/leads?q=${lead.leadNo}`,
      })),
    });
  }

  return { ok: true };
}

/** Matches notifications raised for a lead — new format by ref, old
    format (plain /admin/leads link) by email in the body. */
const leadNotifWhere = (lead: { leadNo: string; email: string }) => ({
  OR: [
    { href: `/admin/leads?q=${lead.leadNo}` },
    { href: "/admin/leads", body: { startsWith: lead.email } },
  ],
});

export async function markLeadHandled(leadId: string) {
  await requireRole("ADMIN");
  const lead = await prisma.lead.update({ where: { id: leadId }, data: { handled: true } });
  await prisma.notification.updateMany({ where: { readAt: null, ...leadNotifWhere(lead) }, data: { readAt: new Date() } });
}

export async function deleteLead(leadId: string) {
  const session = await requireRole("ADMIN");
  const lead = await prisma.lead.delete({ where: { id: leadId } });
  await prisma.notification.deleteMany({ where: leadNotifWhere(lead) });
  await prisma.auditLog.create({
    data: { actorId: session.user.id, action: "LEAD_DELETED", entity: "Lead", entityId: leadId, meta: `${lead.leadNo} <${lead.email}>` },
  });
}
