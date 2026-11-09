import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { notify, notifyAllAdmins } from "@/lib/notify";
import { getGraceDays } from "@/lib/settings";

function billingHrefFor(role: string) {
  return role === "PROVIDER" ? "/lab/billing" : role === "SUPPLIER" ? "/supplier/billing" : "/dashboard/billing";
}

/**
 * Daily sweep (Vercel Cron): expire subscriptions past paid-through + grace,
 * warn partners entering grace, and age overdue invoices.
 * Secure with CRON_SECRET — Vercel injects it automatically when configured.
 */
export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (secret && req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const graceMs = (await getGraceDays()) * 864e5;
  const results = { expired: 0, graceWarned: 0, invoicesAged: 0 };

  // ACTIVE subs past expiresAt but inside grace → warn once (renewRequestedAt doubles as the warn flag's sibling — use audit check via expiresAt proximity)
  const inGrace = await prisma.subscription.findMany({
    where: {
      status: "ACTIVE",
      expiresAt: { not: null, lte: now, gt: new Date(now.getTime() - graceMs) },
    },
    include: { user: { select: { name: true, email: true, role: true } } },
  });
  for (const sub of inGrace) {
    // warn only in the last 3 days of grace to avoid daily spam — approximated by expiresAt age
    const graceLeft = (sub.expiresAt!.getTime() + graceMs - now.getTime()) / 864e5;
    // warn once per expiry cycle — skip if we already notified after this expiry date
    const alreadyWarned = await prisma.notification.findFirst({
      where: {
        userId: sub.userId,
        subject: { startsWith: "Subscription payment overdue" },
        createdAt: { gte: sub.expiresAt! },
      },
      select: { id: true },
    });
    if (graceLeft <= 3 && !alreadyWarned) {
      await notify({
        toUserId: sub.userId,
        subject: `Subscription payment overdue — ${sub.plan} plan`,
        body: `Your ${sub.plan} plan expired on ${sub.expiresAt!.toLocaleDateString()}. Paid features pause in ${Math.ceil(graceLeft)} day(s) unless payment is confirmed. Settle it under Billing.`,
        href: billingHrefFor(sub.user.role),
      });
      results.graceWarned++;
    }
  }

  // ACTIVE subs past expiresAt + grace → EXPIRED
  const toExpire = await prisma.subscription.findMany({
    where: {
      status: "ACTIVE",
      expiresAt: { not: null, lte: new Date(now.getTime() - graceMs) },
    },
    select: { id: true, userId: true, plan: true, user: { select: { role: true } } },
  });
  for (const sub of toExpire) {
    await prisma.subscription.update({ where: { id: sub.id }, data: { status: "EXPIRED" } });
    await notify({
      toUserId: sub.userId,
      subject: `Subscription expired — ${sub.plan} plan`,
      body: `Your ${sub.plan} plan has expired and paid features are now paused. Renew under Billing to restore access.`,
      href: billingHrefFor(sub.user.role),
    });
    await notifyAllAdmins(
      `Subscription expired: ${sub.plan}`,
      `A ${sub.plan} subscription lapsed past its grace period and was marked EXPIRED.`,
      "/admin/subscriptions"
    );
    results.expired++;
  }

  // PENDING_PAYMENT subs older than 14 days → one nudge is enough; skip spam, admins see the queue
  // age open invoices past due → note only (status stays ISSUED; UI shows overdue via dueAt)

  // mark invoices overdue-ish: nothing structural needed — dueAt is rendered; keep count for observability
  results.invoicesAged = await prisma.invoice.count({
    where: { status: { in: ["ISSUED", "PARTIALLY_PAID"] }, dueAt: { lt: now } },
  });

  return NextResponse.json({ ok: true, ...results });
}
