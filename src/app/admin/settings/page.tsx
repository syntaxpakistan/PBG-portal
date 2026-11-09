export const instant = false

import { prisma } from "@/lib/prisma";
import { PageHead } from "@/components/portal/ui";
import { SettingForm } from "./setting-form";
import { getFeePercent, getPlanPrices, getGraceDays, getInvoiceDueDays, getRfqRateLimit, getEnquiryRateLimit } from "@/lib/settings";
import { PLANS, type PlanKey } from "@/lib/plans";

const FEE_KEY = "platform_fee_percent";

export default async function SettingsPage() {
  const [fee, planPrices, graceDays, invoiceDueDays, rfqLimit, enquiryLimit, settings] = await Promise.all([
    getFeePercent(),
    getPlanPrices(),
    getGraceDays(),
    getInvoiceDueDays(),
    getRfqRateLimit(),
    getEnquiryRateLimit(),
    prisma.platformSetting.findMany({ orderBy: { key: "asc" } }),
  ]);

  const planRows: { key: PlanKey; label: string; tagline: string }[] = [
    { key: "BASIC", label: PLANS.BASIC.label, tagline: PLANS.BASIC.tagline },
    { key: "PRO", label: PLANS.PRO.label, tagline: PLANS.PRO.tagline },
    { key: "CUSTOM", label: PLANS.CUSTOM.label, tagline: PLANS.CUSTOM.tagline },
  ];

  return (
    <div className="grid max-w-5xl gap-6 xl:grid-cols-[1fr_300px]">
      <div>
        <PageHead title="Platform settings" sub="Commercial parameters — changes apply to new activity only and are audit-logged." />

        <div className="card p-6">
          <h3 className="text-[14px] font-semibold text-ink">Platform fee</h3>
          <p className="mt-1 text-[12.5px] text-body">
            Percentage Syntax charges on awarded project value. Applies to new awards only.
          </p>
          <SettingForm settingKey={FEE_KEY} current={fee} suffix="%" min={0} max={30} step={0.1} />
        </div>

        <div className="card mt-5 p-6">
          <h3 className="text-[14px] font-semibold text-ink">Subscription plan prices</h3>
          <p className="mt-1 text-[12.5px] text-body">
            Monthly price in USD. New invoices use the updated price; existing subscriptions keep their billed rate.
          </p>
          <div className="mt-4 space-y-4">
            {planRows.map((p) => (
              <div key={p.key} className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-4 last:border-0 last:pb-0">
                <div>
                  <div className="text-[13px] font-semibold text-ink">{p.label} plan</div>
                  <div className="text-[11.5px] text-muted">{p.tagline}</div>
                </div>
                <SettingForm settingKey={`plan_price_${p.key.toLowerCase()}`} current={planPrices[p.key]} suffix="USD/mo" min={0} max={10000} />
              </div>
            ))}
          </div>
        </div>

        <div className="card mt-5 p-6">
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

        <div className="card mt-5 p-6">
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

      {settings.length > 0 && (
        <div className="card h-fit p-5 xl:sticky xl:top-6">
          <h3 className="mb-3 text-[13px] font-semibold text-ink">All settings</h3>
          {settings.map((s) => (
            <div key={s.key} className="flex justify-between gap-3 border-b border-line py-2 text-[12.5px] last:border-0">
              <code className="truncate text-muted">{s.key}</code>
              <span className="shrink-0 font-medium text-ink">{s.value}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
