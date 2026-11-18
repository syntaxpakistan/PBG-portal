import type { Metadata } from "next";
import Link from "next/link";
import { LegalShell, Section, Sub } from "@/components/legal";

export const metadata: Metadata = {
  title: "Privacy Policy",
  alternates: { canonical: "/legal/privacy" },
  description:
    "How the Pakistan Biotechnology Gateway collects, uses, protects and retains personal and project data, including GDPR rights and special-category genetic data handling.",
};

const cell = "border border-line px-3 py-2 align-top text-[13px]";

export default function PrivacyPage() {
  return (
    <LegalShell
      eyebrow="Legal"
      title="Privacy Policy"
      lead="This policy explains what the Gateway collects, why, how it is protected, and the rights you hold over it. It is written for customers, laboratories, suppliers and site visitors, and applies alongside our Data & Research Ethics Policy."
      updated="Last updated: November 2026 · Syntax of Life (Pvt) Ltd · Karachi, Pakistan"
    >
      <Section n="1" title="Who is responsible for your data">
        <p>
          For your account, profile, billing and platform usage data, Syntax of Life (Pvt) Ltd is the{" "}
          <strong className="text-ink">data controller</strong>.
        </p>
        <p>
          For project content exchanged on the marketplace, RFQ details, sample metadata, reports and deliverables:
          the <strong className="text-ink">Customer is the controller</strong> and Syntax, together with the engaged
          Provider, acts as a <strong className="text-ink">processor</strong> handling that data on documented
          instructions. Where we process personal data as a processor, a Data Processing Agreement (DPA) is available
          on request and forms part of the contract.
        </p>
      </Section>

      <Section n="2" title="Data we collect">
        <ul className="list-disc space-y-1.5 pl-5">
          <li><strong className="text-ink">Account & identity</strong>, name, organisation, role, email, phone, credentials (hashed), TOTP second-factor enrolment.</li>
          <li><strong className="text-ink">Profile & verification</strong>, capabilities, instruments, accreditations, addresses, submitted verification documents.</li>
          <li><strong className="text-ink">Marketplace activity</strong>, RFQs, quotes, awards, project stages, QC verdicts, milestone invoices, payment records, reviews and in-platform messages.</li>
          <li><strong className="text-ink">Uploaded files</strong>, documents, reports and receipts you attach to projects (≤25&nbsp;MB each).</li>
          <li><strong className="text-ink">Technical & usage</strong>, log data, IP address, device and browser type, feature usage, security and audit events.</li>
          <li><strong className="text-ink">Communications</strong>, support requests, consultations and correspondence.</li>
        </ul>
      </Section>

      <Section n="3" title="Genetic, health and special-category data">
        <p>
          Genetic and health data are <strong className="text-ink">special category data</strong> under GDPR Article 9
          and equivalent provisions elsewhere, they receive heightened protection. The Gateway is designed so that
          this data mostly never reaches us:
        </p>
        <ul className="list-disc space-y-1.5 pl-5">
          <li><strong className="text-ink">No raw genomic hosting.</strong> FASTQ, BAM, CRAM and comparable raw sequence files are never stored on our systems; they move directly between Customer and Provider.</li>
          <li><strong className="text-ink">De-identification required.</strong> Project attachments must not contain direct identifiers of research participants or patients. Customers must de-identify or pseudonymise personal data in uploaded documents, for HIPAA-covered customers, consistent with 45&nbsp;C.F.R. §164.514.</li>
          <li><strong className="text-ink">No re-identification.</strong> Any attempt to re-identify de-identified or pseudonymised data, or to match it against external datasets, is a material breach of our Terms.</li>
          <li><strong className="text-ink">Processor position.</strong> Where special-category data legitimately appears in project content, the Customer warrants it has a lawful basis, consent, ethical approval or another Article&nbsp;9 condition, and we process it only on documented instructions under heightened access controls.</li>
        </ul>
      </Section>

      <Section n="4" title="Purposes and lawful bases">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-surface text-left">
                <th className={cell}>Purpose</th>
                <th className={cell}>Data used</th>
                <th className={cell}>Lawful basis (GDPR)</th>
              </tr>
            </thead>
            <tbody>
              {[
                ["Operate the marketplace, accounts, RFQs, quoting, projects, files, messages", "Account, marketplace activity, uploads", "Contract performance (Art. 6(1)(b))"],
                ["Verification of providers and suppliers", "Profile, verification documents", "Legitimate interests, marketplace integrity (Art. 6(1)(f))"],
                ["Billing, subscriptions, invoices, payouts", "Identity, transaction records", "Contract + legal obligations (Art. 6(1)(b), (c))"],
                ["Security, fraud prevention, audit logging", "Technical logs, account events", "Legitimate interests + legal obligations"],
                ["Service notifications, stage changes, quotes, QC decisions, invoices", "Account contact details", "Contract performance"],
                ["Product improvement and analytics", "Aggregated usage data", "Legitimate interests; consent where required"],
                ["Legal claims and compliance", "Any relevant records", "Legal obligation + legitimate interests"],
              ].map((r) => (
                <tr key={r[0]}>
                  <td className={cell}>{r[0]}</td>
                  <td className={cell}>{r[1]}</td>
                  <td className={cell}>{r[2]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section n="5" title="Who we share data with">
        <ul className="list-disc space-y-1.5 pl-5">
          <li><strong className="text-ink">Marketplace counterparties</strong>, Providers see RFQ content; Customers see awarded quote details; identity is unmasked only as the project requires (see Terms §5).</li>
          <li><strong className="text-ink">Service vendors</strong>, cloud hosting, payment processing and transactional email under contract and appropriate safeguards.</li>
          <li><strong className="text-ink">Professional advisers & authorities</strong>, auditors, counsel, and regulators or courts where required by law.</li>
          <li><strong className="text-ink">Corporate events</strong>, a merger or acquisition counterparty under equivalent confidentiality.</li>
        </ul>
        <p>
          We do not sell personal data. We do not share quote contents between competing providers. We do not use
          project content to train public AI models.
        </p>
      </Section>

      <Section n="6" title="International transfers">
        <p>
          Our infrastructure may process data in data centres outside Pakistan. Where personal data subject to GDPR or
          UK GDPR is transferred internationally, we rely on recognised transfer mechanisms, adequacy decisions or
          Standard Contractual Clauses, and contractual equivalents for other jurisdictions. Transfers of project
          content between parties happen under their own agreements.
        </p>
      </Section>

      <Section n="7" title="Retention">
        <ul className="list-disc space-y-1.5 pl-5">
          <li><strong className="text-ink">Accounts</strong>, kept while active; deleted or anonymised within 12 months of closure unless a longer period is legally required.</li>
          <li><strong className="text-ink">Financial & transaction records</strong>, retained per applicable tax and company law (typically up to 7 years).</li>
          <li><strong className="text-ink">Project records & files</strong>, retained for the project lifetime and the contract&apos;s stated period; deleted on valid request subject to legal holds.</li>
          <li><strong className="text-ink">Security & audit logs</strong>, 12–24 months for security investigations and compliance.</li>
          <li><strong className="text-ink">Backups</strong>, deleted content may persist in encrypted backups for a limited rotation period before being purged.</li>
        </ul>
      </Section>

      <Section n="8" title="Security">
        <p>
          We apply layered technical and organisational controls aligned with ISO/IEC 27001 principles: encryption in
          transit and at rest, role-isolated access (customers, providers, suppliers and operations each see only
          their scope), least-privilege staff access, mandatory two-factor authentication for privileged operations,
          database-level separation of sealed quotes, and an audit log across privileged actions. No system is
          perfectly secure; we maintain incident-response procedures and will notify affected parties and regulators
          of reportable breaches within required timelines.
        </p>
      </Section>

      <Section n="9" title="Your rights">
        <p>Where GDPR, UK GDPR or equivalent law applies, you may exercise:</p>
        <ul className="list-disc space-y-1.5 pl-5">
          <li><strong className="text-ink">Access</strong>, confirmation and a copy of your personal data;</li>
          <li><strong className="text-ink">Rectification</strong>, correction of inaccurate data;</li>
          <li><strong className="text-ink">Erasure</strong>, deletion subject to legal retention duties;</li>
          <li><strong className="text-ink">Portability</strong>, a structured, machine-readable export;</li>
          <li><strong className="text-ink">Restriction & objection</strong>, limit or object to processing, including marketing;</li>
          <li><strong className="text-ink">Withdraw consent</strong>, where processing rests on consent;</li>
          <li><strong className="text-ink">Complain</strong>, to your supervisory authority.</li>
        </ul>
        <p>
          Send requests via <Link href="/#contact" className="text-blue hover:underline">contact</Link>. We
          respond within one month (GDPR) or the locally applicable period. For project content where a Customer or
          institution is the controller, we will refer you to that party as required.
        </p>
      </Section>

      <Section n="10" title="Cookies and tracking">
        <p>
          We use strictly-necessary cookies for session integrity, security and preferences. Optional analytics
          cookies, where used, are non-identifying and can be disabled without affecting core functionality. We do
          not run third-party advertising trackers.
        </p>
      </Section>

      <Section n="11" title="Children">
        <p>
          The Gateway is a professional B2B service, not directed at children. We do not knowingly collect personal
          data of minors; where research participant data concerns minors it is governed by the submitting
          organisation&apos;s ethics approvals and consent framework.
        </p>
      </Section>

      <Section n="12" title="Automated decisions">
        <p>
          We do not make solely automated decisions with legal or similarly significant effect. RFQ routing matches
          declared capabilities, a form of sorting, not a decision about you.
        </p>
      </Section>

      <Section n="13" title="Changes and contact">
        <p>
          Material changes are posted here with a new effective date and notified to registered accounts. Privacy
          questions, rights requests and DPA enquiries:{" "}
          <Link href="/#contact" className="text-blue hover:underline">contact the platform team</Link>.
        </p>
      </Section>
    </LegalShell>
  );
}
