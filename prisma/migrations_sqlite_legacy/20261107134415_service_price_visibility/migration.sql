-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ServiceListing" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "providerId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "platform" TEXT,
    "description" TEXT,
    "priceFrom" REAL,
    "unit" TEXT,
    "priceVisibility" TEXT NOT NULL DEFAULT 'PUBLIC',
    "turnaroundDays" INTEGER,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ServiceListing_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "ProviderProfile" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_ServiceListing" ("active", "category", "createdAt", "description", "id", "name", "platform", "priceFrom", "providerId", "turnaroundDays", "unit") SELECT "active", "category", "createdAt", "description", "id", "name", "platform", "priceFrom", "providerId", "turnaroundDays", "unit" FROM "ServiceListing";
DROP TABLE "ServiceListing";
ALTER TABLE "new_ServiceListing" RENAME TO "ServiceListing";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
