"use server";

import {
    FieldInputType,
    Prisma,
    RecordStatus,
} from "@/generated/prisma/client";

import { requireAdmin } from "@/lib/auth/authorization";
import { prisma } from "@/lib/prisma";
import { findPredefinedTemplate } from "@/lib/templates/registry";

export async function attachPredefinedTemplateToTest(
    testId: string,
): Promise<{ attached: boolean; templateKey?: string }> {
    const admin = await requireAdmin();

    const test = await prisma.test.findUnique({
        where: { id: testId },
        select: { id: true, testCode: true, testName: true },
    });

    if (!test) {
        throw new Error("Test not found.");
    }

    const template = findPredefinedTemplate(test.testCode, test.testName);

    if (!template) {
        return { attached: false };
    }

    await prisma.$transaction(async (transaction) => {
        for (const readySection of template.sections) {
            const sectionName =
                readySection.sectionName.trim() || `${template.title} RESULT`;

            let section = await transaction.testSection.findFirst({
                where: {
                    testId,
                    sectionName: { equals: sectionName, mode: "insensitive" },
                },
            });

            if (!section) {
                section = await transaction.testSection.create({
                    data: {
                        testId,
                        sectionName,
                        displayOrder: readySection.displayOrder,
                        status: RecordStatus.ACTIVE,
                    },
                });
            }

            for (const readyField of readySection.fields) {
                const exists = await transaction.testField.findFirst({
                    where: {
                        testId,
                        sectionId: section.id,
                        fieldCode: readyField.fieldCode,
                        fieldName: readyField.fieldName,
                        displayOrder: readyField.displayOrder,
                    },
                    select: { id: true },
                });

                if (exists) continue;

                await transaction.testField.create({
                    data: {
                        testId,
                        sectionId: section.id,
                        fieldCode: readyField.fieldCode,
                        fieldName: readyField.fieldName,
                        inputType: readyField.inputType as FieldInputType,
                        femaleRangeText: readyField.femaleRangeText ?? null,
                        maleRangeText: readyField.maleRangeText ?? null,
                        unit: readyField.unit ?? null,
                        options:
                            readyField.options && readyField.options.length > 0
                                ? readyField.options
                                : Prisma.DbNull,
                        displayOrder: readyField.displayOrder,
                        isRequired: false,
                        autoAbnormal: true,
                        showOnReport: true,
                        showInEntry: true,
                        status: RecordStatus.ACTIVE,
                    },
                });
            }
        }

        await transaction.auditLog.create({
            data: {
                userId: admin.id,
                action: "CREATE",
                entityType: "PREDEFINED_TEMPLATE",
                entityId: test.id,
                description: `Attached ${template.key} predefined template to ${test.testName}.`,
                newValues: { testId, templateKey: template.key },
            },
        });
    });

    return { attached: true, templateKey: template.key };
}