"use server";

import {
    AbnormalFlag,
    PatientTestStatus,
    Prisma,
    ReceiptStatus,
} from "@/generated/prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireAuthenticatedUser } from "@/lib/auth/authorization";
import { prisma } from "@/lib/prisma";

export type SaveTestResultsState = {
    success: boolean;
    message: string;
};

function asText(value: FormDataEntryValue | null) {
    if (typeof value !== "string") {
        return "";
    }

    return value.trim();
}

function calculateAbnormalFlag({
    resultValue,
    gender,
    field,
    manuallyAbnormal,
}: {
    resultValue: string;
    gender: "MALE" | "FEMALE" | "OTHER";
    field: {
        inputType: string;
        autoAbnormal: boolean;
        maleMin: Prisma.Decimal | null;
        maleMax: Prisma.Decimal | null;
        femaleMin: Prisma.Decimal | null;
        femaleMax: Prisma.Decimal | null;
    };
    manuallyAbnormal: boolean;
}): AbnormalFlag {
    if (manuallyAbnormal) {
        return AbnormalFlag.ABNORMAL;
    }

    if (
        !field.autoAbnormal ||
        field.inputType !== "NUMBER" ||
        resultValue === ""
    ) {
        return AbnormalFlag.NOT_CHECKED;
    }

    const numericResult = Number(resultValue);

    if (!Number.isFinite(numericResult)) {
        return AbnormalFlag.NOT_CHECKED;
    }

    const minimum =
        gender === "FEMALE"
            ? field.femaleMin
            : gender === "MALE"
                ? field.maleMin
                : null;

    const maximum =
        gender === "FEMALE"
            ? field.femaleMax
            : gender === "MALE"
                ? field.maleMax
                : null;

    if (
        minimum !== null &&
        numericResult < Number(minimum.toString())
    ) {
        return AbnormalFlag.LOW;
    }

    if (
        maximum !== null &&
        numericResult > Number(maximum.toString())
    ) {
        return AbnormalFlag.HIGH;
    }

    if (minimum !== null || maximum !== null) {
        return AbnormalFlag.NORMAL;
    }

    return AbnormalFlag.NOT_CHECKED;
}

function referenceRangeForGender({
    gender,
    field,
}: {
    gender: "MALE" | "FEMALE" | "OTHER";
    field: {
        maleRangeText: string | null;
        femaleRangeText: string | null;
        normalText: string | null;
        maleMin: Prisma.Decimal | null;
        maleMax: Prisma.Decimal | null;
        femaleMin: Prisma.Decimal | null;
        femaleMax: Prisma.Decimal | null;
    };
}) {
    const textRange =
        gender === "FEMALE"
            ? field.femaleRangeText
            : gender === "MALE"
                ? field.maleRangeText
                : null;

    if (textRange) {
        return textRange;
    }

    const minimum =
        gender === "FEMALE"
            ? field.femaleMin
            : gender === "MALE"
                ? field.maleMin
                : null;

    const maximum =
        gender === "FEMALE"
            ? field.femaleMax
            : gender === "MALE"
                ? field.maleMax
                : null;

    if (minimum !== null && maximum !== null) {
        return `${minimum.toString()} - ${maximum.toString()}`;
    }

    if (minimum !== null) {
        return `≥ ${minimum.toString()}`;
    }

    if (maximum !== null) {
        return `≤ ${maximum.toString()}`;
    }

    return field.normalText;
}

export async function saveTestResultsAction(
    receiptId: string,
    patientTestId: string,
    _previousState: SaveTestResultsState,
    formData: FormData,
): Promise<SaveTestResultsState> {
    try {
        const user = await requireAuthenticatedUser();

        const submitMode =
            formData.get("submitMode") === "complete"
                ? "complete"
                : "draft";

        const patientTest = await prisma.patientTest.findFirst({
            where: {
                id: patientTestId,
                receiptId,
            },
            include: {
                receipt: {
                    select: {
                        genderSnapshot: true,
                    },
                },
                test: {
                    include: {
                        fields: {
                            where: {
                                status: "ACTIVE",
                                showInEntry: true,
                            },
                            orderBy: [
                                {
                                    displayOrder: "asc",
                                },
                                {
                                    createdAt: "asc",
                                },
                            ],
                        },
                    },
                },
            },
        });

        if (!patientTest) {
            return {
                success: false,
                message: "Patient test was not found.",
            };
        }

        const remarks = asText(formData.get("remarks"));

        if (submitMode === "complete") {
            const missingRequiredField =
                patientTest.test.fields.find(
                    (field) =>
                        field.isRequired &&
                        asText(formData.get(`result_${field.id}`)) === "",
                );

            if (missingRequiredField) {
                return {
                    success: false,
                    message: `Result is required for "${missingRequiredField.fieldName}".`,
                };
            }
        }

        await prisma.$transaction(async (transaction) => {
            for (const field of patientTest.test.fields) {
                const resultValue = asText(
                    formData.get(`result_${field.id}`),
                );

                const manuallyAbnormal =
                    formData.get(`abnormal_${field.id}`) === "on";

                const abnormalFlag = calculateAbnormalFlag({
                    resultValue,
                    gender: patientTest.receipt.genderSnapshot,
                    field,
                    manuallyAbnormal,
                });

                const referenceRangeSnapshot =
                    referenceRangeForGender({
                        gender: patientTest.receipt.genderSnapshot,
                        field,
                    });

                await transaction.testResult.upsert({
                    where: {
                        patientTestId_fieldId: {
                            patientTestId: patientTest.id,
                            fieldId: field.id,
                        },
                    },
                    update: {
                        fieldNameSnapshot: field.fieldName,
                        sectionNameSnapshot:
                            field.sectionId === null
                                ? null
                                : undefined,
                        resultValue: resultValue || null,
                        unitSnapshot: field.unit,
                        referenceRangeSnapshot,
                        abnormalFlag,
                        isManuallyOverridden: manuallyAbnormal,
                        enteredById: user.id,
                    },
                    create: {
                        patientTestId: patientTest.id,
                        fieldId: field.id,
                        fieldNameSnapshot: field.fieldName,
                        sectionNameSnapshot: null,
                        resultValue: resultValue || null,
                        unitSnapshot: field.unit,
                        referenceRangeSnapshot,
                        abnormalFlag,
                        isManuallyOverridden: manuallyAbnormal,
                        enteredById: user.id,
                    },
                });
            }

            await transaction.patientTest.update({
                where: {
                    id: patientTest.id,
                },
                data: {
                    remarks: remarks || null,
                    status:
                        submitMode === "complete"
                            ? PatientTestStatus.COMPLETED
                            : PatientTestStatus.DRAFT,
                    completedById:
                        submitMode === "complete" ? user.id : null,
                    completedAt:
                        submitMode === "complete" ? new Date() : null,
                },
            });

            const remainingIncompleteTests =
                await transaction.patientTest.count({
                    where: {
                        receiptId,
                        status: {
                            not: PatientTestStatus.COMPLETED,
                        },
                    },
                });

            await transaction.receipt.update({
                where: {
                    id: receiptId,
                },
                data: {
                    reportStatus:
                        remainingIncompleteTests === 0
                            ? ReceiptStatus.COMPLETED
                            : ReceiptStatus.PENDING,
                },
            });

            await transaction.auditLog.create({
                data: {
                    userId: user.id,
                    action: "UPDATE",
                    entityType: "TEST_RESULT",
                    entityId: patientTest.id,
                    description:
                        submitMode === "complete"
                            ? `Completed results for ${patientTest.testNameSnapshot}.`
                            : `Saved draft results for ${patientTest.testNameSnapshot}.`,
                },
            });
        });
    } catch (error) {
        console.error("Save test results error:", error);

        return {
            success: false,
            message:
                error instanceof Error
                    ? error.message
                    : "Unable to save test results.",
        };
    }

    revalidatePath(`/portal/report-entry/${receiptId}`);
    revalidatePath(
        `/portal/report-entry/${receiptId}/tests/${patientTestId}`,
    );
    revalidatePath("/portal/reports");
    revalidatePath("/portal/pending-reports");

    redirect(`/portal/report-entry/${receiptId}`);
}