import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// lightweight DB ping — hit this every ~4 min from an external cron
// (cron-job.org / UptimeRobot) to keep the Neon compute awake on free tier
export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
