-- Analytics add-on: optional paid feature unlock outside the plan
ALTER TABLE "Invoice" ADD COLUMN "addOnId" TEXT;

CREATE TABLE "AddOn" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "pricePkr" DOUBLE PRECISION NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING_PAYMENT',
    "startedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AddOn_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Invoice_addOnId_key" ON "Invoice"("addOnId");
CREATE INDEX "AddOn_userId_kind_idx" ON "AddOn"("userId", "kind");

ALTER TABLE "AddOn" ADD CONSTRAINT "AddOn_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_addOnId_fkey" FOREIGN KEY ("addOnId") REFERENCES "AddOn"("id") ON DELETE SET NULL ON UPDATE CASCADE;
