// Create or promote an admin user. Usage:
//   node --env-file=.env.local scripts/make-admin.mjs <email> <password> [name]
import { PrismaClient } from "@prisma/client";
import { hashPassword } from "better-auth/crypto";

const [email, password, name = "Admin"] = process.argv.slice(2);
if (!email || !password) {
  console.error("usage: node --env-file=.env.local scripts/make-admin.mjs <email> <password> [name]");
  process.exit(1);
}

const prisma = new PrismaClient();
const hash = await hashPassword(password);
const u = await prisma.user.upsert({
  where: { email },
  update: { role: "ADMIN" },
  create: { name, email, role: "ADMIN", emailVerified: true },
});
await prisma.account.upsert({
  where: { providerId_accountId: { providerId: "credential", accountId: u.id } },
  update: { password: hash },
  create: { accountId: u.id, providerId: "credential", userId: u.id, password: hash },
});
console.log(`admin ready: ${email} (${u.id})`);
await prisma.$disconnect();
