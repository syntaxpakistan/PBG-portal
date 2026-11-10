-- CreateEnum
CREATE TYPE "LeadType" AS ENUM ('QUOTE', 'CONTACT');

-- CreateTable
CREATE TABLE "Lead" (
    "id" TEXT NOT NULL,
    "type" "LeadType" NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT,
    "org" TEXT,
    "email" TEXT NOT NULL,
    "interest" TEXT,
    "message" TEXT,
    "handled" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Lead_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Lead_type_handled_idx" ON "Lead"("type", "handled");

-- CreateIndex
CREATE INDEX "Lead_createdAt_idx" ON "Lead"("createdAt");

