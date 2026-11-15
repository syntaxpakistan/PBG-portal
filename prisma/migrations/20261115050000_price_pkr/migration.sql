ALTER TABLE "Subscription" RENAME COLUMN "priceUsd" TO "pricePkr";
ALTER TABLE "Subscription" ALTER COLUMN "pricePkr" SET DEFAULT 50000;
