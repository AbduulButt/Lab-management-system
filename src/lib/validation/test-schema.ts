import { z } from "zod";

export const testSchema = z.object({
  testCode: z
    .string()
    .trim()
    .min(1, "Test code is required.")
    .max(30, "Test code cannot exceed 30 characters."),

  testName: z
    .string()
    .trim()
    .min(2, "Test name must contain at least 2 characters.")
    .max(150, "Test name cannot exceed 150 characters."),

  shortName: z
    .string()
    .trim()
    .max(50, "Short name cannot exceed 50 characters.")
    .optional(),

  sampleRequired: z
    .string()
    .trim()
    .max(100, "Sample information is too long.")
    .optional(),

  reportingTime: z
    .string()
    .trim()
    .max(100, "Reporting time is too long.")
    .optional(),

  reportHeading: z
    .string()
    .trim()
    .max(150, "Report heading cannot exceed 150 characters.")
    .optional(),

  description: z
    .string()
    .trim()
    .max(1000, "Description cannot exceed 1000 characters.")
    .optional(),

  paragraph: z
    .string()
    .trim()
    .max(5000, "Report paragraph cannot exceed 5000 characters.")
    .optional(),

  price: z.coerce
    .number()
    .finite("Enter a valid price.")
    .min(0, "Price cannot be negative."),
});

export type TestFormValues = z.infer<typeof testSchema>;