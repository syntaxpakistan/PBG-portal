export const instant = false

import type { Metadata } from "next";
import Link from "next/link";
import { CircleCheck, ArrowRight, Compass } from "lucide-react";
import { AnnouncementBar } from "@/components/announcement-bar";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";

type Entry = { eyebrow: string; title: string; desc: string; points: string[] };

const e = (eyebrow: string, title: string, desc: string, points: string[]): Entry => ({ eyebrow, title, desc, points });

const CONTENT: Record<string, Entry> = {
  "/multiomics": e("Multiomics", "Multiomics solutions", "Genomic, transcriptomic, epigenomic and proteomic assays unified under a single study design — one RFQ, one integrated report.", ["Integrated multi-assay study design", "Single-sample, single-vendor workflows", "Unified cross-omic bioinformatics"]),
  "/solutions/academics": e("Solutions", "Academics & research institutes", "Grant-scale study design, transparent pricing and publication-ready deliverables for universities and research centers.", ["Budget-friendly blind quotes", "Publication-ready figures & reports", "Multi-site cohort coordination"]),
  "/solutions/pharma-biotech": e("Solutions", "Pharmaceutical & biotech companies", "Discovery, translational and biomarker programs run through verified facilities with auditable delivery.", ["Scalable cohort capacity", "Immuno-oncology & biomarker assays", "Audit-ready documentation"]),
  "/solutions/clinical-diagnostics": e("Solutions", "Clinical & diagnostics laboratories", "Validated workflows for patient cohorts, declared accreditations and strict chain-of-custody tracking.", ["FFPE & low-input workflows", "Accreditation-visible profiles", "Tracked sample handoff"]),
  "/solutions/cro": e("Solutions", "Contract research organizations", "White-label sequencing and analysis capacity on demand — quote under your own timelines.", ["Elastic surge capacity", "Confidential blind quoting", "Custom deliverable formats"]),
  "/solutions/researchers": e("Solutions", "For researchers", "Submit structured RFQs and compare blind quotes side-by-side from verified providers.", ["Structured RFQ builder", "Side-by-side quote comparison", "Free for customers"]),
  "/solutions/labs": e("Solutions", "For laboratories", "Receive RFQs matched to your platforms and quote on merit — your pricing stays invisible to competitors.", ["Capability-matched RFQs", "Blind quoting by design", "You control acceptance"]),
  "/solutions/suppliers": e("Solutions", "For suppliers", "List reagents, kits and consumables in the moderated catalog and receive direct enquiries.", ["Moderated national catalog", "Direct buyer enquiries", "Indigenous product focus"]),
  "/solutions/admin": e("Solutions", "For administrators", "Provider verification, complaint handling, fee tracking and a complete audit trail.", ["Verification workflows", "Full audit logging", "Governance dashboards"]),
  "/resources/documents": e("Resources", "Documents & technical guides", "Whitepapers, application notes and sample-preparation guides for every assay category.", ["Sample requirement specs", "Platform chemistry notes", "Submission checklists"]),
  "/resources/publications": e("Resources", "Publications", "Peer-reviewed research powered by network workflows across genomics, transcriptomics and multiomics.", ["200+ peer-reviewed papers", "Method & citation details", "Linked assays per study"]),
  "/resources/blog": e("Resources", "Blog", "Methods, tips and field notes from the scientists and engineers behind the Gateway.", ["Assay selection guides", "Study design walkthroughs", "Platform comparisons"]),
  "/resources/posters-videos": e("Resources", "Posters & videos", "Conference posters, recorded webinars and workflow walkthroughs.", ["Conference poster archive", "Recorded webinars", "Workflow demos"]),
  "/resources/referral": e("Resources", "Referral program", "Refer a colleague and earn credit when they launch their first project on the Gateway.", ["Reward per onboarded referral", "Trackable referral links", "No cap on earnings"]),
  "/resources/verification": e("Resources", "Verification criteria", "What facilities and suppliers must demonstrate before earning the verified badge.", ["Credential & equipment checks", "Track-record review", "Explicitly non-governmental badge"]),
  "/resources/docs": e("Resources", "Documentation", "Guides for every portal role — customers, providers, suppliers and administrators.", ["Role-based walkthroughs", "RFQ & quoting references", "Pipeline stage definitions"]),
  "/resources/news": e("Resources", "Platform updates", "New capabilities, registry additions and marketplace announcements.", ["Feature releases", "New verified providers", "Program announcements"]),
  "/resources/events": e("Resources", "Events", "Meet the team at conferences and webinars — reserve time to scope your next project.", ["Conference calendar", "Book a meeting", "Webinar replays"]),
  "/resources/faqs": e("Resources", "Frequently asked questions", "Answers on verification, quoting, samples, turnaround and data handling.", ["RFQ & quoting", "Sample requirements", "Data policy"]),
  "/company/about": e("Company", "About", "The team building Pakistan's first biotechnology gateway — a governed marketplace for sequencing, bioinformatics and lab supply.", ["Mission & story", "The Syntax of Life team", "What makes us different"]),
  "/company/news": e("Company", "News & events", "Announcements, partnerships and where to find the team next.", ["Press & announcements", "Conference schedule", "Milestones"]),
  "/company/grants": e("Company", "Grants", "Funding programs supporting sequencing and multiomics studies across the network.", ["Active grant programs", "Eligibility & timelines", "How to apply"]),
  "/company/careers": e("Company", "Careers", "Join the team building the national biotech gateway.", ["Open roles", "Life at Syntax", "How we hire"]),
  "/company/certified": e("Company", "Certified service provider program", "Industry-validated workflows for the platforms you trust — and what certification means here.", ["Platform validation criteria", "In-house workflow audits", "Certified partner list"]),
  "/company/contact": e("Company", "Contact", "Talk to the platform team about your project, onboarding or partnership.", ["Response within one business day", "Project scoping calls", "Supplier & provider onboarding"]),
  "/company/trust": e("Company", "Trust & data policy", "What we store, what we never store, and how your project data is governed.", ["No raw genomic files hosted", "Documents only, ≤25MB", "Admin-audited access"]),
  "/company/legal": e("Company", "Terms & privacy", "The legal framework governing marketplace use, data handling and disputes.", ["Terms of service", "Privacy policy", "Marketplace rules"]),
  "/contact": e("Contact", "Talk to us", "Questions about a project, onboarding or a partnership — the team replies within one business day.", ["Project scoping", "Onboarding help", "Partnership enquiries"]),
  "/platform/rfq": e("Platform", "RFQ engine", "Structured requests precisely routed to providers whose capabilities match your study.", ["Guided request builder", "Capability matching", "Attachment support ≤25MB"]),
  "/platform/quoting": e("Platform", "Blind quoting", "Competing quotes isolated at the database layer — providers never see rival bids.", ["Database-level isolation", "Side-by-side comparison", "Merit-based selection"]),
  "/platform/verification": e("Platform", "Verification", "Syntax criteria every facility must clear before it can quote — an explicitly non-governmental badge.", ["Credential checks", "Equipment validation", "Track-record review"]),
  "/platform/pipeline": e("Platform", "Status pipeline", "Eight tracked stages from RFQ to result — complete visibility on every project.", ["Sample handoff tracking", "Stage notifications", "Audit trail"]),
};

const QUICK_LINKS = [
  { label: "Browse all services", href: "/services" },
  { label: "Explore the platform", href: "/platform" },
  { label: "Visit the marketplace", href: "/marketplace" },
  { label: "Join the Gateway", href: "/biogateway" },
];

export async function generateMetadata({ params }: { params: Promise<{ slug: string[] }> }): Promise<Metadata> {
  const { slug } = await params;
  const entry = CONTENT["/" + slug.join("/")];
  return { title: entry ? `${entry.title} — biogateway` : "biogateway" };
}

export default async function CatchAllPage({ params }: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await params;
  const path = "/" + slug.join("/");
  const entry = CONTENT[path] ?? {
    eyebrow: "Gateway",
    title: "This section is on its way",
    desc: "We're still finishing this part of the Gateway. In the meantime, everything below is live.",
    points: [],
  };

  return (
    <>
      <AnnouncementBar />
      <Navbar />
      <main className="flex-1">
        <section className="relative overflow-hidden bg-gradient-to-b from-navy-2 via-navy to-navy pb-20 pt-[185px]">
          <div className="grid-lines on-dark absolute inset-0" />
          <div className="glow-orb left-[10%] top-[-200px] size-[500px] bg-blue-bright/15" />
          <div className="glow-orb right-[5%] bottom-[-150px] size-[350px] bg-mint/10" />
          <div className="container-x relative">
            <span className="inline-block rounded-full border border-white/25 px-4 py-1.5 text-[10.5px] font-medium uppercase tracking-[0.14em] text-[#c5d2e1]">
              {entry.eyebrow}
            </span>
            <h1 className="h-display on-dark mt-6 max-w-2xl">{entry.title}</h1>
            <p className="mt-6 max-w-xl text-[16px] leading-relaxed text-[#c5d2e1]">{entry.desc}</p>
            {entry.points.length > 0 && (
              <ul className="mt-8 flex max-w-xl flex-wrap gap-x-8 gap-y-3">
                {entry.points.map((p) => (
                  <li key={p} className="flex items-center gap-2.5 text-[13.5px] text-[#c5d2e1]">
                    <CircleCheck className="size-4 shrink-0 text-mint" /> {p}
                  </li>
                ))}
              </ul>
            )}
            <div className="mt-9 flex flex-wrap items-center gap-5">
              <span className="btn-wrap">
                <Link href="/biogateway" className="btn-white">Get started</Link>
              </span>
              <Link href="/services" className="group inline-flex items-center gap-2 text-[14.5px] font-medium text-white/90 hover:text-white">
                Browse services <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        </section>

        <section className="bg-paper py-16">
          <div className="container-x">
            <p className="eyebrow flex items-center gap-2"><Compass className="size-4" /> Keep exploring</p>
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {QUICK_LINKS.map((l) => (
                <Link key={l.href} href={l.href} className="card card-hover group flex items-center justify-between p-5">
                  <span className="text-[14px] font-semibold text-ink">{l.label}</span>
                  <ArrowRight className="size-4 text-navy-2 transition-transform group-hover:translate-x-1" />
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
