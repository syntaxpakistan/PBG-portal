import type { Metadata } from "next";
import Link from "next/link";
import { AnnouncementBar } from "@/components/announcement-bar";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";

export const metadata: Metadata = {
  title: "Terms, Privacy & Billing — Pakistan Biotechnology Gateway",
  description: "Terms of service, privacy policy and subscription/refund terms for the Pakistan Biotechnology Gateway.",
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-10">
      <h2 className="font-display text-[19px] font-medium text-ink">{title}</h2>
      <div className="mt-3 space-y-3 text-[14px] leading-relaxed text-body">{children}</div>
    </section>
  );
}

export default function LegalPage() {
  return (
    <>
      <AnnouncementBar />
      <Navbar />
      <main className="mx-auto max-w-3xl px-6 pb-20 pt-32">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-yellow">Legal</p>
        <h1 className="h-display mt-3 text-[2.4rem]">Terms, privacy & billing</h1>
        <p className="mt-3 text-[13px] text-muted">Last updated: November 2026 · Syntax of Life (Pvt) Ltd — Pakistan Biotechnology Gateway</p>

        <Section title="1. The platform">
          <p>
            The Pakistan Biotechnology Gateway (&quot;Gateway&quot;, &quot;we&quot;) is a B2B marketplace operated by Syntax of Life.
            It connects research customers (universities, institutes, hospitals, companies) with verified
            laboratories and suppliers. Syntax is a commercial intermediary: we are not a party to the
            scientific or commercial agreements between customers and partners, and we do not perform,
            interpret, or guarantee laboratory work.
          </p>
        </Section>

        <Section title="2. Accounts and partners">
          <p>
            You must provide accurate registration information and keep credentials confidential. Accounts are
            personal to the registrant; partner organisations (labs, suppliers) are responsible for the activity
            of users they authorise. We may suspend accounts that violate these terms, provide false
            verification information, or misuse the platform.
          </p>
        </Section>

        <Section title="3. Subscriptions, invoices and payments">
          <p>
            Partner plans (Basic, Pro, Custom) are billed in advance on a monthly cycle at the published rate.
            Each billing period generates an invoice in your portal under Billing. Subscriptions activate only
            after payment is confirmed — either automatically by our payment partner or manually by Syntax
            after verifying your bank/wallet transfer.
          </p>
          <p>
            <strong className="text-ink">Grace period:</strong> if a renewal payment is not confirmed by the
            expiry date, paid features remain available for a short grace period, after which the subscription
            lapses to read-only access until payment is received. We will notify you by email and in-app before
            and during this period.
          </p>
          <p>
            <strong className="text-ink">Refunds:</strong> subscription fees are non-refundable except where
            required by applicable law or where a billing error occurred on our side. Marketplace project
            payments and milestone invoices are governed by the agreement between customer and partner.
          </p>
          <p>
            <strong className="text-ink">Taxes:</strong> prices are exclusive of applicable sales tax/GST.
            Where required, tax invoices will state the applicable levy.
          </p>
        </Section>

        <Section title="4. Marketplace transactions">
          <p>
            Quotes, awards, milestones and invoices exchanged between customers and partners form a contract
            between those parties. Syntax may charge a platform service fee as disclosed at the time of award.
            Payment confirmations recorded by either party are statements of fact; disputes over deliverables,
            quality, or payment are resolved between the parties, with our complaints process available as a
            first step.
          </p>
        </Section>

        <Section title="5. Acceptable use">
          <p>
            Do not upload unlawful, infringing, or unsafe materials; do not misrepresent capabilities or
            verification status; do not attempt to circumvent sealed-bid quote confidentiality or access
            controls. We may remove content and suspend accounts that breach these rules.
          </p>
        </Section>

        <Section title="6. Privacy">
          <p>
            We collect account, profile, transaction, and usage data needed to operate the marketplace, verify
            partners, process billing, and improve the service. Data is stored on secure cloud infrastructure
            (Neon Postgres / S3-compatible storage). We do not sell personal data. Files you upload (results,
            attachments, receipts) are access-controlled per project and retained per our data policy.
            You may request account data export or deletion by contacting us — subject to legal retention
            obligations for financial records.
          </p>
        </Section>

        <Section title="7. Liability">
          <p>
            The Gateway is provided &quot;as is&quot;. To the maximum extent permitted by law, Syntax is not
            liable for the scientific validity, safety, or regulatory compliance of work performed by partner
            laboratories, nor for indirect or consequential damages arising from marketplace transactions.
            Nothing in these terms excludes liability that cannot be excluded by law.
          </p>
        </Section>

        <Section title="8. Changes and contact">
          <p>
            We may update these terms with notice posted on this page. Questions about billing, invoices, or
            these terms: contact us via the <Link href="/company/contact" className="text-blue hover:underline">contact page</Link>.
          </p>
        </Section>
      </main>
      <Footer />
    </>
  );
}
