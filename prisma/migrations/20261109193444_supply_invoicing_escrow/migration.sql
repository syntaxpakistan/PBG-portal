-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "EnquiryStatus" ADD VALUE 'INVOICED';
ALTER TYPE "EnquiryStatus" ADD VALUE 'PAID';

-- AlterTable
ALTER TABLE "Invoice" ADD COLUMN     "enquiryId" TEXT;

-- AlterTable
ALTER TABLE "Transaction" ADD COLUMN     "enquiryId" TEXT,
ALTER COLUMN "projectId" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Invoice_enquiryId_key" ON "Invoice"("enquiryId");

-- CreateIndex
CREATE UNIQUE INDEX "Transaction_enquiryId_key" ON "Transaction"("enquiryId");

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_enquiryId_fkey" FOREIGN KEY ("enquiryId") REFERENCES "Enquiry"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_enquiryId_fkey" FOREIGN KEY ("enquiryId") REFERENCES "Enquiry"("id") ON DELETE SET NULL ON UPDATE CASCADE;

