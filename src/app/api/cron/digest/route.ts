import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";
import { notifyAllAdmins } from "@/lib/notify";

/**
 * Weekly Monday-morning digest (Vercel Cron): last-7-days marketplace activity
 * + open queues, emailed to every admin and mirrored in-app.
 * Secure with CRON_SECRET — Vercel injects it automatically when configured.
 */
export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (secret && req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const weekAgo = new Date(Date.now() - 7 * 86400e3);
  const [
    fees, gmv, newUsers, newRfqs, newQuotes, newProjects, payments,
    verifyPend, modRfqs, modListings, leadsPend, complaintsPend, payPend,
    admins,
  ] = await Promise.all([
    prisma.transaction.aggregate({ where: { status: "PAID", createdAt: { gte: weekAgo } }, _sum: { feeAmount: true } }),
    prisma.transaction.aggregate({ where: { status: { in: ["INVOICED", "PAID"] }, createdAt: { gte: weekAgo } }, _sum: { quotedValue: true } }),
    prisma.user.count({ where: { createdAt: { gte: weekAgo } } }),
    prisma.rfq.count({ where: { createdAt: { gte: weekAgo } } }),
    prisma.quote.count({ where: { createdAt: { gte: weekAgo } } }),
    prisma.project.count({ where: { createdAt: { gte: weekAgo } } }),
    prisma.payment.count({ where: { status: "CONFIRMED", confirmedAt: { gte: weekAgo } } }),
    prisma.providerProfile.count({ where: { status: "PENDING" } }).then(async (n) => n + (await prisma.supplierProfile.count({ where: { status: "PENDING" } }))),
    prisma.rfq.count({ where: { visibility: "BOARD", moderation: "PENDING" } }),
    prisma.serviceListing.count({ where: { moderation: "PENDING" } }),
    prisma.lead.count({ where: { handled: false } }),
    prisma.complaint.count({ where: { status: { in: ["OPEN", "IN_REVIEW"] } } }),
    prisma.payment.count({ where: { status: "PENDING" } }),
    prisma.user.findMany({ where: { role: "ADMIN" }, select: { email: true, name: true } }),
  ]);

  const money = (n: number) => `PKR ${Math.round(n).toLocaleString()}`;
  const open = verifyPend + modRfqs + modListings + leadsPend + complaintsPend + payPend;
  const subject = `Weekly digest — ${money(fees._sum.feeAmount ?? 0)} fees · ${open} items need action`;
  const body = [
    `Last 7 days on the Gateway:`,
    ``,
    `  Fees collected:      ${money(fees._sum.feeAmount ?? 0)}`,
    `  Marketplace volume:  ${money(gmv._sum.quotedValue ?? 0)}`,
    `  New users:           ${newUsers}`,
    `  New RFQs:            ${newRfqs}`,
    `  Quotes submitted:    ${newQuotes}`,
    `  Projects started:    ${newProjects}`,
    `  Payments confirmed:  ${payments}`,
    ``,
    `Needs your attention:`,
    ``,
    `  Verifications:       ${verifyPend}`,
    `  Moderation queue:    ${modRfqs + modListings}`,
    `  Payments to confirm: ${payPend}`,
    `  Unhandled leads:     ${leadsPend}`,
    `  Open complaints:     ${complaintsPend}`,
  ].join("\n");

  let emailed = 0;
  for (const a of admins) {
    try {
      await sendEmail({ to: a.email, subject, text: `Assalam-o-alaikum ${a.name},\n\n${body}\n\n— Pakistan Biotechnology Gateway` });
      emailed++;
    } catch (e) {
      console.error(`[digest] email to ${a.email} failed:`, e);
    }
  }
  await notifyAllAdmins(subject, body, "/admin/reports");

  return NextResponse.json({ ok: true, emailed, open });
}
