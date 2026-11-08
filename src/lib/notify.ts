import { prisma } from "@/lib/prisma";

/**
 * Transactional notifications. Always persisted in-app (bell feed); sends a
 * copy via Resend when RESEND_API_KEY is set; otherwise logs to audit trail.
 */
export async function notify(opts: { toUserId: string; subject: string; body: string; href?: string }) {
  const user = await prisma.user.findUnique({ where: { id: opts.toUserId }, select: { email: true, name: true } });
  if (!user) return;

  await prisma.notification.create({
    data: { userId: opts.toUserId, subject: opts.subject, body: opts.body, href: opts.href ?? null },
  });

  const key = process.env.RESEND_API_KEY;
  if (key) {
    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          from: process.env.MAIL_FROM ?? "Pakistan Biotechnology Gateway <noreply@biogateway.pk>",
          to: user.email,
          subject: opts.subject,
          text: `Assalam-o-alaikum ${user.name},\n\n${opts.body}\n\n— Pakistan Biotechnology Gateway (Syntax of Life)`,
        }),
      });
      if (!res.ok) throw new Error(await res.text());
      return;
    } catch (e) {
      console.error("[notify] Resend failed:", e);
    }
  }
  console.log(`[notify→${user.email}] ${opts.subject} — ${opts.body}`);
  await prisma.auditLog.create({
    data: {
      actorId: opts.toUserId,
      action: "NOTIFICATION",
      entity: "User",
      entityId: opts.toUserId,
      meta: `${opts.subject} → ${user.email}`,
    },
  });
}

// fan-out to every admin — moderation queues, escalations
export async function notifyAllAdmins(subject: string, body: string, href?: string) {
  const admins = await prisma.user.findMany({ where: { role: "ADMIN" }, select: { id: true } });
  for (const a of admins) await notify({ toUserId: a.id, subject, body, href });
}
