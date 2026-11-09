/**
 * Transactional email via Resend. Falls back to console logging when
 * RESEND_API_KEY is not configured, so dev environments keep working.
 */
export async function sendEmail(opts: { to: string; subject: string; text?: string; html?: string }) {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    console.log(`[email→${opts.to}] ${opts.subject}`);
    return;
  }
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: process.env.MAIL_FROM ?? "Pakistan Biotechnology Gateway <noreply@biogateway.pk>",
      to: opts.to,
      subject: opts.subject,
      text: opts.text,
      html: opts.html,
    }),
  });
  if (!res.ok) throw new Error(`Resend ${res.status}: ${await res.text()}`);
}
