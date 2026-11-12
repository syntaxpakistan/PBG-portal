-- AlterTable
ALTER TABLE "CustomerProfile" ADD COLUMN     "status" "VerificationStatus" NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "statusNote" TEXT,
ADD COLUMN     "verifiedAt" TIMESTAMP(3);
