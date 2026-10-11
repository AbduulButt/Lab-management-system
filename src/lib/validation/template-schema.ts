import { z } from "zod";

export const sectionSchema = z.object({
    sectionName: z
        .string()
        .trim()
        .min(2, "Section name must contain at least 2 characters.")
        .max(150, "Section name cannot exceed 150 characters."),

    displayOrder: z.coerce
        .number()
        .int("Display order must be a whole number.")
        .min(0, "Display order cannot be negative.")
        .max(1000, "Display order is too large."),
});

export type SectionFormValues = z.infer<typeof sectionSchema>;