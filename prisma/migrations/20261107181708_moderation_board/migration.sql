-- AlterTable
ALTER TABLE "Rfq" ADD COLUMN     "moderation" TEXT NOT NULL DEFAULT 'APPROVED',
ADD COLUMN     "moderationNote" TEXT,
ADD COLUMN     "visibility" TEXT NOT NULL DEFAULT 'ROUTED';

-- AlterTable
ALTER TABLE "ServiceListing" ADD COLUMN     "moderation" TEXT NOT NULL DEFAULT 'APPROVED',
ADD COLUMN     "moderationNote" TEXT;
