import { z } from "zod";

export const sampleCollectionSchema = z.object({
  patientName: z
    .string()
    .trim()
    .min(2, "Patient name is required.")
    .max(120),

  gender: z.enum(["MALE", "FEMALE", "OTHER"]),

  ageValue: z.coerce
    .number()
    .int()
    .min(0)
    .max(150),

  ageUnit: z.enum([
    "YEARS",
    "MONTHS",
    "DAYS",
  ]),

  phone: z.string().trim().optional(),

  cnic: z.string().trim().optional(),

  fatherOrHusbandName: z
    .string()
    .trim()
    .optional(),

  address: z.string().trim().optional(),

  referenceType: z.enum([
    "SELF",
    "DOCTOR",
    "COMPANY",
    "OTHER",
  ]),

  doctorId: z.string().uuid().optional(),

  companyName: z.string().trim().optional(),

  specimen: z.string().trim().optional(),

  specimenSource: z.enum([
    "TAKEN_IN_LAB",
    "RECEIVED_FROM_OUTSIDE",
  ]),

  collectionDate: z.string(),

  collectionTime: z.string(),

  discountPercent: z.coerce
    .number()
    .min(0)
    .max(100),

  additionalLess: z.coerce
    .number()
    .min(0),

  paidAmount: z.coerce
    .number()
    .min(0),

  selectedTests: z
    .array(
      z.object({
        testId: z.string().uuid(),
      }),
    )
    .min(1, "Select at least one test."),

  submitMode: z.enum([
    "save",
    "save-print",
  ]),
});

export type SampleCollectionInput =
  z.infer<typeof sampleCollectionSchema>;