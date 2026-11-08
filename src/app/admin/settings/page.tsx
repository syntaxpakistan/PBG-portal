export const instant = false

import { prisma } from "@/lib/prisma";
import { PageHead } from "@/components/portal/ui";
import { FeeForm } from "./fee-form";
import { getFeePercent } from "@/lib/settings";

export default async function SettingsPage() {
  const fee = await getFeePercent();
  const settings = await prisma.platformSetting.findMany({ orderBy: { key: "asc" } });

  return (
    <div className="max-w-2xl">
      <PageHead title="Platform settings" sub="Commercial parameters — changes apply to new awards only and are audit-logged." />
      <div className="card p-6">
        <h3 className="text-[14px] font-semibold text-ink">Platform fee</h3>
        <p className="mt-1 text-[12.5px] text-body">
          Percentage Syntax charges on awarded project value. Current: <strong>{fee}%</strong>
        </p>
        <FeeForm current={fee} />
      </div>
      {settings.length > 0 && (
        <div className="card mt-5 p-5">
          <h3 className="mb-3 text-[13px] font-semibold text-ink">All settings</h3>
          {settings.map((s) => (
            <div key={s.key} className="flex justify-between border-b border-line py-2 text-[12.5px] last:border-0">
              <code className="text-muted">{s.key}</code>
              <span className="font-medium text-ink">{s.value}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
