"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import {
  ChevronDown,
  ArrowRight,
  Menu,
  X,
  LayoutGrid,
  Activity,
  FlaskConical,
  CircleDot,
  Map,
  ShieldPlus,
  Archive,
  Ruler,
  Dna,
  Target,
  TestTubes,
  Atom,
  Layers,
  GraduationCap,
  Pill,
  Stethoscope,
  Handshake,
  Workflow,
  FileSearch,
  BarChart3,
  ScanSearch,
  FolderOpen,
  BookOpen,
  PenLine,
  MonitorPlay,
  HelpCircle,
  Gift,
  Info,
  Newspaper,
  Award,
  Briefcase,
  BadgeCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/theme-toggle";

type MenuItem = { icon: React.ElementType; title: string; desc: string; href: string };
type Featured = { title: string; desc: string; cta: string; href: string };
type BottomCard = { title: string; desc: string; href: string; tint: string };
type NavEntry = {
  label: string;
  featured?: Featured;
  groups: { heading?: string; items: MenuItem[] }[];
  bottom?: { heading: string; cards: BottomCard[] };
};

const NAV: NavEntry[] = [
  {
    label: "Services",
    featured: {
      title: "All sequencing services",
      desc: "Every assay category across the verified network, one RFQ away",
      cta: "View all services",
      href: "/services",
    },
    groups: [
      {
        items: [
          { icon: LayoutGrid, title: "All Services", desc: "The complete sequencing catalog", href: "/services" },
          { icon: Activity, title: "Transcriptomics", desc: "Bulk & targeted expression profiling", href: "/services/transcriptomics" },
          { icon: FlaskConical, title: "RNA Sequencing", desc: "RNA-Seq from standard to low-input", href: "/services/rna-sequencing" },
          { icon: CircleDot, title: "Single Cell Sequencing", desc: "10x Genomics, BD Rhapsody, Takara", href: "/services/single-cell-sequencing" },
          { icon: Map, title: "Spatial Transcriptomics", desc: "Visium, Xenium & StrataMap", href: "/services/spatial-transcriptomics" },
          { icon: ShieldPlus, title: "Immune Profiling", desc: "Repertoire & TCR/BCR sequencing", href: "/services/immune-profiling" },
        ],
      },
      {
        items: [
          { icon: Archive, title: "Premade Library Sequencing", desc: "Sequence-only runs on your libraries", href: "/services/premade-library-sequencing" },
          { icon: Ruler, title: "Long Read Services", desc: "PacBio Revio & ONT platforms", href: "/services/long-read" },
          { icon: Dna, title: "Genomics (WGS/WES)", desc: "Whole genome & whole exome", href: "/services/genomics" },
          { icon: Target, title: "Oncology Panel Sequencing", desc: "Targeted cancer gene panels", href: "/services/oncology-panels" },
          { icon: TestTubes, title: "Proteomics Services", desc: "Olink Reveal biomarker panels", href: "/services/proteomics" },
          { icon: Atom, title: "Epigenomics", desc: "Methylation & chromatin assays", href: "/services/epigenomics" },
        ],
      },
    ],
    bottom: {
      heading: "Certified service programs",
      cards: [
        { title: "10x Genomics", desc: "Single cell & multiome workflows.", href: "/platform/verification", tint: "mint" },
        { title: "Visium • Xenium • StrataMap", desc: "Spatial platforms, validated in-house.", href: "/platform/verification", tint: "lavender" },
        { title: "PacBio Revio", desc: "Long-read structural variant resolution.", href: "/platform/verification", tint: "peach" },
        { title: "Olink Reveal", desc: "1,000+ protein biomarkers from 4 μL.", href: "/platform/verification", tint: "lemon" },
      ],
    },
  },
  {
    label: "Multiomics",
    featured: {
      title: "Multiomics solutions",
      desc: "Combined assays and analysis, tailored to your research setting",
      cta: "See the overview",
      href: "/multiomics",
    },
    groups: [
      {
        heading: "By audience",
        items: [
          { icon: Layers, title: "Multiomics Overview", desc: "Integrated assays, one study design", href: "/multiomics" },
          { icon: GraduationCap, title: "Academics & Research Institutes", desc: "Grant-scale studies & publications", href: "/solutions/academics" },
          { icon: Pill, title: "Pharmaceutical & Biotech", desc: "Discovery, translational & biomarker work", href: "/solutions/pharma-biotech" },
          { icon: Stethoscope, title: "Clinical & Diagnostics Labs", desc: "Validated workflows for patient cohorts", href: "/solutions/clinical-diagnostics" },
          { icon: Handshake, title: "Contract Research Organizations", desc: "White-label capacity on demand", href: "/solutions/cro" },
        ],
      },
    ],
  },
  {
    label: "Bioinformatics",
    featured: {
      title: "Analysis, done for you",
      desc: "Pipelines, QC and publication-ready reporting",
      cta: "Explore bioinformatics",
      href: "/bioinformatics",
    },
    groups: [
      {
        items: [
          { icon: Workflow, title: "Bioinformatics Overview", desc: "Pipelines & analyst hours", href: "/bioinformatics" },
          { icon: FileSearch, title: "WES Analysis", desc: "Variant calling & annotation", href: "/bioinformatics/wes-analysis" },
          { icon: BarChart3, title: "RNA Analysis", desc: "Differential expression & pathways", href: "/bioinformatics/rna-analysis" },
          { icon: ScanSearch, title: "Spatial Bioinformatics", desc: "Tissue-mapped expression analysis", href: "/bioinformatics/spatial-bioinformatics" },
        ],
      },
    ],
  },
  {
    label: "Resources",
    groups: [
      {
        heading: "Learn",
        items: [
          { icon: FolderOpen, title: "Documents", desc: "Tech notes & sample guidelines", href: "/resources/documents" },
          { icon: BookOpen, title: "Publications", desc: "Papers powered by the network", href: "/resources/publications" },
          { icon: PenLine, title: "Blog", desc: "Methods, tips & field notes", href: "/resources/blog" },
        ],
      },
      {
        heading: "Explore",
        items: [
          { icon: MonitorPlay, title: "Posters & Videos", desc: "Conference posters & webinars", href: "/resources/posters-videos" },
          { icon: HelpCircle, title: "FAQs", desc: "Verification, quoting & data policy", href: "/services#faq" },
          { icon: Gift, title: "Referral Program", desc: "Credit for every successful referral", href: "/resources/referral" },
        ],
      },
    ],
  },
  {
    label: "Company",
    groups: [
      {
        items: [
          { icon: Info, title: "About", desc: "The team behind the Gateway", href: "/company/about" },
          { icon: Newspaper, title: "News & Events", desc: "Announcements & where to find us", href: "/company/news" },
          { icon: Award, title: "Grants", desc: "Funding programs for your study", href: "/company/grants" },
          { icon: Briefcase, title: "Careers", desc: "Join the platform team", href: "/company/careers" },
          { icon: BadgeCheck, title: "Certified Service Provider", desc: "Platform-validated workflows", href: "/company/certified" },
        ],
      },
    ],
  },
];

const TINTS: Record<string, string> = {
  mint: "bg-[#e7faf1] border-[#a9e5cb]",
  lavender: "bg-[#ecebfa] border-[#c4c0ec]",
  peach: "bg-[#fdeee1] border-[#f3c9a5]",
  lemon: "bg-[#fbf6d9] border-[#e6d97f]",
};

export function Navbar() {
  const [open, setOpen] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileSection, setMobileSection] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const active = NAV.find((n) => n.label === open);

  return (
    <header className="fixed inset-x-0 top-[34px] z-50 pt-2.5">
      <div
        className={cn(
          "container-x transition-all duration-500",
          scrolled ? "max-w-[1100px]" : "max-w-[1200px]"
        )}
      >
        <div className="relative flex h-[76px] items-center justify-between gap-4" onMouseLeave={() => setOpen(null)}>
          <nav
            className={cn(
              "flex h-[76px] flex-1 items-center justify-between rounded-full px-5 transition-all duration-500",
              scrolled ? "bg-navy/90 shadow-xl shadow-navy/20 backdrop-blur-xl" : "bg-navy-2/40 backdrop-blur-md"
            )}
          >
            {/* Logo */}
            <Link href="/" className="flex items-center" aria-label="Syntax of Life home">
              <img src="/brand/logo-dark.png" alt="Syntax of Life" className="h-14 w-auto" />
            </Link>

            {/* Desktop nav */}
            <ul className="hidden items-center lg:flex">
              <li onMouseEnter={() => setOpen(null)}>
                <Link
                  href="/partners"
                  className="flex items-center gap-1 rounded-full px-3 py-2 text-[13.5px] text-white/70 transition-colors hover:text-white"
                >
                  Partners
                </Link>
              </li>
              {NAV.map((entry) => (
                <li key={entry.label} onMouseEnter={() => setOpen(entry.label)}>
                  <button
                    className={cn(
                      "flex items-center gap-1 rounded-full px-3 py-2 text-[13.5px] transition-colors",
                      open === entry.label ? "text-white" : "text-white/70 hover:text-white"
                    )}
                  >
                    {entry.label}
                    <ChevronDown className={cn("size-3.5 transition-transform duration-300", open === entry.label && "rotate-180")} />
                  </button>
                </li>
              ))}
            </ul>

            {/* Mobile toggle */}
            <button
              className="grid size-10 place-items-center rounded-full border border-white/20 text-white lg:hidden"
              onClick={() => {
                setMobileOpen((v) => !v);
                setMobileSection(null);
              }}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
          </nav>

          {/* Right actions — outside the pill, on navy */}
          <div className="hidden items-center lg:flex" onMouseEnter={() => setOpen(null)}>
            <ThemeToggle onDark />
          </div>

          {/* Mega menu panel — prezent style: featured card + item grid + bottom tinted cards */}
          <AnimatePresence>
            {open && active && (
              <motion.div
                key={open}
                initial={{ opacity: 0, y: 12, scale: 0.985 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.985 }}
                transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                className="absolute left-0 top-[84px] w-[min(860px,94vw)]"
              >
                <div className="overflow-hidden rounded-2xl bg-surface p-4 shadow-2xl shadow-navy/30">
                  <div className={cn("grid gap-4", active.featured ? "grid-cols-[220px_1fr]" : "grid-cols-1")}>
                    {/* featured card */}
                    {active.featured && (
                      <Link href={active.featured.href} className="group flex flex-col rounded-xl border border-line bg-paper p-3 transition-colors hover:border-line-strong">
                        <div className="relative h-[92px] overflow-hidden rounded-lg bg-gradient-to-br from-navy-2 to-navy">
                          <Dna className="absolute -right-2 -top-2 size-20 text-white/10" strokeWidth={1} />
                          <div className="absolute bottom-2 left-3 h-px w-2/3 bg-gradient-to-r from-mint via-yellow to-transparent" />
                        </div>
                        <p className="mt-3 text-[14.5px] font-semibold leading-snug text-ink">{active.featured.title}</p>
                        <p className="mt-1 flex-1 text-[12px] leading-snug text-muted">{active.featured.desc}</p>
                        <span className="mt-2.5 inline-flex items-center gap-1.5 text-[12.5px] font-medium text-navy-2 group-hover:text-blue">
                          {active.featured.cta} <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
                        </span>
                      </Link>
                    )}

                    {/* item columns */}
                    <div className={cn("grid gap-1", active.groups.length > 1 ? "sm:grid-cols-2" : "grid-cols-1 sm:grid-cols-2")}>
                      {active.groups.map((group, gi) => (
                        <div key={group.heading ?? gi} className="p-1">
                          {group.heading && (
                            <p className="px-3 pb-2 pt-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">
                              {group.heading}
                            </p>
                          )}
                          {group.items.map((item) => (
                            <Link
                              key={item.title}
                              href={item.href}
                              className="group flex items-start gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-paper-2"
                            >
                              <item.icon className="mt-0.5 size-4.5 shrink-0 text-navy-2" strokeWidth={1.8} />
                              <span>
                                <span className="flex items-center gap-1.5 text-[14px] font-semibold text-ink">
                                  {item.title}
                                </span>
                                <span className="mt-0.5 block text-[12px] leading-snug text-muted">{item.desc}</span>
                              </span>
                            </Link>
                          ))}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* bottom tinted cards */}
                  {active.bottom && (
                    <div className="mt-4 border-t border-line pt-3.5">
                      <p className="px-1 text-[10.5px] font-semibold uppercase tracking-[0.16em] text-muted">
                        {active.bottom.heading}
                      </p>
                      <div className="mt-2.5 grid grid-cols-2 gap-2 lg:grid-cols-4">
                        {active.bottom.cards.map((c) => (
                          <Link
                            key={c.title}
                            href={c.href}
                            className={cn(
                              "group rounded-xl border p-3.5 transition-transform duration-300 hover:-translate-y-0.5",
                              TINTS[c.tint]
                            )}
                          >
                            <p className="text-[13px] font-semibold text-ink">{c.title}</p>
                            <p className="mt-1 text-[11px] leading-snug text-body/80">{c.desc}</p>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Mobile menu — collapsible sections with arrows, capped + scrollable */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="mt-2 overflow-hidden lg:hidden"
          >
            <div className="container-x">
              <div className="max-h-[calc(100dvh-140px)] overflow-y-auto overscroll-contain rounded-2xl border border-line bg-surface p-4 shadow-2xl shadow-navy/20">
                <div className="border-b border-line">
                  <Link
                    href="/partners"
                    onClick={() => setMobileOpen(false)}
                    className="flex w-full items-center justify-between px-2 py-3.5 text-[15px] font-semibold text-ink"
                  >
                    Partners
                    <ArrowRight className="size-4 text-muted" />
                  </Link>
                </div>
                {NAV.map((entry) => {
                  const expanded = mobileSection === entry.label;
                  return (
                    <div key={entry.label} className="border-b border-line last:border-0">
                      <button
                        onClick={() => setMobileSection(expanded ? null : entry.label)}
                        className="flex w-full items-center justify-between px-2 py-3.5 text-[15px] font-semibold text-ink"
                        aria-expanded={expanded}
                      >
                        {entry.label}
                        <ChevronDown className={cn("size-4 text-muted transition-transform duration-300", expanded && "rotate-180")} />
                      </button>
                      <AnimatePresence initial={false}>
                        {expanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                            className="overflow-hidden"
                          >
                            <div className="space-y-0.5 pb-3 pl-1">
                              {entry.featured && (
                                <Link
                                  href={entry.featured.href}
                                  onClick={() => setMobileOpen(false)}
                                  className="flex items-center gap-3 rounded-lg bg-(--st-blue-bg) px-3 py-2.5 text-[14px] font-medium text-(--st-blue-fg)"
                                >
                                  <ArrowRight className="size-4" /> {entry.featured.cta}
                                </Link>
                              )}
                              {entry.groups.flatMap((g) => g.items).map((item) => (
                                <Link
                                  key={item.title}
                                  href={item.href}
                                  onClick={() => setMobileOpen(false)}
                                  className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-[14px] text-ink hover:bg-paper-2"
                                >
                                  <item.icon className="size-4 shrink-0 text-blue" />
                                  <span className="min-w-0">
                                    <span className="block truncate">{item.title}</span>
                                  </span>
                                </Link>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
                <div className="flex items-center gap-3 border-t border-line pt-3">
                  <Link href="/login" onClick={() => setMobileOpen(false)} className="btn-ghost flex-1 justify-center">Login</Link>
                  <Link href="/biogateway" onClick={() => setMobileOpen(false)} className="btn-secondary flex-1 justify-center">Gateway Portal</Link>
                  <ThemeToggle />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
