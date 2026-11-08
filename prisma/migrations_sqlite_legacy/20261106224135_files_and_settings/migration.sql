-- AlterTable
ALTER TABLE "Message" ADD COLUMN "attachmentKey" TEXT;

-- AlterTable
ALTER TABLE "ResultFile" ADD COLUMN "storageKey" TEXT;

-- AlterTable
ALTER TABLE "Rfq" ADD COLUMN "attachmentKey" TEXT;

-- CreateTable
CREATE TABLE "PlatformSetting" (
    "key" TEXT NOT NULL PRIMARY KEY,
    "value" TEXT NOT NULL,
    "updatedAt" DATETIME NOT NULL
);
