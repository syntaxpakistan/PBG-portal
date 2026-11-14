import { setVapidDetails, sendNotification } from "web-push";
import { prisma } from "@/lib/prisma";

// Web Push (VAPID) — configured from env; silently no-ops when keys aren't set
const VAPID_PUBLIC = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const VAPID_PRIVATE = process.env.VAPID_PRIVATE_KEY;

if (VAPID_PUBLIC && VAPID_PRIVATE) {
  setVapidDetails(
    process.env.VAPID_SUBJECT || "mailto:info@biotechnologygateway.com",
    VAPID_PUBLIC,
    VAPID_PRIVATE
  );
}

export function pushConfigured() {
  return Boolean(VAPID_PUBLIC && VAPID_PRIVATE);
}

/** Deliver a push to every browser/device the user has subscribed. Expired
 *  endpoints (404/410) are pruned so the table stays clean. */
export async function sendPushToUser(
  userId: string,
  payload: { title: string; body: string; url?: string }
) {
  if (!pushConfigured()) return;
  const subs = await prisma.pushSubscription.findMany({ where: { userId } });
  await Promise.all(
    subs.map(async (s) => {
      try {
        await sendNotification(
          { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
          JSON.stringify(payload)
        );
      } catch (err) {
        const status = (err as { statusCode?: number })?.statusCode;
        if (status === 404 || status === 410) {
          // subscription revoked or expired — drop it
          await prisma.pushSubscription.delete({ where: { id: s.id } }).catch(() => {});
        } else {
          console.error(`[push] send failed (${status}):`, (err as Error)?.message);
        }
      }
    })
  );
}
