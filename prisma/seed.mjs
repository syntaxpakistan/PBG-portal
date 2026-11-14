import { PrismaClient } from "@prisma/client";
import { hashPassword } from "better-auth/crypto";
import { mkdirSync, writeFileSync } from "fs";
import path from "path";

const prisma = new PrismaClient();

// human-readable refs via the shared RefSequence counter (mirrors src/lib/refs.ts)
async function ref(prefix, yearly = false) {
  const key = yearly ? `${prefix}-${new Date().getFullYear()}` : prefix;
  const s = await prisma.refSequence.upsert({
    where: { key },
    update: { last: { increment: 1 } },
    create: { key, last: 1 },
  });
  return `${key}-${String(s.last).padStart(4, "0")}`;
}

async function user(name, email, role, password) {
  const hash = await hashPassword(password);
  const u = await prisma.user.upsert({
    where: { email },
    update: {},
    create: { name, email, role, emailVerified: true },
  });
  await prisma.account.upsert({
    where: { providerId_accountId: { providerId: "credential", accountId: u.id } },
    update: { password: hash },
    create: { accountId: u.id, providerId: "credential", userId: u.id, password: hash },
  });
  return u;
}

async function main() {
  // ---- admin ----
  await user("Syntax Admin", "admin@syntaxlife.pk", "ADMIN", "Admin@12345");

  // ---- providers ----
  const labA = await user("Dr. Ayesha Khan", "genomelab@pbg.pk", "PROVIDER", "Lab@12345");
  const labB = await user("Dr. Bilal Ahmed", "ncgseq@pbg.pk", "PROVIDER", "Lab@12345");
  const labC = await user("Dr. Sara Tariq", "pendinglab@pbg.pk", "PROVIDER", "Lab@12345");

  const pA = await prisma.providerProfile.upsert({
    where: { userId: labA.id },
    update: {},
    create: {
      orgNo: await ref("LAB"),
      userId: labA.id, orgName: "GenomeLab Karachi", city: "Karachi",
      platforms: "Illumina NovaSeq X, ONT PromethION",
      sampleTypes: "gDNA, RNA, FFPE, PBMC",
      serviceCategories: "WGS, RNA-Seq, Epigenetics",
      hpcCapacity: "16-node cluster",
      bio: "CAP-aligned genomics facility serving hospitals and universities since 2018.",
      status: "APPROVED", verifiedAt: new Date(),
    },
  });
  const pB = await prisma.providerProfile.upsert({
    where: { userId: labB.id },
    update: {},
    create: {
      orgNo: await ref("LAB"),
      userId: labB.id, orgName: "NCG Sequencing Lahore", city: "Lahore",
      platforms: "PacBio Revio, Illumina MiSeq",
      sampleTypes: "gDNA, plant tissue, microbial",
      serviceCategories: "WGS, Long-read, Bioinformatics",
      hpcCapacity: "32-node HPC",
      bio: "Agri-genomics specialist — plant and livestock whole-genome projects.",
      status: "APPROVED", verifiedAt: new Date(),
    },
  });
  await prisma.providerProfile.upsert({
    where: { userId: labC.id },
    update: {},
    create: {
      orgNo: await ref("LAB"),
      userId: labC.id, orgName: "BioCore Islamabad", city: "Islamabad",
      platforms: "Illumina NextSeq",
      sampleTypes: "gDNA, RNA",
      serviceCategories: "WES, Panels",
      bio: "New facility — awaiting verification.",
      status: "PENDING",
    },
  });

  // ---- suppliers ----
  const supA = await user("Hassan Raza", "biosupplies@pbg.pk", "SUPPLIER", "Sup@12345");
  const sA = await prisma.supplierProfile.upsert({
    where: { userId: supA.id },
    update: {},
    create: {
      orgNo: await ref("SUP"),
      userId: supA.id, orgName: "BioSupplies PK", city: "Lahore",
      categories: "Extraction kits, Reagents, Consumables",
      bio: "Indigenous manufacturer of sample-prep kits and lab consumables.",
      status: "APPROVED", verifiedAt: new Date(),
    },
  });
  const kitCount = await prisma.product.count({ where: { supplierId: sA.id } });
  if (kitCount === 0) {
    await prisma.product.create({
      data: { prodNo: await ref("PRD"), supplierId: sA.id, name: "RNA Extraction Kit (50 prep)", category: "Kits", spec: "Spin-column, RNase-free", price: 24800, unit: "kit" },
    });
    await prisma.product.createMany({
      data: [
        { prodNo: await ref("PRD"), supplierId: sA.id, name: "Taq Polymerase 500U", category: "Reagents", spec: "5 U/µL, hot-start", price: 18500, unit: "vial" },
        { prodNo: await ref("PRD"), supplierId: sA.id, name: "Low-bind microtubes 1.5mL (500)", category: "Consumables", spec: "DNA LoBind equivalent", price: 9200, unit: "pack" },
      ],
    });
  }

  // ---- customers ----
  const cust = await user("Dr. Fatima Noor", "fatima@nibge.edu.pk", "CUSTOMER", "Cust@12345");
  await user("Dr. Omar Sheikh", "omar@aku.edu", "CUSTOMER", "Cust@12345");

  // ---- RFQ + quotes (skipped if already seeded) ----
  const seeded = await prisma.rfq.findUnique({ where: { refNo: "RFQ-2601" } });
  if (!seeded) {
  const rfq = await prisma.rfq.create({
    data: {
      refNo: "RFQ-2601",
      customerId: cust.id,
      title: "Wheat rust resistance panel — 48 samples",
      organism: "Triticum aestivum",
      sampleCount: 48,
      sampleType: "Plant leaf tissue",
      serviceCategory: "WGS",
      requestedOutput: "VCF + annotation report",
      analysisType: "Variant calling",
      deadline: new Date(Date.now() + 45 * 864e5),
      budgetHint: "PKR 350k–450k",
      status: "OPEN",
      visibility: "BOARD",
      moderation: "APPROVED",
    },
  });
  // board RFQ still in the moderation queue — admin approves it from /admin/moderation
  await prisma.rfq.create({
    data: {
      refNo: "RFQ-2606",
      customerId: cust.id,
      title: "Soil microbiome 16S survey — 96 samples",
      organism: "Soil metagenome",
      sampleCount: 96,
      sampleType: "Soil DNA extracts",
      serviceCategory: "Panels",
      requestedOutput: "OTU table + diversity report",
      analysisType: "16S metabarcoding",
      deadline: new Date(Date.now() + 60 * 864e5),
      budgetHint: "PKR 200k–300k",
      status: "OPEN",
      visibility: "BOARD",
      moderation: "PENDING",
    },
  });
  await prisma.quote.createMany({
    data: [
      { quoteNo: await ref("QO", true), rfqId: rfq.id, providerId: pA.id, price: 385000, taxAmount: 0, turnaroundDays: 14, platform: "Illumina NovaSeq X", exclusions: "No raw FASTQ delivery via platform", notes: "Includes QC + alignment", status: "SUBMITTED" },
      { quoteNo: await ref("QO", true), rfqId: rfq.id, providerId: pB.id, price: 412500, taxAmount: 24750, turnaroundDays: 10, platform: "PacBio Revio", exclusions: "Samples must pass DNA QC", notes: "Expedited lane available", status: "SUBMITTED" },
    ],
  });

  const rfq2 = await prisma.rfq.create({
    data: {
      refNo: "RFQ-2602",
      customerId: cust.id,
      title: "Tumor RNA-Seq — 24 FFPE samples",
      organism: "Homo sapiens",
      sampleCount: 24,
      sampleType: "FFPE blocks",
      serviceCategory: "RNA-Seq",
      requestedOutput: "Counts matrix + DE report",
      analysisType: "Differential expression",
      status: "OPEN",
    },
  });

  // ---- awarded project with history + messages + result ----
  const q = await prisma.quote.create({
    data: { quoteNo: await ref("QO", true), rfqId: rfq2.id, providerId: pA.id, price: 296000, taxAmount: 0, turnaroundDays: 18, platform: "Illumina NovaSeq X", status: "SELECTED" },
  });
  await prisma.rfq.update({ where: { id: rfq2.id }, data: { status: "AWARDED" } });
  const proj = await prisma.project.create({
    data: {
      refNo: "PRJ-1001", rfqId: rfq2.id, quoteId: q.id,
      customerId: cust.id, providerUserId: labA.id, providerId: pA.id,
      status: "WORK_IN_PROGRESS",
    },
  });
  await prisma.statusHistory.createMany({
    data: [
      { projectId: proj.id, status: "OFFER_SELECTED", note: "Customer selected quote", changedById: cust.id },
      { projectId: proj.id, status: "SAMPLE_AWAITED", note: "Awaiting courier", changedById: labA.id },
      { projectId: proj.id, status: "SAMPLE_RECEIVED", note: "24/24 FFPE blocks received, QC passed", changedById: labA.id },
      { projectId: proj.id, status: "WORK_IN_PROGRESS", note: "Library prep underway", changedById: labA.id },
    ],
  });
  await prisma.message.createMany({
    data: [
      { projectId: proj.id, senderId: cust.id, body: "Blocks are being couriered tomorrow — tracking via TCS." },
      { projectId: proj.id, senderId: labA.id, body: "Received, thank you. DV200 looks acceptable on 22/24; proceeding with all." },
    ],
  });
  // released deliverable with a real file on disk so the download route works end-to-end
  const demoKey = "seed-prj1001-qc-report.pdf";
  const pdf = Buffer.from(
    "%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj\n" +
    "3 0 obj<</Type/Page/Parent 2 0 R/MediaBox[0 0 612 792]/Contents 4 0 R/Resources<</Font<</F1 5 0 R>>>>>>endobj\n" +
    "4 0 obj<</Length 120>>stream\nBT /F1 16 Tf 72 720 Td (PRJ-1001 Sample QC Summary - DV200 acceptable on 22/24 samples. Proceeding with all.) Tj ET\nendstream endobj\n" +
    "5 0 obj<</Type/Font/Subtype/Type1/BaseFont/Helvetica>>endobj\ntrailer<</Root 1 0 R>>\n%%EOF"
  );
  if (process.env.AWS_ENDPOINT_URL_S3) {
    const { S3Client, PutObjectCommand } = await import("@aws-sdk/client-s3");
    const s3 = new S3Client({
      endpoint: process.env.AWS_ENDPOINT_URL_S3,
      region: process.env.AWS_REGION,
      credentials: { accessKeyId: process.env.AWS_ACCESS_KEY_ID, secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY },
      forcePathStyle: true,
    });
    await s3.send(new PutObjectCommand({ Bucket: process.env.S3_BUCKET || "assets", Key: demoKey, Body: pdf, ContentType: "application/pdf" }));
  } else {
    mkdirSync(path.join(process.cwd(), "uploads"), { recursive: true });
    writeFileSync(path.join(process.cwd(), "uploads", demoKey), pdf);
  }
  await prisma.resultFile.create({
    data: {
      projectId: proj.id, filename: "PRJ-1001_QC-report.pdf", storageKey: demoKey,
      sizeBytes: pdf.length, note: "Sample QC summary", uploadedById: labA.id,
      released: true, releasedAt: new Date(),
    },
  });
  await prisma.transaction.create({
    data: { txnNo: await ref("TXN", true), projectId: proj.id, quotedValue: 296000, feePercent: 3.5, feeAmount: 10360, status: "PENDING" },
  });
  await prisma.complaint.create({
    data: { ticketNo: await ref("CMP", true), projectId: proj.id, filedById: cust.id, subject: "Courier delay", details: "Sample pickup took 4 days vs promised 2.", status: "OPEN" },
  });
  await prisma.auditLog.createMany({
    data: [
      { actorId: labA.id, action: "QUOTE_SUBMITTED", entity: "Quote", entityId: q.id, meta: "RFQ-2602 · PKR 296,000" },
      { actorId: cust.id, action: "QUOTE_SELECTED", entity: "Quote", entityId: q.id, meta: "PRJ-1001 created" },
    ],
  });
  } // end if (!seeded)

  // keep the RFQ/PRJ counters ahead of any explicit seed refNos
  const maxRfq = await prisma.$queryRaw`SELECT MAX(CAST(SUBSTRING("refNo" FROM 5) AS INTEGER)) m FROM "Rfq"`;
  const maxPrj = await prisma.$queryRaw`SELECT MAX(CAST(SUBSTRING("refNo" FROM 5) AS INTEGER)) m FROM "Project"`;
  if (maxRfq[0]?.m) await prisma.refSequence.upsert({ where: { key: "RFQ" }, update: { last: maxRfq[0].m }, create: { key: "RFQ", last: maxRfq[0].m } });
  if (maxPrj[0]?.m) await prisma.refSequence.upsert({ where: { key: "PRJ" }, update: { last: maxPrj[0].m }, create: { key: "PRJ", last: maxPrj[0].m } });

  console.log("Seeded ✓");
  console.log("  admin@syntaxlife.pk / Admin@12345");
  console.log("  genomelab@pbg.pk / Lab@12345  (approved lab)");
  console.log("  ncgseq@pbg.pk / Lab@12345    (approved lab)");
  console.log("  pendinglab@pbg.pk / Lab@12345 (pending lab)");
  console.log("  biosupplies@pbg.pk / Sup@12345 (supplier)");
  console.log("  fatima@nibge.edu.pk / Cust@12345 (customer)");
}

main().then(main2).finally(() => prisma.$disconnect());

// ---- profiles & subscriptions (v2 additions) ----
async function main2() {
  const plans = { BASIC: 100, PRO: 300, CUSTOM: 500 };
  for (const [email, plan] of [["genomelab@pbg.pk", "PRO"], ["ncgseq@pbg.pk", "BASIC"], ["pendinglab@pbg.pk", "BASIC"], ["biosupplies@pbg.pk", "BASIC"]]) {
    const u = await prisma.user.findUnique({ where: { email } });
    if (!u) continue;
    await prisma.subscription.upsert({
      where: { userId: u.id },
      update: {},
      create: {
        userId: u.id, plan, priceUsd: plans[plan],
        status: email === "pendinglab@pbg.pk" ? "PENDING_PAYMENT" : "ACTIVE",
        startedAt: new Date(), expiresAt: new Date(Date.now() + 30 * 864e5),
      },
    });
  }
  for (const [email, orgName, orgType, city, dept, desg] of [
    ["fatima@nibge.edu.pk", "NIBGE — National Institute for Biotechnology & Genetic Engineering", "Research Institute", "Faisalabad", "Plant Genomics", "Principal Scientist"],
    ["omar@aku.edu", "Aga Khan University", "Hospital / Clinical", "Karachi", "Pathology", "Consultant"],
  ]) {
    const u = await prisma.user.findUnique({ where: { email } });
    if (!u) continue;
    await prisma.customerProfile.upsert({
      where: { userId: u.id },
      update: {},
      create: { orgNo: await ref("CUS"), userId: u.id, orgName, orgType, city, department: dept, designation: desg, status: "APPROVED", verifiedAt: new Date() },
    });
  }
  // ---- service listings (storefront) ----
  const genomelab = await prisma.providerProfile.findFirst({ where: { orgName: "GenomeLab Karachi" } });
  const ncg = await prisma.providerProfile.findFirst({ where: { orgName: "NCG Sequencing Lahore" } });
  if (genomelab && (await prisma.serviceListing.count({ where: { providerId: genomelab.id } })) === 0) {
    await prisma.serviceListing.createMany({
      data: [
        { svcNo: await ref("SVC"), providerId: genomelab.id, name: "WGS — 30× human genome", category: "WGS", platform: "Illumina NovaSeq X", priceFrom: 95000, unit: "/sample", turnaroundDays: 21, description: "30× coverage, alignment + variant calling, VCF + QC report." },
        { svcNo: await ref("SVC"), providerId: genomelab.id, name: "RNA-Seq — 20M reads", category: "RNA-Seq", platform: "Illumina NovaSeq X", priceFrom: 42000, unit: "/sample", turnaroundDays: 14, description: "Poly-A library, counts matrix + QC. DE analysis available as add-on." },
        { svcNo: await ref("SVC"), providerId: genomelab.id, name: "FFPE RNA-Seq", category: "RNA-Seq", platform: "Illumina NovaSeq X", priceFrom: 58000, priceVisibility: "MEMBERS", unit: "/sample", turnaroundDays: 18, description: "Exome-capture RNA workflow for degraded FFPE material." },
      ],
    });
  }
  if (ncg && (await prisma.serviceListing.count({ where: { providerId: ncg.id } })) === 0) {
    await prisma.serviceListing.createMany({
      data: [
        { svcNo: await ref("SVC"), providerId: ncg.id, name: "Plant WGS — long-read", category: "Long-read", platform: "PacBio Revio", priceFrom: 140000, priceVisibility: "MEMBERS", unit: "/sample", turnaroundDays: 28, description: "HiFi reads for complex plant genomes, assembly included." },
        { svcNo: await ref("SVC"), providerId: ncg.id, name: "Custom bioinformatics pipeline", category: "Bioinformatics", platform: "HPC cluster", priceVisibility: "QUOTE_ONLY", unit: "/project", turnaroundDays: 21, description: "Bespoke analysis — assembly, annotation, variant or DE pipelines scoped per project." },
        { svcNo: await ref("SVC"), providerId: ncg.id, name: "Oxford Nanopore WGS — microbial", category: "Long-read", platform: "ONT PromethION", priceFrom: 85000, unit: "/sample", turnaroundDays: 15, moderation: "PENDING", description: "Complete bacterial genome closure with plasmid detection." },
        { svcNo: await ref("SVC"), providerId: ncg.id, name: "Amplicon / metabarcoding", category: "Panels", platform: "Illumina MiSeq", priceFrom: 18000, unit: "/sample", turnaroundDays: 10, description: "16S/ITS metabarcoding with standard bioinformatics." },
      ],
    });
  }

  // ---- demo project: accepted + milestones + review ----
  const proj = await prisma.project.findUnique({ where: { refNo: "PRJ-1001" }, include: { milestones: true, review: true } });
  if (proj) {
    if (!proj.acceptedAt) {
      await prisma.project.update({ where: { id: proj.id }, data: { acceptedAt: new Date(), poNumber: "NIBGE-PO-1187" } });
    }
    if (proj.milestones.length === 0) {
      await prisma.milestone.createMany({
        data: [
          { projectId: proj.id, title: "Sample QC passed", amount: 74000, status: "PAID", paidAt: new Date() },
          { projectId: proj.id, title: "Library prep & sequencing", amount: 148000, status: "INVOICED" },
          { projectId: proj.id, title: "Analysis & final report", amount: 74000, status: "PLANNED" },
        ],
      });
    }
    if (!proj.review) {
      await prisma.review.create({
        data: { projectId: proj.id, customerId: proj.customerId, providerId: proj.providerId, rating: 5, comment: "Excellent communication and turnaround — QC report was thorough." },
      });
    }
    // SLA due date + lab internals (hidden from customer)
    if (!proj.dueAt) {
      await prisma.project.update({
        where: { id: proj.id },
        data: {
          dueAt: new Date(Date.now() + 12 * 864e5),
          internalId: "GLK-LIMS-4471",
          storageLoc: "-80°C Freezer 2, Rack B3",
          disposalAt: new Date(Date.now() + 180 * 864e5),
        },
      });
    }
    // in-lab stage ladder — project sits at LIBRARY_QC (mid workflow)
    if ((await prisma.workStage.count({ where: { projectId: proj.id } })) === 0) {
      const done = ["ACCESSIONING", "SAMPLE_QC", "LIBRARY_PREP"];
      const keys = ["ACCESSIONING", "SAMPLE_QC", "LIBRARY_PREP", "LIBRARY_QC", "SEQUENCING", "DATA_PROCESSING", "ANALYSIS", "REPORT_REVIEW"];
      await prisma.workStage.createMany({
        data: keys.map((key, i) => ({
          projectId: proj.id,
          key,
          sort: i,
          status: done.includes(key) ? "DONE" : key === "LIBRARY_QC" ? "ACTIVE" : "PENDING",
          operator: key === "SAMPLE_QC" ? "Ayesha K." : key === "LIBRARY_PREP" ? "Hamza R." : null,
          note: key === "ACCESSIONING" ? "24 FFPE blocks accessioned" : key === "LIBRARY_PREP" ? "KAPA HyperPrep, dual-indexed" : null,
          startedAt: new Date(Date.now() - (6 - i) * 864e5),
          doneAt: done.includes(key) ? new Date(Date.now() - (5 - i) * 864e5) : null,
        })),
      });
    }
    // QC records — sample QC passed; library QC flagged → live customer decision demo
    if ((await prisma.qcRecord.count({ where: { projectId: proj.id } })) === 0) {
      await prisma.qcRecord.createMany({
        data: [
          {
            projectId: proj.id, stage: "SAMPLE_QC", result: "PASS",
            concentration: 42.5, rin: null, ratio: 1.83, instrument: "Qubit 4 + Agilent 4200 TapeStation",
            note: "22/24 FFPE blocks passed DV200 ≥30%", decision: "PROCEED", decidedAt: new Date(Date.now() - 5 * 864e5),
          },
          {
            projectId: proj.id, stage: "LIBRARY_QC", result: "PARTIAL",
            concentration: 8.2, rin: null, ratio: null, instrument: "LabChip GX Touch",
            note: "2 libraries under 10nM — below cluster threshold. Proceed or remake?", decision: null,
          },
        ],
      });
    }
  }

  console.log("Profiles & subscriptions seeded ✓");
}
