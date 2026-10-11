-- CreateEnum
CREATE TYPE "ReferenceType" AS ENUM ('SELF', 'DOCTOR', 'COMPANY', 'OTHER');

-- CreateEnum
CREATE TYPE "SpecimenSource" AS ENUM ('TAKEN_IN_LAB', 'RECEIVED_FROM_OUTSIDE');

-- AlterTable
ALTER TABLE "patient_tests" ADD COLUMN     "carry_out_date" TIMESTAMP(3),
ADD COLUMN     "expected_report_date" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "receipts" ADD COLUMN     "company_name_snapshot" TEXT,
ADD COLUMN     "reference_type" "ReferenceType" NOT NULL DEFAULT 'SELF',
ADD COLUMN     "specimen_source" "SpecimenSource" NOT NULL DEFAULT 'TAKEN_IN_LAB';
