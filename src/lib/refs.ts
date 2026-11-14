import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

// atomic human-readable refs — RefSequence rows make concurrent creates collision-proof.
// yearly:false → "LAB-0007" (continuous) · yearly:true → "CMP-2026-0007" (resets each year)
export async function nextRef(
  prefix: string,
  opts: { yearly?: boolean } = {},
  tx: Prisma.TransactionClient = prisma
): Promise<string> {
  const key = opts.yearly ? `${prefix}-${new Date().getFullYear()}` : prefix;
  const seq = await tx.refSequence.upsert({
    where: { key },
    update: { last: { increment: 1 } },
    create: { key, last: 1 },
    select: { last: true },
  });
  return `${key}-${String(seq.last).padStart(4, "0")}`;
}
