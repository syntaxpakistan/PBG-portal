-- AlterEnum
ALTER TYPE "EnquiryStatus" ADD VALUE 'DELIVERED';

-- DropForeignKey
ALTER TABLE "EnquiryMessage" DROP CONSTRAINT "EnquiryMessage_authorId_fkey";

-- DropForeignKey
ALTER TABLE "EnquiryMessage" DROP CONSTRAINT "EnquiryMessage_enquiryId_fkey";

-- AlterTable
ALTER TABLE "EnquiryMessage" ADD COLUMN     "attachmentKey" TEXT,
ADD COLUMN     "attachmentName" TEXT,
ADD COLUMN     "kind" TEXT NOT NULL DEFAULT 'CHAT';

-- AddForeignKey
ALTER TABLE "EnquiryMessage" ADD CONSTRAINT "EnquiryMessage_enquiryId_fkey" FOREIGN KEY ("enquiryId") REFERENCES "Enquiry"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EnquiryMessage" ADD CONSTRAINT "EnquiryMessage_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
