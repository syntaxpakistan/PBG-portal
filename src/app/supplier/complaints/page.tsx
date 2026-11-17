export const instant = false

import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/session";
import { PageHead, StatusBadge } from "@/components/portal/ui";
import { fileSupportComplaint } from "@/lib/actions/marketplace";
import { SubmitButton } from "@/components/portal/submit-button";

const input = "w-full rounded-lg border border-line bg-surface px-3.5 py-2.5 text-[13px] text-ink outline-none focus:border-navy-3";

export default async function SupplierComplaintsPage() {
  const session = await requireRole("SUPPLIER");
  const complaints = await prisma.complaint.findMany({
    where: {
      OR: [{ filedById: session.user.id }, { enquiry: { supplier: { userId: session.user.id } } }],
    },
    orderBy: { createdAt: "desc" },
    include: { project: { select: { refNo: true } }, enquiry: { select: { id: true, enquiryNo: true } }, filedBy: { select: { name: true } } },
  });

  return (
    <>
      <PageHead title="Complaints &amp; support" sub="Delivery, payment or buyer issues — each ticket opens a private thread with the Gateway team." />

      <div className="card mb-6 p-5">
        <h3 className="mb-3 text-[14px] font-semibold text-ink">Raise a ticket</h3>
        <form action={fileSupportComplaint} className="space-y-3">
          <input name="subject" required maxLength={140} placeholder="Subject — e.g. delayed payment on ENQ-2026-0007" className={input} />
          <textarea name="details" required rows={3} placeholder="What happened, which order/enquiry it relates to, and what you need…" className={`${input} resize-y`} />
          <SubmitButton className="btn-primary !py-2.5 text-[13px]">Submit ticket</SubmitButton>
        </form>
      </div>

      <div className="card divide-y divide-line">
        {complaints.length === 0 && (
          <p className="px-5 py-10 text-center text-[13px] text-muted">No tickets yet — payment or delivery issues you raise appear here.</p>
        )}
        {complaints.map((c) => {
          const aboutYou = c.filedById !== session.user.id;
          return (
          <div key={c.id} className="px-5 py-4">
            <div className="flex items-center gap-2">
              <span className="font-mono text-[12px] font-semibold text-muted">{c.ticketNo}</span>
              <Link href={`/supplier/complaints/${c.id}`} className="text-[14px] font-semibold text-ink hover:text-blue">{c.subject}</Link>
              <StatusBadge status={c.status} />
              {aboutYou && <span className="rounded-full bg-(--st-amber-bg) px-2 py-0.5 text-[10px] font-semibold text-(--st-amber-fg)">about your order</span>}
            </div>
            <div className="mt-1 text-[12px] text-muted">
              {c.project ? c.project.refNo : c.enquiry ? <Link href={`/supplier/enquiries/${c.enquiry.id}`} className="font-medium text-blue hover:underline">{c.enquiry.enquiryNo}</Link> : "General"} · filed by {aboutYou ? c.filedBy.name ?? "the buyer" : "you"} {c.createdAt.toLocaleDateString()}
            </div>
            {c.resolution && (
              <p className="mt-2 rounded-lg bg-(--st-green-bg) px-3 py-2 text-[12px] text-(--st-green-fg)">Gateway resolution: {c.resolution}</p>
            )}
          </div>
        );
        })}
      </div>
    </>
  );
}
