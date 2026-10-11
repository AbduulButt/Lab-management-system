"use server";

import { RecordStatus } from "@/generated/prisma/client";
import { revalidatePath } from "next/cache";

import { requireAdmin } from "@/lib/auth/authorization";
import { prisma } from "@/lib/prisma";
import { sectionSchema } from "@/lib/validation/template-schema";

export type TemplateActionState = {
    success: boolean;
    message: string;
    fieldErrors?: Record<string, string[] | undefined>;
};

export async function createSectionAction(
    testId: string,
    _previousState: TemplateActionState,
    formData: FormData,
): Promise<TemplateActionState> {
    try {
        const admin = await requireAdmin();

        const test = await prisma.test.findUnique({
            where: {
                id: testId,
            },
            select: {
                id: true,
                testName: true,
            },
        });

        if (!test) {
            return {
                success: false,
                message: "Test not found.",
            };
        }

        const parsedResult = sectionSchema.safeParse({
            sectionName: formData.get("sectionName"),
            displayOrder: formData.get("displayOrder"),
        });

        if (!parsedResult.success) {
            return {
                success: false,
                message: "Please correct the section information.",
                fieldErrors: parsedResult.error.flatten().fieldErrors,
            };
        }

        const data = parsedResult.data;

        const duplicateSection = await prisma.testSection.findFirst({
            where: {
                testId,
                sectionName: {
                    equals: data.sectionName,
                    mode: "insensitive",
                },
            },
        });

        if (duplicateSection) {
            return {
                success: false,
                message: "A section with this name already exists.",
            };
        }

        const section = await prisma.$transaction(async (transaction) => {
            const createdSection = await transaction.testSection.create({
                data: {
                    testId,
                    sectionName: data.sectionName,
                    displayOrder: data.displayOrder,
                    status: RecordStatus.ACTIVE,
                },
            });

            await transaction.auditLog.create({
                data: {
                    userId: admin.id,
                    action: "CREATE",
                    entityType: "TEST_SECTION",
                    entityId: createdSection.id,
                    description: `Added section "${createdSection.sectionName}" to ${test.testName}.`,
                    newValues: {
                        testId,
                        sectionName: createdSection.sectionName,
                        displayOrder: createdSection.displayOrder,
                    },
                },
            });

            return createdSection;
        });

        revalidatePath(`/portal/tests/${testId}/template`);

        return {
            success: true,
            message: `Section "${section.sectionName}" added successfully.`,
        };
    } catch (error) {
        console.error("Create section error:", error);

        return {
            success: false,
            message:
                error instanceof Error
                    ? error.message
                    : "Unable to add the section.",
        };
    }
}

export async function updateSectionAction(
    testId: string,
    sectionId: string,
    formData: FormData,
): Promise<void> {
    const admin = await requireAdmin();

    const parsedResult = sectionSchema.safeParse({
        sectionName: formData.get("sectionName"),
        displayOrder: formData.get("displayOrder"),
    });

    if (!parsedResult.success) {
        throw new Error("Invalid section information.");
    }

    const existingSection = await prisma.testSection.findFirst({
        where: {
            id: sectionId,
            testId,
        },
    });

    if (!existingSection) {
        throw new Error("Section not found.");
    }

    const data = parsedResult.data;

    await prisma.$transaction(async (transaction) => {
        const updatedSection = await transaction.testSection.update({
            where: {
                id: sectionId,
            },
            data: {
                sectionName: data.sectionName,
                displayOrder: data.displayOrder,
            },
        });

        await transaction.auditLog.create({
            data: {
                userId: admin.id,
                action: "UPDATE",
                entityType: "TEST_SECTION",
                entityId: updatedSection.id,
                description: `Updated template section "${updatedSection.sectionName}".`,
                oldValues: {
                    sectionName: existingSection.sectionName,
                    displayOrder: existingSection.displayOrder,
                },
                newValues: {
                    sectionName: updatedSection.sectionName,
                    displayOrder: updatedSection.displayOrder,
                },
            },
        });
    });

    revalidatePath(`/portal/tests/${testId}/template`);
}

export async function deleteSectionAction(
    testId: string,
    sectionId: string,
): Promise<void> {
    const admin = await requireAdmin();

    const section = await prisma.testSection.findFirst({
        where: {
            id: sectionId,
            testId,
        },
        include: {
            _count: {
                select: {
                    fields: true,
                },
            },
        },
    });

    if (!section) {
        throw new Error("Section not found.");
    }

    if (section._count.fields > 0) {
        throw new Error(
            "Remove the section fields before deleting this section.",
        );
    }

    await prisma.$transaction(async (transaction) => {
        await transaction.testSection.delete({
            where: {
                id: sectionId,
            },
        });

        await transaction.auditLog.create({
            data: {
                userId: admin.id,
                action: "DELETE",
                entityType: "TEST_SECTION",
                entityId: sectionId,
                description: `Deleted template section "${section.sectionName}".`,
                oldValues: {
                    testId,
                    sectionName: section.sectionName,
                    displayOrder: section.displayOrder,
                },
            },
        });
    });

    revalidatePath(`/portal/tests/${testId}/template`);
}