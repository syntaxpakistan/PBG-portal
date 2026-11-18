import { PrismaClient } from "@prisma/client";

// Neon's serverless Postgres drops idle TCP connections — the first query on a
// stale pooled socket fails with a transient error. Retry those once/twice so a
// cold request doesn't surface as a page error.
const RETRYABLE_CODES = new Set(["P1001", "P1002", "P1008", "P1017", "P2024"]);
const RETRYABLE_MESSAGE = /kind: Closed|server closed the connection|Connection terminated|ECONNRESET|ETIMEDOUT|socket hang up/i;

function isRetryable(e: unknown): boolean {
  const err = e as { code?: string; message?: string };
  return (err?.code != null && RETRYABLE_CODES.has(err.code)) || RETRYABLE_MESSAGE.test(err?.message ?? String(e));
}

function createPrisma() {
  return new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  }).$extends({
    name: "neon-idle-retry",
    query: {
      async $allOperations({ args, query }) {
        for (let attempt = 0; ; attempt++) {
          try {
            return await query(args);
          } catch (e) {
            if (attempt >= 2 || !isRetryable(e)) throw e;
          }
        }
      },
    },
  });
}

// the query extension only wraps calls — safe to keep the PrismaClient type so
// interactive-transaction signatures stay compatible
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma = (globalForPrisma.prisma ?? createPrisma()) as PrismaClient;

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
