export const instant = false

import { prisma } from "@/lib/prisma";
import { PageHead } from "@/components/portal/ui";
import { Pagination, SearchBar, PAGE_SIZE, pageOf, qs } from "@/components/portal/pagination";
import { HandledButton } from "./handled-button";

export default async function LeadsPage({ searchParams }: { searchParams: Promise<{ q?: string; page?: string }> }) {
  const sp = await searchParams;
  const page = pageOf(sp);
  const where = sp.q ? {
    OR: [
      { firstName: { contains: sp.q } },
      { lastName: { contains: sp.q } },
      { email: { contains: sp.q } },
      { org: { contains: sp.q } },
      { interest: { contains: sp.q } },
    ],
  } : {};
  const [leads, total, openCount] = await Promise.all([
    prisma.lead.findMany({ where, orderBy: { createdAt: "desc" }, skip: (page - 1) * PAGE_SIZE, take: PAGE_SIZE }),
    prisma.lead.count({ where }),
    prisma.lead.count({ where: { handled: false } }),
  ]);

  return (
    <>
      <PageHead
        title="Leads"
        sub={`${openCount} open · ${total} ${sp.q ? "matching" : "total"} — public quote & contact form submissions.`}
      />
      <SearchBar q={sp.q} placeholder="Search name, email, org or interest…" />
      <div className="card divide-y divide-line">
        {leads.length === 0 && <p className="px-5 py-10 text-center text-[13px] text-muted">No leads yet.</p>}
        {leads.map((l) => (
          <div key={l.id} className={`px-5 py-4 ${l.handled ? "opacity-55" : ""}`}>
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-[12px] font-semibold text-muted">{l.leadNo}</span>
                  <span className="text-[14px] font-semibold text-ink">
                    {l.firstName} {l.lastName}
                  </span>
                  <span
                    className={`rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${
                      l.type === "QUOTE"
                        ? "border-(--st-blue-bd) bg-(--st-blue-bg) text-(--st-blue-fg)"
                        : "border-(--st-purple-bd) bg-(--st-purple-bg) text-(--st-purple-fg)"
                    }`}
                  >
                    {l.type === "QUOTE" ? "Quote request" : "Contact"}
                  </span>
                  {l.handled && (
                    <span className="rounded-full border border-(--st-green-bd) bg-(--st-green-bg) px-2.5 py-0.5 text-[11px] font-medium text-(--st-green-fg)">
                      Handled
                    </span>
                  )}
                </div>
                <div className="mt-1 text-[12px] text-muted">
                  <a href={`mailto:${l.email}`} className="font-medium text-blue hover:underline">{l.email}</a>
                  {l.org && <> · {l.org}</>}
                  {l.interest && <> · {l.interest}</>}
                  {" · "}{l.createdAt.toLocaleString()}
                </div>
                {l.message && <p className="mt-2 max-w-2xl text-[13px] leading-relaxed text-body">{l.message}</p>}
              </div>
              {!l.handled && <HandledButton id={l.id} />}
            </div>
          </div>
        ))}
        <Pagination page={page} total={total} base={`/admin/leads${qs({ q: sp.q })}`} />
      </div>
    </>
  );
}
