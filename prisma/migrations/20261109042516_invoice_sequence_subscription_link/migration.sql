/*
  Warnings:

  - You are about to drop the column `invoiceId` on the `Subscription` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Subscription" DROP CONSTRAINT "Subscription_invoiceId_fkey";

-- DropIndex
DROP INDEX "Invoice_subscriptionId_key";

-- AlterTable
ALTER TABLE "Subscription" DROP COLUMN "invoiceId",
ADD COLUMN     "planChangeRequestedAt" TIMESTAMP(3),
ADD COLUMN     "requestedPlan" TEXT;

-- CreateTable
CREATE TABLE "InvoiceSequence" (
    "year" INTEGER NOT NULL,
    "last" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "InvoiceSequence_pkey" PRIMARY KEY ("year")
);

-- CreateIndex
CREATE INDEX "Invoice_subscriptionId_idx" ON "Invoice"("subscriptionId");

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "Subscription"("id") ON DELETE SET NULL ON UPDATE CASCADE;
