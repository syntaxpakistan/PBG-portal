-- AlterTable
ALTER TABLE "Complaint" ADD COLUMN     "enquiryId" TEXT;

-- AddForeignKey
ALTER TABLE "Complaint" ADD CONSTRAINT "Complaint_enquiryId_fkey" FOREIGN KEY ("enquiryId") REFERENCES "Enquiry"("id") ON DELETE SET NULL ON UPDATE CASCADE;
