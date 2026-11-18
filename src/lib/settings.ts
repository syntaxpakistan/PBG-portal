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

/** editable plan prices, overrides live in PlatformSetting, PLANS.price is the default */
export async function getPlanPrice(plan: PlanKey): Promise<number> {
  return getNumberSetting(`plan_price_${plan.toLowerCase()}`, PLANS[plan].price);
}

export async function getPlanPrices(): Promise<Record<PlanKey, number>> {
  const [basic, pro, custom] = await Promise.all([
    getPlanPrice("BASIC"), getPlanPrice("PRO"), getPlanPrice("CUSTOM"),
  ]);
  return { BASIC: basic, PRO: pro, CUSTOM: custom };
}

/** Analytics add-on, yearly price for customers / Basic-tier partners (PKR) */
export async function getAnalyticsAddonPrice(): Promise<number> {
  return getNumberSetting("addon_analytics_price", 25000);
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

// ---------- pay-to details shown on every invoice ----------

export async function getPaymentInstructions(): Promise<{
  accountTitle: string; bankName: string; iban: string; instructions: string;
}> {
  const rows = await prisma.platformSetting.findMany({
    where: { key: { in: ["payment_account_title", "payment_bank_name", "payment_iban", "payment_instructions"] } },
  });
  const m = Object.fromEntries(rows.map((r) => [r.key, r.value]));
  return {
    accountTitle: m.payment_account_title ?? "",
    bankName: m.payment_bank_name ?? "",
    iban: m.payment_iban ?? "",
    instructions: m.payment_instructions ?? "",
  };
}
