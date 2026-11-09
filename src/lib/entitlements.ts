import { prisma } from "@/lib/prisma";
import { PLAN_FLAGS, GRACE_DAYS, type PlanKey } from "@/lib/plans";
import { getGraceDays } from "@/lib/settings";
import type { SubscriptionStatus } from "@prisma/client";

export type PartnerAccess = {
  hasSubscription: boolean;
  status: SubscriptionStatus | null;
  plan: PlanKey | null;
  priceUsd: number;
  /** may perform paid actions (quote, list, respond) right now */
  active: boolean;
  /** ACTIVE but past expiresAt — inside the GRACE_DAYS window */
  inGrace: boolean;
  expiresAt: Date | null;
  /** days until paid-through date; negative = overdue */
  daysLeft: number | null;
  renewRequested: boolean;
  flags: (typeof PLAN_FLAGS)[PlanKey] | null;
};

const LOCKED: PartnerAccess = {
  hasSubscription: false, status: null, plan: null, priceUsd: 0,
  active: false, inGrace: false, expiresAt: null, daysLeft: null,
  renewRequested: false, flags: null,
};

export async function getPartnerAccess(userId: string): Promise<PartnerAccess> {
  const sub = await prisma.subscription.findUnique({ where: { userId } });
  if (!sub) return LOCKED;
  const plan = sub.plan as PlanKey;
  const now = Date.now();
  const graceDays = await getGraceDays();
  const graceEnd = sub.expiresAt ? sub.expiresAt.getTime() + graceDays * 864e5 : null;
  const inGrace = sub.status === "ACTIVE" && sub.expiresAt != null && sub.expiresAt.getTime() <= now && graceEnd! > now;
  const active = sub.status === "ACTIVE" && (sub.expiresAt == null || graceEnd! > now);
  return {
    hasSubscription: true,
    status: sub.status,
    plan,
    priceUsd: sub.priceUsd,
    active,
    inGrace,
    expiresAt: sub.expiresAt,
    daysLeft: sub.expiresAt ? Math.ceil((sub.expiresAt.getTime() - now) / 864e5) : null,
    renewRequested: !!sub.renewRequestedAt,
    flags: PLAN_FLAGS[plan] ?? PLAN_FLAGS.BASIC,
  };
}

/** throws unless the partner's subscription is currently active (incl. grace) */
export async function assertPartnerActive(userId: string): Promise<PartnerAccess> {
  const access = await getPartnerAccess(userId);
  if (!access.active) {
    throw new Error(
      access.status === "PENDING_PAYMENT"
        ? "Your subscription is awaiting payment — settle your plan invoice to activate your portal."
        : "Subscription inactive — renew your plan to continue using paid features."
    );
  }
  return access;
}

/** plan tier for sorting/priority — higher plans rank first */
export function planTier(plan: string | null | undefined): number {
  return plan === "CUSTOM" ? 2 : plan === "PRO" ? 1 : 0;
}

/** true when a customer subscription is ACTIVE Pro/Custom within paid-through + grace — drives priority lab matching */
export function isPriorityClientSubscription(sub: { plan: string; status: string; expiresAt: Date | null } | null | undefined, graceDays = GRACE_DAYS): boolean {
  if (!sub || sub.status !== "ACTIVE") return false;
  if (sub.plan !== "PRO" && sub.plan !== "CUSTOM") return false;
  const now = Date.now();
  return !sub.expiresAt || sub.expiresAt.getTime() + graceDays * 864e5 > now;
}
