# Sequencing Coverage Calculator — Research & Data Pack

Research compiled for the PBG coverage-calculator feature.
Sources: Illumina support/specs, **Illumina calculator source files**
(customprotocolselector.illumina.com/covcalc — the actual engine),
Lander & Waterman (1988), Genohub, ENCODE, Oxford Nanopore, PacBio,
University sequencing cores (Tübingen, Exeter, Guelph, Yale,
Northwestern, HBC/Harvard), QIAGEN GeneGlobe.

---

## 0. THE ILLUMINA CALCULATOR — COMPLETE INTERNALS

The real calculator lives at
`customprotocolselector.illumina.com/covcalc/` — its PHP form, calc
engine and data files are publicly readable. Everything below was
extracted from the actual source files, not reverse-engineered guesses.

### 0.1 User workflow (wgs_enr_welcome.htm)

1. Click application type — DNA / RNA / DNA+RNA
2. Select application or product from dropdown (~22 presets)
3. Fill input parameters — **some fields are locked (grayed) per product**
   (e.g., a kit with fixed read length disables that field)
4. Select instruments to estimate for (checkboxes)
5. Submit → results table + **CSV download** ("share data or use in Excel")

### 0.2 Input fields (wgs_enr_form.php)

| Field | Type | Notes |
|---|---|---|
| Application or product | dropdown (~22 presets) | drives locked defaults |
| Coverage | × number | WGS/enrichment mode |
| Min clusters/reads (on-target) | millions | panel mode |
| Duplicates | % | |
| Genome or region size | Mb | panels lock this |
| Total read length | cycles (200 = 2×100) | PE total |
| On target | % | panels lock this |
| Instruments | checkboxes | Benchtop vs Production split |

### 0.3 Three calculation engines (from *_explain.htm)

**Mode A — coverage-based** (WGS, enrichment, some panels):

```
Total output required = region_size × coverage / ((1 − dup/100) × onTarget/100)
Output per unit       = clusters_per_unit × read_length
Units (cells/lanes)   = total_output_required / output_per_unit
Samples per unit      = output_per_unit / total_output_required
```

**Mode B — cluster/min-reads-based** (most panels):

```
Units   = recommended_clusters / clusters_per_unit
Samples = clusters_per_unit / recommended_clusters
```
(recommended clusters already corrected for on-target %)

**Mode C — fixed-samples** (e.g. TruSight Cancer): vendor lookup table
of max samples per instrument/kit — no math, pure data.

Key footnote from Illumina: **one cluster = one read, even in PE mode**
(clusters counted, not reads — avoids the reads-vs-pairs ambiguity).

### 0.4 Instrument data schema (wgs_enr_Data.txt, wgs_enr_reads_Data.txt)

Tab-separated, one row per instrument×kit:
`Code | LabelPerUnit | Instrument | RunType | Clusters | OutputPerUnit |
ExceedsMaxReadLen | UnitsPerSample | SamplesPerUnit | Comments | Product×3 |
InstrKit | End`

Full cluster-per-unit table extracted (single reads/clusters):

| Code | Instrument | Kit | Clusters | Max cycles |
|---|---|---|---|---|
| ISi1 | iSeq 100 | i1 reagents | 4 M | 150 |
| MNmo | MiniSeq | Mid Output | 8 M | 150 |
| MNho | MiniSeq | High Output | 25 M | 150 |
| MSv3 | MiSeq | v3 | 25 M | 300 |
| MSv2 | MiSeq | v2 | 15 M | 250 |
| MSv2nano | MiSeq | v2 Nano | 1 M | 250 |
| MSv2micro | MiSeq | v2 Micro | 4 M | 150 |
| NSho | NextSeq 500 | High Output | 400 M | 150 |
| NSmo | NextSeq 500 | Mid Output | 130 M | 150 |
| NS2000p1/p2/p3 | NextSeq 2000 | P1/P2/P3 | 100 M / 400 M / 1.2 B | 300/150/150 |
| NS1000p1/p2 | NextSeq 1000 | P1/P2 | 100 M / 400 M (300M @600cy) | 300/150 |
| NoSSP/S1/S2/S4 | NovaSeq 6000 | SP/S1/S2/S4 | 800 M / 1.6 B / 4.1 B / 10 B | 250/150/150/150 |
| HS4000 | HiSeq 3000/4000 | lane | 312.5 M | 150 |
| 2500rrv2cBot | HiSeq 2500 RR | lane (2/fc) | 150.7 M | 250 |
| 2500rrv2OBCG | HiSeq 2500 RR | flow cell | 300 M | 250 |
| 2500hov4 | HiSeq 2500 HO | lane (8/fc) | 250 M | 125 |
| 2500hov3 | HiSeq 2500 HO | lane (8/fc) | 18.75 M* | 100 |
| 2000v4/v3 | HiSeq 1000/2000 | lane | 249.9 M / 186 M | 125/100 |
| GA | Genome Analyzer IIx | lane | 42 M | 150 |
| HSSQ | HiScanSQ | lane | 93 M | 100 |

### 0.5 Kit/application defaults (wgs_enr_DNA_Kits.txt)

Schema: `Kit | RegionSize(Mb) | OnTarget% | CalcMethod | Dup% | ReadLen |
CompatInstruments | CompatKits | FixedSamples | MinClusters | MinCov | Note`

| Kit | Region (Mb) | OnT% | Method | Dup% | RL | Samples/unit | Min clusters |
|---|---|---|---|---|---|---|---|
| Whole-Genome Seq (generic) | 3300 | 100 | open | 2 | — | all:384 | — |
| Illumina DNA PCR-Free | 3300 | 100 | open | 2 | — | all:384 | — |
| TruSeq DNA Exome | 45 | 80 | fixed | 20 | 150 | all:96 | — |
| Nextera DNA Exome | 45 | 75 | fixed | 10 | 150 | all:96 | — |
| TruSight Cancer | 0.3 | 70 | samples | 0 | 300 | all:96, MS:24, MNmo:12, MNho:24 | 0.625 M |
| TruSight Cardio | 0.572 | 65 | minreads | 0 | 300 | MS:12, NS/NoS/NS2k/NS1k:48 | 1.25 M |
| TruSight Inherited Disease | 2.25 | — | minreads | 0 | 300 | all:96, MSv2:4, MSv3:8, NSho:96, NSmo:48, MNmo:4, MNho:8 | 1.8 M |
| TruSight Myeloid | 0.141 | 80 | minreads | 0 | 300 | all:96 | 3.125 M |
| TruSight Tumor 15 | 0.044 | 80 | minreads | 0 | 300 | all:24 | 3.125 M |
| TruSight Tumor 26 | 0.021 | 85 | minreads | 0 | 240 | all:48, MSv2:4 | 3.75 M |
| TruSight Neurodegeneration | 8.7 | 80 | open | 0 | 300 | all:96 | — |
| AmpliSeq BRCA germline | 0.026 | 80 | samples | 0 | 300 | MSv2nano:32, MSv2micro:96, ISi1:96 | 0.033 M |
| AmpliSeq BRCA somatic | 0.026 | 80 | samples | 0 | 300 | MNmo:24, MNho:80, MSv2:48, MSv3:80, ISi1:12 | — |
| AmpliSeq Cancer HotSpot v2 | 0.022 | 80 | samples | 0 | 300 | MNmo:32, MNho:96, MSv2:60, MSv3:96, ISi1:16 | 0.208 M |
| AmpliSeq Childhood Cancer | 0.35 | 80 | samples | 0 | 300 | MNmo:1, MNho:5, MSv2:3, MSv3:5, NSmo:27, NSho:83, NS2000p1/NS1000p1:20, p2:83, p3:249 | — |
| AmpliSeq Comprehensive Cancer | 1.74 | 80 | samples | 0 | 300 | NSmo:4, NSho:12, p1:3, p2:12, p3:36 | 26 M |
| AmpliSeq Comprehensive v3 | 0.4 | 80 | samples | 0 | 300 | MNho:3, MSv3:3, NSmo:16, NSho:48, p1:12, p2:48, p3:144 | 8 M |
| AmpliSeq Exome Panel | 60.4 | 80 | samples | 0 | 300 | NSmo:2, NSho:8, p1:2, p2:8, p3:24 | 40 M |
| AmpliSeq Focus | 0.029 | 80 | samples | 0 | 300 | MNmo:24, MNho:72, MSv2:40, MSv3:72, ISi1:8 | 0.35 M |
| AmpliSeq Myeloid | 0.12 | 80 | samples | 0 | 300 | MNmo:4, MNho:12, MSv2:7, MSv3:12 | — |

Calc methods: `open` = user-entered coverage (Mode A);
`fixed`/`minreads` = cluster-based (Mode B); `samples` = fixed lookup
(Mode C); `flexenr`/`cfdnaflexenr` = separate enrichment flow.

### 0.6 Illumina output format

- On-screen **results table**: per selected instrument×kit → units
  needed per sample AND samples per unit
- **CSV download** (comma-separated values → Excel) — the only
  export. No PDF, no shareable link, no API.

---

## 1. Core mathematics

### Lander–Waterman equation (the industry standard)

```
C = (L × N) / G
```

- `C` = mean coverage (depth, ×)
- `L` = read length in bp (paired-end: use the SUM, e.g. 2×150 → 300)
- `N` = number of reads (paired-end: N = read PAIRS, with L = both ends)
- `G` = haploid genome / target size in bp

Rearranged — reads needed for a target depth:

```
N = (C × G) / (L × usable_fraction)
Bases needed (Gb) = (C × G) / 1e9 / usable_fraction
```

`usable_fraction` accounts for reads lost to adapter trimming, QC,
mapping failures, duplicates and (for capture) off-target reads.
Typical usable values: **0.70–0.95** (default 0.85 is a sane midpoint).

### Poisson coverage-breadth model (Lander–Waterman)

Reads land at random → per-base coverage ~ Poisson(C):

```
P(base covered ≥ 1×) = 1 − e^(−C)
P(base covered ≥ k×) = 1 − Σ(i=0..k−1) e^(−C) · C^i / i!
```

Examples at C = 30×: ~100% ≥1×, ~99.6% ≥10×, ~81% ≥30×.
At C = 10×: ~100% ≥1×, ~97.6% ≥5×, ~2.9% ≥30×.

Useful UI output: "fraction of genome expected at ≥10× / ≥20× / ≥30×".

### Caveats worth surfacing in the UI

- Model assumes uniform random reads — real data has GC bias, repeat
  dropouts, capture efficiency variation.
- For capture panels/exomes, G = **target size**, NOT whole genome.
- Coverage is a mean — real depth varies locus to locus.
- Paired-end ambiguity is the #1 user error: are numbers "reads" or
  "read pairs"? The calculator must ask explicitly.

---

## 2. Coverage-depth recommendations by application

| Application | Recommended depth / reads | Source |
|---|---|---|
| Human WGS — germline SNVs/indels | 30×–50× (30× is standard) | Illumina, Exeter |
| Human WGS — het SNVs only | ~33× | Bentley 2008 (Genohub) |
| Human WGS — indels | ~60× | Feng 2014 (Genohub) |
| Human WGS — CNV only | 1–8× | Xie 2009 (Genohub) |
| WGS — somatic/tumor variants | 500×–1000× | Guelph AAC |
| De novo assembly — short read | 100×–200× | Exeter |
| De novo — ONT only | ~50× mean | Exeter |
| Hybrid assembly (ONT+Illumina) | ~100× ONT + 20–30× Illumina | Tübingen |
| Bacterial WGS | ~100× | Tübingen, Sequencing Ctr |
| Diploid variant calling (general) | 40–50× mean | Exeter |
| Haploid/bacterial variant calling | 10–20× median | Exeter |
| Whole-exome | 100× mean (Clark 2011: 3× local for homo, 13× het) | Illumina, Genohub |
| Targeted panels | 200×–500× typical; ≥500× somatic | common practice |
| ChIP-seq | 100× mean or 25–30M reads | Illumina, Yale |
| 16S amplicon microbiome | 50k–80k reads/sample (Yale: up to 200k) | Tübingen, Yale |
| Shotgun metagenomics (taxa ID) | 1–20M reads | Guelph |
| Shotgun metagenomics (MAGs/de novo) | 100–400× per species; 5–10 Gb+/sample | Guelph, Tübingen |
| Genome skimming | 0.05–20× | Guelph |

### RNA-seq — reads, not coverage (key distinction)

| Goal | Reads per sample | Source |
|---|---|---|
| Standard gene expression (polyA) | 20–25M (ENCODE) / 10–20M pairs | ENCODE, Northwestern |
| Expression w/ rRNA-depleted total RNA | 35–40M pairs | Yale |
| Lowly-expressed genes | 30–60M | HBC |
| Isoform/splice variant analysis | 80–100M pairs | Yale, ENCODE |
| Novel transcript discovery | up to 200M pairs | ENCODE |
| Prokaryotic RNA-seq | 3–5M per replicate | Exeter |
| Small RNA-seq | 4–5M (NUSeq) / 10–20M (Yale) | Northwestern, Yale |
| Replicates > depth for DE | 4–6 biological replicates min | ENCODE, Exeter |

---

## 3. Haploid genome sizes (calculator presets)

Curated for PBG users — human/clinical, agriculture (Pakistan-relevant),
microbes, models. bp = haploid genome size.

| Organism | Size (bp) | Notes |
|---|---|---|
| Human (H. sapiens) | 3.1 Gb (3,100,000,000) | GRCh38 ~3.1; some refs 3.2–3.3 |
| Mouse (M. musculus) | 2.8 Gb | |
| Rat (R. norvegicus) | 3.0 Gb | |
| Zebrafish (D. rerio) | 1.4–1.7 Gb | |
| Chicken (G. gallus) | 1.2 Gb | poultry/agri |
| Buffalo / cattle (B. taurus) | ~2.7 Gb | livestock — Pakistan-relevant |
| Goat (C. hircus) | ~2.9 Gb | livestock |
| Sheep (O. aries) | ~2.6 Gb | livestock |
| Maize / corn (Z. mays) | 2.1–3.9 Gb | refs differ (B73 ~2.1 Gb) |
| Wheat — bread (T. aestivum) | ~14.5 Gb | hexaploid, huge |
| Rice (O. sativa) | ~0.4–0.5 Gb | indica ~465 Mb |
| Cotton (G. hirsutum) | ~2.4 Gb | allotetraploid — Pakistan crop |
| Chickpea (C. arietinum) | ~0.74 Gb | Pakistan crop |
| Sugarcane (S. officinarum) | ~10 Gb | highly polyploid |
| Arabidopsis (A. thaliana) | 135 Mb | model plant |
| Fruit fly (D. melanogaster) | 140 Mb | |
| C. elegans | 100 Mb | |
| Yeast (S. cerevisiae) | 12 Mb | |
| E. coli | 4.6 Mb | typical bacterium |
| Mycobacterium tuberculosis | 4.4 Mb | Pakistan health relevance |
| Mycoplasma genitalium | 0.58 Mb | smallest free-living |
| SARS-CoV-2 | 30 kb | virus scale |
| Typical plasmid | 3–10 kb | |
| Human exome (capture space) | ~45–60 Mb | for WES mode, G = target |
| Typical gene panel | 0.1–3 Mb | G = target size |

---

## 4. Instrument output specifications (flow-cell / run yields)

### Illumina — NovaSeq X / X Plus (per flow cell)

| Flow cell | 2×50 | 2×100 | 2×150 | Reads (single) |
|---|---|---|---|---|
| 1.5B | 165–238 Gb | 330–476 Gb | 500–716 Gb | 1.6–2.4 B |
| 5B | 500–650 Gb | 1–1.3 Tb | 1.5–2 Tb | 5–6.5 B |
| 10B | 1–1.3 Tb | 2–2.7 Tb | 3–4 Tb | 10–13 B |
| 25B | 2.6–3.5 Tb | 5.3–7 Tb | 8–10.5 Tb | 26–35 B |

(X Plus runs dual flow cells = ×2.)

### Illumina — NextSeq 1000/2000 XLEAP (per flow cell)

| Flow cell | 2×50 | 2×100 | 2×150 | 2×300 | Single reads |
|---|---|---|---|---|---|
| P1 | 10 Gb | — | 30 Gb | 60 Gb | 100 M |
| P2 | 40 Gb | 80 Gb | 120 Gb | 240 Gb | 400 M |
| P3* | 120 Gb | 240 Gb | 360 Gb | — | 1.2 B |
| P4* | 180 Gb | 360 Gb | 540 Gb | 90 Gb (1×50) | 1.8 B |

*P3/P4 = NextSeq 2000 only.

### Illumina — MiSeq i100 (per flow cell)

| Flow cell | 1×100 | 2×150 | 2×300 | 2×500 | Single reads |
|---|---|---|---|---|---|
| 5M | — | 1.5 Gb | 3 Gb | — | 5 M |
| 25M | 2.5 Gb | 7.5 Gb | 15 Gb | 25 Gb | 25 M |
| 50M* | 5 Gb | 15 Gb | 30 Gb | — | 50 M |
| 100M* | 10 Gb | 30 Gb | — | — | 100 M |

*50M/100M = i100 Plus only.

### Long-read platforms

| Platform | Unit | Yield | Read length | Accuracy |
|---|---|---|---|---|
| PacBio Revio | SMRT cell | 100–120 Gb (15–20 kb libs) | 15–20 kb | 99.95% (Q33) |
| PacBio Revio | SMRT cell | 35–70 Gb (10–15 kb) / 6–8 M reads (short) | varies | ≥99.9% |
| ONT PromethION | flow cell | 50–150 Gb (up to ~290 Gb reported) | 10–100 kb+ | ~Q20–Q25 simplex / >Q30 duplex |
| ONT MinION/GridION | flow cell | 10–50 Gb | 10–100 kb+ | same chemistry |
| ONT PromethION (human) | flow cell | ~30–60× human genome per cell | — | — |

Revio: ~1 SMRT cell ≈ >40× human genome (24 h); 4 cells/instrument.

### Legacy reference (Genohub table — older instruments still in Pakistani labs)

| Instrument | Unit | Single reads |
|---|---|---|
| HiSeq X Ten | lane | 375 M |
| HiSeq 3000/4000 | lane | 312.5 M |
| NextSeq 500 high-output | run | 400 M |
| MiSeq v3 | run | 25 M |
| MiSeq v2 | run | 16 M |
| MiSeq v2 Micro | run | 4 M |
| Ion Proton I | chip | 60 M |
| Ion PGM 318 | chip | 4 M |

---

## 5. Multiplexing / samples-per-run model (Genohub approach)

```
reads_per_sample = floor(total_run_reads / n_samples)
coverage_per_sample = reads_per_sample × L / G
max_samples = floor(total_run_reads / reads_needed_per_sample)
```

QIAGEN GeneGlobe uses the same model for panel multiplexing.
Important real-world note: pooling assumes **even allocation** —
qPCR-based quantification before pooling affects actual distribution
(worth a UI disclaimer).

---

## 6. Loss-factor model (turn raw output into honest estimates)

| Factor | Typical range | Where it applies |
|---|---|---|
| Passing filter / usable clusters | 85–95% | always (baked into specs already) |
| Adapter/QC trimming loss | 3–10% | always |
| Mapping/on-target fraction | 70–95% WGS; 50–90% capture | WGS vs panels |
| PCR/optical duplicates | 5–30% (worse for capture & low-input) | depth-effective calc |
| rRNA contamination (total RNA-seq) | 5–15% | RNA-seq |

Effective-depth model: `C_eff = C × usable × on_target × (1 − dup_rate)`

---

## 7. Competitor calculators reviewed

| Tool | Inputs | Outputs |
|---|---|---|
| **Illumina Coverage Calculator** (XLSM) | genome size, target coverage, read length, instrument/kit | reagent kits & runs needed |
| Genohub matching engine | reads or coverage + genome size | packages across provider instruments; multiplexing allocation |
| QIAGEN GeneGlobe | panel UMI coverage, DNA input | samples multiplexable per run |
| zubairkhalid.com tool | reads, read length, G, usable% | mean coverage, 1−e^(−C) breadth |
| AgentCalc | G, L, N, PE toggle, usable%, dup% | depth, breadth, ≥k× fraction, cost |
| ONT docs | data/Gb ÷ genome size | coverage (simplest model) |

PBG differentiator: coverage → **which verified Pakistani lab + platform
can run it**, and straight into an RFQ (no competitor does procurement).

---

## 8. Proposed feature design for PBG

### Calculator modes (tabbed)

1. **"I know my target"** → organism + application preset → reads/bases
   needed + samples-per-flow-cell on chosen platform.
2. **"I have a quote"** → provider's offered reads/Gb → what coverage
   will I actually get? (validates vendor quotes!)
3. **"How many samples fit"** → run specs → max samples at target depth.

### Inputs

- Organism preset dropdown (table §3) or custom genome size + unit
  (Gb/Mb/Kb)
- Application preset (table §2) → default target coverage/reads
- Read length presets (2×150 default; 2×100, 2×300, 1×50, HiFi ~15 kb)
- Platform/flow-cell preset (table §4) or custom yield
- Number of samples
- Advanced: usable%, duplicate%, on-target% (defaults hidden)

### Outputs (on-screen)

- Mean coverage achieved (×) and effective coverage after losses
- % genome ≥ 10×/20×/30× (Poisson model)
- Total reads + Gb needed; reads/sample; runs/flow-cells needed
- Max multiplexable samples on the chosen flow cell
- Per-instrument table like Illumina's: units needed + samples/unit
- "Get quotes" CTA → prefill RFQ with computed requirements
- For labs: capacity-check against their declared platform

---

## 9. EXPORT & DOWNLOAD FORMATS (what users get out)

Illumina only offers CSV. For PBG, both audiences need different artifacts:

### Customer / researcher

| Format | Contents | Use |
|---|---|---|
| **PDF report** (branded) | Inputs, assumptions, results table, Poisson curve chart, disclaimers, PBG letterhead | attach to grant proposals, share with PI/supervisor, procurement files |
| **CSV / XLSX** | same data rows as the on-screen table | further math in Excel (what Illumina offers) |
| **Shareable URL** | calculator state encoded in query params | send to colleague/lab — opens prefilled |
| **Attach to RFQ** | structured JSON snapshot saved onto the RFQ (service category, target coverage, reads needed, genome size, sample count) | labs see the *computation*, not just prose → more accurate quotes |

### Lab / provider

| Format | Contents | Use |
|---|---|---|
| Same PDF/CSV | — | capacity planning, reply to RFQs with evidence |
| **Capacity check panel** | their declared platform vs required output → can/cannot fulfill, % of one run used | pre-quote sanity check |
| RFQ-linked view | customer's computed requirements rendered in the quote form | quote against exact specs |

### Implementation notes

- CSV is trivial (`text/csv` stream). XLSX via a tiny lib (e.g. `xlsx`) only if requested — CSV covers the same use.
- PDF: generate server-side (e.g. `@react-pdf/renderer` or a print-styled HTML page + `window.print()` to start — no new dependency).
- Shareable state: encode inputs in the URL (`?g=3100&cov=30&rl=150&...`) — zero backend needed, SSR renders prefilled.
- RFQ snapshot: store calculator JSON on the `Rfq` record (`coverageSpec Json?`) — one small schema field, no files needed.

---

### Fit with existing catalogue

Maps onto the service taxonomy: WGS (microbial/plant/animal/human,
short/long/hybrid read), targeted panels, RNA-seq, amplicon
microbiome, shotgun metagenomics — calculator presets should reuse
`src/lib/service-catalog.ts` categories.
