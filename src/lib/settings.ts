import { prisma } from "@/lib/prisma";

export async function getFeePercent(): Promise<number> {
  const row = await prisma.platformSetting.findUnique({ where: { key: "platform_fee_percent" } });
  return row ? Number(row.value) : 3.5;
}
