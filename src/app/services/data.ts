import type { ComponentType } from "react";
import {
  Beaker, Cpu, Dna, Microscope, FlaskConical, GitBranch,
  SearchCheck, TestTubes,
} from "lucide-react";

export type SubService = {
  icon: ComponentType<{ className?: string }>;
  name: string;
  /** one-paragraph summary shown on the /services index */
  desc: string;
  /** longer detail shown on the dedicated category page */
  detail: string;
  tags: string[];
  /** what the lab needs from you */
  inputs: string[];
  /** what you get back */
  deliverables: string[];
};

export type ServicePanel = {
  slug: string;
  title: string;
  intro: string;
  items: SubService[];
};

export const PANELS: ServicePanel[] = [
  {
    slug: "molecular-biology",
    title: "Molecular biology services",
    intro:
      "Upstream wet-lab work that every sequencing project depends on — extraction, amplification and quantification, performed to publication-grade quality standards.",
    items: [
      {
        icon: TestTubes,
        name: "DNA Extraction",
        desc: "High-quality genomic DNA isolated from blood, tissue, cultured cells, plant material, soil and microbial samples — including high-molecular-weight (HMW) extraction protocols required for long-read sequencing on Oxford Nanopore and PacBio. Every extract is quantified and purity-checked before it enters your project.",
        detail:
          "Extraction quality decides everything downstream. Providers on the Gateway run column-based, magnetic-bead and phenol-free protocols matched to the sample matrix — blood and buffy coat, fresh or FFPE tissue, cultured cells, leaf and seed material, soil, biofilm and pure cultures. For long-read projects, dedicated high-molecular-weight protocols preserve 50 kb+ fragments instead of sheared gDNA, which directly determines read N50 and assembly contiguity. Extraction is quoted as a line item so you can compare it transparently across labs.",
        tags: ["HMW gDNA", "Qubit / NanoDrop QC", "Blood · tissue · plant · microbial"],
        inputs: ["Raw sample with declared matrix and volume", "Sample history (storage, fixatives, shipping conditions)", "Target application (short-read, long-read, qPCR)"],
        deliverables: ["Purified DNA at declared concentration", "A260/280 & A260/230 purity report", "Qubit dsDNA quantification", "Size distribution / integrity check where required"],
      },
      {
        icon: Beaker,
        name: "RNA Extraction",
        desc: "Total RNA and mRNA isolation with DNase treatment and integrity scoring (RIN), suitable for transcriptome sequencing, RT-qPCR and downstream expression studies. Providers declare accepted sample types and stabilization requirements per listing.",
        detail:
          "RNA projects fail at extraction more often than anywhere else — degradation starts within minutes of sampling. Gateway labs specify stabilization (RNAlater, TRIzol, snap-freezing) and run column or magnetic workflows with on-column DNase digestion. Integrity is scored on the Bioanalyzer/TapeStation scale (RIN or RINe); most sequencing applications need RIN ≥ 7, and providers state their acceptance threshold before you ship.",
        tags: ["Total RNA / mRNA", "RIN integrity QC", "DNase-treated"],
        inputs: ["Fresh, stabilized or frozen sample", "Organism and tissue type", "Downstream application (RNA-seq, RT-qPCR)"],
        deliverables: ["Purified RNA at declared concentration", "RIN/RINe integrity score", "DNase treatment confirmation", "Purity report"],
      },
      {
        icon: Dna,
        name: "PCR",
        desc: "Endpoint PCR and amplicon generation for Sanger sequencing, barcoding, cloning verification and targeted assays — including primer design and optimization for difficult templates such as GC-rich or low-copy targets.",
        detail:
          "Standard endpoint PCR remains the workhorse for targeted work: amplifying a locus for Sanger confirmation, producing barcode amplicons (COI, ITS, rbcL, 16S), verifying plasmid inserts and preparing targeted panels. Providers can design and optimize primers — including touchdown and gradient protocols for GC-rich or low-template targets — and deliver gel-verified, cleanup-ready amplicons.",
        tags: ["Primer design", "Amplicon prep", "GC-rich & low-copy"],
        inputs: ["Template DNA or source material", "Target locus / primer sequences (or design request)", "Purpose of amplification (Sanger, cloning, QC)"],
        deliverables: ["Purified amplicon", "Gel image / size verification", "Primer sequences and conditions used"],
      },
      {
        icon: Microscope,
        name: "qPCR / Quantitative PCR",
        desc: "Quantitative real-time PCR for gene-expression measurement, pathogen and GMO detection, copy-number checks and assay validation. Options include SYBR and probe-based (TaqMan) chemistry with standard-curve or ΔΔCt reporting.",
        detail:
          "Real-time quantitative PCR is the reference method for targeted quantification: relative gene expression (ΔΔCt), absolute copy number against a standard curve, pathogen load, GMO screening and assay validation before larger sequencing work. Providers run SYBR Green or hydrolysis-probe (TaqMan) chemistry in single- or multiplex formats, with melt-curve and efficiency reporting.",
        tags: ["Gene expression", "Pathogen detection", "TaqMan / SYBR"],
        inputs: ["Extracted RNA/DNA or raw samples", "Target genes / pathogens", "Reference genes or standards where applicable"],
        deliverables: ["Ct/Cq values per sample", "Standard curve & amplification efficiency", "ΔΔCt expression tables", "Melt curves and QC flags"],
      },
    ],
  },
  {
    slug: "sequencing",
    title: "Sequencing services",
    intro:
      "From a single gene fragment to a complete genome — short-read, long-read and Sanger capacity routed to verified national laboratories whose declared platforms match your project.",
    items: [
      {
        icon: SearchCheck,
        name: "Gene / amplicon / fragment sequencing (Sanger)",
        desc: "Gold-standard capillary sequencing for PCR products, plasmid and clone verification, mutation confirmation and DNA barcoding (COI, ITS, rbcL, 16S). Reads of ~500–1000 bp with chromatogram-level trace files delivered for every sample.",
        detail:
          "Sanger remains the confirmation technology: nothing beats it for verifying a cloned insert, confirming an edit or variant, or barcoding a specimen. Providers sequence purified PCR products or plasmids with your primers or standard vector primers, delivering ~500–1000 bp of clean read plus the raw chromatogram (.ab1) so you can inspect every base call.",
        tags: ["PCR product verification", "DNA barcoding", "Chromatograms included"],
        inputs: ["Purified PCR product or plasmid at declared concentration", "Sequencing primer(s)", "Expected sequence or reference where available"],
        deliverables: [".ab1 chromatogram per reaction", "Consensus sequence (FASTA/text)", "Quality-trimmed read length report"],
      },
      {
        icon: Dna,
        name: "Microbial whole-genome sequencing (WGS)",
        desc: "Complete bacterial and archaeal genomes for outbreak tracing, antimicrobial-resistance (AMR) profiling, strain typing and reference-quality de novo assembly. Hybrid short+long-read strategies close genomes that short reads alone can't finish.",
        detail:
          "Microbial WGS is the highest-volume genomics application in Pakistan's clinical, food-safety and agriculture labs. Short-read runs (Illumina MiSeq/NextSeq/NovaSeq X) deliver accurate draft assemblies; adding long reads (ONT or PacBio) resolves plasmids, rRNA operons and repeats into closed, circularized genomes. Downstream typing — MLST, serotyping, AMR and virulence panels — rides on the same data.",
        tags: ["De novo assembly", "AMR & virulence typing", "Hybrid assembly"],
        inputs: ["Pure culture or extracted gDNA", "Expected genus/species where known", "Short-read only vs hybrid strategy preference"],
        deliverables: ["Draft or closed assembly (FASTA)", "Assembly QC (N50, coverage, contamination check)", "Typing report (MLST/AMR) where requested"],
      },
      {
        icon: FlaskConical,
        name: "Plant, animal & human WGS",
        desc: "Whole-genome sequencing for crop and livestock improvement, biodiversity and conservation genomics, and human germline or disease studies — from 30× short-read resequencing on Illumina NovaSeq X to contiguous long-read assemblies on PacBio Revio or ONT PromethION.",
        detail:
          "For complex eukaryotic genomes the design question is coverage and read length: 30×+ short-read resequencing suits variant discovery against a reference; long reads (PacBio HiFi, ONT) deliver the contiguity needed for de novo assembly of plants, livestock and novel organisms. Providers state which platforms and depths they can deliver, so quotes are comparable on like-for-like designs.",
        tags: ["Illumina · PacBio · ONT", "Resequencing & de novo", "Variant-ready output"],
        inputs: ["Species and genome-size estimate", "HMW DNA or raw sample + extraction", "Target coverage / assembly goal", "Reference genome where one exists"],
        deliverables: ["Aligned BAM/CRAM or de novo assembly", "Coverage & mapping QC", "Variant calls where analysis is included"],
      },
      {
        icon: Beaker,
        name: "Epigenome sequencing",
        desc: "Genome-wide DNA-methylation profiling via bisulfite sequencing (WGBS / RRBS) on Illumina, or direct detection of 5mC and 6mA modifications on native Oxford Nanopore reads — plus chromatin-accessibility mapping (ATAC-seq) where providers declare it.",
        detail:
          "Epigenomics splits by method: bisulfite conversion followed by sequencing (whole-genome WGBS or reduced-representation RRBS) is the established Illumina route; Oxford Nanopore detects 5mC and 6mA natively on the same run as the base sequence — no conversion, no extra library. ATAC-seq adds chromatin accessibility for regulatory studies. Providers declare which assays they actually run — list only what is confirmed.",
        tags: ["WGBS / RRBS", "Native ONT methylation", "ATAC-seq"],
        inputs: ["DNA or cells at assay-specific quantities", "Target regions vs whole-genome scope", "Platform / assay preference"],
        deliverables: ["Methylation calls (CpG context)", "Coverage report per region", "DMR-ready aligned data"],
      },
      {
        icon: GitBranch,
        name: "Transcriptome / RNA sequencing",
        desc: "Bulk RNA-seq for differential-expression studies, full-length isoform discovery with long-read transcriptomics, and small-RNA profiling. Libraries can be stranded, poly-A selected or rRNA-depleted depending on your organism and question.",
        detail:
          "RNA-seq design hinges on the library: poly-A selection for coding transcriptomes in eukaryotes, rRNA depletion for bacterial or degraded samples, stranded protocols for antisense resolution. Short-read bulk RNA-seq powers differential-expression studies; long-read transcriptomics (Iso-Seq-style or direct RNA) resolves full-length isoforms and splicing that fragments miss.",
        tags: ["Bulk RNA-seq", "Full-length isoforms", "Poly-A / rRNA-depleted"],
        inputs: ["RNA at RIN ≥ provider threshold (or raw stabilized sample)", "Replicate design and comparison groups", "Library type preference or guidance request"],
        deliverables: ["Aligned expression-ready reads", "Counts matrix where analysis is included", "Library QC (insert size, duplication rate)"],
      },
      {
        icon: Microscope,
        name: "Shotgun metagenome sequencing",
        desc: "Untargeted sequencing of entire microbial communities — species, strains and functional genes in one assay. Suited to gut, soil, water and industrial samples, with metagenome-assembled genomes (MAGs) and pathway profiling as downstream options.",
        detail:
          "Shotgun metagenomics sequences everything in the sample — no primers, no marker-gene bias — so you recover species, strains, genes and pathways simultaneously. It is the right choice for functional questions (resistomes, metabolic capacity) and for recovering metagenome-assembled genomes. Host-depletion options matter for high-background samples like tissue or swabs.",
        tags: ["Species + function", "MAG recovery", "Gut · soil · water"],
        inputs: ["Environmental or host-associated sample", "Expected microbial fraction", "Depth target / host-depletion need"],
        deliverables: ["Taxonomic & functional profiles", "MAGs where requested", "QC-filtered reads and reports"],
      },
      {
        icon: TestTubes,
        name: "Amplicon metagenome sequencing",
        desc: "Marker-gene community surveys — 16S rRNA (V3–V4 and other variable regions), ITS for fungi and 18S for eukaryotes — the cost-efficient way to profile community composition across large cohorts.",
        detail:
          "Amplicon profiling is the high-throughput survey method: one marker gene amplified and sequenced across dozens or hundreds of samples. 16S rRNA covers bacteria and archaea, ITS covers fungi, 18S covers broader eukaryotes. Cheaper per sample than shotgun, it answers 'who is there and at what relative abundance' for cohort, environmental and agricultural studies.",
        tags: ["16S rRNA", "ITS / 18S", "High-throughput cohorts"],
        inputs: ["Extracted environmental DNA", "Marker region choice (or guidance)", "Sample count / cohort size"],
        deliverables: ["ASV/OTU table", "Taxonomy assignments", "Diversity metrics & summary report"],
      },
    ],
  },
  {
    slug: "bioinformatics",
    title: "Bioinformatics services",
    intro:
      "Analysis by trained bioinformaticians on high-performance computing — bundled with sequencing or as a standalone project on data you already hold.",
    items: [
      {
        icon: Cpu,
        name: "Genome assembly & annotation",
        desc: "De novo and hybrid assemblies — short-read, long-read or combined — polished to reference quality, then structurally and functionally annotated (genes, rRNAs, mobile elements, biosynthetic clusters). Delivered as assembly files, QC metrics and annotated feature tables.",
        detail:
          "Assembly turns reads into biology. Pipelines are matched to the data: short-read assemblers for Illumina-only runs, long-read assemblers (Flye, Hifiasm) for ONT/PacBio, and hybrid strategies that combine both. Assemblies are polished, contamination-screened and then annotated — protein-coding genes, rRNAs, prophage, mobile elements and biosynthetic gene clusters where relevant.",
        tags: ["Hybrid & de novo", "Contig-to-chromosome", "Annotation reports"],
        inputs: ["Sequencing reads (FASTQ) or existing assembly", "Organism and ploidy expectations", "Reference or close-relative genome where available"],
        deliverables: ["Assembly FASTA + QC metrics", "Annotated GenBank/GFF", "BUSCO completeness & contamination report"],
      },
      {
        icon: GitBranch,
        name: "Pangenome analysis",
        desc: "Core, accessory and strain-specific gene content across isolates — pan-genome graphs, phylogenetic placement and presence/absence matrices that reveal population structure for bacterial collections and outbreak studies.",
        detail:
          "A single reference genome cannot represent a species. Pangenome analysis compares your isolate collection to split gene content into core, accessory and unique fractions — revealing open vs closed pangenomes, lineage-specific genes, and the phylogenetic backbone of an outbreak or breeding collection.",
        tags: ["Core / accessory genes", "Phylogenetics", "Population structure"],
        inputs: ["Assemblies or reads for ≥ a few isolates", "Metadata (source, location, phenotype)", "Outgroup or reference preference"],
        deliverables: ["Pangenome matrix & curves", "Core-genome phylogeny", "Presence/absence tables per isolate"],
      },
      {
        icon: SearchCheck,
        name: "Variant calling",
        desc: "SNPs, indels, copy-number and structural variants called with validated pipelines (GATK, DeepVariant, Clair3) and annotated for functional consequence — delivered as filtered VCFs with QC reports and interpretation-ready tables.",
        detail:
          "Variant pipelines are chosen by data type: GATK best-practice and DeepVariant for short reads, Clair3 and sniffles-style callers for long reads. Calls are hard-filtered or model-scored, then annotated against genes, transcripts and known variant databases — so results arrive interpretable, not as raw pileups.",
        tags: ["SNP / indel / CNV / SV", "Annotated VCF", "Germline & somatic"],
        inputs: ["Aligned or raw reads", "Reference genome", "Germline vs somatic context"],
        deliverables: ["Filtered, annotated VCF", "Calling QC & coverage report", "Summary tables for review"],
      },
      {
        icon: Cpu,
        name: "Differential gene expression analysis",
        desc: "Statistical RNA-seq analysis — normalization, differential expression, clustering and pathway/Gene-Ontology enrichment — with publication-ready figures: volcano plots, heatmaps, PCA and interactive result tables.",
        detail:
          "DGE is a statistics problem, not just a pipeline. Analysis covers exploratory QC (PCA, library size, batch structure), differential expression with DESeq2/edgeR-style models, multiple-testing control, and functional interpretation through GO/pathway enrichment — packaged so a reviewer can trace every figure back to a method.",
        tags: ["DESeq2 / edgeR", "Pathway enrichment", "Publication-ready figures"],
        inputs: ["Counts matrix or raw RNA-seq reads", "Experimental design (groups, replicates, batches)", "Organism annotation"],
        deliverables: ["DE gene tables with FDR", "Volcano / heatmap / PCA figures", "Enrichment results", "Methods paragraph draft"],
      },
      {
        icon: Dna,
        name: "Isoform identification",
        desc: "Full-length transcript discovery from long-read data — novel isoforms, alternative splicing events, fusion transcripts and allele-specific expression that short-read RNA-seq cannot resolve.",
        detail:
          "Long reads span entire transcripts, exposing what fragments hide: novel isoforms, alternative splice sites, fusion transcripts and allele-specific expression. Pipelines classify isoforms against the reference annotation, quantify them per condition, and flag novel coding potential.",
        tags: ["Novel isoforms", "Splice & fusion events", "Long-read transcriptome"],
        inputs: ["Long-read transcriptome data (PacBio Iso-Seq / ONT)", "Reference genome + annotation", "Conditions to compare"],
        deliverables: ["Isoform classification tables", "Novel-isoform catalog", "Per-condition isoform quantification"],
      },
      {
        icon: Microscope,
        name: "Microbiome & metagenome analysis",
        desc: "Taxonomic and functional profiling of amplicon and shotgun datasets — diversity metrics, differential abundance, MAG binning and resistome/pathway analysis, summarized in reports designed for non-specialist reviewers.",
        detail:
          "Amplicon datasets get ASV-level pipelines (DADA2/QIIME2) with curated taxonomy; shotgun datasets get read-based profiling plus assembly, binning and annotation of metagenome-assembled genomes. Both end in reviewer-friendly outputs: diversity statistics, differential abundance, and plain-language interpretation of what the community is doing.",
        tags: ["QIIME2 / Kraken", "MAGs & pathways", "Diversity reports"],
        inputs: ["Amplicon or shotgun reads", "Sample metadata & comparison groups", "Target databases / regions"],
        deliverables: ["Taxonomy & abundance tables", "Alpha/beta diversity statistics", "MAGs + functional profiles where applicable"],
      },
      {
        icon: Beaker,
        name: "Methylation analysis",
        desc: "Differentially methylated region (DMR) calling, CpG-context statistics and sample clustering from WGBS/RRBS data, or direct modification calls from native Nanopore reads — mapped against genes and regulatory features.",
        detail:
          "Bisulfite data are processed through methylation-aware aligners to per-CpG calls, then DMRs between conditions are tested with proper replicate statistics. ONT native-call data skip conversion entirely — modification bams are read directly and aggregated per site. Results are always mapped back to genes and regulatory regions for interpretation.",
        tags: ["DMR calling", "WGBS / RRBS pipelines", "ONT modkit"],
        inputs: ["WGBS/RRBS reads or ONT mod-bam data", "Experimental groups", "Reference genome"],
        deliverables: ["Per-site methylation tables", "DMR list with statistics", "Gene-context annotation"],
      },
    ],
  },
];

export function panelBySlug(slug: string) {
  return PANELS.find((p) => p.slug === slug);
}
