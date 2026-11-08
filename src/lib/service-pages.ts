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
    slug: "transcriptomics",
    eyebrow: "Transcriptomics",
    title: "Transcriptomics services",
    tagline:
      "Expression profiling at every resolution — bulk, single-cell, spatial and full-length long-read — matched to your samples and study goals.",
    subs: [
      { title: "Bulk RNA-Seq", desc: "High-quality gene expression profiling on Illumina and Takara chemistries, optimized for low-input and FFPE material." },
      { title: "Single-Cell RNA-Seq", desc: "Reveal cellular heterogeneity and rare populations with high-throughput single-cell transcriptomics." },
      { title: "Spatial Transcriptomics", desc: "Read expression architecture inside intact tissue sections while keeping morphological context." },
      { title: "PacBio Long-Read Transcriptomics", desc: "Resolve complex isoforms, alternative splicing and gene fusions with full-length cDNA sequencing (Iso-Seq)." },
    ],
    features: [
      { title: "End-to-end workflows", desc: "Extraction, QC, library prep, sequencing, analysis and reporting handled under one roof." },
      { title: "Multi-platform profiling", desc: "Illumina short-read, PacBio long-read, single-cell and spatial methods combined to fit the study." },
      { title: "Exceptional sensitivity", desc: "Validated low-input and single-cell protocols, plus degraded FFPE specimens." },
      { title: "Strand-specific accuracy", desc: "Stranded RNA-Seq captures antisense transcription, splice variants and fusion transcripts." },
      { title: "Expert oversight", desc: "PhD-level scientists guide study design, platform selection and data interpretation." },
      { title: "Scalable infrastructure", desc: "Illumina NovaSeq X Plus and PacBio platforms deliver ultra-deep coverage and throughput." },
      { title: "Fast turnaround", desc: "Automated liquid handling keeps processing efficient and delivery predictable." },
    ],
    steps: [
      { title: "Consultation & study design", desc: "Scientists align bulk, single-cell, spatial or long-read workflows with your objectives." },
      { title: "Order & sample submission", desc: "Register samples through the portal and arrange tracked shipment or courier pickup." },
      { title: "Sample QC & evaluation", desc: "Formal Qubit, TapeStation or Bioanalyzer reports shared for sign-off before library work." },
      { title: "Library QC & sequencing", desc: "Indexed libraries are pooled and run on Illumina and PacBio platforms for balanced output." },
      { title: "Delivery & bioinformatics", desc: "FASTQ/BAM files and QC reports delivered securely, with publication-ready interpretation." },
    ],
    deliverablesTitle: "Comprehensive transcriptome analysis",
    deliverablesDesc:
      "Automated pipelines take you from raw reads to biological insight — from bulk differential expression to single-cell clustering and spatial alignment.",
    deliverables: [
      "FASTQ files", "Sequencer QC report", "Alignment files (BAM)", "Processed count matrices",
      "Publication-ready figures", "Expression heatmaps & volcano plots", "Tumor microenvironment deconvolution",
      "Gene networks", "Dot plots", "Alignment stats / mapped-read distribution", "PCA & correlation plots",
      "Secure delivery — SFTP, AWS or Google Cloud",
    ],
    applications: [
      { title: "Oncology & tumor microenvironments", desc: "Uncover the spatial distribution and cellular interactions of immune and cancer cells." },
      { title: "Immune activation & repertoires", desc: "Understand single-cell immune activation, receptor repertoires and response pathways." },
      { title: "Drug mechanism of action", desc: "Evaluate how therapeutic compounds shift cellular pathways across tissues." },
      { title: "Differential gene expression", desc: "Compare transcriptional profiles between groups to isolate biomarkers." },
      { title: "Isoform & splicing analysis", desc: "Discover novel transcripts, splicing events and fusions using long reads." },
    ],
    resources: [
      { tag: "Tech sheet", title: "Bulk RNA-Seq workflows", desc: "End-to-end bulk workflows tuned for standard, ultra-low-input and challenging clinical FFPE material." },
      { tag: "Tech sheet", title: "Single-cell workflows", desc: "High-throughput methods for mapping heterogeneity, immune repertoires and complex microenvironments." },
      { tag: "Tech sheet", title: "Spatial workflows", desc: "How high-resolution expression is mapped within tissue sections while preserving morphology." },
    ],
    faqs: [
      { q: "Bulk, single-cell or spatial — which do I choose?", a: "Bulk RNA-Seq gives a deep, cost-effective view of average expression. Single-cell resolves heterogeneity; spatial retains morphological context. Scientists help you pick during the free consultation." },
      { q: "What is the typical turnaround time?", a: "Standard turnaround is 3–4 weeks from sample QC approval; select bulk RNA workflows can be expedited to 10–12 business days." },
      { q: "Which sequencing platforms are used?", a: "Illumina NovaSeq X Plus for high-throughput short reads (PE150) and PacBio instruments for high-fidelity long-read Iso-Seq." },
      { q: "What sample types are compatible?", a: "Whole blood, fresh-frozen tissue, cultured cells, single-cell suspensions and clinical FFPE blocks." },
      { q: "What are the sample requirements?", a: "Bulk RNA prefers >10–50 ng purified RNA (RIN >5), down to 10 pg for ultra-low input. Single-cell needs >80% viability suspensions. Spatial takes fresh-frozen tissue or qualified FFPE. Long-read prefers high-integrity total RNA (RIN >7)." },
      { q: "What quality control is provided?", a: "Every input is validated with Qubit and TapeStation, with formal reports shared for sign-off before any run." },
    ],
    ctaTitle: "Let's discuss your transcriptomics project",
    ctaDesc: "Tell us about your samples and goals — a PhD scientist replies within one business day with sample requirements, technology options and a tailored quote.",
    ctaPoints: ["Bulk, single-cell, spatial & long-read expertise", "Complimentary technical consultation", "Integrated bioinformatics & reporting"],
  },
  {
    slug: "rna-sequencing",
    eyebrow: "RNA-Seq",
    title: "RNA sequencing services",
    tagline:
      "Stranded, total, low-input and long-read RNA-Seq workflows engineered around sample quality — from 10 pg inputs to archived FFPE.",
    subs: [
      { title: "Stranded mRNA-Seq", desc: "High-quality profiling with Illumina Stranded mRNA chemistry for inputs above 50 ng." },
      { title: "Total RNA-Seq", desc: "Whole-transcriptome coverage with targeted rRNA depletion on Illumina Stranded workflows." },
      { title: "Low Input RNA-Seq", desc: "Ultra-sensitive Takara SMART-Seq profiling for precious samples down to 10 pg." },
      { title: "FFPE RNA-Seq", desc: "Dependable transcriptomic recovery from heavily degraded, archived clinical specimens." },
      { title: "Blood RNA-Seq", desc: "Whole-blood expression profiling with integrated globin and rRNA depletion (Ribo-Zero Plus)." },
      { title: "Long-Read RNA", desc: "Accurate isoform, alternative-splicing and gene-fusion characterization." },
      { title: "Small RNA-Seq", desc: "Targeted small-RNA profiling with size selection for 18–30 nt transcripts." },
      { title: "16S Microbiome", desc: "High-throughput microbial identification using full-length 1.5 kb 16S on PacBio Kinnex." },
      { title: "Expedited RNA-Seq", desc: "Accelerated sequencing and analysis delivered in as few as 10–12 business days." },
    ],
    features: [
      { title: "End-to-end workflows", desc: "RNA extraction, QC, library prep, sequencing, analysis and reporting in one laboratory chain." },
      { title: "Flexible transcriptome capture", desc: "mRNA, total, stranded, small RNA, globin-depleted and custom designs across Illumina, PacBio and Takara." },
      { title: "High strand specificity", desc: "Confident detection of antisense transcription, overlapping genes, splice variants and fusions." },
      { title: "Broad sample compatibility", desc: "Ultra-low inputs to 10 pg and degraded FFPE down to DV200 >20%." },
      { title: "Expert oversight", desc: "PhD-level guidance on design, workflow selection, QC and interpretation." },
      { title: "Scalable depth", desc: "Illumina NovaSeq X Plus delivers deep transcriptomic coverage at any cohort size." },
    ],
    steps: [
      { title: "Consultation & design", desc: "Dedicated guidance aligns the right RNA workflow to your research objectives." },
      { title: "Order & submission", desc: "Register samples online and ship or schedule pickup when ready." },
      { title: "Sample QC & library prep", desc: "Qubit and TapeStation reports shared for full transparency before library construction." },
      { title: "Library QC & sequencing", desc: "Libraries QC'd and pooled for high-fidelity output on the NovaSeq X+ platform." },
      { title: "Delivery & bioinformatics", desc: "Secure FASTQ and QC delivery via SFTP or cloud, with optional publication-ready analysis." },
    ],
    deliverablesTitle: "Comprehensive RNA bioinformatics",
    deliverablesDesc:
      "Industry-standard STAR and DESeq2 workflows deliver accurate alignment and differential expression, paired with pathway enrichment that prioritizes real biology.",
    deliverables: [
      "FASTQ & data QC report", "Alignment files (BAM)", "Germline VCF", "Variant annotation",
      "Low-frequency variant calling", "Volcano plots", "Tumor microenvironment analysis", "Gene networks",
      "Dot plots", "Alignment stats", "PCA plots", "Correlation plots", "Heatmaps",
    ],
    applications: [
      { title: "Immune activation & response", desc: "Understand immune cell activation and response pathways." },
      { title: "Drug mechanism of action", desc: "Evaluate how compounds affect cellular pathways." },
      { title: "Single-cell correlation", desc: "Bulk RNA-Seq to validate or complement single-cell datasets." },
      { title: "Differential gene expression", desc: "Compare transcriptional profiles between experimental groups." },
      { title: "Transcriptome profiling", desc: "Discover novel transcripts, isoforms and non-coding RNAs." },
      { title: "Oncology & biomarker discovery", desc: "Identify fusion genes and expression signatures in cancer." },
    ],
    resources: [
      { tag: "Tech sheet", title: "RNA-Seq service overview", desc: "Complete bulk, low-input and FFPE configurations, platform specs and recommended depths." },
      { tag: "Technical guide", title: "RNA-Seq sample QC standards", desc: "How Qubit and TapeStation metrics (RIN, DV200) guarantee optimal library prep." },
      { tag: "Blog", title: "RNA sequencing demystified", desc: "A walkthrough of the five-step lab workflow from extraction to publication-ready analysis." },
    ],
    faqs: [
      { q: "How do I order RNA-Seq?", a: "Submit a request through the portal — a specialist helps with account setup, ordering and sample submission through the customer portal." },
      { q: "What is the typical turnaround time?", a: "Standard TAT is 3–4 weeks from sample QC approval; expedited service is available for urgent projects." },
      { q: "What QC is provided?", a: "All RNA is checked on Qubit and TapeStation (RIN/DV200) with formal reporting before sequencing." },
      { q: "Which species are supported?", a: "Full support for human, mouse and rat; total RNA and polyA workflows also serve plants, bacteria and other organisms via specialized depletion or universal kits." },
      { q: "Which library prep kits are used?", a: "Five core kits cover most needs: Illumina Stranded mRNA, Takara SMART-Seq mRNA, Illumina Stranded Total RNA Ribo-Zero Plus, and Takara Total RNA ZAPR with UMIs. Alternative workflows are available on request." },
      { q: "What analysis options are available?", a: "Standard (alignment and gene counts), Advanced (differential expression, pathway enrichment, splicing) and fully custom analysis to publication level." },
      { q: "What are the sample requirements?", a: "Purified RNA: prefer 10 ng (lowest 10 pg) in 15 µL, RIN >5. Cells: >10,000 recommended (as few as 1–1,000 for low-input). Tissue: ~60 mg fresh/frozen. Blood: 3 mL in PAXgene tubes. FFPE: 5–8 slides or curls at 10 µm." },
      { q: "What sequencing depth is recommended?", a: "20–30M reads per sample for standard expression profiling; 50M+ for rare transcript discovery or deep transcriptome work." },
      { q: "Which platform is used?", a: "Illumina NovaSeq X+ at PE150 read length for leading data quality and throughput." },
      { q: "Can low-input RNA be handled?", a: "Yes — high-efficiency conversion kits maximize data from limited starting material." },
      { q: "Which extraction kits are used?", a: "Validated Qiagen RNeasy or Promega Maxwell kits matched to sample type for yield and purity." },
    ],
    ctaTitle: "Start your RNA-Seq project",
    ctaDesc: "Tell us about your samples and goals — a PhD scientist replies within one business day with the right workflow and a tailored quote.",
    ctaPoints: ["Illumina NovaSeq X+ & Takara workflows", "Standard, total, low-input & FFPE RNA-Seq", "Publication-ready analysis available"],
  },
  {
    slug: "single-cell-sequencing",
    eyebrow: "Single cell",
    title: "Single-cell sequencing services",
    tagline:
      "Droplet, microwell, plate-based and long-read capture for gene expression, multiome, immune repertoire and CITE-Seq profiling.",
    subs: [
      { title: "10x Genomics Single-Cell", desc: "High-throughput droplet profiling for >100k starting cells — gene expression, Epi Multiome, FLEX, immune profiling and CITE-Seq chemistries." },
      { title: "BD Rhapsody Single-Cell", desc: "Gentle, gravity-driven microwell partitioning with high capture efficiency and low doublet rates — ideal for fragile, large or low-input samples." },
      { title: "Takara Plate-Based Single-Cell", desc: "Ultra-sensitive full-length expression or TCR via SMART-Seq — best for FACS-sorted, LCM, FNA and rare cell populations." },
      { title: "PacBio Single-Cell", desc: "Kinnex long-read transcriptomics capturing full-length transcripts for isoform discovery, splicing, fusions and SVs at single-cell level." },
    ],
    features: [
      { title: "End-to-end solutions", desc: "Automated dissociation and FACS sorting through multi-stage QC and interactive bioinformatics." },
      { title: "Multi-platform flexibility", desc: "Droplet, microwell, multi-well plate, short-read and long-read formats matched to target counts and coverage." },
      { title: "Automated prep & cleanup", desc: "Miltenyi gentleMACS dissociation and FACS sorting remove dead cells and debris without stressing fragile surfaces." },
      { title: "Broad sample compatibility", desc: "Validated workflows for hard-to-dissociate tissues — brain, liver, kidney and solid tumors." },
      { title: "Expert PhD support", desc: "Scientist oversight from design through library prep — viability thresholds, labeling strategies and pilot goals." },
      { title: "Fast turnaround", desc: "In-house fluidics, partition capture and sequencing keep timelines short." },
    ],
    steps: [
      { title: "Consultation & study design", desc: "Align cell inputs, capture chemistry, multiplexing and read depth to your biology." },
      { title: "Order & submission", desc: "Register samples via the portal; arrange courier pickup or cold-chain shipping." },
      { title: "Sample prep & viability QC", desc: "Automated dissociation or nuclei extraction with count and viability checkpoints before chip loading." },
      { title: "Capture & sequencing", desc: "Cells partitioned into droplets or microwells, barcoded and sequenced at high throughput." },
      { title: "Delivery & bioinformatics", desc: "FASTQ matrices plus publication-grade cluster figures and custom multi-omic integrations." },
    ],
    deliverablesTitle: "Advanced single-cell bioinformatics",
    deliverablesDesc:
      "Cell Ranger, Seurat and companion tools turn complex count matrices into clear, interactive biological landscapes.",
    deliverables: [
      "FASTQ files", "Sequencer QC report", "Alignment files (BAM)", "Cell Ranger QC metrics",
      "Expression heatmaps", "CLOUPE file for Loupe Browser", "Advanced Seurat QC", "TCR/BCR clonal frequency maps",
      "Cell–cell interaction analysis", "Pathway analysis", "V-J circos plots", "Scoring heat maps",
      "Delta distribution", "Clonotype expansion", "Cell-type annotation",
      "UMAP / t-SNE cluster plots", "Subpopulation distribution",
    ],
    applications: [
      { title: "Tumor microenvironment profiling", desc: "Uncover rare immune-evading populations and immune infiltration inside solid tumors." },
      { title: "Immune repertoire mapping", desc: "Trace exact BCR/TCR clonotypes and heavy-light chain pairings across disease or therapy." },
      { title: "Therapeutic target discovery", desc: "Identify the subpopulations driving drug resistance or responding to targeted mechanisms." },
    ],
    resources: [
      { tag: "Guide", title: "Droplet, microwell or plate?", desc: "A decision-tree guide to single-cell platforms by sample type and viability metrics." },
      { tag: "Tech sheet", title: "Single-cell solutions overview", desc: "The full technical menu — viability thresholds, cell-count matrices and shipping requirements." },
      { tag: "Article", title: "Applications, methods & insights", desc: "Core single-cell methodologies and how to choose the right application for translational research." },
    ],
    faqs: [
      { q: "How do I initiate a single-cell project?", a: "Reach out through the portal — a specialist schedules a technical call covering sample logistics and provides a project quote." },
      { q: "Which single-cell services are offered?", a: "10x Genomics Chromium, BD Rhapsody, 96-well Takara SMART-Seq plate workflows and PacBio Kinnex — with library options for gene expression, ATAC, immune profiling and antibody surface markers." },
      { q: "What bioinformatics is provided?", a: "Standard alignment and QC (Cell Ranger), advanced clustering and cell-type annotation (Seurat/Scanpy), or custom multi-omic integration pipelines." },
      { q: "Which cell states are supported?", a: "Fresh/FACS cells, cryopreserved cells, fresh or frozen tissue nuclei, and fixed tissue profiles via the probe-based Chromium Flex protocol." },
      { q: "What are the starting cell requirements?", a: "From 1 to 60,000 cell captures per sample depending on the platform selected." },
      { q: "Can fixed cells or tissue slides be processed?", a: "Yes — send flash-frozen tissue or cryopreserved cells for on-site fixing, or submit fixed cells, nuclei or tissues directly." },
      { q: "What sample formats are supported?", a: "Primary human and animal tissues (brain, tumor, lung, liver, kidney, heart), PBMCs and marrow aspirates, plus challenging formats — flash-frozen tissue for nuclei, low-viability archives and fragile primary cultures." },
    ],
    ctaTitle: "Start your single-cell sequencing project",
    ctaDesc: "Tell us about your samples and goals — a PhD scientist recommends the right workflow and returns a custom quote within one business day.",
    ctaPoints: ["10x Genomics Chromium, BD Rhapsody & Takara workflows", "scRNA-Seq, immune profiling, CITE-Seq, ATAC & multiomics", "Expert sample prep, bioinformatics & publication-ready results"],
  },
  {
    slug: "spatial-transcriptomics",
    eyebrow: "Spatial biology",
    title: "Spatial transcriptomics services",
    tagline:
      "Multi-platform workflows for tissue architecture — from unbiased whole-transcriptome capture to subcellular targeted imaging.",
    subs: [
      { title: "10x Genomics Visium", desc: "NGS-based spatial transcriptomics — unbiased whole-transcriptome mapping with integrated H&E morphology." },
      { title: "10x Genomics Xenium", desc: "Subcellular, high-plex imaging of targeted gene expression and protein panels at high throughput." },
      { title: "Illumina StrataMap", desc: "The newest spatial assay — unbiased whole-transcriptome capture over a massive 750 mm² area with continuous 1 µm surface features." },
    ],
    features: [
      { title: "End-to-end solutions", desc: "Block preparation, TMA building, H&E imaging, spatial mapping, sequencing and reporting in one chain." },
      { title: "Multi-platform profiling", desc: "Whole-transcriptome capture, high-plex targeted imaging and high-density resolution." },
      { title: "Unrivaled sensitivity", desc: "Validated transfer and capture protocols protect low-input, thin cryosections and degraded archives." },
      { title: "Structural preservation", desc: "Precision cryosectioning prevents detachment and delivers crisp, publication-grade morphology." },
      { title: "Expert support", desc: "PhD guidance on DV200 assessment, custom gene panels and platform choice." },
      { title: "Scalable infrastructure", desc: "NovaSeq X+ sequencing alongside advanced spatial analyzers for depth and resolution." },
      { title: "Fast turnaround", desc: "Automated slide handling delivers spatial data in roughly 1–4 weeks." },
    ],
    steps: [
      { title: "Consultation & study design", desc: "Align Visium, Xenium or StrataMap to your sample dimensions, preparation state and objectives." },
      { title: "Order & submission", desc: "Register FFPE blocks, fresh-frozen tissue or pre-cut sections via the portal." },
      { title: "Sample QC & evaluation", desc: "Morphology, RIN or DV200 reporting and slide-placement confirmation before processing." },
      { title: "Spatial processing & imaging", desc: "Precision mounting, probe hybridization or matrix capture and high-resolution histology imaging." },
      { title: "Delivery & bioinformatics", desc: "Analysis-ready files via Space Ranger, Xenium Ranger and DRAGEN Spatial pipelines." },
    ],
    deliverablesTitle: "Comprehensive spatial bioinformatics",
    deliverablesDesc:
      "Space Ranger, Xenium Ranger, Seurat and Squidpy transform count matrices and image alignments into clear biological landscapes.",
    deliverables: [
      "Transcript overlays on H&E scans", "Cell segmentation", "UMAP of segmented cells",
      "Graph-based cluster tissue plots", "Spatial expression maps", "Neighborhood analysis",
      "Cell size distribution", "UMI-to-image alignment", "8 µm bin cluster plots",
      "8 µm bin UMAP projections",
    ],
    applications: [
      { title: "Neurobiology & brain mapping", desc: "Resolve cellular layers across CNS tissues and track regional expression across brain structures." },
      { title: "Biomarker validation & translational screens", desc: "Validate target expression and study structural change across clinical cohorts pre- and post-treatment." },
      { title: "Drug mechanism of action", desc: "See how compounds shift cellular pathways while preserving physiological morphology." },
      { title: "Tumor microenvironment architecture", desc: "Map immune cells, stromal barriers and tumor margins to expose local immune evasion." },
    ],
    resources: [
      { tag: "Tech sheet", title: "Spatial service overview", desc: "How high-resolution expression is mapped in tissue sections with morphology preserved." },
      { tag: "Guide", title: "Visium vs Xenium vs StrataMap", desc: "Balance whole-transcriptome discovery against subcellular targeted resolution for your budget and samples." },
      { tag: "White paper", title: "Maximize spatial discoveries", desc: "Key applications in developmental biology, neuroscience, cancer and regenerative medicine." },
    ],
    faqs: [
      { q: "How do I initiate a spatial project?", a: "Reach out through the portal — a specialist schedules a technical call covering tissue blocks, slide compatibility and a project quote." },
      { q: "Visium vs Xenium vs StrataMap — what's the difference?", a: "Visium and StrataMap are unbiased whole-transcriptome platforms — Visium is spot-based, while StrataMap covers 750 mm² with continuous 1 µm features for single-cell-binned mapping. Xenium delivers targeted single-molecule panels at subcellular resolution." },
      { q: "What sample types are compatible?", a: "Primarily FFPE blocks and fresh-frozen tissue; exact compatibility is confirmed per platform during consultation." },
      { q: "What bioinformatics is provided?", a: "Automated image alignment, transcript mapping, spatial clustering (Space Ranger / Xenium Ranger), tissue-zone partitioning, cell segmentation and interactive visualization." },
      { q: "Which tissue formats are supported?", a: "Fresh-frozen blocks embedded in OCT and standard clinical FFPE blocks." },
      { q: "Are tissue-quality metrics required?", a: "Yes — RIN >7 for fresh-frozen; DV200 >30% for FFPE (ideally >50% for best performance)." },
      { q: "What is the typical turnaround?", a: "Typically 4–6 weeks from sample receipt to delivery, depending on scale, quality and depth." },
      { q: "Do I need pre-cut slides?", a: "No — an in-house histology core handles precision sectioning, slide placement, quality testing and staining." },
    ],
    ctaTitle: "Ready to accelerate your spatial biology research?",
    ctaDesc: "Contact the team for a technical consultation — sample requirements, technology options, slide architectures and library prep aligned to your goals.",
    ctaPoints: ["10x Genomics certified workflows", "In-house sectioning, H&E and TMA construction", "Visium, Xenium & Illumina StrataMap", "Publication-ready spatial figures"],
  },
  {
    slug: "immune-profiling",
    eyebrow: "Immune profiling",
    title: "TCR/BCR sequencing & immune profiling",
    tagline:
      "Bulk and single-cell repertoire analysis — full-length, CDR3 and paired-chain VDJ profiling across all sample types.",
    subs: [
      { title: "Full-Length TCR & BCR", desc: "Unbiased Takara SMARTer 5′ RACE capture of complete receptor sequences — for high-quality RNA, PBMCs, whole blood and fresh-frozen tissue." },
      { title: "CDR3 TCR & BCR", desc: "High-throughput clonotype analysis with Cellecta DriverMap — 11-chain captures covering the full repertoire." },
      { title: "FFPE TCR & BCR", desc: "Repertoire analysis from archived or degraded specimens via specialized Cellecta chemistries (DV200 >20%, RNA or DNA)." },
      { title: "Single-Cell VDJ", desc: "10x Genomics 5′ + VDJ — expression plus paired TCR/BCR chains for lineage tracing and phenotype tracking." },
    ],
    features: [
      { title: "End-to-end support", desc: "Sample prep and QC through design-aligned library prep, sequencing and full analysis." },
      { title: "Multi-capture chemistries", desc: "Takara SMARTer 5′ RACE, Cellecta DriverMap and 10x Chromium 5′ v2 matched to your goals." },
      { title: "Broad species coverage", desc: "Validated primers for human, mouse, rat and NHP — TCR αβ/γδ and BCR heavy/light chains." },
      { title: "Extreme input sensitivity", desc: "Works from >100 sorted T cells, fine-needle aspirates and degraded FFPE (DV200 >20%)." },
      { title: "Precise clonal tracking", desc: "Follow expansion, persistence and contraction across multi-timepoint studies and treatment regimens." },
      { title: "Advanced bioinformatics", desc: "Clonotype quantification, nucleotide and amino-acid sequences and V(D)J usage with publication-ready figures." },
    ],
    steps: [
      { title: "Consultation & design", desc: "Align chemistry to your species, material quality and objectives." },
      { title: "Order & submission", desc: "Register samples online; arrange pickup or direct shipment." },
      { title: "Sample QC & extraction", desc: "RNA/DNA extraction with formal Qubit or TapeStation metrics for sign-off." },
      { title: "Library QC & sequencing", desc: "Molecularly indexed libraries pooled for high-fidelity output on NovaSeq X+." },
      { title: "Delivery & bioinformatics", desc: "FASTQ plus QC via secure transfer, with turnkey clonotype and diversity analysis." },
    ],
    deliverablesTitle: "Comprehensive repertoire bioinformatics",
    deliverablesDesc:
      "Tailored pipelines cover bulk clonotype tracking through single-cell immunophenotyping and paired-chain analysis.",
    deliverables: [
      "FASTQ files", "Data QC report", "Alignment files", "Clonotype frequency",
      "Nucleotide & amino-acid sequences", "V & J gene usage", "Phylogenetic analysis",
      "Dendrograms", "Spectratype plots", "Shannon diversity", "Circos plots",
      "Top clonal proportion", "Rare clonal proportion",
    ],
    applications: [
      { title: "Vaccine development & antibody discovery", desc: "Map somatic hypermutation, class-switch recombination and isotype distribution after antigen challenge." },
      { title: "Autoimmune & infectious disease", desc: "Monitor abnormal clonal dominance, activation profiles and response pathways across disease states." },
      { title: "Cell therapy tracking (CAR-T / TCR-T)", desc: "Follow engraftment, persistence and systemic expansion of engineered therapies in clinical models." },
      { title: "Biomarker & target discovery", desc: "Compare repertoires between cohorts to isolate disease-specific or therapy-responsive clones." },
      { title: "Immuno-oncology & TIL characterization", desc: "Evaluate tumor-infiltrating lymphocyte expansion and microenvironment engagement." },
    ],
    resources: [
      { tag: "Tech sheet", title: "Bulk & single-cell TCR services", desc: "High-throughput workflows mapping adaptive repertoires and pairing α/β chains." },
      { tag: "Tech sheet", title: "Bulk & single-cell BCR services", desc: "Repertoire mapping with heavy/light chain pairing and phenotype tracking." },
      { tag: "Technical guide", title: "TCR-Seq QC standards", desc: "How Qubit and TapeStation metrics (RIN, DV200) guarantee optimal library prep." },
    ],
    faqs: [
      { q: "How do I choose the right service?", a: "Bulk (Takara/Cellecta) suits cost-effective deep clone tracking; single-cell (10x) links paired chains to individual phenotypes; spatial maps immune architecture inside tissue." },
      { q: "Which species are supported?", a: "Human, mouse, rat and NHP. Takara covers all four; 10x Genomics covers human, mouse and rat; Cellecta is primarily human and mouse." },
      { q: "Which bulk kit should I pick?", a: "Takara SMARTer for full-length V(D)J variable regions; Cellecta full-length for complete variable coverage; Cellecta CDR3 for absolute digital clonotype quantification and rare subsets." },
      { q: "What are the input requirements?", a: "Purified RNA: 20–1,000 ng (RIN >6 preferred) in 15 µL. Bulk cells: 50k recommended, 100 minimum. Single-cell: 1–1,000,000 cells at >85% viability. FFPE: 5–8 slides/curls at 10 µm, DV200 >20%." },
      { q: "What is the turnaround?", a: "Standard 3–4 weeks from QC approval; bulk workflows can be expedited to 10–12 business days." },
      { q: "Which platforms are used?", a: "Illumina NovaSeq X Plus and MiSeq i100, run in-house." },
      { q: "What QC do you provide?", a: "Rigorous Qubit and TapeStation validation on all inputs, with formal reports signed off before library construction." },
    ],
    ctaTitle: "Start your immune profiling project",
    ctaDesc: "Tell us about your samples and goals — a PhD scientist recommends the ideal TCR or BCR workflow and returns a tailored quote within one business day.",
    ctaPoints: ["Bulk & single-cell TCR/BCR repertoire sequencing", "End-to-end workflow with bioinformatics support", "Human, mouse, rat & NHP coverage"],
  },
  {
    slug: "premade-library-sequencing",
    eyebrow: "Sequencing only",
    title: "Premade library sequencing",
    tagline:
      "Ship your finished libraries — we QC, pool and run them across Illumina and PacBio platforms with fast, predictable turnaround.",
    subs: [
      { title: "NovaSeq 6000 SP", desc: "500-cycle runs delivering ~750M paired or single reads (less PhiX)." },
      { title: "NovaSeq X+ 1.5B", desc: "100, 200 or 300-cycle flowcells delivering 1.5B paired or single reads." },
      { title: "NovaSeq X+ 10B", desc: "Full 10B flowcell or 1B paired-read lane options." },
      { title: "NovaSeq X+ 25B", desc: "Full 25B flowcell or 3B paired-read lane options for maximum depth." },
      { title: "MiSeq i100 series", desc: "5M (600-cycle), 25M (1000-cycle), 50M and 100M flowcell choices." },
      { title: "MiSeq v2/v3", desc: "Nano v2 (1M), Micro v2 (4M), v2 (36-cycle/12M) and v3 (150-cycle/20M) options." },
      { title: "PacBio Revio SMRT cells", desc: "0.5–5 kb libraries yield 6–8M HiFi reads; 5–10 kb yield 35–70 Gb; 10–15 kb yield 70–100 Gb; 15–20 kb yield 100–120 Gb — any library type." },
    ],
    features: [
      { title: "Expert support", desc: "Qubit and TapeStation QC, adapter-dimer and pooling troubleshooting, plus scientist-to-scientist guidance." },
      { title: "Proven data quality", desc: "Thousands of libraries sequenced, with results in high-impact journals." },
      { title: "Efficient online experience", desc: "Submit manifests and register samples 24/7 through the portal." },
      { title: "Flexible output & read lengths", desc: "PacBio long-read or Illumina short-read with customizable read-length options." },
      { title: "Cost-effective & rapid", desc: "Standard and express options for every budget — down to same-day loading." },
      { title: "Any library type", desc: "WGS, amplicon, single-cell, spatial, Kinnex RNA, Iso-Seq, bisulfite and TCR/BCR libraries." },
    ],
    steps: [
      { title: "Request a quote & order", desc: "Align service, read length and turnaround needs; your order is generated in the customer portal." },
      { title: "Upload & ship", desc: "Register samples against your order anytime; ship for weekday arrival or schedule pickup." },
      { title: "QC, sequencing & delivery", desc: "Libraries QC'd and run shortly after arrival; files delivered via secure FTP or cloud storage." },
    ],
    deliverablesTitle: "Run deliverables",
    deliverablesDesc:
      "A fast, flexible and cost-effective route for researchers who already have sequencing-ready libraries.",
    deliverables: [
      "Demultiplexed FASTQ files", "PacBio run folder", "Run QC metrics", "Index balance report",
      "BAM & analysis outputs (optional)", "Final report with publication-ready figures", "Secure SFTP, AWS or Globus delivery",
    ],
    faqs: [
      { q: "What library types can I submit?", a: "Any Illumina- or PacBio-compatible library — RNA-Seq, single-cell, spatial, WGS, WES, amplicon, bisulfite, TCR/BCR and more." },
      { q: "Do you offer pooling support?", a: "Yes — send individual libraries for QC, pooling and loading, or submit a pre-pooled library." },
      { q: "Can libraries with adapter dimers be sequenced?", a: "Yes — cleanup options to remove dimers are discussed before sequencing." },
      { q: "Is QC provided for premade libraries?", a: "Every tube is checked on Qubit and TapeStation; index and pooling compatibility is reviewed in software, and any concerns are discussed with you directly." },
      { q: "How quickly are results delivered?", a: "Express same-day loading is available; dedicated flowcells typically deliver in 3–5 days and shared lanes within 1–2 weeks." },
      { q: "Which file formats do I receive?", a: "FASTQ files (Illumina and HiFi) plus the PacBio run folder by default; bioinformatics adds BAM, supplementary outputs and a figure-rich report." },
      { q: "Can sequencing parameters be customized?", a: "Yes — read lengths, lane configurations, flowcell types, custom PhiX loading and custom primers." },
    ],
    ctaTitle: "Have libraries ready?",
    ctaDesc: "Send them in for reliable sequencing and rapid turnaround — standard and express options available.",
    ctaPoints: ["Illumina & PacBio flowcell and lane options", "Express same-day loading available", "QC, pooling & index troubleshooting included"],
  },
  {
    slug: "long-read",
    eyebrow: "Long read",
    title: "PacBio long-read sequencing services",
    tagline:
      "HiFi circular consensus sequencing for contiguous assemblies, complete variant catalogs, full-length isoforms and native methylation — human, plant and animal research.",
    stats: [
      { value: "10–25 kb", label: "HiFi read lengths" },
      { value: "~99.9%", label: "Q30 consensus accuracy" },
      { value: "35–120 Gb", label: "yield per SMRT cell" },
      { value: "500 ng–10 µg", label: "HMW DNA input" },
    ],
    subs: [
      { title: "De Novo Assembly & Annotation", desc: "Contiguous, accurate genome builds with comprehensive gene and isoform annotation — ideal for complex or polyploid species." },
      { title: "Comprehensive Variant Detection", desc: "High-confidence SNV, Indel and SV calls with haplotype phasing — including large and complex variants short reads miss." },
      { title: "Full-Length RNA (Iso-Seq)", desc: "Complete transcript coverage in bulk and single-cell for isoform resolution, fusion detection and non-coding RNA characterization." },
      { title: "Native Methylation Profiling", desc: "Epigenetic patterns read directly from the DNA — no additional chemical treatment required." },
    ],
    features: [
      { title: "All variant types", desc: "SNVs, Indels and large structural variants resolved in a single assay." },
      { title: "Difficult regions", desc: "Repetitive, polyploid and GC-rich loci sequenced accurately." },
      { title: "Isoform diversity", desc: "Full-length transcripts reveal novel isoforms and fusions." },
      { title: "Epigenetics included", desc: "Methylation patterns profiled natively alongside sequence." },
      { title: "Expert processing", desc: "Scientist-to-scientist design consultation and stringent QC at every step." },
      { title: "End-to-end analysis", desc: "From raw data to publication-ready results with dedicated bioinformatics." },
    ],
    steps: [
      { title: "Consultation", desc: "Design the right HiFi workflow for your genome size, ploidy and goals." },
      { title: "HMW extraction", desc: "High-molecular-weight DNA prepared for long-fragment libraries." },
      { title: "Library prep & QC", desc: "Sized, quantified libraries verified before SMRT cell loading." },
      { title: "Revio sequencing", desc: "HiFi reads generated at 35–120+ Gb per SMRT cell depending on insert size." },
      { title: "Delivery & analysis", desc: "Assemblies, variant calls or isoform reports delivered via secure transfer." },
    ],
    deliverablesTitle: "Long-read bioinformatics",
    deliverablesDesc:
      "End-to-end support moves your project seamlessly from raw HiFi data to actionable insight.",
    deliverables: [
      "HiFi FASTQ/BAM", "Assembly metrics", "Phased variant calls (VCF)", "Structural variant reports",
      "Isoform annotations", "Methylation tracks", "Publication-ready figures",
    ],
    applications: [
      { title: "Genome assembly", desc: "Contiguous reference builds for complex or polyploid genomes." },
      { title: "Structural variant detection", desc: "Large SVs and complex rearrangements with haplotype phasing." },
      { title: "Isoform discovery", desc: "Novel transcripts, fusions and non-coding RNAs in human, plant and animal." },
      { title: "Methylation profiling", desc: "Native epigenetic signal captured without chemical conversion." },
    ],
    faqs: [
      { q: "What is PacBio HiFi sequencing?", a: "A long-read technology producing highly accurate reads via circular consensus sequencing (CCS) — enabling detailed genome and transcriptome analysis." },
      { q: "What applications benefit most?", a: "Genome assembly, structural variant detection, isoform discovery, methylation profiling and targeted sequencing across human, plant and animal research." },
      { q: "How much input DNA is needed?", a: "Typically 500 ng–10 µg of high-molecular-weight DNA, depending on the application." },
      { q: "Is bioinformatics support included?", a: "Yes — every project includes consultation plus optional complete analysis, from raw data to publication-ready results." },
    ],
    ctaTitle: "Start your genomic discovery",
    ctaDesc: "Accurate long-read sequencing for human, plant and animal genomes.",
    ctaPoints: ["PacBio Revio HiFi accuracy", "Human, plant & animal genomes", "Optional full bioinformatics analysis"],
  },
  {
    slug: "genomics",
    eyebrow: "Genomics",
    title: "Genomics sequencing services — WGS, WES & panels",
    tagline:
      "Short- and long-read DNA sequencing for germline cohorts, population studies, tumors and complex somatic variant discovery.",
    subs: [
      { title: "Whole Genome Sequencing", desc: "Complete, unbiased coding and non-coding profiling on the newest Illumina and Twist chemistries — germline, population cohorts, tumors and complex somatic variants." },
      { title: "Whole Exome Sequencing", desc: "Deep, cost-effective exome coverage with precision target enrichment for rare variants, disease-linked mutations and neoantigens." },
      { title: "PacBio Long-Read Genomics", desc: "Resolve structural variants, repetitive regions, pseudogenes and long-range haplotype phasing with HiFi sequencing." },
      { title: "Oncology Targeted Panels", desc: "High-depth profiling of actionable cancer genes — ultra-low-frequency mutations, TMB and MSI." },
    ],
    features: [
      { title: "End-to-end solutions", desc: "Extraction, library prep, sequencing and bioinformatics managed in one laboratory." },
      { title: "Low-input sensitivity", desc: "Validated protocols for picogram-level material, archived tissue and FFPE." },
      { title: "Multi-platform options", desc: "Illumina short-read, PacBio long-read and advanced enrichment matched to your study." },
      { title: "Expert support", desc: "PhD guidance on cohort power, platform choice, QC and variant interpretation." },
      { title: "Fast turnaround", desc: "Automated liquid handling keeps large cohorts moving." },
      { title: "Transparent reporting", desc: "Formal QC documentation at every checkpoint before sequencing." },
    ],
    steps: [
      { title: "Consultation & design", desc: "Align WGS, WES, long-read or panel workflows with coverage and objectives." },
      { title: "Order & submission", desc: "Register samples online and ship when ready." },
      { title: "Sample QC", desc: "Qubit, TapeStation or Fragment Analyzer reports shared for sign-off." },
      { title: "Library QC & sequencing", desc: "Balanced libraries run on Illumina and PacBio platforms." },
      { title: "Delivery & bioinformatics", desc: "FASTQ/VCF and QC reports via secure transfer, with interpretation available." },
    ],
    deliverablesTitle: "Comprehensive genomic bioinformatics",
    deliverablesDesc:
      "Pipelines range from germline variant calling to complex somatic tumor annotation and structural variant filtering.",
    deliverables: [
      "FASTQ files", "QC report", "Alignment files (BAM)", "Germline & somatic VCF",
      "Variant annotation", "Copy-number profiles", "CNV & structural events",
      "Structural variant calls", "Publication-ready figures",
    ],
    applications: [
      { title: "Oncology & immunotherapy biomarkers", desc: "Track subclonal heterogeneity, mutational burden and personalized neoantigen exploration." },
      { title: "Rare & Mendelian disease", desc: "Pinpoint causative coding and splicing variants via targeted exome enrichment." },
      { title: "Therapeutic mechanism & pharmacogenomics", desc: "Find variants that alter drug metabolism, toxicity and patient-specific response." },
      { title: "Somatic & germline variant mapping", desc: "Identify SNVs and small indels underlying hereditary patterns or disease drivers." },
      { title: "Structural variation & phasing", desc: "Resolve inversions, duplications, translocations and haplotype context with PacBio long reads." },
    ],
    resources: [
      { tag: "Tech sheet", title: "WGS & WES service overview", desc: "End-to-end workflows tuned for standard inputs, population scale and challenging FFPE." },
      { tag: "Tech sheet", title: "HiFi long-read workflows", desc: "Mapping large structural variants, resolving dark regions and phasing haplotypes." },
      { tag: "Tech sheet", title: "Oncology panel overview", desc: "Tracking low-frequency mutations, TMB and MSI across solid tumors and liquid biopsy." },
    ],
    faqs: [
      { q: "WGS, WES or a targeted panel — how do I choose?", a: "WGS gives a complete, unbiased view of coding and non-coding regions. WES focuses on protein-coding regions for cost-effective functional screening. Targeted panels deliver extreme depth on selected oncogenes and biomarkers — ideal for tracking rare somatic subclones." },
      { q: "What sample types are compatible?", a: "Whole blood, fresh-frozen tissue, cultured mammalian and microbial cells, saliva and degraded clinical FFPE blocks." },
      { q: "What is the typical turnaround?", a: "Standard 3–4 weeks from sample QC approval; select WGS and enriched workflows expedite to 10–12 business days." },
      { q: "What are the DNA requirements?", a: "WGS/WES prefer >10–50 ng purified DNA (low-input down to picogram scale). PacBio needs high-molecular-weight DNA, DIN >7 preferred. FFPE and panels are evaluated on fragment size with repair steps applied as needed." },
      { q: "Which platforms are used?", a: "Illumina NovaSeq X Plus (PE150) for short reads and PacBio Revio for high-fidelity long reads." },
      { q: "What QC is provided?", a: "Qubit fluorometric quantification plus TapeStation or Fragment Analyzer sizing, with formal reports before every run." },
    ],
    ctaTitle: "Start your genomics project",
    ctaDesc: "Tell us about your samples and goals — a PhD scientist replies within one business day with the right workflow and a tailored quote.",
    ctaPoints: ["Illumina NovaSeq X Plus & PacBio Revio", "WGS, WES, long-read & targeted panels", "Publication-ready analysis available"],
  },
  {
    slug: "oncology-panels",
    eyebrow: "Oncology",
    title: "Oncology panel sequencing",
    tagline:
      "High-depth targeted profiling of actionable cancer genes — anchored by the 523-gene TruSight Oncology 500 assay with MSI and TMB.",
    stats: [
      { value: "523", label: "cancer-relevant genes (TSO 500)" },
      { value: "5–7 days", label: "typical TSO 500 turnaround" },
      { value: "50 ng", label: "DNA/RNA input (20–30 ng ctDNA)" },
      { value: "6+", label: "variant classes detected" },
    ],
    subs: [
      { title: "TruSight Oncology 500 (TSO 500)", desc: "Pan-cancer profiling across 523 genes — SNVs, InDels, CNVs, multinucleotide variants, fusions and splice variants, plus MSI and TMB, from DNA, RNA, ctDNA or FFPE." },
      { title: "Hotspot Panels", desc: "Focused 20–50 gene panels for rapid, deep interrogation of actionable loci." },
      { title: "ctDNA Liquid Biopsy", desc: "Non-invasive cancer monitoring and MRD tracking from circulating free DNA." },
      { title: "Complementary Assays", desc: "Pair panels with WGS/WES, RNA-Seq, single-cell, spatial or epigenetic profiling for broader context." },
    ],
    features: [
      { title: "Solid tumor profiling", desc: "Lung, melanoma, ovarian, breast, gastric, bladder, sarcoma and more — mutations and therapy-resistance pathways." },
      { title: "Hematologic analysis", desc: "Clonal architecture, MRD monitoring, lineage reconstruction and marrow immune shifts in blood cancers." },
      { title: "Immuno-oncology", desc: "Immune repertoires, checkpoint expression and functional states in tissue and circulation." },
      { title: "Degraded-sample ready", desc: "Pipelines optimized for FFPE and low-yield clinical material." },
    ],
    steps: [
      { title: "Study consultation", desc: "Assess sample compatibility and select the optimal assays for your goals." },
      { title: "Sample submission", desc: "Ship fresh/frozen tissue, FFPE or liquid biopsy." },
      { title: "QC & library prep", desc: "Documented QC and enrichment-based library construction." },
      { title: "Deep sequencing", desc: "High-depth runs sized to detect ultra-low-frequency variants." },
      { title: "Annotated reporting", desc: "COSMIC- and ClinVar-annotated variants with publication-ready outputs." },
    ],
    deliverablesTitle: "End-to-end oncology bioinformatics",
    deliverablesDesc:
      "Every oncology project includes expert analysis — variant annotation, expression, immune metrics and multiomic integration.",
    deliverables: [
      "COSMIC & ClinVar annotation", "Bulk, single-cell & spatial expression analysis",
      "Immune repertoire metrics", "Multiomic integration (RNA, ATAC, protein)", "Interactive reports & figures",
    ],
    applications: [
      { title: "Solid tumor profiling", desc: "Detect mutations and pathway disruptions linked to therapy resistance; subtype tumors with expression and spatial context." },
      { title: "Hematologic cancer analysis", desc: "Track clonal architecture in leukemias and lymphomas; monitor MRD via serial sampling." },
      { title: "Immune profiling in oncology", desc: "Map immune repertoires, checkpoint expression and functional states in tumor and circulation." },
    ],
    faqs: [
      { q: "Which sample types are accepted?", a: "Fresh or frozen tumor tissue, FFPE blocks/slides and circulating free DNA — pipelines handle both high-quality and degraded, low-yield material." },
      { q: "How large are the panels?", a: "From focused 20–50 gene hotspot panels to broad 300–600+ gene pan-cancer panels, customizable to disease context." },
      { q: "What alterations are detected?", a: "SNVs, insertions/deletions, copy-number variations, gene fusions and select structural rearrangements across targeted regions." },
      { q: "How much DNA is required?", a: "Typically ~50–200 ng, with low-input FFPE accommodations; ctDNA assays need 20–30 ng." },
      { q: "What is the turnaround?", a: "TSO 500 runs 5–7 days sample-to-report; most panel projects deliver in 2–4 weeks with expedited options." },
      { q: "What data outputs do I receive?", a: "Raw FASTQ/BAM files, annotated VCF, comprehensive coverage metrics, variant pathogenicity reports and interactive visualizations." },
      { q: "Are panels customizable?", a: "Yes — choose pre-defined panels or a custom design covering your genes of interest, including new or emerging biomarkers." },
      { q: "What bioinformatics is performed?", a: "End-to-end: alignment, variant calling, annotation, copy-number and structural alteration analysis, plus expert-reviewed interpretation." },
    ],
    ctaTitle: "Get expert guidance for your oncology research",
    ctaDesc: "The team helps assess sample compatibility, select optimal assays and plan sequencing timelines.",
    ctaPoints: ["TSO 500 pan-cancer profiling", "Solid tumor, hematologic & liquid biopsy", "COSMIC/ClinVar-annotated reporting"],
  },
  {
    slug: "proteomics",
    eyebrow: "Proteomics",
    title: "Proteomics services — Olink Reveal",
    tagline:
      "Next-generation proteomics made simple, scalable and accessible — measure 1,000+ proteins from just 4 µL of plasma or serum.",
    stats: [
      { value: ">1,000", label: "proteins covering the proteome" },
      { value: "4 µL", label: "sample — plasma, serum & more" },
      { value: "2.5 hrs", label: "hands-on prep, 86–344 samples" },
      { value: "~4 weeks", label: "sample receipt to data delivery" },
    ],
    subs: [
      { title: "Olink Reveal", desc: "NGS-based proteomics covering inflammation, cytokine and chemokine signaling, immune cell migration, transport and homeostasis — integrated into standard NGS workflows." },
      { title: "Olink Explore", desc: "Expanded-plex proteomics for deeper proteome coverage on larger cohorts." },
      { title: "Proteogenomic Integration", desc: "Combine proteomics with genomic and transcriptomic data inside a single project for biomarker and mechanism discovery." },
    ],
    features: [
      { title: "End-to-end support", desc: "Guidance through platform selection, sample prep, sequencing and interpretation." },
      { title: "Built for multiomics", desc: "Proteomics, genomics and transcriptomics unified in one study." },
      { title: "Optimized for speed", desc: "Typical timelines around four weeks from receipt to delivery." },
      { title: "Minimal input, maximum output", desc: "Hundreds to thousands of proteins per sample from only 4 µL." },
      { title: "Population-scale ready", desc: "The chemistry behind the UK Biobank project that analyzed 600,000+ samples." },
      { title: "Certified provider network", desc: "Certified Olink workflows combined with expert bioinformatics." },
    ],
    steps: [
      { title: "Collect & ship", desc: "Send plasma, serum or CSF — samples are prepared and diluted on receipt." },
      { title: "Library preparation", desc: "Incubation, PCR, pooling, purification and QC in ~2.5 hours of hands-on time." },
      { title: "NGS sequencing", desc: "Libraries sequenced on Illumina NovaSeq for deep proteomic coverage." },
      { title: "Olink Insight analysis", desc: "Raw data plus interpreted results delivered through Olink Insight." },
      { title: "Deeper interpretation", desc: "Optional collaboration with the bioinformatics team for advanced insight." },
    ],
    deliverablesTitle: "What you can discover",
    deliverablesDesc:
      "Curated protein panels enriched for biological relevance and high cis-pQTL content.",
    deliverables: [
      "Inflammation & immune profiling — 537 proteins, 96% of Reactome immune pathways",
      "Disease stratification — cancer, cardiovascular and neuroinflammation biomarkers",
      "Population-scale studies — validated at 600K+ sample scale",
      "Proteogenomics — biomarker and mechanistic discovery",
    ],
    ctaTitle: "Start your proteomics study with Olink Reveal",
    ctaDesc: "Just starting out or scaling up — the team supports study design, validated NGS workflows and interpretation.",
    ctaPoints: ["1,000+ proteins from 4 µL", "~4 week turnaround", "Multiomics-ready data"],
  },
  {
    slug: "epigenomics",
    eyebrow: "Epigenomics",
    title: "Epigenomic sequencing services",
    tagline:
      "Chromatin accessibility, 3D genome architecture, methylomes and transcription-factor footprints — at bulk or single-cell resolution.",
    subs: [
      { title: "Bulk ATAC-Seq", desc: "High-quality chromatin accessibility mapping and nucleosome positioning for inputs ≥100k cells." },
      { title: "Single-Cell ATAC-Seq", desc: "Cell-level chromatin profiling resolving epigenetic heterogeneity with 10x Genomics." },
      { title: "Single-Cell Multiome (ATAC + GEX)", desc: "Simultaneous open-chromatin and expression profiling on 10x Genomics or BD Rhapsody." },
      { title: "Hi-C Chromatin", desc: "High-resolution 3D genome architecture, looping and long-range chromosomal interactions." },
      { title: "Methylome Profiling", desc: "Genome-wide DNA methylation via Illumina 5-Base, Em-Seq, WGBS or PacBio long-read." },
      { title: "CUT&RUN", desc: "Ultra-low-background, antibody-targeted TF and histone-mark mapping from Epicypher." },
      { title: "ChIP-Seq", desc: "Send IP'd pull-down DNA — library prep completed on the NEB Ultra II workflow." },
    ],
    features: [
      { title: "End-to-end solutions", desc: "Nuclei isolation, library prep, deep sequencing and peak-calling under one roof." },
      { title: "Flexible profiling", desc: "Open chromatin, TF footprints, 3D architecture and base-resolution methylomes — bulk, single-cell or targeted." },
      { title: "High signal-to-noise", desc: "Validated enzymatic chemistries minimize background and mitochondrial contamination." },
      { title: "Stringent QC", desc: "Fluorometric quantification and fragment sizing flag compromised DNA before sequencing." },
      { title: "Unified chain of custody", desc: "All preparation, instrument cycles and pipelines run in-house." },
      { title: "Advanced data delivery", desc: "Pre-aligned matrices, publication-ready browser tracks and multiomic interactome analyses." },
    ],
    steps: [
      { title: "Scope & design", desc: "Starting material and analysis goals aligned to a compatible service." },
      { title: "Cold-chain delivery", desc: "Ship snap-frozen cells, tissue or isolated DNA on dry ice (purified gDNA at 4 °C)." },
      { title: "Nuclei isolation & pre-QC", desc: "Nuclei isolation or DNA extraction with documented QC." },
      { title: "Library prep & sequencing", desc: "Tagmentation or antibody cleavage, dual-index libraries, deep Illumina sequencing." },
      { title: "Delivery & bioinformatics", desc: "Pre-aligned peak files, footprinting profiles and methylation matrices ready to publish." },
    ],
    deliverablesTitle: "Epigenomic bioinformatics",
    deliverablesDesc:
      "From raw reads to regulatory insight — QC, alignment, peak and methylation calling, differential analysis and motif discovery.",
    deliverables: [
      "FASTQ files", "Sequencer QC report", "BED files & peak calls", "Consensus peak calling",
      "Hierarchical clustering", "PCA", "Heatmap correlation", "Metagene profiles",
      "Methylation tracks", "Peak intensity plots", "Publication-ready figures",
    ],
    applications: [
      { title: "Developmental biology", desc: "Visualize gene-regulation waves and cell-fate choices driven by dynamic enhancer activation." },
      { title: "Regenerative medicine", desc: "Characterize pluripotency landscapes for reprogramming, scaffolds and cell-based therapeutics." },
      { title: "Inflammatory disease", desc: "Identify pathogenic regulatory niches separating active and quiescent zones in fibrotic disease." },
      { title: "Oncology", desc: "Link aberrant chromatin remodeling to tumor heterogeneity, resistance and novel biomarkers." },
      { title: "Neuroscience", desc: "Map transcriptional priming and chromatin states within brain subregions for plasticity and degeneration research." },
      { title: "Immunology", desc: "Profile accessibility and histone shifts during T-cell exhaustion, differentiation and acute inflammation." },
    ],
    resources: [
      { tag: "Tech sheet", title: "Epigenomic sequencing services", desc: "Complete bulk and single-cell configurations, platform specs and recommended depths." },
      { tag: "Flyer", title: "Epigenetic analysis", desc: "End-to-end pipelines from raw data to QC, FASTQ/BAM/VCF, variant annotation and flexible packages." },
      { tag: "Blog", title: "Sequencing demystified", desc: "The five-step lab workflow from extraction to publication-ready analysis." },
    ],
    faqs: [
      { q: "What is epigenomic sequencing?", a: "Analysis of chromatin states, histone modifications and DNA methylation — how genes are switched on or off without changing the DNA sequence." },
      { q: "Which epigenomic services are offered?", a: "Chromatin & binding: ATAC-Seq (bulk and single-cell), CUT&RUN, ChIP-Seq and Hi-C. Methylation: methylome profiling, WGBS and long-read methylation." },
      { q: "How much input does each assay need?", a: "Bulk ATAC ≥100k cells or 20–50 mg tissue; scATAC 500k–1M cells at >85% viability; CUT&RUN ~250k cells per antibody; ChIP ≥1 ng IP'd DNA; methylome/WGBS/long-read 100–1,000 ng DNA." },
      { q: "What sequencing depth is required?", a: "30–50M paired-end reads for open chromatin; 10–20M for CUT&RUN TF footprints; 40–50M for histone marks and ChIP-Seq; ~30–50× coverage for WGBS." },
      { q: "Can epigenomics combine with other omics?", a: "Yes — chromatin data integrates with RNA-Seq, single-cell, spatial and proteomics for cross-assay correlation." },
      { q: "What bioinformatics is included?", a: "QC, alignment, peak and methylation calling, differential peaks, motif discovery, cross-assay integration and publication-ready figures." },
      { q: "What is the expected timeline?", a: "Standard bulk assays run ~4–6 weeks; complex single-cell or multiomic projects may take longer. Ship snap-frozen material on dry ice; purified gDNA at 4 °C." },
      { q: "How do I get started?", a: "Submit the form or contact the team — we assist with study design, assay selection and logistics." },
    ],
    ctaTitle: "Uncover the regulatory mechanisms driving your biology",
    ctaDesc: "Contact the team for a technical consultation — the right assay, sample requirements and a sequencing strategy tailored to your goals.",
    ctaPoints: ["DNA methylation, ATAC-Seq, ChIP-Seq, CUT&Tag & CUT&RUN", "Expert library prep, sequencing & bioinformatics", "Publication-ready data & analysis support"],
  },
];

export const SERVICE_SLUGS = SERVICE_PAGES.map((s) => s.slug);

export function getServicePage(slug: string) {
  return SERVICE_PAGES.find((s) => s.slug === slug);
}
