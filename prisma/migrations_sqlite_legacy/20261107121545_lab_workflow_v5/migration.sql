-- AlterTable
ALTER TABLE "Project" ADD COLUMN "disposalAt" DATETIME;
ALTER TABLE "Project" ADD COLUMN "internalId" TEXT;
ALTER TABLE "Project" ADD COLUMN "pauseReason" TEXT;
ALTER TABLE "Project" ADD COLUMN "pausedAt" DATETIME;
ALTER TABLE "Project" ADD COLUMN "pausedFor" TEXT;
ALTER TABLE "Project" ADD COLUMN "storageLoc" TEXT;

-- AlterTable
ALTER TABLE "Quote" ADD COLUMN "estTurnaround" INTEGER;

-- CreateTable
CREATE TABLE "WorkStage" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "sort" INTEGER NOT NULL,
    "operator" TEXT,
    "note" TEXT,
    "startedAt" DATETIME,
    "doneAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "WorkStage_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "QcRecord" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "projectId" TEXT NOT NULL,
    "stage" TEXT NOT NULL,
    "result" TEXT NOT NULL,
    "concentration" REAL,
    "rin" REAL,
    "ratio" REAL,
    "instrument" TEXT,
    "note" TEXT,
    "decision" TEXT,
    "decidedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "QcRecord_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ResultFile" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "storageKey" TEXT,
    "projectId" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "sizeBytes" INTEGER NOT NULL,
    "note" TEXT,
    "version" INTEGER NOT NULL DEFAULT 1,
    "released" BOOLEAN NOT NULL DEFAULT false,
    "releasedAt" DATETIME,
    "uploadedById" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ResultFile_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ResultFile_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_ResultFile" ("createdAt", "filename", "id", "note", "projectId", "sizeBytes", "storageKey", "uploadedById") SELECT "createdAt", "filename", "id", "note", "projectId", "sizeBytes", "storageKey", "uploadedById" FROM "ResultFile";
DROP TABLE "ResultFile";
ALTER TABLE "new_ResultFile" RENAME TO "ResultFile";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "WorkStage_projectId_key_key" ON "WorkStage"("projectId", "key");
