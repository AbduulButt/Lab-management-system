"use server";

import {
    FieldInputType,
    Prisma,
    RecordStatus,
} from "@/generated/prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireAdmin } from "@/lib/auth/authorization";
import { prisma } from "@/lib/prisma";
import { testFieldSchema } from "@/lib/validation/test-field-schema";

export type TestFieldActionState = {
    success: boolean;
    message: string;
    fieldErrors?: Record<string, string[] | undefined>;
};

function optionalText(
    value: FormDataEntryValue | null,
): string | undefined {
    if (typeof value !== "string") {
        return undefined;
    }

    const cleaned = value.trim();

    return cleaned || undefined;
}

function checkboxValue(formData: FormData, name: string): boolean {
    return formData.get(name) === "on";
}

function optionalDecimal(value: number | undefined) {
    return value === undefined
        ? null
        : new Prisma.Decimal(value);
}

function parseOptions(
  optionsText: string | undefined,
): Prisma.InputJsonValue | typeof Prisma.DbNull {
  if (!optionsText) {
    return Prisma.DbNull;
  }

  const options = optionsText
    .split(/\r?\n|,/)
    .map((option) => option.trim())
    .filter(Boolean);

  return options.length > 0
    ? options
    : Prisma.DbNull;
}

export async function createTestFieldAction(
    testId: string,
    _previousState: TestFieldActionState,
    formData: FormData,
): Promise<TestFieldActionState> {
    try {
        const admin = await requireAdmin();

        const parsed = testFieldSchema.safeParse({
            sectionId: formData.get("sectionId"),
            fieldCode: optionalText(formData.get("fieldCode")),
            fieldName: formData.get("fieldName"),
            inputType: formData.get("inputType"),
            unit: optionalText(formData.get("unit")),

            femaleRangeText: optionalText(
                formData.get("femaleRangeText"),
            ),
            maleRangeText: optionalText(
                formData.get("maleRangeText"),
            ),

            femaleMin: formData.get("femaleMin"),
            femaleMax: formData.get("femaleMax"),
            maleMin: formData.get("maleMin"),
            maleMax: formData.get("maleMax"),

            normalText: optionalText(formData.get("normalText")),
            defaultValue: optionalText(formData.get("defaultValue")),
            optionsText: optionalText(formData.get("optionsText")),

            displayOrder: formData.get("displayOrder"),

            isRequired: checkboxValue(formData, "isRequired"),
            autoAbnormal: checkboxValue(formData, "autoAbnormal"),
            showOnReport: checkboxValue(formData, "showOnReport"),
            showInEntry: checkboxValue(formData, "showInEntry"),
        });

        if (!parsed.success) {
            return {
                success: false,
                message: "Please correct the field information.",
                fieldErrors: parsed.error.flatten().fieldErrors,
            };
        }

        const section = await prisma.testSection.findFirst({
            where: {
                id: parsed.data.sectionId,
                testId,
            },
            select: {
                id: true,
                sectionName: true,
            },
        });

        if (!section) {
            return {
                success: false,
                message: "The selected section does not belong to this test.",
            };
        }

        const data = parsed.data;

        await prisma.$transaction(async (transaction) => {
            const field = await transaction.testField.create({
                data: {
                    testId,
                    sectionId: data.sectionId,

                    fieldCode: data.fieldCode || null,
                    fieldName: data.fieldName,
                    inputType: data.inputType as FieldInputType,
                    unit: data.unit || null,

                    femaleRangeText: data.femaleRangeText || null,
                    maleRangeText: data.maleRangeText || null,

                    femaleMin: optionalDecimal(data.femaleMin),
                    femaleMax: optionalDecimal(data.femaleMax),
                    maleMin: optionalDecimal(data.maleMin),
                    maleMax: optionalDecimal(data.maleMax),

                    normalText: data.normalText || null,
                    defaultValue: data.defaultValue || null,
                    options: parseOptions(data.optionsText),

                    displayOrder: data.displayOrder,
                    isRequired: data.isRequired,
                    autoAbnormal: data.autoAbnormal,
                    showOnReport: data.showOnReport,
                    showInEntry: data.showInEntry,
                    status: RecordStatus.ACTIVE,
                },
            });

            await transaction.auditLog.create({
                data: {
                    userId: admin.id,
                    action: "CREATE",
                    entityType: "TEST_FIELD",
                    entityId: field.id,
                    description: `Added field "${field.fieldName}" to section "${section.sectionName}".`,
                    newValues: {
                        testId,
                        sectionId: section.id,
                        fieldName: field.fieldName,
                        displayOrder: field.displayOrder,
                    },
                },
            });
        });
    } catch (error) {
        console.error("Create test field error:", error);

        return {
            success: false,
            message:
                error instanceof Error
                    ? error.message
                    : "Unable to create the result field.",
        };
    }

    revalidatePath(`/portal/tests/${testId}/template`);
    redirect(`/portal/tests/${testId}/template`);
}

export async function deleteTestFieldAction(
    testId: string,
    fieldId: string,
): Promise<void> {
    const admin = await requireAdmin();

    const field = await prisma.testField.findFirst({
        where: {
            id: fieldId,
            testId,
        },
        include: {
            _count: {
                select: {
                    results: true,
                },
            },
        },
    });

    if (!field) {
        throw new Error("Template field not found.");
    }

    if (field._count.results > 0) {
        throw new Error(
            "This field already has patient results and cannot be deleted.",
        );
    }

    await prisma.$transaction(async (transaction) => {
        await transaction.testField.delete({
            where: {
                id: field.id,
            },
        });

        await transaction.auditLog.create({
            data: {
                userId: admin.id,
                action: "DELETE",
                entityType: "TEST_FIELD",
                entityId: field.id,
                description: `Deleted template field "${field.fieldName}".`,
                oldValues: {
                    fieldName: field.fieldName,
                    testId,
                    sectionId: field.sectionId,
                },
            },
        });
    });

    revalidatePath(`/portal/tests/${testId}/template`);
}