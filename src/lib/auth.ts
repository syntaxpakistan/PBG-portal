import { betterAuth } from "better-auth";
import { twoFactor } from "better-auth/plugins";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";

export const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: "postgresql" }),
  // Google is sign-in only — all accounts are created through the registration
  // form (role choice + org details + admin verification). disableSignUp blocks
  // OAuth account creation; accountLinking attaches Google to the existing user
  // row by verified email once an admin has approved them (emailVerified=true).
  ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
    ? {
        socialProviders: {
          google: {
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            disableSignUp: true,
          },
        },
      }
    : {}),
  account: {
    accountLinking: {
      trustedProviders: ["google"],
    },
  },
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    sendResetPassword: async ({ user, url }) => {
      await sendEmail({
        to: user.email,
        subject: "Reset your Pakistan Biotechnology Gateway password",
        html: `<p>Hi ${user.name || "there"},</p><p>We received a request to reset your password. This link expires shortly:</p><p><a href="${url}">${url}</a></p><p>If you didn't request this, you can ignore this email.</p>`,
      }).catch((e) => console.error("[auth] reset email failed", e));
    },
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: false,
        defaultValue: "CUSTOMER",
        input: true,
      },
      phone: {
        type: "string",
        required: false,
        input: true,
      },
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24,
  },
  plugins: [
    twoFactor({ issuer: "Pakistan Biotechnology Gateway" }),
  ],
  trustedOrigins: [
    "http://localhost:3000",
    "http://localhost:3200",
    "https://pbg-portal-theta.vercel.app",
    "https://pbg-teal.vercel.app",
    "https://pbg.syntaxpakistan.com",
  ],
});

export type Session = typeof auth.$Infer.Session;
