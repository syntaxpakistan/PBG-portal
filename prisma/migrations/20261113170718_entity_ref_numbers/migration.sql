-- Entity reference numbers: human-readable IDs for every business entity.
-- Adds columns nullable, backfills existing rows in createdAt order, then enforces NOT NULL + unique.
-- Also creates RefSequence — the atomic counter that makes concurrent creates collision-proof.

-- CreateTable
CREATE TABLE "RefSequence" (
    "key" TEXT NOT NULL,
    "last" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "RefSequence_pkey" PRIMARY KEY ("key")
);

-- AlterTable (nullable first — backfill below)
ALTER TABLE "Complaint" ADD COLUMN "ticketNo" TEXT;
ALTER TABLE "CustomerProfile" ADD COLUMN "orgNo" TEXT;
ALTER TABLE "Enquiry" ADD COLUMN "enquiryNo" TEXT;
ALTER TABLE "Lead" ADD COLUMN "leadNo" TEXT;
ALTER TABLE "Payment" ADD COLUMN "paymentNo" TEXT;
ALTER TABLE "Payout" ADD COLUMN "payoutNo" TEXT;
ALTER TABLE "Product" ADD COLUMN "prodNo" TEXT;
ALTER TABLE "ProviderProfile" ADD COLUMN "orgNo" TEXT;
ALTER TABLE "Quote" ADD COLUMN "quoteNo" TEXT;
ALTER TABLE "ServiceListing" ADD COLUMN "svcNo" TEXT;
ALTER TABLE "SupplierProfile" ADD COLUMN "orgNo" TEXT;
ALTER TABLE "Transaction" ADD COLUMN "txnNo" TEXT;

-- ---------- backfill: org + catalog refs (PREFIX-NNNN, ordered by createdAt) ----------

WITH seq AS (SELECT id, ROW_NUMBER() OVER (ORDER BY "createdAt", id) rn FROM "ProviderProfile")
UPDATE "ProviderProfile" t SET "orgNo" = 'LAB-' || LPAD(seq.rn::text, 4, '0') FROM seq WHERE t.id = seq.id;

WITH seq AS (SELECT id, ROW_NUMBER() OVER (ORDER BY "createdAt", id) rn FROM "SupplierProfile")
UPDATE "SupplierProfile" t SET "orgNo" = 'SUP-' || LPAD(seq.rn::text, 4, '0') FROM seq WHERE t.id = seq.id;

WITH seq AS (SELECT id, ROW_NUMBER() OVER (ORDER BY "createdAt", id) rn FROM "CustomerProfile")
UPDATE "CustomerProfile" t SET "orgNo" = 'CUS-' || LPAD(seq.rn::text, 4, '0') FROM seq WHERE t.id = seq.id;

WITH seq AS (SELECT id, ROW_NUMBER() OVER (ORDER BY "createdAt", id) rn FROM "ServiceListing")
UPDATE "ServiceListing" t SET "svcNo" = 'SVC-' || LPAD(seq.rn::text, 4, '0') FROM seq WHERE t.id = seq.id;

WITH seq AS (SELECT id, ROW_NUMBER() OVER (ORDER BY "createdAt", id) rn FROM "Product")
UPDATE "Product" t SET "prodNo" = 'PRD-' || LPAD(seq.rn::text, 4, '0') FROM seq WHERE t.id = seq.id;

WITH seq AS (SELECT id, ROW_NUMBER() OVER (ORDER BY "createdAt", id) rn FROM "Lead")
UPDATE "Lead" t SET "leadNo" = 'LED-' || LPAD(seq.rn::text, 4, '0') FROM seq WHERE t.id = seq.id;

-- ---------- backfill: year-based document refs (PREFIX-YYYY-NNNN, per-year ordering) ----------

WITH seq AS (SELECT id, "createdAt", ROW_NUMBER() OVER (PARTITION BY EXTRACT(YEAR FROM "createdAt") ORDER BY "createdAt", id) rn FROM "Complaint")
UPDATE "Complaint" t SET "ticketNo" = 'CMP-' || EXTRACT(YEAR FROM seq."createdAt")::int || '-' || LPAD(seq.rn::text, 4, '0') FROM seq WHERE t.id = seq.id;

WITH seq AS (SELECT id, "createdAt", ROW_NUMBER() OVER (PARTITION BY EXTRACT(YEAR FROM "createdAt") ORDER BY "createdAt", id) rn FROM "Quote")
UPDATE "Quote" t SET "quoteNo" = 'QO-' || EXTRACT(YEAR FROM seq."createdAt")::int || '-' || LPAD(seq.rn::text, 4, '0') FROM seq WHERE t.id = seq.id;

WITH seq AS (SELECT id, "createdAt", ROW_NUMBER() OVER (PARTITION BY EXTRACT(YEAR FROM "createdAt") ORDER BY "createdAt", id) rn FROM "Enquiry")
UPDATE "Enquiry" t SET "enquiryNo" = 'ENQ-' || EXTRACT(YEAR FROM seq."createdAt")::int || '-' || LPAD(seq.rn::text, 4, '0') FROM seq WHERE t.id = seq.id;

WITH seq AS (SELECT id, "createdAt", ROW_NUMBER() OVER (PARTITION BY EXTRACT(YEAR FROM "createdAt") ORDER BY "createdAt", id) rn FROM "Transaction")
UPDATE "Transaction" t SET "txnNo" = 'TXN-' || EXTRACT(YEAR FROM seq."createdAt")::int || '-' || LPAD(seq.rn::text, 4, '0') FROM seq WHERE t.id = seq.id;

WITH seq AS (SELECT id, "createdAt", ROW_NUMBER() OVER (PARTITION BY EXTRACT(YEAR FROM "createdAt") ORDER BY "createdAt", id) rn FROM "Payment")
UPDATE "Payment" t SET "paymentNo" = 'PAY-' || EXTRACT(YEAR FROM seq."createdAt")::int || '-' || LPAD(seq.rn::text, 4, '0') FROM seq WHERE t.id = seq.id;

WITH seq AS (SELECT id, "createdAt", ROW_NUMBER() OVER (PARTITION BY EXTRACT(YEAR FROM "createdAt") ORDER BY "createdAt", id) rn FROM "Payout")
UPDATE "Payout" t SET "payoutNo" = 'PO-' || EXTRACT(YEAR FROM seq."createdAt")::int || '-' || LPAD(seq.rn::text, 4, '0') FROM seq WHERE t.id = seq.id;

-- ---------- enforce NOT NULL ----------

ALTER TABLE "Complaint" ALTER COLUMN "ticketNo" SET NOT NULL;
ALTER TABLE "CustomerProfile" ALTER COLUMN "orgNo" SET NOT NULL;
ALTER TABLE "Enquiry" ALTER COLUMN "enquiryNo" SET NOT NULL;
ALTER TABLE "Lead" ALTER COLUMN "leadNo" SET NOT NULL;
ALTER TABLE "Payment" ALTER COLUMN "paymentNo" SET NOT NULL;
ALTER TABLE "Payout" ALTER COLUMN "payoutNo" SET NOT NULL;
ALTER TABLE "Product" ALTER COLUMN "prodNo" SET NOT NULL;
ALTER TABLE "ProviderProfile" ALTER COLUMN "orgNo" SET NOT NULL;
ALTER TABLE "Quote" ALTER COLUMN "quoteNo" SET NOT NULL;
ALTER TABLE "ServiceListing" ALTER COLUMN "svcNo" SET NOT NULL;
ALTER TABLE "SupplierProfile" ALTER COLUMN "orgNo" SET NOT NULL;
ALTER TABLE "Transaction" ALTER COLUMN "txnNo" SET NOT NULL;

-- ---------- seed the sequence counters ----------
-- plain-prefix keys continue from the assigned max; RFQ/PRJ continue from existing refNos.

INSERT INTO "RefSequence" ("key", "last") VALUES
  ('LAB', (SELECT COUNT(*) FROM "ProviderProfile")),
  ('SUP', (SELECT COUNT(*) FROM "SupplierProfile")),
  ('CUS', (SELECT COUNT(*) FROM "CustomerProfile")),
  ('SVC', (SELECT COUNT(*) FROM "ServiceListing")),
  ('PRD', (SELECT COUNT(*) FROM "Product")),
  ('LED', (SELECT COUNT(*) FROM "Lead")),
  ('RFQ', COALESCE((SELECT MAX(CAST(SUBSTRING("refNo" FROM 5) AS INTEGER)) FROM "Rfq"), 2600)),
  ('PRJ', COALESCE((SELECT MAX(CAST(SUBSTRING("refNo" FROM 5) AS INTEGER)) FROM "Project"), 1000));

INSERT INTO "RefSequence" ("key", "last")
SELECT 'CMP-' || y, MAX(rn) FROM (
  SELECT EXTRACT(YEAR FROM "createdAt")::int y, ROW_NUMBER() OVER (PARTITION BY EXTRACT(YEAR FROM "createdAt") ORDER BY "createdAt", id) rn FROM "Complaint"
) s GROUP BY y;
INSERT INTO "RefSequence" ("key", "last")
SELECT 'QO-' || y, MAX(rn) FROM (
  SELECT EXTRACT(YEAR FROM "createdAt")::int y, ROW_NUMBER() OVER (PARTITION BY EXTRACT(YEAR FROM "createdAt") ORDER BY "createdAt", id) rn FROM "Quote"
) s GROUP BY y;
INSERT INTO "RefSequence" ("key", "last")
SELECT 'ENQ-' || y, MAX(rn) FROM (
  SELECT EXTRACT(YEAR FROM "createdAt")::int y, ROW_NUMBER() OVER (PARTITION BY EXTRACT(YEAR FROM "createdAt") ORDER BY "createdAt", id) rn FROM "Enquiry"
) s GROUP BY y;
INSERT INTO "RefSequence" ("key", "last")
SELECT 'TXN-' || y, MAX(rn) FROM (
  SELECT EXTRACT(YEAR FROM "createdAt")::int y, ROW_NUMBER() OVER (PARTITION BY EXTRACT(YEAR FROM "createdAt") ORDER BY "createdAt", id) rn FROM "Transaction"
) s GROUP BY y;
INSERT INTO "RefSequence" ("key", "last")
SELECT 'PAY-' || y, MAX(rn) FROM (
  SELECT EXTRACT(YEAR FROM "createdAt")::int y, ROW_NUMBER() OVER (PARTITION BY EXTRACT(YEAR FROM "createdAt") ORDER BY "createdAt", id) rn FROM "Payment"
) s GROUP BY y;
INSERT INTO "RefSequence" ("key", "last")
SELECT 'PO-' || y, MAX(rn) FROM (
  SELECT EXTRACT(YEAR FROM "createdAt")::int y, ROW_NUMBER() OVER (PARTITION BY EXTRACT(YEAR FROM "createdAt") ORDER BY "createdAt", id) rn FROM "Payout"
) s GROUP BY y;

-- ---------- unique indexes ----------

CREATE UNIQUE INDEX "Complaint_ticketNo_key" ON "Complaint"("ticketNo");
CREATE UNIQUE INDEX "CustomerProfile_orgNo_key" ON "CustomerProfile"("orgNo");
CREATE UNIQUE INDEX "Enquiry_enquiryNo_key" ON "Enquiry"("enquiryNo");
CREATE UNIQUE INDEX "Lead_leadNo_key" ON "Lead"("leadNo");
CREATE UNIQUE INDEX "Payment_paymentNo_key" ON "Payment"("paymentNo");
CREATE UNIQUE INDEX "Payout_payoutNo_key" ON "Payout"("payoutNo");
CREATE UNIQUE INDEX "Product_prodNo_key" ON "Product"("prodNo");
CREATE UNIQUE INDEX "ProviderProfile_orgNo_key" ON "ProviderProfile"("orgNo");
CREATE UNIQUE INDEX "Quote_quoteNo_key" ON "Quote"("quoteNo");
CREATE UNIQUE INDEX "ServiceListing_svcNo_key" ON "ServiceListing"("svcNo");
CREATE UNIQUE INDEX "SupplierProfile_orgNo_key" ON "SupplierProfile"("orgNo");
CREATE UNIQUE INDEX "Transaction_txnNo_key" ON "Transaction"("txnNo");
