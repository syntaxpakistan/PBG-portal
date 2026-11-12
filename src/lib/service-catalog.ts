// PBG Service Catalogue taxonomy — shared by the lab "Add a service" form
// (client cascade) and the saveService server action (validation + naming).

export type DepField = {
  key: string;
  label: string;
  type: "select" | "text";
  options?: string[];
  placeholder?: string;
  /** only render when another field equals a value */
  showIf?: { key: string; value: string };
};

export type CatalogService = {
  name: string;
  /** optgroup label shown in the service dropdown (Bioinformatics analysis groups) */
  group?: string;
  fields: DepField[];
  /** when a field takes this value, the listing becomes an Experimental Design Consultation with the preselected topic */
  consultRoute?: { key: string; value: string; topic: string };
};

export type CatalogCategory = {
  name: string;
  services: CatalogService[];
};

const COMPLEX_SAMPLE_TYPES = ["Plant tissue", "Animal tissue", "Microbial culture", "Soil", "Water", "Stool", "Other complex sample"];

const CONSULT = "Experimental design consultation";
export const CONSULT_TOPICS = ["Transcriptomics", "Epigenomics", "Metagenomics", "General experimental design"];

export const SERVICE_CATALOG: CatalogCategory[] = [
  {
    name: "Molecular Biology",
    services: [
      {
        name: "DNA extraction",
        fields: [
          { key: "sampleType", label: "Sample type", type: "select", options: COMPLEX_SAMPLE_TYPES },
          { key: "extractionType", label: "Extraction type", type: "select", options: ["Standard DNA extraction", "High-molecular-weight DNA extraction"] },
        ],
      },
      {
        name: "RNA extraction",
        fields: [
          { key: "sampleType", label: "Sample type", type: "select", options: ["Plant tissue", "Animal tissue", "Microbial culture", "Soil", "Water", "Stool", "Other sample type"] },
          { key: "rnaType", label: "RNA type", type: "select", options: ["Total RNA", "Small RNA-enriched preparation"] },
        ],
      },
      {
        name: "PCR",
        fields: [{ key: "method", label: "Method", type: "select", options: ["Conventional PCR", "Multiplex PCR", "Reverse-transcription PCR (RT-PCR)"] }],
      },
      {
        name: "qPCR",
        fields: [
          { key: "method", label: "Method", type: "select", options: ["DNA qPCR", "Reverse-transcription qPCR (RT-qPCR)"] },
          { key: "quantification", label: "Quantification", type: "select", options: ["Relative", "Absolute"] },
        ],
      },
    ],
  },
  {
    name: "Sequencing",
    services: [
      {
        name: "Gene or amplicon sequencing",
        fields: [{ key: "method", label: "Method", type: "select", options: ["Sanger sequencing", "Targeted amplicon sequencing"] }],
      },
      {
        name: "Gene panel sequencing",
        fields: [
          { key: "panelType", label: "Panel type", type: "select", options: ["Predefined gene panel", "Custom gene panel"] },
          { key: "panelName", label: "Panel name", type: "text", placeholder: "e.g. BRCA1/BRCA2 panel" },
        ],
      },
      {
        name: "Oncology panel sequencing",
        fields: [
          { key: "panelType", label: "Panel type", type: "select", options: ["DNA panel", "RNA panel", "Combined DNA and RNA panel"] },
          { key: "panelName", label: "Panel name", type: "text", placeholder: "e.g. Oncomine comprehensive" },
        ],
      },
      {
        name: "Whole-genome sequencing (WGS)",
        fields: [
          { key: "organism", label: "Organism", type: "select", options: ["Microbial", "Plant", "Animal", "Human"] },
          { key: "readType", label: "Read type", type: "select", options: ["Short-read", "Long-read", "Hybrid"] },
        ],
      },
      {
        name: "Transcriptome sequencing (RNA-seq)",
        fields: [
          {
            key: "offering",
            label: "Offering",
            type: "select",
            options: ["Bulk RNA-seq", "Full-length transcriptome sequencing", "Small RNA sequencing", CONSULT],
          },
        ],
        consultRoute: { key: "offering", value: CONSULT, topic: "Transcriptomics" },
      },
      {
        name: "Epigenome sequencing",
        fields: [
          {
            key: "offering",
            label: "Offering",
            type: "select",
            options: ["DNA methylation profiling", "ATAC-seq", "ChIP-seq", CONSULT],
          },
        ],
        consultRoute: { key: "offering", value: CONSULT, topic: "Epigenomics" },
      },
      {
        name: "Exome sequencing",
        fields: [
          { key: "offering", label: "Offering", type: "select", options: ["Human exome", "Non-human exome", "Custom exome capture"] },
        ],
      },
      {
        name: "Shotgun metagenomic sequencing",
        fields: [
          { key: "offering", label: "Offering", type: "select", options: ["Sequencing", CONSULT] },
          { key: "sampleType", label: "Sample type", type: "select", options: ["Soil", "Water", "Stool", "Other complex sample"], showIf: { key: "offering", value: "Sequencing" } },
        ],
        consultRoute: { key: "offering", value: CONSULT, topic: "Metagenomics" },
      },
      {
        name: "Amplicon-based microbiome profiling",
        fields: [
          { key: "offering", label: "Offering", type: "select", options: ["Sequencing", CONSULT] },
          { key: "marker", label: "Marker", type: "select", options: ["16S rRNA", "ITS", "18S rRNA", "Other marker"], showIf: { key: "offering", value: "Sequencing" } },
        ],
        consultRoute: { key: "offering", value: CONSULT, topic: "Metagenomics" },
      },
    ],
  },
  {
    name: "Bioinformatics",
    services: [
      {
        name: "De novo genome assembly",
        group: "Genome assembly and annotation",
        fields: [],
      },
      { name: "Hybrid genome assembly", group: "Genome assembly and annotation", fields: [] },
      { name: "Assembly QC and completeness assessment", group: "Genome assembly and annotation", fields: [] },
      { name: "Genome annotation", group: "Genome assembly and annotation", fields: [] },
      { name: "Comparative genome analysis", group: "Comparative genomics", fields: [] },
      { name: "Pangenome analysis", group: "Comparative genomics", fields: [] },
      { name: "Orthology analysis", group: "Comparative genomics", fields: [] },
      { name: "Synteny analysis", group: "Comparative genomics", fields: [] },
      { name: "Phylogenomics", group: "Comparative genomics", fields: [] },
      { name: "SNP and small indel calling", group: "Variant analysis", fields: [] },
      { name: "Structural variant calling", group: "Variant analysis", fields: [] },
      { name: "Copy-number variant analysis", group: "Variant analysis", fields: [] },
      { name: "Variant annotation", group: "Variant analysis", fields: [] },
      { name: "Expression quantification", group: "Transcriptome analysis", fields: [] },
      { name: "Differential gene expression (DEG) analysis", group: "Transcriptome analysis", fields: [] },
      { name: "Full-length isoform discovery and quantification", group: "Transcriptome analysis", fields: [] },
      { name: "Differential transcript usage", group: "Transcriptome analysis", fields: [] },
      { name: "Alternative splicing analysis", group: "Transcriptome analysis", fields: [] },
      { name: "Non-coding RNA identification", group: "Transcriptome analysis", fields: [] },
      { name: "Small RNA analysis", group: "Transcriptome analysis", fields: [] },
      { name: "Functional enrichment", group: "Transcriptome analysis", fields: [] },
      { name: "Taxonomic profiling", group: "Shotgun metagenomic analysis", fields: [] },
      { name: "Diversity analysis", group: "Shotgun metagenomic analysis", fields: [] },
      { name: "Functional and pathway profiling", group: "Shotgun metagenomic analysis", fields: [] },
      { name: "Metagenome assembly", group: "Shotgun metagenomic analysis", fields: [] },
      { name: "Genome binning and metagenome-assembled genome (MAG) recovery", group: "Shotgun metagenomic analysis", fields: [] },
      { name: "Comparative metagenomics", group: "Shotgun metagenomic analysis", fields: [] },
      { name: "Amplicon sequence variant (ASV) analysis", group: "Amplicon-based microbiome analysis", fields: [] },
      { name: "Taxonomic assignment", group: "Amplicon-based microbiome analysis", fields: [] },
      { name: "Alpha and beta diversity", group: "Amplicon-based microbiome analysis", fields: [] },
      { name: "Differential abundance analysis", group: "Amplicon-based microbiome analysis", fields: [] },
      { name: "Microbial community comparison", group: "Amplicon-based microbiome analysis", fields: [] },
      { name: "DNA methylation analysis", group: "Epigenomic analysis", fields: [] },
      { name: "Differential methylation analysis", group: "Epigenomic analysis", fields: [] },
      { name: "Chromatin accessibility analysis", group: "Epigenomic analysis", fields: [] },
      { name: "Peak calling and annotation", group: "Epigenomic analysis", fields: [] },
    ],
  },
  {
    name: "Experimental Design Consultation",
    services: [
      {
        name: "Experimental design consultation",
        fields: [{ key: "topic", label: "Consultation topic", type: "select", options: CONSULT_TOPICS }],
      },
    ],
  },
];

export const PRICE_UNITS = ["per sample", "per reaction", "per run", "per project", "per consultation"] as const;

export function findCategory(name: string) {
  return SERVICE_CATALOG.find((c) => c.name === name);
}

export function findService(category: string, service: string) {
  return findCategory(category)?.services.find((s) => s.name === service);
}

/** Fields visible for a service given current selections (showIf evaluation). */
export function visibleFields(svc: CatalogService, values: Record<string, string>) {
  return svc.fields.filter((f) => !f.showIf || values[f.showIf.key] === f.showIf.value);
}

/**
 * Generated listing name — service + selected options.
 * If an option value already contains the service name (e.g. "High-molecular-weight
 * DNA extraction" ⊃ "DNA extraction"), it replaces the service as the base so the
 * result reads "High-molecular-weight DNA extraction · Plant tissue".
 */
export function buildListingName(service: string, optionValues: string[]) {
  const parts = [service];
  for (const v of optionValues) {
    if (!v) continue;
    if (v.toLowerCase().includes(service.toLowerCase())) parts[0] = v;
    else parts.push(v);
  }
  return parts.join(" · ");
}
