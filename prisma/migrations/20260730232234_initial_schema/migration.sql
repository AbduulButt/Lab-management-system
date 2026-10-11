-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'RECEPTIONIST', 'TECHNICIAN');

-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE', 'OTHER');

-- CreateEnum
CREATE TYPE "AgeUnit" AS ENUM ('YEARS', 'MONTHS', 'DAYS');

-- CreateEnum
CREATE TYPE "RecordStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateEnum
CREATE TYPE "ReceiptStatus" AS ENUM ('PENDING', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "PatientTestStatus" AS ENUM ('PENDING', 'DRAFT', 'COMPLETED');

-- CreateEnum
CREATE TYPE "FieldInputType" AS ENUM ('NUMBER', 'TEXT', 'SELECT', 'TEXTAREA', 'CHECKBOX', 'POSITIVE_NEGATIVE');

-- CreateEnum
CREATE TYPE "AbnormalFlag" AS ENUM ('NORMAL', 'LOW', 'HIGH', 'ABNORMAL', 'NOT_CHECKED');

-- CreateEnum
CREATE TYPE "AuditAction" AS ENUM ('CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 'PRINT', 'GENERATE', 'ACTIVATE', 'DEACTIVATE');

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "full_name" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'RECEPTIONIST',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "last_login_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "token_hash" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_used_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "patients" (
    "id" UUID NOT NULL,
    "mr_number" BIGSERIAL NOT NULL,
    "full_name" TEXT NOT NULL,
    "father_or_husband_name" TEXT,
    "gender" "Gender" NOT NULL,
    "date_of_birth" DATE,
    "phone" TEXT,
    "cnic" TEXT,
    "address" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "patients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "doctors" (
    "id" UUID NOT NULL,
    "doctor_name" TEXT NOT NULL,
    "qualification" TEXT,
    "phone" TEXT,
    "address" TEXT,
    "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "doctors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tests" (
    "id" UUID NOT NULL,
    "test_code" TEXT NOT NULL,
    "test_name" TEXT NOT NULL,
    "short_name" TEXT,
    "description" TEXT,
    "sample_required" TEXT,
    "reporting_time" TEXT,
    "report_heading" TEXT,
    "price" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "created_by_id" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "test_sections" (
    "id" UUID NOT NULL,
    "test_id" UUID NOT NULL,
    "section_name" TEXT NOT NULL,
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "test_sections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "test_fields" (
    "id" UUID NOT NULL,
    "test_id" UUID NOT NULL,
    "section_id" UUID,
    "field_code" TEXT,
    "field_name" TEXT NOT NULL,
    "input_type" "FieldInputType" NOT NULL DEFAULT 'NUMBER',
    "unit" TEXT,
    "male_min" DECIMAL(12,4),
    "male_max" DECIMAL(12,4),
    "female_min" DECIMAL(12,4),
    "female_max" DECIMAL(12,4),
    "child_min" DECIMAL(12,4),
    "child_max" DECIMAL(12,4),
    "normal_text" TEXT,
    "default_value" TEXT,
    "options" JSONB,
    "is_required" BOOLEAN NOT NULL DEFAULT false,
    "auto_abnormal" BOOLEAN NOT NULL DEFAULT true,
    "show_on_report" BOOLEAN NOT NULL DEFAULT true,
    "show_in_entry" BOOLEAN NOT NULL DEFAULT true,
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "status" "RecordStatus" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "test_fields_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "receipts" (
    "id" UUID NOT NULL,
    "receipt_number" BIGSERIAL NOT NULL,
    "patient_id" UUID NOT NULL,
    "doctor_id" UUID,
    "doctor_name_snapshot" TEXT,
    "patient_name_snapshot" TEXT NOT NULL,
    "gender_snapshot" "Gender" NOT NULL,
    "age_value" INTEGER,
    "age_unit" "AgeUnit" NOT NULL DEFAULT 'YEARS',
    "phone_snapshot" TEXT,
    "cnic_snapshot" TEXT,
    "address_snapshot" TEXT,
    "father_or_husband_snapshot" TEXT,
    "specimen" TEXT,
    "collection_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "subtotal" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "discount_percent" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "discount_amount" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "additional_less" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "total_discount" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "net_amount" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "paid_amount" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "due_amount" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "report_status" "ReceiptStatus" NOT NULL DEFAULT 'PENDING',
    "collected_by_id" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "receipts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "patient_tests" (
    "id" UUID NOT NULL,
    "receipt_id" UUID NOT NULL,
    "test_id" UUID NOT NULL,
    "test_code_snapshot" TEXT NOT NULL,
    "test_name_snapshot" TEXT NOT NULL,
    "test_price_snapshot" DECIMAL(12,2) NOT NULL,
    "sample_required_snapshot" TEXT,
    "status" "PatientTestStatus" NOT NULL DEFAULT 'PENDING',
    "remarks" TEXT,
    "completed_by_id" UUID,
    "completed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "patient_tests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "test_results" (
    "id" UUID NOT NULL,
    "patient_test_id" UUID NOT NULL,
    "field_id" UUID NOT NULL,
    "field_name_snapshot" TEXT NOT NULL,
    "section_name_snapshot" TEXT,
    "result_value" TEXT,
    "unit_snapshot" TEXT,
    "reference_range_snapshot" TEXT,
    "abnormal_flag" "AbnormalFlag" NOT NULL DEFAULT 'NOT_CHECKED',
    "is_manually_overridden" BOOLEAN NOT NULL DEFAULT false,
    "remarks" TEXT,
    "entered_by_id" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "test_results_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "generated_reports" (
    "id" UUID NOT NULL,
    "receipt_id" UUID NOT NULL,
    "report_version" INTEGER NOT NULL DEFAULT 1,
    "file_name" TEXT NOT NULL,
    "file_path" TEXT NOT NULL,
    "file_size" BIGINT,
    "is_current" BOOLEAN NOT NULL DEFAULT true,
    "generated_by_id" UUID,
    "generated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "generated_reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "system_settings" (
    "id" UUID NOT NULL,
    "lab_name" TEXT NOT NULL,
    "logo_path" TEXT,
    "address" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "report_footer" TEXT,
    "receipt_prefix" TEXT NOT NULL DEFAULT 'REC',
    "mr_prefix" TEXT NOT NULL DEFAULT 'MR',
    "currency" TEXT NOT NULL DEFAULT 'PKR',
    "updated_by_id" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "system_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" UUID NOT NULL,
    "user_id" UUID,
    "action" "AuditAction" NOT NULL,
    "entity_type" TEXT NOT NULL,
    "entity_id" UUID,
    "old_values" JSONB,
    "new_values" JSONB,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE INDEX "users_role_idx" ON "users"("role");

-- CreateIndex
CREATE INDEX "users_is_active_idx" ON "users"("is_active");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_token_hash_key" ON "sessions"("token_hash");

-- CreateIndex
CREATE INDEX "sessions_user_id_idx" ON "sessions"("user_id");

-- CreateIndex
CREATE INDEX "sessions_expires_at_idx" ON "sessions"("expires_at");

-- CreateIndex
CREATE UNIQUE INDEX "patients_mr_number_key" ON "patients"("mr_number");

-- CreateIndex
CREATE INDEX "patients_full_name_idx" ON "patients"("full_name");

-- CreateIndex
CREATE INDEX "patients_phone_idx" ON "patients"("phone");

-- CreateIndex
CREATE INDEX "patients_cnic_idx" ON "patients"("cnic");

-- CreateIndex
CREATE INDEX "doctors_doctor_name_idx" ON "doctors"("doctor_name");

-- CreateIndex
CREATE INDEX "doctors_status_idx" ON "doctors"("status");

-- CreateIndex
CREATE UNIQUE INDEX "tests_test_code_key" ON "tests"("test_code");

-- CreateIndex
CREATE INDEX "tests_test_name_idx" ON "tests"("test_name");

-- CreateIndex
CREATE INDEX "tests_status_idx" ON "tests"("status");

-- CreateIndex
CREATE INDEX "tests_created_by_id_idx" ON "tests"("created_by_id");

-- CreateIndex
CREATE INDEX "test_sections_test_id_idx" ON "test_sections"("test_id");

-- CreateIndex
CREATE INDEX "test_sections_test_id_display_order_idx" ON "test_sections"("test_id", "display_order");

-- CreateIndex
CREATE INDEX "test_fields_test_id_idx" ON "test_fields"("test_id");

-- CreateIndex
CREATE INDEX "test_fields_section_id_idx" ON "test_fields"("section_id");

-- CreateIndex
CREATE INDEX "test_fields_test_id_display_order_idx" ON "test_fields"("test_id", "display_order");

-- CreateIndex
CREATE INDEX "test_fields_section_id_display_order_idx" ON "test_fields"("section_id", "display_order");

-- CreateIndex
CREATE UNIQUE INDEX "receipts_receipt_number_key" ON "receipts"("receipt_number");

-- CreateIndex
CREATE INDEX "receipts_patient_id_idx" ON "receipts"("patient_id");

-- CreateIndex
CREATE INDEX "receipts_doctor_id_idx" ON "receipts"("doctor_id");

-- CreateIndex
CREATE INDEX "receipts_report_status_idx" ON "receipts"("report_status");

-- CreateIndex
CREATE INDEX "receipts_collection_date_idx" ON "receipts"("collection_date");

-- CreateIndex
CREATE INDEX "receipts_collected_by_id_idx" ON "receipts"("collected_by_id");

-- CreateIndex
CREATE INDEX "patient_tests_receipt_id_idx" ON "patient_tests"("receipt_id");

-- CreateIndex
CREATE INDEX "patient_tests_test_id_idx" ON "patient_tests"("test_id");

-- CreateIndex
CREATE INDEX "patient_tests_status_idx" ON "patient_tests"("status");

-- CreateIndex
CREATE INDEX "patient_tests_completed_by_id_idx" ON "patient_tests"("completed_by_id");

-- CreateIndex
CREATE UNIQUE INDEX "patient_tests_receipt_id_test_id_key" ON "patient_tests"("receipt_id", "test_id");

-- CreateIndex
CREATE INDEX "test_results_patient_test_id_idx" ON "test_results"("patient_test_id");

-- CreateIndex
CREATE INDEX "test_results_field_id_idx" ON "test_results"("field_id");

-- CreateIndex
CREATE INDEX "test_results_abnormal_flag_idx" ON "test_results"("abnormal_flag");

-- CreateIndex
CREATE INDEX "test_results_entered_by_id_idx" ON "test_results"("entered_by_id");

-- CreateIndex
CREATE UNIQUE INDEX "test_results_patient_test_id_field_id_key" ON "test_results"("patient_test_id", "field_id");

-- CreateIndex
CREATE INDEX "generated_reports_receipt_id_idx" ON "generated_reports"("receipt_id");

-- CreateIndex
CREATE INDEX "generated_reports_is_current_idx" ON "generated_reports"("is_current");

-- CreateIndex
CREATE INDEX "generated_reports_generated_by_id_idx" ON "generated_reports"("generated_by_id");

-- CreateIndex
CREATE UNIQUE INDEX "generated_reports_receipt_id_report_version_key" ON "generated_reports"("receipt_id", "report_version");

-- CreateIndex
CREATE INDEX "system_settings_updated_by_id_idx" ON "system_settings"("updated_by_id");

-- CreateIndex
CREATE INDEX "audit_logs_user_id_idx" ON "audit_logs"("user_id");

-- CreateIndex
CREATE INDEX "audit_logs_entity_type_idx" ON "audit_logs"("entity_type");

-- CreateIndex
CREATE INDEX "audit_logs_entity_id_idx" ON "audit_logs"("entity_id");

-- CreateIndex
CREATE INDEX "audit_logs_created_at_idx" ON "audit_logs"("created_at");

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tests" ADD CONSTRAINT "tests_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "test_sections" ADD CONSTRAINT "test_sections_test_id_fkey" FOREIGN KEY ("test_id") REFERENCES "tests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "test_fields" ADD CONSTRAINT "test_fields_test_id_fkey" FOREIGN KEY ("test_id") REFERENCES "tests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "test_fields" ADD CONSTRAINT "test_fields_section_id_fkey" FOREIGN KEY ("section_id") REFERENCES "test_sections"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "receipts" ADD CONSTRAINT "receipts_patient_id_fkey" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "receipts" ADD CONSTRAINT "receipts_doctor_id_fkey" FOREIGN KEY ("doctor_id") REFERENCES "doctors"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "receipts" ADD CONSTRAINT "receipts_collected_by_id_fkey" FOREIGN KEY ("collected_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "patient_tests" ADD CONSTRAINT "patient_tests_receipt_id_fkey" FOREIGN KEY ("receipt_id") REFERENCES "receipts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "patient_tests" ADD CONSTRAINT "patient_tests_test_id_fkey" FOREIGN KEY ("test_id") REFERENCES "tests"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "patient_tests" ADD CONSTRAINT "patient_tests_completed_by_id_fkey" FOREIGN KEY ("completed_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "test_results" ADD CONSTRAINT "test_results_patient_test_id_fkey" FOREIGN KEY ("patient_test_id") REFERENCES "patient_tests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "test_results" ADD CONSTRAINT "test_results_field_id_fkey" FOREIGN KEY ("field_id") REFERENCES "test_fields"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "test_results" ADD CONSTRAINT "test_results_entered_by_id_fkey" FOREIGN KEY ("entered_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "generated_reports" ADD CONSTRAINT "generated_reports_receipt_id_fkey" FOREIGN KEY ("receipt_id") REFERENCES "receipts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "generated_reports" ADD CONSTRAINT "generated_reports_generated_by_id_fkey" FOREIGN KEY ("generated_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "system_settings" ADD CONSTRAINT "system_settings_updated_by_id_fkey" FOREIGN KEY ("updated_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
