// Sequencing coverage estimator — mirrors the Illumina coverage calculator
// (customprotocolselector.illumina.com/covcalc) with its real kit/instrument
// data, plus PBG extensions (long-read platforms, RFQ handoff).
// Formulas: Lander & Waterman (1988); Illumina wgs_enr_*_explain.htm.
// Data sources: wgs_enr_Data.txt, wgs_enr_DNA_Kits.txt, wgs_enr_RNA_Kits.txt,
// wgs_enr_DNARNA_Kits.txt — see FLOWS/coverage-calculator-research.md

export type AppType = "dna" | "rna" | "dnarna";
export type KitMethod = "coverage" | "minreads" | "samples";

/* ------------------------------ instruments ---------------------------- */
// Users select INSTRUMENTS (checkboxes); each expands to its run types —
// exactly like the Illumina estimator (one result row per instrument×kit).
// Cluster counts + max cycles from the published estimator tables.
// `code`/`kitCode` match Illumina's compatibility & fixed-sample lookups.

export interface RunType {
  kitCode: string;          // e.g. MSv3, NS2000p3
  label: string;            // e.g. "v3 reagents"
  unit: string;             // "flow cell" | "lane" | "SMRT cell"
  clustersM?: number;
  maxCycles?: number;       // max total cycles the kit supports
  outputGb?: number;        // fixed-output long-read platforms
  note?: string;
}

export interface Instrument {
  id: string;
  name: string;
  code: string;             // instrument code (MS, NS2000, NoS…)
  group: "benchtop" | "production" | "longread";
  runs: RunType[];
}

export const INSTRUMENTS: Instrument[] = [
  // ---------------- benchtop ----------------
  { id: "iseq", name: "iSeq", code: "IS", group: "benchtop", runs: [
    { kitCode: "ISi1", label: "i1 reagents", unit: "flow cell", clustersM: 4, maxCycles: 300 },
  ]},
  { id: "miniseq", name: "MiniSeq", code: "MN", group: "benchtop", runs: [
    { kitCode: "MNmo", label: "Mid Output kit", unit: "flow cell", clustersM: 8, maxCycles: 300 },
    { kitCode: "MNho", label: "High Output kit", unit: "flow cell", clustersM: 25, maxCycles: 300 },
  ]},
  { id: "miseq", name: "MiSeq / MiSeq Dx in RUO mode", code: "MS", group: "benchtop", runs: [
    { kitCode: "MSv3", label: "v3 reagents", unit: "flow cell", clustersM: 25, maxCycles: 600 },
    { kitCode: "MSv2", label: "v2 reagents", unit: "flow cell", clustersM: 15, maxCycles: 500 },
    { kitCode: "MSv2nano", label: "v2 Nano reagents", unit: "flow cell", clustersM: 1, maxCycles: 500 },
    { kitCode: "MSv2micro", label: "v2 Micro reagents", unit: "flow cell", clustersM: 4, maxCycles: 300 },
  ]},
  { id: "ns500", name: "NextSeq 500/550", code: "NS", group: "benchtop", runs: [
    { kitCode: "NSho", label: "High Output kit", unit: "flow cell", clustersM: 400, maxCycles: 300 },
    { kitCode: "NSmo", label: "Mid Output kit", unit: "flow cell", clustersM: 130, maxCycles: 300 },
  ]},
  // ---------------- production ----------------
  { id: "ns500p", name: "NextSeq 500/550", code: "NS", group: "production", runs: [
    { kitCode: "NSho", label: "High Output kit", unit: "flow cell", clustersM: 400, maxCycles: 300 },
    { kitCode: "NSmo", label: "Mid Output kit", unit: "flow cell", clustersM: 130, maxCycles: 300 },
  ]},
  { id: "novaseq", name: "NovaSeq 6000", code: "NoS", group: "production", runs: [
    { kitCode: "NoSSP", label: "SP reagent kit", unit: "flow cell", clustersM: 800, maxCycles: 500 },
    { kitCode: "NoSS1", label: "S1 reagent kit", unit: "flow cell", clustersM: 1600, maxCycles: 300 },
    { kitCode: "NoSS2", label: "S2 reagent kit", unit: "flow cell", clustersM: 4100, maxCycles: 300 },
    { kitCode: "NoSS4", label: "S4 reagent kit", unit: "flow cell", clustersM: 10000, maxCycles: 300 },
  ]},
  { id: "hs4000", name: "HiSeq 3000/4000", code: "HS4000", group: "production", runs: [
    { kitCode: "HS4000", label: "—", unit: "lane", clustersM: 312.5, maxCycles: 300 },
  ]},
  { id: "hs2500rr", name: "HiSeq 1500/2500 Rapid Run", code: "HS2500RR", group: "production", runs: [
    { kitCode: "2500rrv2OBCG", label: "Rapid Run v2 (OBCG)", unit: "flow cell", clustersM: 300, maxCycles: 500 },
    { kitCode: "2500rrv2cBot", label: "Rapid Run v2 (cBot)", unit: "lane", clustersM: 150.7, maxCycles: 500, note: "2 lanes per flow cell" },
  ]},
  { id: "hs2500ho", name: "HiSeq 1500/2500 High Output", code: "HS2500HO", group: "production", runs: [
    { kitCode: "2500hov4", label: "High Output v4", unit: "lane", clustersM: 250, maxCycles: 125, note: "8 lanes per flow cell" },
    { kitCode: "2500hov3", label: "High Output v3", unit: "lane", clustersM: 18.75, maxCycles: 100, note: "8 lanes per flow cell" },
  ]},
  { id: "ns1000", name: "NextSeq 1000 Sequencing System", code: "NS1000", group: "production", runs: [
    { kitCode: "NS1000p1", label: "P1 reagents", unit: "flow cell", clustersM: 100, maxCycles: 600 },
    { kitCode: "NS1000p2", label: "P2 reagents", unit: "flow cell", clustersM: 400, maxCycles: 300 },
    { kitCode: "NS1000p2x", label: "P2 300M reagents", unit: "flow cell", clustersM: 300, maxCycles: 600 },
  ]},
  { id: "ns2000", name: "NextSeq 2000 Sequencing System", code: "NS2000", group: "production", runs: [
    { kitCode: "NS2000p1", label: "P1 reagents", unit: "flow cell", clustersM: 100, maxCycles: 600 },
    { kitCode: "NS2000p2", label: "P2 reagents", unit: "flow cell", clustersM: 400, maxCycles: 300 },
    { kitCode: "NS2000p3", label: "P3 reagents", unit: "flow cell", clustersM: 1200, maxCycles: 300 },
  ]},
  // ---------------- long-read (PBG extension) ----------------
  { id: "revio", name: "PacBio Revio", code: "PB", group: "longread", runs: [
    { kitCode: "revio", label: "SMRT cell (HiFi)", unit: "SMRT cell", outputGb: 90, note: "~15–20 kb reads, 60–120 Gb typical" },
  ]},
  { id: "promethion", name: "ONT PromethION", code: "ONT", group: "longread", runs: [
    { kitCode: "promethion", label: "R10 flow cell", unit: "flow cell", outputGb: 100, note: "~10–30 kb reads, 50–150 Gb typical" },
  ]},
  { id: "minion", name: "ONT MinION / GridION", code: "ONT", group: "longread", runs: [
    { kitCode: "minion", label: "R10 flow cell", unit: "flow cell", outputGb: 20, note: "10–30 Gb typical" },
  ]},
];

export const GROUP_LABELS: Record<Instrument["group"], string> = {
  benchtop: "Benchtop Sequencers",
  production: "Production-Scale Sequencers",
  longread: "Long-Read Platforms",
};

/* --------------------------------- kits --------------------------------- */
// method (Illumina "Calculation method"):
//   coverage — user enters coverage; required output = region×cov / ((1−dup)·onT)
//   minreads — recommended clusters/sample, corrected by on-target %
//   samples  — fixed samples-per-unit lookup per instrument/run type
// open = coverage-method kits whose defaults stay editable (gray = locked).
// compat = instrument codes; instrKit = run-kit codes (takes precedence).
// fixed maps kitCode / instrument code / "all" → max samples per unit.

export interface FlexPanel {
  id: string;
  label: string;
  regionMb?: number;
  onTargetPct?: number;
  readCycles: number;
  minClustersM?: number;
  fixed?: Record<string, number>;
  compat?: string[];
  instrKit?: string[];
  note?: string;
}

export interface Kit {
  id: string;
  label: string;
  type: AppType;
  method: KitMethod;
  open?: boolean;
  regionMb?: number;
  onTargetPct?: number;
  duplicatesPct?: number;
  readCycles?: number;
  minClustersM?: number;
  fixed?: Record<string, number>;
  compat?: string[];
  instrKit?: string[];
  panels?: FlexPanel[];   // enrichment products open a second dropdown
  note?: string;
}

/** Effective calculation config after resolving a flex panel selection. */
export interface Resolved {
  method: KitMethod;
  label: string;
  regionMb?: number;
  onTargetPct?: number;
  readCycles?: number;
  minClustersM?: number;
  fixed?: Record<string, number>;
  compat?: string[];
  instrKit?: string[];
  note?: string;
}

export function resolveKit(k: Kit, panelId?: string): Resolved {
  const p = panelId ? k.panels?.find((x) => x.id === panelId) ?? k.panels?.[0] : k.panels?.[0];
  if (!p) {
    return {
      method: k.method, label: k.label, regionMb: k.regionMb,
      onTargetPct: k.onTargetPct, readCycles: k.readCycles,
      minClustersM: k.minClustersM, fixed: k.fixed,
      compat: k.compat, instrKit: k.instrKit, note: k.note,
    };
  }
  return {
    method: "samples", label: `${k.label} — ${p.label}`,
    regionMb: p.regionMb, onTargetPct: p.onTargetPct, readCycles: p.readCycles,
    minClustersM: p.minClustersM, fixed: p.fixed,
    compat: p.compat, instrKit: p.instrKit, note: p.note,
  };
}

export const KITS: Kit[] = [
  /* ------------------------------- DNA --------------------------------- */
  { id: "wgs", label: "Whole-Genome Sequencing", type: "dna", method: "coverage", open: true,
    regionMb: 3300, onTargetPct: 100, duplicatesPct: 2, fixed: { all: 384 } },
  { id: "dna-pcrfree", label: "Illumina DNA PCR-Free", type: "dna", method: "coverage", open: true,
    regionMb: 3300, onTargetPct: 100, duplicatesPct: 2, fixed: { all: 384 },
    compat: ["HS2500RR", "HS2500HO", "MS", "NS", "HS4000", "MN", "NoS", "NS2000", "NS1000"] },
  { id: "truseq-exome", label: "TruSeq DNA Exome", type: "dna", method: "coverage",
    regionMb: 45, onTargetPct: 80, duplicatesPct: 20, readCycles: 150, fixed: { all: 96 },
    compat: ["HS2500RR", "HS2500HO", "MS", "NS", "HS4000", "MN", "NoS", "NS2000", "NS1000"] },
  { id: "nextera-exome", label: "Nextera DNA Exome", type: "dna", method: "coverage",
    regionMb: 45, onTargetPct: 75, duplicatesPct: 10, readCycles: 150, fixed: { all: 96 },
    compat: ["HS2500RR", "HS2500HO", "MS", "NS", "HS4000", "MN", "NoS", "NS2000", "NS1000"] },
  { id: "truseq-neuro", label: "TruSeq Neurodegeneration Sequencing Panel", type: "dna", method: "coverage", open: true,
    regionMb: 8.7, onTargetPct: 80, duplicatesPct: 0, readCycles: 300, fixed: { all: 96 } },
  { id: "dna-enrichment", label: "Illumina DNA Prep with Enrichment", type: "dna", method: "samples",
    duplicatesPct: 0, note: "Select the enrichment panel — sample capacity depends on panel size.",
    panels: [
      { id: "il-exome", label: "Illumina Exome", regionMb: 45, onTargetPct: 85, readCycles: 200,
        compat: ["HS2500RR", "HS2500HO", "NS", "HS4000", "NoS", "NS2000", "NS1000"],
        instrKit: ["NSmo", "NSho", "2500rrv2cBot", "2500hov4", "HS4000", "NoSSP", "NoSS1", "NoSS2", "NoSS4", "NS2000p1", "NS1000p1", "NS2000p2", "NS1000p2", "NS2000p3"],
        fixed: { NSmo: 5, NSho: 16, "2500rrv2cBot": 12, "2500hov4": 80, HS4000: 12, NoSSP: 64, NoSS1: 128, NoSS2: 164, NoSS4: 384, NS2000p1: 4, NS1000p1: 4, NS2000p2: 16, NS1000p2: 16, NS2000p3: 48 } },
      { id: "exome-x", label: "Exome Panel X", regionMb: 39, onTargetPct: 91, readCycles: 200,
        compat: ["HS2500RR", "HS2500HO", "NS", "HS4000", "NoS", "NS2000", "NS1000"],
        instrKit: ["NSmo", "NSho", "2500rrv2cBot", "2500hov4", "HS4000", "NoSSP", "NoSS1", "NoSS2", "NoSS4", "NS2000p1", "NS1000p1", "NS2000p2", "NS1000p2", "NS2000p3"],
        fixed: { NSmo: 5, NSho: 16, "2500rrv2cBot": 12, "2500hov4": 80, HS4000: 12, NoSSP: 64, NoSS1: 128, NoSS2: 164, NoSS4: 384, NS2000p1: 4, NS1000p1: 4, NS2000p2: 16, NS1000p2: 16, NS2000p3: 48 } },
      { id: "exome-y", label: "Exome Panel Y", regionMb: 33, onTargetPct: 91, readCycles: 200,
        compat: ["HS2500RR", "HS2500HO", "NS", "HS4000", "NoS", "NS2000", "NS1000"],
        instrKit: ["NSmo", "NSho", "2500rrv2cBot", "2500hov4", "HS4000", "NoSSP", "NoSS1", "NoSS2", "NoSS4", "NS2000p1", "NS1000p1", "NS2000p2", "NS1000p2", "NS2000p3"],
        fixed: { NSmo: 6, NSho: 20, "2500rrv2cBot": 15, "2500hov4": 100, HS4000: 15, NoSSP: 80, NoSS1: 160, NoSS2: 205, NoSS4: 384, NS2000p1: 5, NS1000p1: 5, NS2000p2: 20, NS1000p2: 20, NS2000p3: 60 } },
      { id: "tsone", label: "TruSight One", regionMb: 12, readCycles: 200, minClustersM: 8,
        compat: ["MS", "NS"], instrKit: ["MSv3", "NSmo", "NSho"],
        fixed: { MSv3: 3, NSmo: 12, NSho: 36 },
        note: "Germline workflow recommendations — somatic needs higher coverage for low-VAF variants." },
      { id: "tsone-exp", label: "TruSight One Expanded", regionMb: 16.5, readCycles: 200,
        compat: ["HS2500RR", "HS2500HO", "NS", "NoS"], instrKit: ["NSho", "2500rrv2cBot", "2500hov4", "NoSS1"],
        fixed: { NSho: 24, "2500rrv2cBot": 18, "2500hov4": 95, NoSS1: 96 },
        note: "Germline workflow recommendations — somatic needs higher coverage for low-VAF variants." },
      { id: "flex-tc", label: "TruSight Cancer", regionMb: 0.3, readCycles: 200, minClustersM: 0.625,
        compat: ["IS", "MN", "MS", "NS", "NS2000", "NS1000"],
        instrKit: ["ISi1", "MNmo", "MNho", "MSv2", "MSv2nano", "MSv2micro", "MSv3", "NSmo", "NSho", "NS2000p1", "NS1000p1", "NS2000p2", "NS1000p2", "NS2000p3"],
        fixed: { ISi1: 4, MNmo: 8, MNho: 24, MSv2: 12, MSv2nano: 1, MSv2micro: 4, MSv3: 24, NSmo: 96, NSho: 384, NS2000p1: 96, NS1000p1: 96, NS2000p2: 384, NS1000p2: 384, NS2000p3: 384 } },
      { id: "flex-thc", label: "TruSight Hereditary Cancer", regionMb: 0.4, readCycles: 200,
        compat: ["IS", "MN", "MS", "NS", "NS2000", "NS1000"],
        instrKit: ["ISi1", "MNmo", "MNho", "MSv2", "MSv2nano", "MSv2micro", "MSv3", "NSmo", "NSho", "NS2000p1", "NS1000p1", "NS2000p2", "NS1000p2", "NS2000p3"],
        fixed: { ISi1: 4, MNmo: 8, MNho: 24, MSv2: 12, MSv2nano: 1, MSv2micro: 4, MSv3: 24, NSmo: 96, NSho: 384, NS2000p1: 62, NS1000p1: 62, NS2000p2: 250, NS1000p2: 250, NS2000p3: 384 } },
      { id: "flex-cardio", label: "TruSight Cardio", regionMb: 0.572, readCycles: 200, minClustersM: 1.25,
        compat: ["IS", "MN", "MS", "NS", "NS2000", "NS1000"],
        instrKit: ["ISi1", "MNmo", "MNho", "MSv2", "MSv2nano", "MSv2micro", "MSv3", "NSmo", "NSho", "NS2000p1", "NS1000p1", "NS2000p2", "NS1000p2", "NS2000p3"],
        fixed: { ISi1: 4, MNmo: 8, MNho: 24, MSv2: 12, MSv2nano: 1, MSv2micro: 4, MSv3: 24, NSmo: 96, NSho: 384, NS2000p1: 96, NS1000p1: 96, NS2000p2: 384, NS1000p2: 384, NS2000p3: 384 } },
      { id: "custom-2k", label: "Custom panel — 2000 probes", regionMb: 0.15, readCycles: 200,
        compat: ["IS", "MN", "MS", "NS", "NS2000", "NS1000"],
        instrKit: ["ISi1", "MNmo", "MNho", "MSv2", "MSv2nano", "MSv2micro", "MSv3", "NSmo", "NSho", "NS2000p1", "NS1000p1", "NS2000p2", "NS1000p2", "NS2000p3"],
        fixed: { ISi1: 8, MNmo: 16, MNho: 50, MSv2: 30, MSv2nano: 2, MSv2micro: 8, MSv3: 50, NSmo: 260, NSho: 384, NS2000p1: 96, NS1000p1: 96, NS2000p2: 384, NS1000p2: 384, NS2000p3: 384 } },
      { id: "custom-5k", label: "Custom panel — 5000 probes", regionMb: 0.4, readCycles: 200,
        compat: ["IS", "MN", "MS", "NS", "NS2000", "NS1000"],
        instrKit: ["ISi1", "MNmo", "MNho", "MSv2", "MSv2nano", "MSv2micro", "MSv3", "NSmo", "NSho", "NS2000p1", "NS1000p1", "NS2000p2", "NS1000p2", "NS2000p3"],
        fixed: { ISi1: 2, MNmo: 4, MNho: 12, MSv2: 8, MSv2nano: 1, MSv2micro: 2, MSv3: 12, NSmo: 65, NSho: 200, NS2000p1: 50, NS1000p1: 50, NS2000p2: 200, NS1000p2: 200, NS2000p3: 384 } },
      { id: "custom-10k", label: "Custom panel — 10,000 probes", regionMb: 0.8, readCycles: 200,
        compat: ["IS", "MN", "MS", "NS", "NS2000", "NS1000"],
        instrKit: ["ISi1", "MNmo", "MNho", "MSv2", "MSv2nano", "MSv2micro", "MSv3", "NSmo", "NSho", "NS2000p1", "NS1000p1", "NS2000p2", "NS1000p2", "NS2000p3"],
        fixed: { ISi1: 1, MNmo: 2, MNho: 6, MSv2: 4, MSv2nano: 0, MSv2micro: 1, MSv3: 6, NSmo: 33, NSho: 100, NS2000p1: 25, NS1000p1: 25, NS2000p2: 100, NS1000p2: 100, NS2000p3: 300 } },
    ] },
  { id: "cfdna-enrichment", label: "Illumina cfDNA Prep with Enrichment", type: "dna", method: "samples",
    duplicatesPct: 0, note: "Select the cfDNA enrichment panel — capacity is read-driven.",
    panels: [
      { id: "cf-2k-v1", label: "2000 probes v1", regionMb: 0.16, readCycles: 300, minClustersM: 28,
        compat: ["NS", "NoS", "NS2000", "NS1000"],
        instrKit: ["NSmo", "NSho", "NoSSP", "NoSS1", "NoSS2", "NoSS4", "NS2000p1", "NS1000p1", "NS2000p2", "NS1000p2", "NS2000p3"] },
      { id: "cf-5k-v1", label: "5000 probes v1", regionMb: 0.4, readCycles: 300, minClustersM: 70,
        compat: ["NS", "NoS", "NS2000", "NS1000"],
        instrKit: ["NSmo", "NSho", "NoSSP", "NoSS1", "NoSS2", "NoSS4", "NS2000p1", "NS1000p1", "NS2000p2", "NS1000p2", "NS2000p3"] },
      { id: "cf-10k-v1", label: "10000 probes v1", regionMb: 0.8, readCycles: 300, minClustersM: 140,
        compat: ["NS", "NoS", "NS2000", "NS1000"],
        instrKit: ["NSmo", "NSho", "NoSSP", "NoSS1", "NoSS2", "NoSS4", "NS2000p1", "NS1000p1", "NS2000p2", "NS1000p2", "NS2000p3"] },
      { id: "cf-700-v2", label: "700 probes v2", regionMb: 0.084, readCycles: 300, minClustersM: 15,
        compat: ["NS", "NoS", "NS2000", "NS1000"],
        instrKit: ["NSmo", "NSho", "NoSSP", "NoSS1", "NoSS2", "NoSS4", "NS2000p1", "NS1000p1", "NS2000p2", "NS1000p2", "NS2000p3"] },
      { id: "cf-2k-v2", label: "2000 probes v2", regionMb: 0.24, readCycles: 300, minClustersM: 42,
        compat: ["NS", "NoS", "NS2000", "NS1000"],
        instrKit: ["NSmo", "NSho", "NoSSP", "NoSS1", "NoSS2", "NoSS4", "NS2000p1", "NS1000p1", "NS2000p2", "NS1000p2", "NS2000p3"] },
      { id: "cf-5k-v2", label: "5000 probes v2", regionMb: 0.6, readCycles: 300, minClustersM: 105,
        compat: ["NS", "NoS", "NS2000", "NS1000"],
        instrKit: ["NSmo", "NSho", "NoSSP", "NoSS1", "NoSS2", "NoSS4", "NS2000p1", "NS1000p1", "NS2000p2", "NS1000p2", "NS2000p3"] },
      { id: "cf-10k-v2", label: "10000 probes v2", regionMb: 1.2, readCycles: 300, minClustersM: 210,
        compat: ["NS", "NoS", "NS2000", "NS1000"],
        instrKit: ["NSmo", "NSho", "NoSSP", "NoSS1", "NoSS2", "NoSS4", "NS2000p1", "NS1000p1", "NS2000p2", "NS1000p2", "NS2000p3"] },
    ] },
  { id: "trusight-cancer", label: "TruSight Cancer", type: "dna", method: "samples",
    regionMb: 0.3, onTargetPct: 70, duplicatesPct: 0, readCycles: 300, minClustersM: 0.625,
    fixed: { all: 96, MS: 24, MNmo: 12, MNho: 24 },
    compat: ["HS2500RR", "HS2500HO", "MS", "NS", "MN", "NoS", "NS2000", "NS1000"],
    note: "Most cost-efficient in multiples of 12 samples per lane or flow cell." },
  { id: "trusight-cardio", label: "TruSight Cardio", type: "dna", method: "minreads",
    regionMb: 0.572, onTargetPct: 65, duplicatesPct: 0, readCycles: 300, minClustersM: 1.25,
    instrKit: ["MSv2", "NSmo", "NoSSP", "NoSS1", "NoSS2", "NoSS4", "NS2000p1", "NS1000p1", "NS2000p2", "NS1000p2", "NS2000p3"],
    compat: ["MS", "NS", "NoS", "NS2000", "NS1000"] },
  { id: "trusight-inherited", label: "TruSight Inherited Disease", type: "dna", method: "minreads",
    regionMb: 2.25, duplicatesPct: 0, readCycles: 300, minClustersM: 1.8 },
  { id: "trusight-myeloid", label: "TruSight Myeloid", type: "dna", method: "minreads",
    regionMb: 0.141, onTargetPct: 80, duplicatesPct: 0, readCycles: 300, minClustersM: 3.125,
    compat: ["MS", "NS", "MN", "NoS", "NS2000", "NS1000"] },
  { id: "trusight-t15", label: "TruSight Tumor 15", type: "dna", method: "minreads",
    regionMb: 0.044, onTargetPct: 80, duplicatesPct: 0, readCycles: 300, minClustersM: 3.125,
    compat: ["MS", "MN", "NoS", "NS2000", "NS1000"] },
  { id: "trusight-t26", label: "TruSight Tumor 26", type: "dna", method: "minreads",
    regionMb: 0.021, onTargetPct: 85, duplicatesPct: 0, readCycles: 240, minClustersM: 3.75,
    compat: ["HS2500RR", "MS", "NS", "MN", "NoS", "NS2000", "NS1000"] },
  { id: "ampliseq-brca-germ", label: "AmpliSeq for Illumina BRCA Panel (germline)", type: "dna", method: "samples",
    regionMb: 0.026, onTargetPct: 80, duplicatesPct: 0, readCycles: 300, minClustersM: 0.033,
    fixed: { MSv2nano: 32, MSv2micro: 96, ISi1: 96 }, compat: ["IS", "MS"] },
  { id: "ampliseq-brca-som", label: "AmpliSeq for Illumina BRCA Panel (somatic)", type: "dna", method: "samples",
    regionMb: 0.026, onTargetPct: 80, duplicatesPct: 0, readCycles: 300,
    fixed: { MNmo: 24, MNho: 80, MSv2: 48, MSv2nano: 3, MSv2micro: 12, MSv3: 80, ISi1: 12 },
    compat: ["IS", "MN", "MS"] },
  { id: "ampliseq-hotspot", label: "AmpliSeq for Illumina Cancer HotSpot Panel v2", type: "dna", method: "samples",
    regionMb: 0.022, onTargetPct: 80, duplicatesPct: 0, readCycles: 300, minClustersM: 0.208,
    fixed: { MNmo: 32, MNho: 96, MSv2: 60, MSv2nano: 4, MSv2micro: 16, MSv3: 96, ISi1: 16 },
    compat: ["IS", "MN", "MS"] },
  { id: "ampliseq-childhood", label: "AmpliSeq for Illumina Childhood Cancer Panel", type: "dna", method: "samples",
    regionMb: 0.35, onTargetPct: 80, duplicatesPct: 0, readCycles: 300,
    fixed: { MNmo: 1, MNho: 5, MSv2: 3, MSv3: 5, NSmo: 27, NSho: 83, NS2000p1: 20, NS1000p1: 20, NS2000p2: 83, NS1000p2: 83, NS2000p3: 249 },
    compat: ["MN", "MS", "NS", "NS2000", "NS1000"] },
  { id: "ampliseq-compcancer", label: "AmpliSeq for Illumina Comprehensive Cancer Panel", type: "dna", method: "samples",
    regionMb: 1.74, onTargetPct: 80, duplicatesPct: 0, readCycles: 300, minClustersM: 26,
    fixed: { NSmo: 4, NSho: 12, NS2000p1: 3, NS1000p1: 3, NS2000p2: 12, NS1000p2: 12, NS2000p3: 36 },
    compat: ["NS", "NS2000", "NS1000"] },
  { id: "ampliseq-compv3", label: "AmpliSeq for Illumina Comprehensive Panel v3", type: "dna", method: "samples",
    regionMb: 0.4, onTargetPct: 80, duplicatesPct: 0, readCycles: 300, minClustersM: 8,
    fixed: { MNho: 3, MSv3: 3, NSmo: 16, NSho: 48, NS2000p1: 12, NS1000p1: 12, NS2000p2: 48, NS1000p2: 48, NS2000p3: 144 },
    compat: ["MN", "MS", "NS", "NS2000", "NS1000"] },
  { id: "ampliseq-exome", label: "AmpliSeq for Illumina Exome Panel", type: "dna", method: "samples",
    regionMb: 60.4, onTargetPct: 80, duplicatesPct: 0, readCycles: 300, minClustersM: 40,
    fixed: { NSmo: 2, NSho: 8, NS2000p1: 2, NS1000p1: 2, NS2000p2: 8, NS1000p2: 8, NS2000p3: 24 },
    compat: ["NS", "NS2000", "NS1000"] },
  { id: "ampliseq-focus", label: "AmpliSeq for Illumina Focus Panel", type: "dna", method: "samples",
    regionMb: 0.029, onTargetPct: 80, duplicatesPct: 0, readCycles: 300, minClustersM: 0.35,
    fixed: { MNmo: 24, MNho: 72, MSv2: 40, MSv2micro: 12, MSv3: 72, ISi1: 8 },
    compat: ["IS", "MN", "MS"] },
  { id: "ampliseq-myeloid", label: "AmpliSeq for Illumina Myeloid", type: "dna", method: "samples",
    regionMb: 0.12, onTargetPct: 80, duplicatesPct: 0, readCycles: 300,
    fixed: { MNmo: 4, MNho: 12, MSv2: 7, MSv3: 12 }, compat: ["MN", "MS"] },

  /* ------------------------------- RNA --------------------------------- */
  { id: "mrna-seq", label: "mRNA-seq", type: "rna", method: "minreads", open: true,
    duplicatesPct: 0, readCycles: 150, minClustersM: 25, fixed: { all: 96 },
    note: "Recommended reads vary with the scientific question and organism." },
  { id: "total-rna", label: "Total RNA-seq", type: "rna", method: "minreads", open: true,
    duplicatesPct: 0, readCycles: 150, minClustersM: 50, fixed: { all: 96 },
    note: "Recommended reads vary with the scientific question and organism." },
  { id: "stranded-total", label: "Illumina Stranded Total RNA", type: "rna", method: "samples",
    duplicatesPct: 0, readCycles: 150,
    fixed: { NSmo: 2, NSho: 8, NS2000p1: 2, NS1000p1: 2, NS2000p2: 8, NS1000p2: 8, NS2000p3: 24, NoSSP: 16, NoSS1: 32, NoSS2: 82, NoSS4: 200 },
    compat: ["NS", "NoS", "NS2000", "NS1000"], note: "Based on 50M reads per sample." },
  { id: "stranded-mrna", label: "Illumina Stranded mRNA", type: "rna", method: "samples",
    duplicatesPct: 0, readCycles: 150,
    fixed: { NSmo: 5, NSho: 16, NS2000p1: 4, NS1000p1: 4, NS2000p2: 16, NS1000p2: 16, NS2000p3: 48, NoSSP: 32, NoSS1: 64, NoSS2: 164, NoSS4: 384 },
    compat: ["NS", "NoS", "NS2000", "NS1000"], note: "Based on 25M reads per sample." },
  { id: "rna-enr-exome", label: "Illumina RNA Prep with Enrichment + Exome Panel", type: "rna", method: "samples",
    duplicatesPct: 0, readCycles: 200,
    fixed: { NSmo: 5, NSho: 16, NS2000p1: 4, NS1000p1: 4, NS2000p2: 16, NS1000p2: 16, NS2000p3: 48, NoSSP: 32, NoSS1: 64, NoSS2: 164, NoSS4: 384 },
    compat: ["NS", "NoS", "NS2000", "NS1000"], note: "Based on 25M reads per sample." },
  { id: "rna-enr-resp", label: "Illumina RNA Prep with Enrichment + Respiratory Virus Oligo Panel", type: "rna", method: "samples",
    duplicatesPct: 0, readCycles: 150,
    fixed: { MNho: 25, MNmo: 8, MSv3: 25, MSv2: 15, MSv2nano: 1, MSv2micro: 4, NSmo: 130, NSho: 384, NS2000p1: 96, NS1000p1: 96, NS2000p2: 384, NS1000p2: 384 },
    compat: ["MN", "MS", "NS", "NS2000", "NS1000"], note: "Based on 1M reads per sample." },
  { id: "pan-cancer", label: "Pan Cancer", type: "rna", method: "minreads",
    onTargetPct: 70, duplicatesPct: 0, readCycles: 150, minClustersM: 3,
    instrKit: ["MSv3", "MSv2", "MSv2micro", "NSho", "NSmo", "MNmo", "MNho", "NoSSP", "NoSS1", "NoSS2", "NoSS4", "NS2000p1", "NS1000p1", "NS2000p2", "NS1000p2", "NS2000p3"],
    compat: ["MS", "NS", "MN", "NoS", "NS2000", "NS1000"] },
  { id: "rna-access", label: "RNA Access", type: "rna", method: "minreads",
    duplicatesPct: 0, readCycles: 150, minClustersM: 25, fixed: { all: 24 },
    compat: ["HS2500RR", "NS", "NoS", "NS2000", "NS1000"] },
  { id: "small-rna", label: "small RNA", type: "rna", method: "minreads",
    duplicatesPct: 0, readCycles: 50, minClustersM: 2.22, fixed: { all: 48 } },
  { id: "ampliseq-rna-childhood", label: "AmpliSeq for Illumina Childhood Cancer Panel", type: "rna", method: "samples",
    regionMb: 0.21, onTargetPct: 80, duplicatesPct: 0, readCycles: 300,
    fixed: { MNmo: 8, MNho: 25, MSv2: 15, MSv3: 25, NSmo: 96, NSho: 96, NS2000p1: 96, NS1000p1: 96, NS2000p2: 384, NS1000p2: 384, NS2000p3: 384 },
    compat: ["MN", "MS", "NS", "NS2000", "NS1000"] },
  { id: "ampliseq-rna-compv3", label: "AmpliSeq for Illumina Comprehensive Panel v3", type: "rna", method: "minreads",
    regionMb: 0.086, onTargetPct: 80, duplicatesPct: 0, readCycles: 300, minClustersM: 0.3,
    fixed: { MNmo: 24, MNho: 80, MSv2: 48, MSv2nano: 3, MSv2micro: 12, MSv3: 80 }, compat: ["MN", "MS"] },
  { id: "ampliseq-rna-focus", label: "AmpliSeq for Illumina Focus Panel", type: "rna", method: "minreads",
    regionMb: 0.026, onTargetPct: 80, duplicatesPct: 0, readCycles: 300, minClustersM: 0.15,
    fixed: { MNmo: 48, MSv2: 96, MSv2nano: 6, MSv2micro: 24 }, compat: ["MN", "MS"] },
  { id: "ampliseq-immune", label: "AmpliSeq for Illumina Immune Response Panel", type: "rna", method: "minreads",
    regionMb: 0.042, onTargetPct: 80, duplicatesPct: 0, readCycles: 300, minClustersM: 1,
    fixed: { MNmo: 8, MNho: 24, MSv2: 16, MSv2micro: 4, MSv3: 24, ISi1: 4 }, compat: ["IS", "MN", "MS"] },
  { id: "ampliseq-rna-myeloid", label: "AmpliSeq for Illumina Myeloid", type: "rna", method: "samples",
    regionMb: 0.07, onTargetPct: 80, duplicatesPct: 0, readCycles: 300,
    fixed: { MNmo: 32, MNho: 96, MSv2: 60, MSv3: 96 }, compat: ["MN", "MS"] },
  { id: "ampliseq-transcriptome", label: "AmpliSeq for Illumina Transcriptome Panel", type: "rna", method: "samples",
    regionMb: 2.16, onTargetPct: 80, duplicatesPct: 0, readCycles: 300, minClustersM: 10,
    fixed: { MNho: 3, MSv3: 3, NSmo: 12, NSho: 40, NS2000p1: 10, NS1000p1: 10, NS2000p2: 40, NS1000p2: 40, NS2000p3: 120 },
    compat: ["MS", "MN", "NS", "NS2000", "NS1000"] },

  /* ----------------------------- DNA + RNA ----------------------------- */
  { id: "dnarna-focus", label: "AmpliSeq for Illumina Focus Panel", type: "dnarna", method: "minreads",
    onTargetPct: 80, duplicatesPct: 0, readCycles: 300, minClustersM: 0.15,
    fixed: { MNmo: 16, MNho: 48, MSv2: 30, MSv2micro: 8, MSv3: 48 }, compat: ["MN", "MS"] },
  { id: "dnarna-compv3", label: "AmpliSeq for Illumina Comprehensive Panel v3", type: "dnarna", method: "minreads",
    onTargetPct: 80, duplicatesPct: 0, readCycles: 300, minClustersM: 0.3,
    fixed: { MNho: 3, MSv3: 3, NSmo: 16, NSho: 48, NS2000p1: 12, NS1000p1: 12, NS2000p2: 48, NS1000p2: 48, NS2000p3: 144 },
    compat: ["MN", "MS", "NS", "NS2000", "NS1000"] },
  { id: "dnarna-myeloid", label: "AmpliSeq for Illumina Myeloid", type: "dnarna", method: "minreads",
    onTargetPct: 80, duplicatesPct: 0, readCycles: 300,
    fixed: { MNmo: 3, MNho: 11, MSv2: 6, MSv3: 11 }, compat: ["MN", "MS"] },
  { id: "dnarna-childhood", label: "AmpliSeq for Illumina Childhood Cancer Panel", type: "dnarna", method: "minreads",
    onTargetPct: 80, duplicatesPct: 0, readCycles: 300,
    fixed: { MNmo: 1, MNho: 4, MSv2: 2, MSv3: 4, NSmo: 22, NSho: 48, NS2000p1: 12, NS1000p1: 12, NS2000p2: 48, NS1000p2: 48, NS2000p3: 144 },
    compat: ["MN", "MS", "NS", "NS2000", "NS1000"] },
];

export function kitsFor(type: AppType): Kit[] {
  return KITS.filter((k) => k.type === type);
}

/** Is run type `r` of instrument `i` usable with the resolved config? */
export function runCompatible(k: Pick<Resolved, "method" | "compat" | "instrKit">, i: Instrument, r: RunType): boolean {
  if (i.group === "longread") return k.method === "coverage";
  if (k.instrKit && k.instrKit.length) return k.instrKit.includes(r.kitCode);
  if (k.compat && k.compat.length)
    return k.compat.includes(i.code) || k.compat.includes(r.kitCode);
  return true;
}

/** Fixed-sample cap for a run type (kitCode > instrument code > "all"). */
function fixedCap(k: Pick<Resolved, "fixed">, i: Instrument, r: RunType): number | null {
  if (!k.fixed) return null;
  return k.fixed[r.kitCode] ?? k.fixed[i.code] ?? k.fixed["all"] ?? null;
}

/* ------------------------------ estimation ------------------------------ */

export interface EstInput {
  type: AppType;
  kitId: string;
  panelId?: string;         // enrichment products: selected panel
  coverage: number;
  minClustersM: number;
  duplicatesPct: number;
  regionMb: number;
  readCycles: number;       // 0 = blank (user must enter, like Illumina)
  onTargetPct: number;
  instrumentIds: string[];  // checked instruments — expanded to run types
}

export interface EstRow {
  instrument: Instrument;
  run: RunType;
  outputPerUnitGb: number | null;
  unitsPerSample: number | null;
  samplesPerUnit: number | null;
  note: string | null;      // reason for "—" or extra info
}

export interface EstResult {
  kit: Kit;
  rk: Resolved;
  totalOutputRequiredGb: number | null;
  requiredClustersM: number | null;
  rows: EstRow[];
}

export function outputPerUnitGb(r: RunType, cycles: number): number | null {
  if (r.outputGb != null) return r.outputGb;
  if (r.clustersM == null || cycles <= 0) return null;
  return (r.clustersM * cycles) / 1000;
}

export function estimate(inp: EstInput): EstResult {
  const kit = KITS.find((k) => k.id === inp.kitId) ?? KITS[0];
  const rk = resolveKit(kit, inp.panelId);
  const onT = ((rk.onTargetPct ?? inp.onTargetPct) || 100) / 100;
  const dup = 1 - (inp.duplicatesPct || 0) / 100;
  const readCycles = rk.readCycles ?? inp.readCycles;

  let totalOutputRequiredGb: number | null = null;
  if (rk.method === "coverage" && inp.regionMb > 0 && inp.coverage > 0 && onT > 0 && dup > 0)
    totalOutputRequiredGb = (inp.regionMb * inp.coverage) / (dup * onT) / 1000;

  const requiredClustersM =
    rk.method === "minreads" && inp.minClustersM > 0 && onT > 0
      ? inp.minClustersM / onT
      : rk.method === "samples" && rk.minClustersM != null && onT > 0
        ? rk.minClustersM / onT
        : null;

  const rows: EstRow[] = [];
  for (const iid of inp.instrumentIds) {
    const inst = INSTRUMENTS.find((x) => x.id === iid);
    if (!inst) continue;
    for (const run of inst.runs) {
      const compatible = runCompatible(rk, inst, run);
      const exceeded =
        run.clustersM != null && run.maxCycles != null && readCycles > run.maxCycles;
      const outGb = outputPerUnitGb(run, readCycles);
      const base: EstRow = {
        instrument: inst, run,
        outputPerUnitGb: outGb, unitsPerSample: null, samplesPerUnit: null,
        note: run.note ?? null,
      };
      if (!compatible) { rows.push({ ...base, note: "Not recommended for this product" }); continue; }

      if (rk.method === "coverage") {
        if (totalOutputRequiredGb == null || outGb == null) {
          rows.push({ ...base, note: totalOutputRequiredGb == null ? "Enter coverage, region size and read length" : "Enter read length" });
          continue;
        }
        rows.push({
          ...base,
          unitsPerSample: totalOutputRequiredGb / outGb,
          samplesPerUnit: Math.floor(outGb / totalOutputRequiredGb),
          note: exceeded ? `Exceeds max read length (${run.maxCycles} cycles)` : base.note,
        });
        continue;
      }

      if (rk.method === "minreads") {
        if (requiredClustersM == null || run.clustersM == null) {
          rows.push({ ...base, note: "Enter recommended clusters" });
          continue;
        }
        const byClusters = Math.floor(run.clustersM / requiredClustersM);
        const cap = fixedCap(rk, inst, run);
        rows.push({
          ...base,
          unitsPerSample: requiredClustersM / run.clustersM,
          samplesPerUnit: cap != null ? Math.min(byClusters, cap) : byClusters,
          note: exceeded ? `Exceeds max read length (${run.maxCycles} cycles)` : base.note,
        });
        continue;
      }

      // samples method — fixed lookup (+ cluster floor when minClusters known)
      const cap = fixedCap(rk, inst, run);
      let samples = cap;
      if (requiredClustersM != null && run.clustersM != null) {
        const byClusters = Math.floor(run.clustersM / requiredClustersM);
        samples = samples != null ? Math.min(samples, byClusters) : byClusters;
      }
      rows.push({
        ...base,
        unitsPerSample: samples != null && samples > 0 ? 1 / samples : null,
        samplesPerUnit: samples,
        note: samples == null ? "No recommendation for this instrument"
          : exceeded ? `Exceeds max read length (${run.maxCycles} cycles)` : base.note,
      });
    }
  }

  return { kit, rk, totalOutputRequiredGb, requiredClustersM, rows };
}

/* ------------------------------ form rules ------------------------------ */

/** Which parameter fields are visible (Illumina hides the rest). */
export function visibleFields(k: Kit, panelId?: string): Set<string> {
  const rk = resolveKit(k, panelId);
  const s = new Set<string>(["duplicatesPct", "readCycles"]);
  if (rk.method === "coverage") { s.add("coverage"); s.add("regionMb"); }
  if (rk.method === "minreads") s.add("minClustersM");
  if (rk.method === "samples" && rk.regionMb != null) s.add("regionMb");
  if (rk.onTargetPct == null && rk.method !== "samples") s.add("onTargetPct");
  return s;
}

/** Which visible fields are locked (grayed) — open kits keep defaults editable. */
export function lockedFields(k: Kit, panelId?: string): Set<string> {
  const rk = resolveKit(k, panelId);
  const s = new Set<string>();
  if (rk.method !== "coverage") s.add("coverage");
  if (rk.method !== "minreads") s.add("minClustersM");
  const lockable = ["duplicatesPct", "regionMb", "readCycles", "onTargetPct"] as const;
  for (const f of lockable) {
    const defined =
      f === "duplicatesPct" ? k.duplicatesPct != null
      : f === "regionMb" ? rk.regionMb != null
      : f === "readCycles" ? rk.readCycles != null
      : rk.onTargetPct != null;
    if (defined && !k.open) s.add(f);
  }
  return s;
}

/** Apply a kit's (+ panel's) defaults onto the input. */
export function applyKit(inp: EstInput, kit: Kit, panelId?: string): EstInput {
  const rk = resolveKit(kit, panelId);
  return {
    ...inp,
    kitId: kit.id,
    panelId: panelId ?? kit.panels?.[0]?.id,
    ...(rk.regionMb != null ? { regionMb: rk.regionMb } : { regionMb: inp.regionMb }),
    ...(rk.onTargetPct != null ? { onTargetPct: rk.onTargetPct } : {}),
    ...(kit.duplicatesPct != null ? { duplicatesPct: kit.duplicatesPct } : {}),
    readCycles: rk.readCycles ?? (kit.open ? 0 : inp.readCycles),
    ...(rk.minClustersM != null ? { minClustersM: rk.minClustersM } : {}),
  };
}

/* ------------------------------ defaults -------------------------------- */

export const DEFAULT_EST: EstInput = {
  type: "dna",
  kitId: "wgs",
  coverage: 0,
  minClustersM: 25,
  duplicatesPct: 2,
  regionMb: 3300,
  readCycles: 0,
  onTargetPct: 100,
  instrumentIds: [],
};

/* ------------------------------ URL state ------------------------------- */

const NUMS = ["coverage", "minClustersM", "duplicatesPct", "regionMb", "readCycles", "onTargetPct"] as const;

export function encodeEst(inp: EstInput): string {
  const p = new URLSearchParams();
  if (inp.type !== "dna") p.set("t", inp.type);
  if (inp.kitId !== "wgs") p.set("k", inp.kitId);
  if (inp.panelId) p.set("pnl", inp.panelId);
  for (const key of NUMS) if (inp[key] !== DEFAULT_EST[key]) p.set(key, String(inp[key]));
  if (inp.instrumentIds.length) p.set("i", inp.instrumentIds.join(","));
  const s = p.toString();
  return s ? `?${s}` : "";
}

export function decodeEst(sp: Record<string, string | string[] | undefined>): EstInput {
  const get = (k: string) => { const v = sp[k]; return Array.isArray(v) ? v[0] : v; };
  let out = { ...DEFAULT_EST };
  const t = get("t");
  if (t === "rna" || t === "dnarna") out.type = t;
  const kit = KITS.find((k) => k.id === get("k"));
  const panelId = get("pnl");
  if (kit) {
    out.type = kit.type;
    out = applyKit(out, kit, panelId && kit.panels?.some((p) => p.id === panelId) ? panelId : undefined);
  }
  for (const key of NUMS) {
    const v = parseFloat(get(key) ?? "");
    if (Number.isFinite(v)) out[key] = v;
  }
  const ids = get("i");
  if (ids) out.instrumentIds = ids.split(",").filter((id) => INSTRUMENTS.some((x) => x.id === id));
  return out;
}

/* ------------------------------ formatting ------------------------------ */

export function fmt(n: number | null, digits = 1): string {
  if (n == null || !Number.isFinite(n)) return "—";
  if (Math.abs(n) >= 1000) return n.toLocaleString("en-US", { maximumFractionDigits: 0 });
  return n.toLocaleString("en-US", { maximumFractionDigits: digits });
}

export function fmtGb(gb: number | null): string {
  if (gb == null || !Number.isFinite(gb)) return "—";
  if (gb >= 1000) return `${fmt(gb / 1000, 2)} Tb`;
  if (gb >= 1) return `${fmt(gb, 1)} Gb`;
  return `${fmt(gb * 1000, 0)} Mb`;
}
