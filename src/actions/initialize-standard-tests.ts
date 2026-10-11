"use server";

import { Prisma, RecordStatus } from "@/generated/prisma/client";
import { revalidatePath } from "next/cache";

import { attachPredefinedTemplateToTest } from "@/actions/predefined-template-actions";
import { requireAdmin } from "@/lib/auth/authorization";
import { prisma } from "@/lib/prisma";

export type InitializeStandardTestsState = {
  success: boolean;
  message: string;
  created: number;
  existing: number;
  templatesAttached: number;
  failed: number;
};

const STANDARD_TESTS = [
  { testCode: "CBC", testName: "COMPLETE BLOOD EXAMINATION", shortName: "CBC" },
  { testCode: "CRP", testName: "CRP (HIGH SENSITIVITY)", shortName: "CRP" },
  { testCode: "TSH", testName: "TSH (THYROID STIMULATING HORMONE)", shortName: "TSH" },
  { testCode: "ANTI HCV", testName: "ANTI HCV (SCREENING)", shortName: "Anti HCV" },
  { testCode: "HBSAG", testName: "HBSAG (SCREENING)", shortName: "HBsAg" },
  { testCode: "ESR", testName: "ESR", shortName: "ESR" },
  { testCode: "HBA1C", testName: "HBA1C (GLYCOSYLATED HAEMOGLOBIN)", shortName: "HbA1C" },
  { testCode: "URIC ACID", testName: "URIC ACID", shortName: "Uric Acid" },
  { testCode: "RFT", testName: "RFT / RENAL FUNCTION", shortName: "RFT" },
  { testCode: "SERUM ELECTROLYTES", testName: "SERUM ELECTROLYTES (NA, K, CL, HCO3)", shortName: "Electrolytes" },
  { testCode: "LFT", testName: "LFT / LIVER FUNCTION TESTS", shortName: "LFT" },
  { testCode: "H PYLORI", testName: "H. PYLORI", shortName: "H. Pylori" },
  { testCode: "LIPID PROFILE", testName: "LIPID PROFILE", shortName: "Lipid Profile" },
  { testCode: "BETA HCG", testName: "BETA HCG", shortName: "Beta HCG" },
  { testCode: "FT4", testName: "FREE T-4 (FREE THYROXINE)", shortName: "FT4" },
  { testCode: "BSR", testName: "SUGAR 1/2 HOUR ABF", shortName: "BSR" },
  { testCode: "BLOOD GROUP", testName: "BLOOD GROUP & RH FACTOR", shortName: "Blood Group" },
  { testCode: "TROP-T", testName: "TROPONIN-T", shortName: "Troponin-T" },
  { testCode: "ANA", testName: "ANA", shortName: "ANA" },
  {
    testCode: "CROSS_MATCHING_SCREENING",
    testName: "CROSS MATCHING WITH SCREENING",
    shortName: "Cross Matching",
  },
  {
    testCode: "URINE_COMPLETE_EXAMINATION",
    testName: "URINE COMPLETE EXAMINATION",
    shortName: "Urine C/E",
  },
  {
    testCode: "AMYLASE_SERUM",
    testName: "AMYLASE (SERUM)",
    shortName: "Serum Amylase",
  },
  {
    testCode: "RA_FACTOR_QL",
    testName: "RA FACTOR (QL)",
    shortName: "RA Factor",
  },
  {
    testCode: "ANTI_CCP",
    testName: "ANTI-CCP",
    shortName: "Anti CCP",
  },
  {
    testCode: "PT_PROTHROMBIN_TIME",
    testName: "PT (PROTHROMBIN TIME)",
    shortName: "PT",
  },
  {
    testCode: "APTT",
    testName: "APTT (ACTIVATED PARTIAL THROMBOPLASTIN TIME)",
    shortName: "APTT",
  },
  {
    testCode: "INR",
    testName: "INTERNATIONAL NORMALIZED RATIO",
    shortName: "INR",
  },
  {
    testCode: "CHOLESTEROL",
    testName: "CHOLESTEROL",
    shortName: "Cholesterol",
  },
  {
    testCode: "AFP",
    testName: "ALPHA FETO PROTEIN (AFP)",
    shortName: "AFP",
  },
  {
    testCode: "ASO_TITRE",
    testName: "ASO TITRE",
    shortName: "ASO",
  },
  {
    testCode: "MALARIAL_PARASITE",
    testName: "MALARIAL PARASITE SMEAR",
    shortName: "MP",
  },
] as const;

export async function initializeStandardTestsAction(
  _previousState: InitializeStandardTestsState,
  _formData: FormData,
): Promise<InitializeStandardTestsState> {
  try {
    const admin = await requireAdmin();

    let created = 0;
    let existing = 0;
    let templatesAttached = 0;
    let failed = 0;

    for (const standardTest of STANDARD_TESTS) {
      try {
        let test = await prisma.test.findUnique({
          where: { testCode: standardTest.testCode },
          select: { id: true },
        });

        if (!test) {
          test = await prisma.$transaction(async (transaction) => {
            const createdTest = await transaction.test.create({
              data: {
                testCode: standardTest.testCode,
                testName: standardTest.testName,
                shortName: standardTest.shortName,
                sampleRequired: null,
                reportingTime: null,
                reportHeading: standardTest.testName,
                description: null,
                paragraph: null,
                price: new Prisma.Decimal(0),
                status: RecordStatus.ACTIVE,
                createdById: admin.id,
              },
              select: { id: true },
            });

            await transaction.auditLog.create({
              data: {
                userId: admin.id,
                action: "CREATE",
                entityType: "TEST",
                entityId: createdTest.id,
                description: `Initialized standard laboratory test ${standardTest.testName}.`,
              },
            });

            return createdTest;
          });

          created += 1;
        } else {
          existing += 1;
        }

        const templateResult = await attachPredefinedTemplateToTest(test.id);

        if (templateResult.attached) {
          templatesAttached += 1;
        }
      } catch (error) {
        failed += 1;
        console.error(`Failed to initialize ${standardTest.testCode}:`, error);
      }
    }

    revalidatePath("/portal/tests");

    return {
      success: failed === 0,
      message:
        failed === 0
          ? "All standard tests and templates are ready."
          : "Initialization completed, but some tests could not be processed.",
      created,
      existing,
      templatesAttached,
      failed,
    };
  } catch (error) {
    console.error("Initialize standard tests error:", error);

    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Unable to initialize standard tests.",
      created: 0,
      existing: 0,
      templatesAttached: 0,
      failed: STANDARD_TESTS.length,
    };
  }
}