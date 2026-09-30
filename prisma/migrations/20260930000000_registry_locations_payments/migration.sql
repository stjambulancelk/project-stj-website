-- Registry (patients, locations), invoice pickup/drop + billing snapshot,
-- payment source + refunds, partial statuses.
-- ADDITIVE ONLY: no drops, renames or type changes. Every statement is guarded
-- (IF NOT EXISTS / duplicate_object) so a re-run or partial apply is safe.

-- CreateEnum
DO $$ BEGIN
    CREATE TYPE "LocationType" AS ENUM ('HOSPITAL', 'HOME', 'OFFICE', 'AIRPORT', 'HARBOUR', 'OTHER');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- CreateEnum
DO $$ BEGIN
    CREATE TYPE "PaymentSource" AS ENUM ('PAYHERE', 'CASH', 'BANK_TRANSFER', 'CHEQUE', 'OTHER');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- AlterEnum (IF NOT EXISTS — safe to re-run; PG 12+)
ALTER TYPE "InvoiceStatus" ADD VALUE IF NOT EXISTS 'PARTIALLY_PAID';
ALTER TYPE "InvoiceStatus" ADD VALUE IF NOT EXISTS 'PARTIALLY_REFUNDED';

-- AlterTable
ALTER TABLE "Customer" ADD COLUMN IF NOT EXISTS "isActive" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "Invoice" ADD COLUMN IF NOT EXISTS "billingAddress" TEXT,
ADD COLUMN IF NOT EXISTS "dropAddress" TEXT,
ADD COLUMN IF NOT EXISTS "dropLocationId" TEXT,
ADD COLUMN IF NOT EXISTS "dropMapsUrl" TEXT,
ADD COLUMN IF NOT EXISTS "dropName" TEXT,
ADD COLUMN IF NOT EXISTS "dropType" "LocationType",
ADD COLUMN IF NOT EXISTS "patientId" TEXT,
ADD COLUMN IF NOT EXISTS "pickupAddress" TEXT,
ADD COLUMN IF NOT EXISTS "pickupLocationId" TEXT,
ADD COLUMN IF NOT EXISTS "pickupMapsUrl" TEXT,
ADD COLUMN IF NOT EXISTS "pickupName" TEXT,
ADD COLUMN IF NOT EXISTS "pickupType" "LocationType";

-- AlterTable
ALTER TABLE "Payment" ADD COLUMN IF NOT EXISTS "note" TEXT,
ADD COLUMN IF NOT EXISTS "recordedBy" TEXT,
ADD COLUMN IF NOT EXISTS "reference" TEXT,
ADD COLUMN IF NOT EXISTS "refundedAmount" DECIMAL(10,2) NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS "source" "PaymentSource" NOT NULL DEFAULT 'PAYHERE';

-- CreateTable
CREATE TABLE IF NOT EXISTS "Patient" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "nic" TEXT,
    "phone" TEXT,
    "dateOfBirth" TIMESTAMP(3),
    "gender" TEXT,
    "notes" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Patient_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "Location" (
    "id" TEXT NOT NULL,
    "type" "LocationType" NOT NULL DEFAULT 'OTHER',
    "name" TEXT NOT NULL,
    "address" TEXT,
    "city" TEXT,
    "phone" TEXT,
    "mapsUrl" TEXT,
    "notes" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Location_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "Refund" (
    "id" TEXT NOT NULL,
    "paymentId" TEXT NOT NULL,
    "invoiceId" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "reason" TEXT NOT NULL,
    "method" "PaymentSource" NOT NULL,
    "reference" TEXT,
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Refund_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Patient_nic_idx" ON "Patient"("nic");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Patient_name_idx" ON "Patient"("name");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Location_type_idx" ON "Location"("type");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Location_name_idx" ON "Location"("name");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Refund_invoiceId_idx" ON "Refund"("invoiceId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Refund_paymentId_idx" ON "Refund"("paymentId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Customer_name_idx" ON "Customer"("name");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "Invoice_patientId_idx" ON "Invoice"("patientId");

-- AddForeignKey
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Invoice_patientId_fkey' AND connamespace = current_schema()::regnamespace) THEN
        ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;

-- AddForeignKey
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Invoice_pickupLocationId_fkey' AND connamespace = current_schema()::regnamespace) THEN
        ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_pickupLocationId_fkey" FOREIGN KEY ("pickupLocationId") REFERENCES "Location"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;

-- AddForeignKey
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Invoice_dropLocationId_fkey' AND connamespace = current_schema()::regnamespace) THEN
        ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_dropLocationId_fkey" FOREIGN KEY ("dropLocationId") REFERENCES "Location"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;

-- AddForeignKey
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Refund_paymentId_fkey' AND connamespace = current_schema()::regnamespace) THEN
        ALTER TABLE "Refund" ADD CONSTRAINT "Refund_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "Payment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;
END $$;

-- AddForeignKey
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Refund_invoiceId_fkey' AND connamespace = current_schema()::regnamespace) THEN
        ALTER TABLE "Refund" ADD CONSTRAINT "Refund_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;
END $$;


-- Backfill: payments refunded before this migration were marked REFUNDED with no amount.
-- Only touches rows still at the default 0, so re-running is a no-op.
UPDATE "Payment" SET "refundedAmount" = "amount" WHERE "status" = 'REFUNDED' AND "refundedAmount" = 0;
