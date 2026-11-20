export const instant = false

import { prisma } from "@/lib/prisma";
import { PageHead } from "@/components/portal/ui";
import { SettingForm } from "./setting-form";
import { TextSettingForm } from "./text-setting-form";
import { getFeePercent, getAllPlanPricing, getAnalyticsAddonPricing, getGraceDays, getInvoiceDueDays, getRfqRateLimit, getEnquiryRateLimit, getPaymentInstructions } from "@/lib/settings";
import { PLANS, type PlanKey } from "@/lib/plans";

const FEE_KEY = "platform_fee_percent";

export default async function SettingsPage() {
  const [fee, planPricing, graceDays, invoiceDueDays, rfqLimit, enquiryLimit, payTo, settings, addonPricing] = await Promise.all([
    getFeePercent(),
    getAllPlanPricing(),
    getGraceDays(),
    getInvoiceDueDays(),
    getRfqRateLimit(),
    getEnquiryRateLimit(),
    getPaymentInstructions(),
    prisma.platformSetting.findMany({ orderBy: { key: "asc" } }),
    getAnalyticsAddonPricing(),
  ]);

  const planRows: { key: PlanKey; label: string; tagline: string }[] = [
    { key: "BASIC", label: PLANS.BASIC.label, tagline: PLANS.BASIC.tagline },
    { key: "PRO", label: PLANS.PRO.label, tagline: PLANS.PRO.tagline },
    { key: "CUSTOM", label: PLANS.CUSTOM.label, tagline: PLANS.CUSTOM.tagline },
  ];

  return (
    <div className="max-w-6xl">
      <PageHead title="Platform settings" sub="Commercial parameters, changes apply to new activity only and are audit-logged." />

      <div className="grid items-start gap-5 md:grid-cols-2">
        {/* left column */}
        <div className="space-y-5">
          <div className="card p-6">
            <h3 className="text-[14px] font-semibold text-ink">Platform fee</h3>
            <p className="mt-1 text-[12.5px] text-body">
              Percentage Syntax charges on awarded project value. Applies to new awards only.
            </p>
            <SettingForm settingKey={FEE_KEY} current={fee} suffix="%" min={0} max={30} step={0.1} />
          </div>

          <div className="card p-6">
            <h3 className="text-[14px] font-semibold text-ink">Billing terms</h3>
            <p className="mt-1 text-[12.5px] text-body">Grace window and invoice due dates across all portals.</p>
            <div className="mt-4 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-4">
                <div>
                  <div className="text-[13px] font-semibold text-ink">Grace period</div>
                  <div className="text-[11.5px] text-muted">Days paid features stay active after expiry</div>
                </div>
                <SettingForm settingKey="grace_days" current={graceDays} suffix="days" min={0} max={60} />
              </div>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="text-[13px] font-semibold text-ink">Invoice due window</div>
                  <div className="text-[11.5px] text-muted">Days until new subscription invoices are due</div>
                </div>
                <SettingForm settingKey="invoice_due_days" current={invoiceDueDays} suffix="days" min={1} max={90} />
              </div>
            </div>
          </div>

          <div className="card p-6">
            <h3 className="text-[14px] font-semibold text-ink">Limits</h3>
            <p className="mt-1 text-[12.5px] text-body">Anti-abuse controls applied at creation time.</p>
            <div className="mt-4 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-4">
                <div>
                  <div className="text-[13px] font-semibold text-ink">RFQ rate limit</div>
                  <div className="text-[11.5px] text-muted">Max requests a customer can post per day</div>
                </div>
                <SettingForm settingKey="rfq_rate_limit_per_day" current={rfqLimit} suffix="/day" min={1} max={100} />
              </div>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="text-[13px] font-semibold text-ink">Enquiry rate limit</div>
                  <div className="text-[11.5px] text-muted">Max product enquiries a user can send per day</div>
                </div>
                <SettingForm settingKey="enquiry_rate_limit_per_day" current={enquiryLimit} suffix="/day" min={1} max={200} />
              </div>
            </div>
          </div>
        </div>

        {/* right column */}
        <div className="space-y-5">
          <div className="card p-6">
            <h3 className="text-[14px] font-semibold text-ink">Subscription plan prices</h3>
            <p className="mt-1 text-[12.5px] text-body">
              Term price in PKR (covers the full plan term). New invoices use the updated price; existing subscriptions keep their billed rate.
            </p>
            <div className="mt-4 space-y-4">
            {planRows.map((p) => (
              <div key={p.key} className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-4 last:border-0 last:pb-0">
                <div>
                  <div className="text-[13px] font-semibold text-ink">{p.label} plan</div>
                  <div className="text-[11.5px] text-muted">{p.tagline}</div>
                  {planPricing[p.key].discount > 0 && (
                    <div className="mt-0.5 text-[11px] font-medium text-(--st-green-fg)">
                      Bills PKR {planPricing[p.key].final.toLocaleString()} after {planPricing[p.key].discount}% off
                    </div>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-x-5">
                  <SettingForm settingKey={`plan_price_${p.key.toLowerCase()}`} current={planPricing[p.key].price} suffix="PKR" min={0} max={10000000} />
                  <SettingForm settingKey={`plan_discount_${p.key.toLowerCase()}`} current={planPricing[p.key].discount} suffix="% off" min={0} max={90} />
                </div>
              </div>
            ))}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
              <div>
                <div className="text-[13px] font-semibold text-ink">Analytics add-on</div>
                <div className="text-[11.5px] text-muted">Yearly price for customers &amp; Basic-tier partners</div>
                {addonPricing.discount > 0 && (
                  <div className="mt-0.5 text-[11px] font-medium text-(--st-green-fg)">
                    Bills PKR {addonPricing.final.toLocaleString()} after {addonPricing.discount}% off
                  </div>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-x-5">
                <SettingForm settingKey="addon_analytics_price" current={addonPricing.price} suffix="PKR" min={0} max={10000000} />
                <SettingForm settingKey="addon_analytics_discount" current={addonPricing.discount} suffix="% off" min={0} max={90} />
              </div>
            </div>
          </div>
        </div>

          <div className="card p-6">
            <h3 className="text-[14px] font-semibold text-ink">Payment instructions</h3>
          <p className="mt-1 text-[12.5px] text-body">
            Shown on every invoice so payers know where to send money. Leave blank until your account is ready.
          </p>
          <div className="mt-4 space-y-4">
            <div>
              <div className="text-[13px] font-semibold text-ink">Account title</div>
              <TextSettingForm settingKey="payment_account_title" current={payTo.accountTitle} placeholder="Syntax of Life (Pvt) Ltd" />
            </div>
            <div>
              <div className="text-[13px] font-semibold text-ink">Bank name</div>
              <TextSettingForm settingKey="payment_bank_name" current={payTo.bankName} placeholder="e.g. Meezan Bank, DHA Lahore branch" />
            </div>
            <div>
              <div className="text-[13px] font-semibold text-ink">IBAN / account number</div>
              <TextSettingForm settingKey="payment_iban" current={payTo.iban} placeholder="PK00XXXX0000000000000000" />
            </div>
            <div>
              <div className="text-[13px] font-semibold text-ink">Instructions</div>
              <TextSettingForm settingKey="payment_instructions" current={payTo.instructions} textarea placeholder="e.g. Quote your invoice number (INV-…) as the transfer reference, then report the payment with your receipt." />
            </div>
          </div>
        </div>

        </div>

        {settings.length > 0 && (
          <div className="card p-5 md:col-span-2">
            <h3 className="mb-3 text-[13px] font-semibold text-ink">All settings</h3>
            <div className="grid gap-x-8 sm:grid-cols-2">
              {settings.map((s) => (
                <div key={s.key} className="flex justify-between gap-3 border-b border-line py-2 text-[12.5px] last:border-0">
                  <code className="truncate text-muted">{s.key}</code>
                  <span className="shrink-0 font-medium text-ink">{s.value}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
