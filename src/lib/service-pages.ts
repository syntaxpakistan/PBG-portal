export type ServiceSub = { title: string; desc: string; points?: string[]; note?: string };
export type ServicePage = {
  slug: string;
  eyebrow: string;
  title: string;
  tagline: string;
  stats?: { value: string; label: string }[];
  subs: ServiceSub[];
  features: { title: string; desc: string }[];
  steps: { title: string; desc: string }[];
  deliverablesTitle: string;
  deliverablesDesc: string;
  deliverables: string[];
  applications?: { title: string; desc: string }[];
  resources?: { tag: string; title: string; desc: string }[];
  faqs?: { q: string; a: string }[];
  ctaTitle?: string;
  ctaDesc?: string;
  ctaPoints?: string[];
  sections?: {
    backHref?: string;
    backLabel?: string;
    subsEyebrow?: string;
    subsTitle?: string;
    subsDesc?: string;
    featuresEyebrow?: string;
    featuresTitle?: string;
    stepsEyebrow?: string;
    stepsTitle?: string;
    relatedEyebrow?: string;
    relatedTitle?: string;
  };
  related?: { href: string; eyebrow: string; title: string }[];
};

export const SERVICE_PAGES: ServicePage[] = [
  {
    slug: "whole-genome-sequencing",
    eyebrow: "Genomics",
    title: "Whole-genome sequencing services",
    tagline:
      "Sequence microbial, plant and animal genomes for de novo assembly or resequencing — short-read and long-read workflows matched to genome size and study goals.",
    subs: [
      { title: "Long-read WGS", desc: "Oxford Nanopore and PacBio HiFi genomes — contiguous assemblies, structural variants and complex or polyploid regions resolved end-to-end." },
      { title: "Short-read WGS", desc: "High-depth Illumina whole-genome sequencing for resequencing, variant discovery and population-scale microbial, plant and animal cohorts." },
    ],
    features: [
      { title: "End-to-end solutions", desc: "Extraction, library prep, sequencing and bioinformatics managed in one laboratory chain." },
      { title: "Microbe to mammal", desc: "Bacterial and fungal isolates through to plant, livestock and human genomes — workflow sized to genome complexity." },
      { title: "Multi-platform options", desc: "Illumina short-read, Oxford Nanopore and PacBio long-read platforms matched to the study." },
      { title: "Expert support", desc: "PhD guidance on coverage, platform choice, QC and variant interpretation." },
      { title: "Fast turnaround", desc: "Automated workflows keep large cohorts and routine isolates moving." },
      { title: "Transparent reporting", desc: "Formal QC documentation at every checkpoint before sequencing." },
    ],
    steps: [
      { title: "Consultation & design", desc: "Align organism, coverage targets and platform — short-read resequencing or long-read assembly." },
      { title: "Order & submission", desc: "Register samples online and arrange tracked shipment or courier pickup." },
      { title: "Sample QC", desc: "Qubit and TapeStation or Fragment Analyzer reports shared for sign-off." },
      { title: "Library QC & sequencing", desc: "Balanced libraries run on Illumina, ONT or PacBio platforms." },
      { title: "Delivery & bioinformatics", desc: "FASTQ, assemblies or variant calls delivered securely, with annotation available." },
    ],
    deliverablesTitle: "Comprehensive genomic bioinformatics",
    deliverablesDesc:
      "Pipelines range from de novo assembly and annotation through resequencing variant calls — germline, somatic and microbial.",
    deliverables: [
      "FASTQ files", "QC report", "De novo assembly (FASTA)", "Assembly metrics & completeness",
      "Alignment files (BAM)", "Germline & somatic VCF", "Variant annotation",
      "Copy-number profiles", "Structural variant calls", "Publication-ready figures",
    ],
    applications: [
      { title: "Microbial genomes", desc: "Complete or draft assemblies for bacterial and fungal isolates — AMR, virulence and typing." },
      { title: "Plant & crop genomes", desc: "Assembly and resequencing for breeding, diversity and trait-mapping studies." },
      { title: "Animal & livestock", desc: "Population genomics, parentage and trait discovery across breeding programs." },
      { title: "Rare & inherited disease", desc: "Pinpoint causative coding and non-coding variants in research cohorts." },
      { title: "Structural variation & phasing", desc: "Resolve inversions, duplications, translocations and haplotype context with long reads." },
    ],
    faqs: [
      { q: "Long-read or short-read WGS — which do I choose?", a: "Long-read WGS (ONT/PacBio) is best for de novo assembly, structural variants and repetitive regions. Short-read WGS (Illumina) is the cost-efficient choice for resequencing and variant discovery against a reference. Scientists help you pick during the free consultation." },
      { q: "What organisms are supported?", a: "Bacterial, fungal, plant and animal genomes — from microbial isolates to large polyploid plant genomes. Workflow and depth are sized to genome size and complexity." },
      { q: "What is the typical turnaround?", a: "Standard 3–4 weeks from sample QC approval for most isolates; larger genomes and cohort studies are scheduled per project." },
      { q: "What are the DNA requirements?", a: "Short-read WGS prefers >10–50 ng purified DNA. Long-read assembly needs high-molecular-weight DNA (DIN >7 preferred) — free DNA extraction is offered by select partner labs." },
      { q: "Which platforms are used?", a: "Illumina short-read for resequencing, Oxford Nanopore and PacBio for long-read assembly — chosen per project." },
      { q: "Is analysis included?", a: "Assembly, annotation and variant calling are available as add-on or standalone bioinformatics packages — quoted per project." },
    ],
    ctaTitle: "Start your genome project",
    ctaDesc: "Tell us about your organism and goals — a scientist replies within one business day with the right workflow and a tailored quote.",
    ctaPoints: ["Microbial, plant & animal genomes", "Long-read & short-read workflows", "Assembly, annotation & variant analysis"],
    related: [
      { href: "/services/metagenomics", eyebrow: "Microbiome", title: "Metagenomics & Microbiome Profiling" },
      { href: "/services/sequencing-only", eyebrow: "Sequence-only", title: "Sequencing Only — your libraries" },
      { href: "/bioinformatics", eyebrow: "Bioinformatics", title: "Assembly & Variant Analysis" },
    ],
  },
  {
    slug: "metagenomics",
    eyebrow: "Microbiome",
    title: "Metagenomics & microbiome profiling",
    tagline:
      "Characterise microbial communities in mixed samples — from soil, water, gut and plant microbiomes to clinical and industrial specimens.",
    subs: [
      { title: "Shotgun Metagenomics", desc: "Unbiased sequencing of all DNA in a sample — species-level taxonomy, functional pathways, AMR and virulence profiling without targeted primers." },
      { title: "Amplicon Profiling (16S / ITS / 18S)", desc: "Cost-effective community profiling with targeted marker genes — 16S rRNA for bacteria, ITS for fungi and 18S for eukaryotic communities." },
    ],
    features: [
      { title: "Any sample matrix", desc: "Soil, water, sediment, faecal, plant tissue, food and clinical specimens — extraction protocols matched to matrix." },
      { title: "Species-level resolution", desc: "Shotgun sequencing resolves strain-level taxonomy; amplicons give rapid genus-level community structure." },
      { title: "Functional insight", desc: "Metabolic pathways, antibiotic-resistance genes and virulence factors profiled alongside taxonomy." },
      { title: "Downstream-ready", desc: "Kraken2/MetaPhlAn taxonomy, HUMAnN pathways and diversity statistics delivered as interpreted reports." },
      { title: "Partner-subsidized rates", desc: "Local partner pricing on shotgun and amplicon runs — DNA extraction free on qualifying submissions." },
      { title: "Data ownership", desc: "Your data stays yours — raw reads and reports released only to your project space." },
    ],
    steps: [
      { title: "Study design", desc: "Shotgun vs amplicon, marker choice and sequencing depth aligned to your community and questions." },
      { title: "Sample submission", desc: "Ship preserved samples — extraction and inhibitor cleanup handled in-house." },
      { title: "Extraction & QC", desc: "Bead-beating and column workflows with fluorometric QC and documented yields." },
      { title: "Library & sequencing", desc: "Indexed libraries sequenced on Illumina or Oxford Nanopore platforms." },
      { title: "Profiling & reporting", desc: "Taxonomic and functional profiles, diversity metrics and publication-ready figures." },
    ],
    deliverablesTitle: "Metagenomic analysis",
    deliverablesDesc:
      "From raw reads to community insight — taxonomy, diversity and functional annotation delivered as clean, interpreted outputs.",
    deliverables: [
      "FASTQ files", "QC report", "Taxonomic profiles (Kraken2/MetaPhlAn)", "Alpha & beta diversity metrics",
      "Functional pathway tables (HUMAnN)", "AMR & virulence screens", "Amplicon ASV/OTU tables",
      "Rarefaction & ordination plots", "Publication-ready figures",
    ],
    applications: [
      { title: "Soil & agriculture", desc: "Rhizosphere and field-soil communities linked to crop health and productivity." },
      { title: "Gut & animal microbiome", desc: "Livestock, aquaculture and human gut community profiling." },
      { title: "Environmental monitoring", desc: "Water, wastewater and sediment community surveillance." },
      { title: "Food & fermentation", desc: "Starter-culture, spoilage and safety screening of food products." },
      { title: "Clinical research", desc: "Specimen microbiomes in infection, inflammation and treatment-response studies." },
    ],
    faqs: [
      { q: "Shotgun or amplicon — which do I choose?", a: "Amplicon profiling (16S/ITS/18S) is the economical choice for community composition across many samples. Shotgun metagenomics costs more per sample but resolves species/strain taxonomy plus functional genes and AMR — no primer bias." },
      { q: "Which marker regions are supported?", a: "16S rRNA (V3–V4 and full-length) for bacteria, ITS for fungi and 18S for eukaryotic communities — primer sets matched to your sample type." },
      { q: "What sample types are accepted?", a: "Soil, water filters, faecal material, plant tissue, swabs, food matrices and clinical specimens — with preservation guidance provided at submission." },
      { q: "How many reads per sample?", a: "Amplicons typically 50–100k reads; shotgun runs 5–20M+ reads depending on community complexity and host DNA fraction — depth is set at consultation." },
      { q: "Is bioinformatics included?", a: "Taxonomy, diversity and functional profiling are delivered as standard reports; deeper custom analysis is available through the bioinformatics team." },
    ],
    ctaTitle: "Profile your microbial community",
    ctaDesc: "Describe your samples and questions — a scientist replies with marker/platform recommendations and a tailored quote.",
    ctaPoints: ["Shotgun & amplicon workflows", "Soil, gut, plant & clinical matrices", "Subsidized partner rates available"],
    related: [
      { href: "/services/whole-genome-sequencing", eyebrow: "Genomics", title: "Whole-Genome Sequencing" },
      { href: "/services/sanger", eyebrow: "Sanger", title: "Sanger Sequencing & Barcoding" },
      { href: "/bioinformatics", eyebrow: "Bioinformatics", title: "Microbiome Analysis" },
    ],
  },
  {
    slug: "transcriptomics",
    eyebrow: "Transcriptomics",
    title: "Transcriptomics services",
    tagline:
      "Measure gene expression or study transcript isoforms — bulk RNA-Seq for expression profiling and long-read RNA for full-length transcript structure.",
    subs: [
      { title: "Short-read Bulk RNA Sequencing", desc: "Stranded Illumina RNA-Seq for differential expression — standard, total, low-input and FFPE workflows with QC'd alignment and count matrices." },
      { title: "Long-read RNA Sequencing", desc: "Full-length isoform resolution on PacBio Iso-Seq or Oxford Nanopore — alternative splicing, gene fusions and novel transcript discovery." },
    ],
    features: [
      { title: "End-to-end workflows", desc: "RNA extraction, QC, library prep, sequencing, analysis and reporting handled under one roof." },
      { title: "Expression to isoforms", desc: "Bulk differential expression through full-length isoform characterization in a single study." },
      { title: "Exceptional sensitivity", desc: "Validated low-input protocols down to picogram RNA, plus degraded FFPE specimens." },
      { title: "Strand-specific accuracy", desc: "Stranded RNA-Seq captures antisense transcription, splice variants and fusion transcripts." },
      { title: "Expert oversight", desc: "PhD-level scientists guide study design, platform selection and data interpretation." },
      { title: "Fast turnaround", desc: "Automated liquid handling keeps processing efficient and delivery predictable." },
    ],
    steps: [
      { title: "Consultation & study design", desc: "Bulk vs long-read RNA workflows aligned with your objectives and sample quality." },
      { title: "Order & sample submission", desc: "Register samples through the portal and arrange tracked shipment or courier pickup." },
      { title: "Sample QC & evaluation", desc: "Qubit, TapeStation or Bioanalyzer reports (RIN/DV200) shared for sign-off before library work." },
      { title: "Library QC & sequencing", desc: "Indexed libraries pooled and run on Illumina, PacBio or ONT platforms." },
      { title: "Delivery & bioinformatics", desc: "FASTQ/BAM files, count matrices and QC reports delivered securely." },
    ],
    deliverablesTitle: "Comprehensive transcriptome analysis",
    deliverablesDesc:
      "Automated pipelines take you from raw reads to biological insight — differential expression, pathway enrichment and isoform-level analysis.",
    deliverables: [
      "FASTQ files", "Sequencer QC report", "Alignment files (BAM)", "Processed count matrices",
      "Differential expression tables", "Pathway enrichment", "Isoform & fusion annotations",
      "Expression heatmaps & volcano plots", "PCA & correlation plots", "Publication-ready figures",
    ],
    applications: [
      { title: "Differential gene expression", desc: "Compare transcriptional profiles between groups to isolate biomarkers." },
      { title: "Isoform & splicing analysis", desc: "Discover novel transcripts, splicing events and fusions using long reads." },
      { title: "Plant & crop expression", desc: "Stress-response and trait-expression studies across breeding lines." },
      { title: "Microbial transcriptomics", desc: "Bacterial expression profiling for AMR, virulence and pathway studies." },
      { title: "Drug mechanism of action", desc: "Evaluate how therapeutic compounds shift cellular pathways across tissues." },
    ],
    faqs: [
      { q: "Bulk RNA-Seq or long-read RNA — which do I choose?", a: "Bulk short-read RNA-Seq is the standard for comparing expression between groups. Long-read RNA (Iso-Seq/direct RNA) is for isoform structure — alternative splicing, fusions and novel transcripts. Many projects run both; we help you design it." },
      { q: "What is the typical turnaround time?", a: "Standard turnaround is 3–4 weeks from sample QC approval; select bulk workflows can be expedited." },
      { q: "What are the sample requirements?", a: "Bulk RNA prefers >10–50 ng purified RNA (RIN >5), down to picogram levels for low-input. Long-read prefers high-integrity total RNA (RIN >7)." },
      { q: "What sample types are compatible?", a: "Whole blood, fresh-frozen tissue, cultured cells, microbial isolates and clinical FFPE blocks." },
      { q: "What quality control is provided?", a: "Every input is validated with Qubit and TapeStation (RIN/DV200), with formal reports shared for sign-off before any run." },
    ],
    ctaTitle: "Let's discuss your transcriptomics project",
    ctaDesc: "Tell us about your samples and goals — a scientist replies within one business day with workflow options and a tailored quote.",
    ctaPoints: ["Bulk expression & full-length isoforms", "Complimentary technical consultation", "Integrated bioinformatics & reporting"],
    related: [
      { href: "/services/epigenomics", eyebrow: "Epigenomics", title: "DNA Methylation Profiling" },
      { href: "/services/sequencing-only", eyebrow: "Sequence-only", title: "Sequencing Only — your libraries" },
      { href: "/bioinformatics/rna-analysis", eyebrow: "Bioinformatics", title: "RNA-Seq Data Analysis" },
    ],
  },
  {
    slug: "epigenomics",
    eyebrow: "Epigenomics",
    title: "Epigenomic sequencing services",
    tagline:
      "Profile DNA methylation with methods suited to your study — direct native detection on long reads or base-resolution sequencing on short-read platforms.",
    subs: [
      { title: "Oxford Nanopore Native DNA Methylation", desc: "5mC and other modifications read directly from native DNA — no bisulfite conversion, no extra prep — alongside long-read sequence, structure and phasing." },
      { title: "Illumina-based Methylation Sequencing", desc: "Base-resolution methylomes via WGBS or enzymatic conversion — genome-wide CpG coverage for cohort studies and differential methylation." },
    ],
    features: [
      { title: "Native or converted", desc: "Direct ONT methylation calls on unmodified DNA, or gold-standard bisulfite/enzymatic workflows on Illumina." },
      { title: "Cohort to single-molecule", desc: "Population-scale methylome studies through single-molecule phasing of methylation over structural variants." },
      { title: "High signal-to-noise", desc: "Validated chemistries and conversion controls keep false-positive rates low." },
      { title: "Stringent QC", desc: "Fluorometric quantification and fragment sizing flag compromised DNA before sequencing." },
      { title: "Unified chain of custody", desc: "Preparation, instrument cycles and pipelines run inside verified partner facilities." },
      { title: "Advanced data delivery", desc: "Per-CpG matrices, differentially methylated regions and browser tracks ready to publish." },
    ],
    steps: [
      { title: "Scope & design", desc: "ONT native calls vs Illumina conversion chemistry matched to coverage and resolution needs." },
      { title: "Sample submission", desc: "Ship snap-frozen tissue or cells on dry ice; purified gDNA ships at 4 °C." },
      { title: "Extraction & pre-QC", desc: "HMW DNA extraction for ONT or standard extraction for WGBS with documented QC." },
      { title: "Sequencing", desc: "Native long-read runs or converted short-read libraries sequenced to target depth." },
      { title: "Delivery & bioinformatics", desc: "Methylation calls, DMRs and tracks delivered as interpreted reports." },
    ],
    deliverablesTitle: "Methylation bioinformatics",
    deliverablesDesc:
      "From raw reads to regulatory insight — QC, methylation calling, differential analysis and publication-ready visualizations.",
    deliverables: [
      "FASTQ files", "Sequencer QC report", "Per-CpG methylation calls", "Methylation tracks (bedGraph/bigWig)",
      "Differentially methylated regions", "Hierarchical clustering & PCA", "Heatmap correlation",
      "Metagene profiles", "Publication-ready figures",
    ],
    applications: [
      { title: "Developmental biology", desc: "Track methylation reprogramming across differentiation and developmental stages." },
      { title: "Plant epigenetics", desc: "Stress memory, transgenerational methylation and trait regulation in crops." },
      { title: "Imprinting & disease", desc: "Aberrant methylation signatures in developmental and metabolic disorders." },
      { title: "Microbial epigenetics", desc: "m6A/m4C and methylation-driven phase variation in bacterial genomes." },
      { title: "Aging & environment", desc: "Methylation drift linked to exposure, diet and environmental change." },
    ],
    faqs: [
      { q: "ONT native methylation or Illumina methylation — which do I choose?", a: "ONT reads methylation directly from native DNA — ideal when you also want structural variants or phasing from the same run, with no bisulfite degradation. Illumina WGBS/enzymatic gives the deepest, most uniform CpG coverage for cohort-scale differential methylation." },
      { q: "How much input is required?", a: "ONT native methylation typically needs 1–3 µg HMW DNA (DIN >7). Illumina WGBS takes 100–1,000 ng; enzymatic conversion tolerates lower and more degraded inputs." },
      { q: "What coverage is recommended?", a: "WGBS projects generally target 30–50× per sample; ONT methylation calls track native coverage — depth is set per study at consultation." },
      { q: "Can methylation combine with other assays?", a: "Yes — methylation integrates with RNA-Seq expression and WGS variant data inside a single project for cross-omic correlation." },
      { q: "What is the expected timeline?", a: "Standard projects run ~4–6 weeks from sample QC approval depending on cohort size and platform." },
    ],
    ctaTitle: "Uncover the regulatory layer of your genome",
    ctaDesc: "Contact the team for a technical consultation — method selection, sample requirements and a sequencing strategy tailored to your goals.",
    ctaPoints: ["ONT native & Illumina methylation", "Expert prep, sequencing & bioinformatics", "Publication-ready data & analysis support"],
    related: [
      { href: "/services/transcriptomics", eyebrow: "Transcriptomics", title: "Gene Expression & Isoforms" },
      { href: "/services/whole-genome-sequencing", eyebrow: "Genomics", title: "Whole-Genome Sequencing" },
      { href: "/bioinformatics", eyebrow: "Bioinformatics", title: "Methylation Analysis" },
    ],
  },
  {
    slug: "sanger",
    eyebrow: "Sanger",
    title: "Sanger sequencing services",
    tagline:
      "Sequence individual DNA fragments for confirmation and identification — the gold-standard read for validating clones, amplicons and barcodes.",
    subs: [
      { title: "PCR Product Sequencing", desc: "Direct reads of purified amplicons — confirm sequence identity, genotype variants and edit sites with ~500–900 bp high-quality traces." },
      { title: "Plasmid & Clone Verification", desc: "Verify inserts, junctions and full constructs in plasmids and engineered clones — reads across cloning sites with custom primers." },
      { title: "DNA Barcoding", desc: "Species identification with COI, 16S, ITS, rbcL and matK markers — rapid taxonomic confirmation for biodiversity and food-authenticity work." },
    ],
    features: [
      { title: "Fast single reads", desc: "Routine turnaround of 24–48 hours for standard templates and primers." },
      { title: "Any fragment", desc: "PCR products, plasmids, purified gDNA fragments and cloned inserts." },
      { title: "Primer support", desc: "Standard primers stocked for common vectors and barcodes; custom primers accepted." },
      { title: "Trace-level QC", desc: "Chromatogram (.ab1) files delivered with quality scores alongside edited consensus text." },
      { title: "Seq Studio platform", desc: "Capillary electrophoresis on Applied Biosystems SeqStudio-class instruments." },
      { title: "Batch-friendly", desc: "Plate-scale submissions for colony screens, library verification and biodiversity surveys." },
    ],
    steps: [
      { title: "Submit samples", desc: "Register templates and primers — guidance on concentrations provided at checkout." },
      { title: "Template QC", desc: "Concentration and purity checked; failures flagged before chemistry is consumed." },
      { title: "Cycle sequencing", desc: "BigDye-style cycle sequencing reactions run with your or standard primers." },
      { title: "Capillary read", desc: "Fragments resolved on capillary electrophoresis for base-called traces." },
      { title: "Delivery", desc: "Chromatograms and consensus text delivered to your project space, typically within 48h." },
    ],
    deliverablesTitle: "Sanger outputs",
    deliverablesDesc:
      "Every read ships with the raw trace and an edited consensus — ready for alignment against your reference.",
    deliverables: [
      "Chromatogram (.ab1) files", "Edited consensus (FASTA/text)", "Quality scores",
      "Primer-site annotation", "Alignment-ready outputs", "Plate manifests for batch runs",
    ],
    applications: [
      { title: "Clone & construct QC", desc: "Confirm engineered plasmids before downstream experiments." },
      { title: "Variant confirmation", desc: "Validate NGS variant calls and edited alleles at single loci." },
      { title: "Species ID & barcoding", desc: "COI/16S/ITS barcodes for taxonomy, forensics and food authenticity." },
      { title: "Genotyping", desc: "Targeted reads for markers, repeats and known loci." },
    ],
    faqs: [
      { q: "What templates are accepted?", a: "Purified PCR products, plasmid DNA, BACs and colony lysates — submission guidelines specify the required concentration and volume per template type." },
      { q: "How long are the reads?", a: "Typically 500–900 bp of high-quality sequence per reaction, depending on template quality and primer design." },
      { q: "Can you sequence with my own primers?", a: "Yes — ship custom primers alongside templates, or use stocked standard primers for common vectors and barcode loci." },
      { q: "What is the turnaround?", a: "Routine reads return in 24–48 hours; plate-scale batch runs are scheduled on submission." },
      { q: "What do I receive?", a: "The raw chromatogram, an edited consensus sequence and a quality report — all downloadable from your project space." },
    ],
    ctaTitle: "Confirm it with a Sanger read",
    ctaDesc: "Tell us about your templates — routine reads return within 48 hours with traces and edited consensus.",
    ctaPoints: ["24–48h routine turnaround", "PCR, plasmid & barcode templates", "Traces + edited consensus delivered"],
    related: [
      { href: "/services/metagenomics", eyebrow: "Microbiome", title: "Amplicon Community Profiling" },
      { href: "/services/whole-genome-sequencing", eyebrow: "Genomics", title: "Whole-Genome Sequencing" },
      { href: "/services/sequencing-only", eyebrow: "Sequence-only", title: "Sequencing Only" },
    ],
  },
  {
    slug: "sequencing-only",
    eyebrow: "Sequencing only",
    title: "Sequencing-only services",
    tagline:
      "Submit prepared libraries for sequencing on a compatible platform — your libraries, our instruments, raw data back fast.",
    subs: [
      { title: "Long-read Library Sequencing", desc: "Loading of your Oxford Nanopore or PacBio libraries on shared or dedicated flow cells and SMRT cells — cost-efficient access to long-read capacity." },
      { title: "Short-read Library Sequencing", desc: "Your indexed Illumina libraries pooled and run across NovaSeq-class lanes — per-lane or per-read-count pricing for routine and deep runs." },
    ],
    features: [
      { title: "Bring your libraries", desc: "QC'd Illumina, ONT or PacBio libraries accepted — concentration and sizing verified on receipt." },
      { title: "Shared or dedicated runs", desc: "Pool into shared flow cells for small projects or book dedicated capacity for cohorts." },
      { title: "Fast turnaround", desc: "Runs scheduled within days of library QC sign-off — express loading on select platforms." },
      { title: "Transparent QC", desc: "Loading metrics, cluster/PASS stats and run QC reports shared with every lane." },
      { title: "Raw-data delivery", desc: "FASTQ and run metrics released securely to your project space." },
      { title: "Analysis optional", desc: "Add bioinformatics any time — or keep it sequencing-only and take raw data in-house." },
    ],
    steps: [
      { title: "Library QC", desc: "Concentration, size distribution and adapter integrity verified before scheduling." },
      { title: "Run planning", desc: "Pooling scheme, lane allocation and read depth confirmed with you." },
      { title: "Sequencing", desc: "Libraries loaded on the matched platform with documented run QC." },
      { title: "Delivery", desc: "FASTQ files and run metrics released to your project space." },
    ],
    deliverablesTitle: "Sequence-only outputs",
    deliverablesDesc:
      "Clean raw data and run metrics — nothing between you and your downstream pipeline.",
    deliverables: [
      "Demultiplexed FASTQ", "Run QC report", "Index balance & loading metrics",
      "Read-length distributions", "Per-sample yield tables",
    ],
    applications: [
      { title: "In-house library pipelines", desc: "Keep library prep in your lab; outsource instrument time only." },
      { title: "Overflow capacity", desc: "Surge sequencing capacity without capital equipment." },
      { title: "Cost-controlled depth", desc: "Shared lanes and flow cells for budget-sensitive projects." },
    ],
    faqs: [
      { q: "What library types are accepted?", a: "Indexed Illumina-compatible libraries, ONT ligation/rapid libraries and PacBio SMRTbell libraries — QC'd on receipt with acceptance criteria shared upfront." },
      { q: "Can I share a lane or flow cell?", a: "Yes — shared runs pool compatible libraries for cost efficiency; dedicated capacity is available for larger projects." },
      { q: "How fast is turnaround?", a: "Runs typically schedule within a few working days of library QC sign-off; express loading is available on select platforms." },
      { q: "What QC is performed?", a: "Concentration (Qubit), sizing (TapeStation/Fragment Analyzer) and platform-specific checks — failed libraries are flagged before your run slot is used." },
      { q: "Is analysis included?", a: "Sequencing-only ships raw data — but any analysis tier can be added later through the bioinformatics team." },
    ],
    ctaTitle: "Book sequencing capacity",
    ctaDesc: "Tell us your library type, index scheme and target depth — we schedule your run and confirm pricing.",
    ctaPoints: ["Long-read & short-read platforms", "Shared or dedicated runs", "FASTQ + run metrics delivered"],
    related: [
      { href: "/services/whole-genome-sequencing", eyebrow: "Genomics", title: "Whole-Genome Sequencing" },
      { href: "/services/transcriptomics", eyebrow: "Transcriptomics", title: "RNA Sequencing Workflows" },
      { href: "/bioinformatics", eyebrow: "Bioinformatics", title: "Data Analysis Packages" },
    ],
  },
];

export const SERVICE_SLUGS = SERVICE_PAGES.map((s) => s.slug);

export function getServicePage(slug: string) {
  return SERVICE_PAGES.find((s) => s.slug === slug);
}
