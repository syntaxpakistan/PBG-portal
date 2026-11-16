ALTER TABLE "Product"
ADD COLUMN "description" TEXT,
ADD COLUMN "brand" TEXT,
ADD COLUMN "imageKey" TEXT,
ADD COLUMN "datasheetKey" TEXT,
ADD COLUMN "moderation" TEXT NOT NULL DEFAULT 'PENDING',
ADD COLUMN "moderationNote" TEXT;

-- existing listings were live before moderation existed — grandfather them in
UPDATE "Product" SET "moderation" = 'APPROVED';

ALTER TABLE "Enquiry"
ADD COLUMN "quoteFileKey" TEXT,
ADD COLUMN "declineReason" TEXT,
ADD COLUMN "courier" TEXT,
ADD COLUMN "trackingNo" TEXT;

CREATE TABLE "EnquiryMessage" (
  "id" TEXT NOT NULL,
  "enquiryId" TEXT NOT NULL,
  "authorId" TEXT NOT NULL,
  "body" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "EnquiryMessage_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "EnquiryMessage_enquiryId_fkey" FOREIGN KEY ("enquiryId") REFERENCES "Enquiry"("id") ON DELETE CASCADE,
  CONSTRAINT "EnquiryMessage_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id")
);

CREATE INDEX "EnquiryMessage_enquiryId_createdAt_idx" ON "EnquiryMessage"("enquiryId", "createdAt");
