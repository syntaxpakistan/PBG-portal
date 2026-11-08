-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_TwoFactor" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "secret" TEXT NOT NULL,
    "backupCodes" TEXT NOT NULL,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "failedVerificationCount" INTEGER NOT NULL DEFAULT 0,
    "lockedUntil" DATETIME,
    "userId" TEXT NOT NULL,
    CONSTRAINT "TwoFactor_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_TwoFactor" ("backupCodes", "id", "secret", "userId") SELECT "backupCodes", "id", "secret", "userId" FROM "TwoFactor";
DROP TABLE "TwoFactor";
ALTER TABLE "new_TwoFactor" RENAME TO "TwoFactor";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
