import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { sendPushToUser, pushConfigured } from "@/lib/push";

// POST — fire a test push at the signed-in user's subscribed devices
export async function POST() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  if (!pushConfigured()) return NextResponse.json({ error: "VAPID keys not configured" }, { status: 500 });
  await sendPushToUser(session.user.id, {
    title: "PBG Portal — push is working",
    body: "You'll now get alerts here for quotes, projects, payments and replies.",
    url: "/notifications",
  });
  return NextResponse.json({ ok: true });
}
