import { z } from "zod";

const optionalNumber = z.preprocess(
    (value) => {
        if (value === "" || value === null || value === undefined) {
            return undefined;
        }

        return Number(value);
    },
    z
        .number()
        .finite("Enter a valid number.")
        .optional(),
);

export const testFieldSchema = z.object({
    sectionId: z.string().uuid("Invalid section."),

    fieldCode: z
        .string()
        .trim()
        .max(30, "Field code cannot exceed 30 characters.")
        .optional(),

    fieldName: z
        .string()
        .trim()
        .min(1, "Description is required.")
        .max(150, "Description cannot exceed 150 characters."),

    inputType: z.enum([
        "NUMBER",
        "TEXT",
        "SELECT",
        "TEXTAREA",
        "CHECKBOX",
        "POSITIVE_NEGATIVE",
    ]),

    unit: z
        .string()
        .trim()
        .max(50, "Unit cannot exceed 50 characters.")
        .optional(),

    femaleRangeText: z
        .string()
        .trim()
        .max(100, "Female range is too long.")
        .optional(),

    maleRangeText: z
        .string()
        .trim()
        .max(100, "Male range is too long.")
        .optional(),

    femaleMin: optionalNumber,
    femaleMax: optionalNumber,
    maleMin: optionalNumber,
    maleMax: optionalNumber,

    normalText: z
        .string()
        .trim()
        .max(100, "Normal text cannot exceed 100 characters.")
        .optional(),

    defaultValue: z
        .string()
        .trim()
        .max(100, "Default value cannot exceed 100 characters.")
        .optional(),

    optionsText: z
        .string()
        .trim()
        .max(1000, "Options are too long.")
        .optional(),

    displayOrder: z.coerce
        .number()
        .int("Display order must be a whole number.")
        .min(0, "Display order cannot be negative."),

    isRequired: z.boolean(),
    autoAbnormal: z.boolean(),
    showOnReport: z.boolean(),
    showInEntry: z.boolean(),
});

export type TestFieldFormValues = z.infer<typeof testFieldSchema>;