import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

/** Re-authentication gate: after password confirmation we set a signed,
    short-lived cookie. Sensitive pages check it server-side before
    rendering, so the gate can't be bypassed client-side. */

const COOKIE = "pbg_reauth";
const TTL_MS = 10 * 60 * 1000; // 10 minutes

const secret = () =>
  process.env.BETTER_AUTH_SECRET ?? process.env.AUTH_SECRET ?? "pbg-reauth-local-fallback";

const sign = (payload: string) =>
  createHmac("sha256", secret()).update(payload).digest("hex");

export async function grantReauth(userId: string) {
  const exp = Date.now() + TTL_MS;
  const payload = `${userId}.${exp}`;
  const jar = await cookies();
  jar.set(COOKIE, `${payload}.${sign(payload)}`, {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: TTL_MS / 1000,
  });
}

export async function hasFreshReauth(userId: string): Promise<boolean> {
  const v = (await cookies()).get(COOKIE)?.value;
  if (!v) return false;
  const [id, expStr, sig] = v.split(".");
  if (id !== userId) return false;
  const exp = Number(expStr);
  if (!Number.isFinite(exp) || exp < Date.now()) return false;
  const expected = Buffer.from(sign(`${id}.${expStr}`), "hex");
  const given = Buffer.from(sig ?? "", "hex");
  return given.length === expected.length && timingSafeEqual(given, expected);
}
