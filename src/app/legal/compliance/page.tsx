import type { Metadata } from "next";
import Link from "next/link";
import { LegalShell, Section, Sub } from "@/components/legal";

export const metadata: Metadata = {
  title: "Compliance & Standards",
  alternates: { canonical: "/legal/compliance" },
  description:
    "How the Pakistan Biotechnology Gateway aligns with GDPR, HIPAA, ISO 15189/17025/27001, GLP/GCP and Pakistan's regulatory framework for biotechnology work.",
};

export default function CompliancePage() {
  return (
    <LegalShell
      eyebrow="Legal"
      title="Compliance & Standards"
      lead="Research-grade work demands research-grade governance. This page states, plainly, how the Gateway aligns with the international frameworks our users operate under, and where responsibility sits between the platform, providers and customers."
      updated="Last updated: November 2026 · Syntax of Life (Pvt) Ltd · Karachi, Pakistan"
    >
      <Section n="1" title="Our compliance approach">
        <p>
          The Gateway is engineered around privacy-by-design: role-isolated portals, sealed quotes enforced at the
          data layer, masked identity before award, staged result release, immutable audit logging and mandatory
          two-factor authentication for privileged operations. Compliance is shared, the platform provides the
          controls; Customers and Providers are responsible for the approvals and licences their own work requires.
        </p>
      </Section>

      <Section n="2" title="GDPR and UK GDPR">
        <p>
          For users and counterparties in the EU/UK, we operate as follows:
        </p>
        <ul className="list-disc space-y-1.5 pl-5">
          <li><strong className="text-ink">Lawful bases</strong> mapped per processing activity (Privacy Policy §4): contract performance, legal obligation, legitimate interests, and consent where required.</li>
          <li><strong className="text-ink">Special-category data</strong> (genetic, health, Art. 9) handled under documented instructions, de-identified where possible, under heightened access controls; we require Customers to establish the Article 9 condition.</li>
          <li><strong className="text-ink">Data subject rights</strong> honoured within one month, access, rectification, erasure, portability, restriction, objection (Privacy Policy §9).</li>
          <li><strong className="text-ink">Transfers</strong> outside the EU/UK via adequacy decisions or Standard Contractual Clauses.</li>
          <li><strong className="text-ink">DPA available</strong>, a Data Processing Agreement for Customers for whom we act as processor; a DPIA can be supported on request for high-risk processing.</li>
          <li><strong className="text-ink">Breach notification</strong> to supervisory authorities and affected parties within required timelines.</li>
        </ul>
      </Section>

      <Section n="3" title="HIPAA position">
        <p>
          The Gateway is not a HIPAA covered entity or business associate by default, we do not host raw genomic or
          clinical datasets, and project attachments are documents only. For HIPAA-covered customers (US providers,
          payers or clearinghouses):
        </p>
        <ul className="list-disc space-y-1.5 pl-5">
          <li>upload only data de-identified consistent with 45&nbsp;C.F.R. §164.514, Safe Harbor removal or Expert Determination;</li>
          <li>your organisation remains responsible for its own PHI handling and minimum-necessary rules;</li>
          <li>where a genuine business-associate relationship is required, contact us, a Business Associate Agreement may be executed for qualifying engagements.</li>
        </ul>
      </Section>

      <Section n="4" title="Laboratory and quality standards">
        <ul className="list-disc space-y-1.5 pl-5">
          <li><strong className="text-ink">ISO 15189</strong>, medical laboratory competence; where a provider holds accreditation it is declared on its registry profile and verified during onboarding.</li>
          <li><strong className="text-ink">ISO/IEC 17025</strong>, testing and calibration laboratories; competence claims are shown per provider.</li>
          <li><strong className="text-ink">GLP / GCP</strong>, for regulated studies (preclinical, clinical-trial support), customers and providers contract for the applicable Good Practice framework; project records support audit trails.</li>
          <li><strong className="text-ink">Good Documentation Practice</strong>, QC verdicts, stage history, file releases and decisions are preserved as tamper-evident project records.</li>
        </ul>
        <p>
          Provider accreditations are provider-declared and Syntax-verified to our criteria; Customers remain
          responsible for confirming the accreditation level their study requires (see Terms §4).
        </p>
      </Section>

      <Section n="5" title="Information security">
        <p>
          Security controls are aligned with ISO/IEC 27001 and ISO/IEC 27701 principles: encryption in transit and at
          rest, least-privilege access, TOTP second-factor enforcement for privileged roles, database-enforced quote
          isolation, audit logging, and periodic review. Vulnerability disclosures are welcome via{" "}
          <Link href="/#contact" className="text-blue hover:underline">contact</Link>, responsible reporting
          is appreciated.
        </p>
      </Section>

      <Section n="6" title="Pakistan regulatory framework">
        <ul className="list-disc space-y-1.5 pl-5">
          <li><strong className="text-ink">PECA 2016</strong>, electronic transactions and cyber-crime provisions applicable to platform conduct.</li>
          <li><strong className="text-ink">Personal Data Protection Bill</strong>, Pakistan's draft data-protection framework; our controller/processor architecture and rights handling are designed in anticipation of its requirements.</li>
          <li><strong className="text-ink">National Biosafety Committee / Pakistan Biosafety Rules</strong>, governing GMO and regulated-organism work; providers must hold the approvals their scope requires.</li>
          <li><strong className="text-ink">DRAP</strong>, Drug Regulatory Authority of Pakistan rules where supplies or diagnostics fall within its remit.</li>
          <li><strong className="text-ink">Company & tax law</strong>, invoicing, retention and reporting per applicable Pakistan statute.</li>
        </ul>
      </Section>

      <Section n="7" title="Other jurisdictions">
        <p>
          Counterparties elsewhere (for example under Canada&apos;s PIPEDA or Australian Privacy Act) are handled
          under the equivalent principles in our Privacy Policy, documented instructions, safeguards, and
          contractual commitments. Where a project must satisfy a specific framework, raise it during RFQ scoping so
          routing can match appropriately accredited providers.
        </p>
      </Section>

      <Section n="8" title="Requests and documentation">
        <p>
          Customers and providers may request: our DPA template, security questionnaire responses, verification
          criteria summaries, and (for their own engagements) the provider documentation referenced in Section 4.
          Route all compliance requests through{" "}
          <Link href="/#contact" className="text-blue hover:underline">contact</Link>.
        </p>
      </Section>
    </LegalShell>
  );
}
