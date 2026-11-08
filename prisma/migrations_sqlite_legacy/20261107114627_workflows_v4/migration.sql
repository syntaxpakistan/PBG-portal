-- AlterTable
ALTER TABLE "Enquiry" ADD COLUMN "leadTimeDays" INTEGER;
ALTER TABLE "Enquiry" ADD COLUMN "quotedPrice" REAL;
ALTER TABLE "Enquiry" ADD COLUMN "reply" TEXT;

-- AlterTable
ALTER TABLE "Project" ADD COLUMN "dueAt" DATETIME;
ALTER TABLE "Project" ADD COLUMN "sampleQc" TEXT;
ALTER TABLE "Project" ADD COLUMN "sampleQcNote" TEXT;
ALTER TABLE "Project" ADD COLUMN "shipmentCourier" TEXT;
ALTER TABLE "Project" ADD COLUMN "shippedAt" DATETIME;
ALTER TABLE "Project" ADD COLUMN "trackingNo" TEXT;

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "href" TEXT,
    "readAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Product" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "supplierId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "spec" TEXT,
    "catalogNo" TEXT,
    "price" REAL,
    "unit" TEXT,
    "stockStatus" TEXT NOT NULL DEFAULT 'IN_STOCK',
    "leadTimeDays" INTEGER,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Product_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "SupplierProfile" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Product" ("active", "category", "createdAt", "id", "name", "price", "spec", "supplierId", "unit") SELECT "active", "category", "createdAt", "id", "name", "price", "spec", "supplierId", "unit" FROM "Product";
DROP TABLE "Product";
ALTER TABLE "new_Product" RENAME TO "Product";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
