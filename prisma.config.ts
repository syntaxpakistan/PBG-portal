import { config as loadEnv } from "dotenv";
import { defineConfig } from "prisma/config";

// Next.js keeps secrets in .env.local; Prisma CLI only auto-loads .env.
loadEnv({ path: [".env.local", ".env"] });

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "node prisma/seed.mjs",
  },
});
