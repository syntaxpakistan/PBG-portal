import { prisma } from "@/lib/prisma";
import { PLANS, GRACE_DAYS, type PlanKey } from "@/lib/plans";

/** raw string setting with fallback */
export async function getSetting(key: string, fallback: string): Promise<string> {
  const row = await prisma.platformSetting.findUnique({ where: { key } });
  return row?.value ?? fallback;
}

export async function getNumberSetting(key: string, fallback: number): Promise<number> {
  const v = Number(await getSetting(key, String(fallback)));
  return Number.isFinite(v) ? v : fallback;
}

export async function getFeePercent(): Promise<number> {
  return getNumberSetting("platform_fee_percent", 3.5);
}

// ---------- commercial ----------

/** editable plan prices — overrides live in PlatformSetting, PLANS.price is the default */
export async function getPlanPrice(plan: PlanKey): Promise<number> {
  return getNumberSetting(`plan_price_${plan.toLowerCase()}`, PLANS[plan].price);
}

export async function getPlanPrices(): Promise<Record<PlanKey, number>> {
  const [basic, pro, custom] = await Promise.all([
    getPlanPrice("BASIC"), getPlanPrice("PRO"), getPlanPrice("CUSTOM"),
  ]);
  return { BASIC: basic, PRO: pro, CUSTOM: custom };
}

// ---------- billing terms ----------

export async function getGraceDays(): Promise<number> {
  return getNumberSetting("grace_days", GRACE_DAYS);
}

/** days a new subscription invoice is due */
export async function getInvoiceDueDays(): Promise<number> {
  return getNumberSetting("invoice_due_days", 7);
}

// ---------- limits ----------

/** max RFQs a customer can post per day */
export async function getRfqRateLimit(): Promise<number> {
  return getNumberSetting("rfq_rate_limit_per_day", 15);
}

/** max product enquiries a user can send per day */
export async function getEnquiryRateLimit(): Promise<number> {
  return getNumberSetting("enquiry_rate_limit_per_day", 20);
}
