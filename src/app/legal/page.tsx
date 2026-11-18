import type { Metadata } from "next";
import Link from "next/link";
import { LegalShell, Section, Sub } from "@/components/legal";

export const metadata: Metadata = {
  title: "Terms of Service",
  alternates: { canonical: "/legal" },
  description:
    "Terms of service for the Pakistan Biotechnology Gateway, marketplace rules, sealed bidding, subscriptions, payments, liability and governing law.",
};

export default function LegalPage() {
  return (
    <LegalShell
      eyebrow="Legal"
      title="Terms of Service"
      lead="These Terms of Service govern access to and use of the Pakistan Biotechnology Gateway operated by Syntax of Life (Pvt) Ltd. They apply to every customer, laboratory, supplier and visitor. By creating an account or using the platform you agree to them."
      updated="Last updated: November 2026 · Syntax of Life (Pvt) Ltd · Karachi, Pakistan"
    >
      <Section n="1" title="Definitions">
        <p>
          <strong className="text-ink">&quot;Gateway&quot; / &quot;Platform&quot;</strong>, the Pakistan Biotechnology
          Gateway, the B2B marketplace operated by Syntax of Life (Pvt) Ltd (&quot;Syntax&quot;, &quot;we&quot;, &quot;us&quot;).
        </p>
        <p>
          <strong className="text-ink">&quot;Customer&quot;</strong>, a researcher, university, institute, hospital,
          company or other organisation that posts requests for quotation (&quot;RFQs&quot;) and purchases services.
        </p>
        <p>
          <strong className="text-ink">&quot;Provider&quot;</strong>, a verified laboratory or bioinformatics facility that
          receives routed RFQs, submits quotes and performs awarded work.
        </p>
        <p>
          <strong className="text-ink">&quot;Supplier&quot;</strong>, a verified vendor of reagents, kits, consumables and
          related products listed on the Gateway.
        </p>
        <p>
          <strong className="text-ink">&quot;Project&quot;</strong>, a unit of awarded work progressing through tracked work
          stages from sample intake to released results, including its QC records, milestones, invoices, files and
          communications.
        </p>
        <p>
          <strong className="text-ink">&quot;Sealed bid&quot;</strong>, a quote visible in substance only to its author and
          the awarding customer; competing providers see only that a sealed quote exists, never its price or content.
        </p>
      </Section>

      <Section n="2" title="The platform and our role">
        <p>
          The Gateway is a business-to-business marketplace and workflow platform. Syntax connects Customers with
          verified Providers and Suppliers, routes RFQs, administers blind quoting, tracks project stages and records
          marketplace transactions. <strong className="text-ink">Syntax is a commercial intermediary.</strong> We are not
          a laboratory, we do not perform or interpret scientific work, and we are not a party to the service or supply
          agreements formed between Customers and Providers or Suppliers through the platform.
        </p>
        <p>
          A quote, award, milestone or invoice exchanged on the Gateway forms a contract solely between the Customer
          and the Provider or Supplier involved. Syntax&apos;s role is limited to operating the platform, verification,
          moderation and settlement workflows described in these Terms.
        </p>
      </Section>

      <Section n="3" title="Eligibility and accounts">
        <p>
          The Gateway is intended for professional and institutional use. You must be at least 18 years old and
          authorised to bind the organisation you register. Registration information must be accurate and kept current.
          Credentials are personal and may not be shared outside your organisation.
        </p>
        <p>
          Organisations are responsible for the conduct of the users they authorise, including portal access, quoting
          authority and payment reporting. We may suspend or terminate accounts that breach these Terms, provide false
          or misleading verification material, or misuse the platform, with notice except where immediate suspension
          is required to protect the marketplace or its users.
        </p>
      </Section>

      <Section n="4" title="Provider and supplier verification">
        <p>
          Verified status on the Gateway means the organisation cleared Syntax&apos;s verification criteria, credential
          checks, capability and equipment review, track-record assessment and moderation. The badge is issued by
          Syntax of Life, a private company; <strong className="text-ink">it is not a government accreditation</strong>
          and does not replace a Customer&apos;s own due diligence, institutional approvals or regulatory requirements.
        </p>
        <p>
          Verification criteria, declared accreditations (for example ISO 15189 or ISO/IEC 17025 status where
          applicable) and capability profiles are shown on provider registry entries. Providers must keep profile
          information accurate; material misrepresentation is grounds for removal.
        </p>
      </Section>

      <Section n="5" title="Marketplace mechanics, RFQs, sealed bidding and award">
        <Sub title="5.1 RFQs">
          <p>
            Customers post structured RFQs describing the work required. RFQs may be routed to selected providers or
            posted to the open request board. Customers must describe work truthfully and are responsible for the
            legality, ethics approvals and regulatory permits applicable to their samples and intended use.
          </p>
        </Sub>
        <Sub title="5.2 Sealed bids">
          <p>
            Providers quote blind: each sees only the number of sealed quotes on an RFQ, never a competitor&apos;s price
            or content. Quotes may be revised by their author until award. Attempting to obtain, signal or collude on
            another party&apos;s quote is a serious breach and grounds for removal.
          </p>
        </Sub>
        <Sub title="5.3 Award and acceptance">
          <p>
            Customers compare quotes side-by-side and select one. The awarded Provider must accept or decline within
            the displayed period; providers remain independent businesses and are never obliged to accept. On
            acceptance, a Project is created and the customer identity may be unmasked to the performing Provider to
            the extent needed to execute the work.
          </p>
        </Sub>
        <Sub title="5.4 SLA">
          <p>
            Quoted turnaround times become the project SLA on acceptance. Where a Customer decision is pending (for
            example a QC proceed/resend/cancel decision), the SLA clock pauses and resumes on the recorded decision.
          </p>
        </Sub>
      </Section>

      <Section n="6" title="Subscriptions and fees">
        <p>
          Partner plans are billed in advance on a monthly cycle at the published rate. Each billing period generates
          an invoice in your portal. Subscriptions activate only after payment is confirmed, automatically by our
          payment partner or manually by Syntax after verifying a bank or wallet transfer. A platform service fee may
          apply to marketplace transactions as disclosed at the time of award.
        </p>
        <p>
          <strong className="text-ink">Grace period:</strong> if a renewal payment is not confirmed by the expiry date,
          paid features remain available for a short grace period, after which the subscription lapses to read-only
          access until payment is received. We will notify you in advance and during the period.
        </p>
        <p>
          <strong className="text-ink">Refunds:</strong> subscription fees are non-refundable except where required by
          applicable law or where a billing error occurred on our side. Marketplace project payments and milestone
          invoices are governed by the contract between Customer and Provider or Supplier.
        </p>
        <p>
          <strong className="text-ink">Taxes:</strong> prices are exclusive of applicable sales tax/GST and withholding
          obligations. Where required, tax invoices will state the applicable levy.
        </p>
      </Section>

      <Section n="7" title="Marketplace payments and disputes">
        <p>
          Milestone invoices, recorded payments and payout events are statements of fact recorded on the project
          ledger. Customers pay the performing Provider or Supplier per the agreed schedule; Syntax may facilitate
          payment verification, escrow-style holds or settlement where offered, as described at the time.
        </p>
        <p>
          Disputes over deliverables, quality, turnaround or payment are resolved first between the parties using the
          in-project record (stages, QC verdicts, files and messages are the authoritative log). The Gateway complaints
          process is available as a first escalation step; Syntax may mediate but does not adjudicate the underlying
          contract. Persistently abusive or fraudulent conduct leads to removal.
        </p>
      </Section>

      <Section n="8" title="Content, uploads and acceptable use">
        <p>
          Project attachments are limited to documents and reports (current cap 25&nbsp;MB per file).{" "}
          <strong className="text-ink">The Gateway does not host raw genomic data</strong>, FASTQ/BAM/CRAM and
          equivalent raw read files are transferred directly between Customer and Provider under their own agreement.
        </p>
        <p>You must not:</p>
        <ul className="list-disc space-y-1.5 pl-5">
          <li>upload unlawful, infringing, unsafe or malicious material;</li>
          <li>upload identifiable personal or patient data except as permitted by the Data &amp; Research Ethics Policy;</li>
          <li>misrepresent capabilities, accreditation or verification status;</li>
          <li>attempt to circumvent sealed-bid confidentiality, role isolation or access controls;</li>
          <li>scrape, probe or disrupt the platform or its security;</li>
          <li>use the platform for work prohibited by applicable biosafety, export-control or sanctions law.</li>
        </ul>
        <p>
          We may remove content and suspend accounts that breach these rules. You retain ownership of content you
          upload; you grant us the limited licence needed to store, transmit and display it in operating the platform.
        </p>
      </Section>

      <Section n="9" title="Confidentiality">
        <p>
          Quote contents, RFQ details, project records and business information exchanged on the Gateway are
          confidential to the parties involved and to Syntax as platform operator. Syntax does not disclose a
          provider&apos;s quotes to competitors, a customer&apos;s identity before award, or project contents to third
          parties, except as required by law, by a competent authority, or with the party&apos;s consent.
        </p>
      </Section>

      <Section n="10" title="Scientific, ethical and regulatory responsibility">
        <p>
          Each party is responsible for its own regulatory position. Customers are responsible for the ethics
          approvals, informed consent, import/export permits and intended-use legality of the work they request.
          Providers and Suppliers are responsible for holding the licences, accreditations and biosafety
          authorisations their work requires, and for performing services to the professional standard they
          represent. The <Link href="/legal/data" className="text-blue hover:underline">Data &amp; Research
          Ethics Policy</Link> forms part of these Terms and is binding on all parties.
        </p>
      </Section>

      <Section n="11" title="Intellectual property">
        <p>
          The Gateway software, design, text and marks are the property of Syntax of Life or its licensors. Customer
          data, RFQs, results and reports belong to the Customer; provider-developed methods and general know-how
          remain the Provider&apos;s unless the project contract states otherwise. Nothing in these Terms transfers
          ownership of pre-existing intellectual property between the parties.
        </p>
      </Section>

      <Section n="12" title="Disclaimers">
        <p>
          The platform is provided &quot;as is&quot; and &quot;as available&quot;. Syntax does not warrant the scientific
          validity, fitness for purpose, safety or regulatory compliance of work performed by Providers or goods
          supplied by Suppliers, nor continuous error-free availability of the platform. Registry information is
          provider-supplied and verified to the standard described in Section 4.
        </p>
      </Section>

      <Section n="13" title="Limitation of liability">
        <p>
          To the maximum extent permitted by law, Syntax is not liable for indirect, consequential or exemplary
          damages, lost profit, lost data or lost research opportunity arising from use of the platform or from
          marketplace transactions between other parties. Our aggregate liability for claims arising from platform
          operation is limited to the fees you paid Syntax in the twelve months preceding the claim. Nothing in these
          Terms excludes liability that cannot be excluded by law, including liability for fraud or wilful
          misconduct.
        </p>
      </Section>

      <Section n="14" title="Indemnification">
        <p>
          You agree to indemnify and hold harmless Syntax of Life, its officers and staff against claims, losses and
          expenses arising from your breach of these Terms, your uploaded content, your regulatory or ethical
          non-compliance, or your infringement of third-party rights.
        </p>
      </Section>

      <Section n="15" title="Suspension and termination">
        <p>
          You may close your account at any time; project and financial records are retained as required by law and
          the Data &amp; Research Ethics Policy. We may suspend or terminate access for breach, fraud, extended
          non-payment or conduct harmful to the marketplace, with notice where practicable. Provisions that by nature
          survive, confidentiality, IP, liability, disputes, survive termination.
        </p>
      </Section>

      <Section n="16" title="Governing law and disputes">
        <p>
          These Terms are governed by the laws of Pakistan. Disputes arising from platform operation will be
          submitted first to good-faith negotiation, then to the courts of competent jurisdiction in Karachi,
          Pakistan, unless applicable law requires otherwise. Contracts between Customers and Providers or Suppliers
          are governed by the law those parties agree.
        </p>
      </Section>

      <Section n="17" title="Changes and contact">
        <p>
          We may update these Terms; material changes are posted here with a new effective date and, for registered
          accounts, notified in-app or by email before taking effect. Continued use after the effective date
          constitutes acceptance. Legal notices:{" "}
          <Link href="/#contact" className="text-blue hover:underline">contact the platform team</Link>.
        </p>
      </Section>
    </LegalShell>
  );
}
