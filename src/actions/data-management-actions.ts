"use server";

import {
    ReceiptStatus,
} from "@/generated/prisma/client";

import { requireAdmin } from "@/lib/auth/authorization";
import { prisma } from "@/lib/prisma";

export type CleanupPreview = {
    receipts: number;
    patientTests: number;
    testResults: number;
    generatedReports: number;
    removablePatients: number;
};

export type CleanupResult = {
    success: boolean;
    message: string;
    deleted?: {
        receipts: number;
        patients: number;
        patientTests: number;
        testResults: number;
        generatedReports: number;
    };
};
export type DatabaseRecordInfo = {
    lastSavedDate: string | null;
    oldestSavedDate: string | null;
    latestDeletableDate: string;
};

function getMaximumAllowedCutoff() {
    const date = new Date();

    date.setMonth(
        date.getMonth() - 2,
    );

    date.setHours(23, 59, 59, 999);

    return date;
}

function parseCutoffDate(
    value: string,
) {
    if (!value) {
        return null;
    }

    const date = new Date(
        `${value}T23:59:59.999`,
    );

    if (Number.isNaN(date.getTime())) {
        return null;
    }

    return date;
}

function validateCutoffDate(
    cutoffDate: Date | null,
) {
    if (!cutoffDate) {
        return {
            valid: false,
            message:
                "Please select a valid cleanup date.",
        };
    }

    const maximumCutoff =
        getMaximumAllowedCutoff();

    if (cutoffDate > maximumCutoff) {
        return {
            valid: false,
            message:
                "For safety, records from the last 2 months cannot be deleted.",
        };
    }

    return {
        valid: true,
        message: "",
    };
}
export async function getDatabaseRecordInfoAction(): Promise<
    | {
        success: true;
        info: DatabaseRecordInfo;
    }
    | {
        success: false;
        message: string;
    }
> {
    await requireAdmin();

    try {
        const [latestReceipt, oldestReceipt] =
            await Promise.all([
                prisma.receipt.findFirst({
                    orderBy: {
                        createdAt: "desc",
                    },
                    select: {
                        createdAt: true,
                    },
                }),

                prisma.receipt.findFirst({
                    orderBy: {
                        createdAt: "asc",
                    },
                    select: {
                        createdAt: true,
                    },
                }),
            ]);

        const maximumCutoff =
            getMaximumAllowedCutoff();

        return {
            success: true,

            info: {
                lastSavedDate:
                    latestReceipt?.createdAt.toISOString() ??
                    null,

                oldestSavedDate:
                    oldestReceipt?.createdAt.toISOString() ??
                    null,

                latestDeletableDate:
                    maximumCutoff.toISOString(),
            },
        };
    } catch (error) {
        console.error(
            "Database record info error:",
            error,
        );

        return {
            success: false,
            message:
                error instanceof Error
                    ? error.message
                    : "Unable to load database record information.",
        };
    }
}

/* =========================================================
   PREVIEW OLD RECORDS
========================================================= */

export async function previewOldRecordsAction(
    cutoffDateValue: string,
): Promise<
    | {
        success: true;
        message: string;
        preview: CleanupPreview;
    }
    | {
        success: false;
        message: string;
    }
> {
    await requireAdmin();

    const cutoffDate =
        parseCutoffDate(cutoffDateValue);

    const validation =
        validateCutoffDate(cutoffDate);

    if (
        !validation.valid ||
        !cutoffDate
    ) {
        return {
            success: false,
            message: validation.message,
        };
    }

    try {
        const eligibleReceipts =
            await prisma.receipt.findMany({
                where: {
                    collectionDate: {
                        lte: cutoffDate,
                    },

                    reportStatus: {
                        in: [
                            ReceiptStatus.COMPLETED,
                            ReceiptStatus.CANCELLED,
                        ],
                    },
                },

                select: {
                    id: true,
                    patientId: true,

                    _count: {
                        select: {
                            patientTests: true,
                            generatedReports: true,
                        },
                    },

                    patientTests: {
                        select: {
                            _count: {
                                select: {
                                    results: true,
                                },
                            },
                        },
                    },
                },
            });

        const receiptIds =
            eligibleReceipts.map(
                (receipt) => receipt.id,
            );

        const patientIds = [
            ...new Set(
                eligibleReceipts.map(
                    (receipt) =>
                        receipt.patientId,
                ),
            ),
        ];

        const patientTests =
            eligibleReceipts.reduce(
                (total, receipt) =>
                    total +
                    receipt._count.patientTests,
                0,
            );

        const generatedReports =
            eligibleReceipts.reduce(
                (total, receipt) =>
                    total +
                    receipt._count.generatedReports,
                0,
            );

        const testResults =
            eligibleReceipts.reduce(
                (receiptTotal, receipt) =>
                    receiptTotal +
                    receipt.patientTests.reduce(
                        (testTotal, test) =>
                            testTotal +
                            test._count.results,
                        0,
                    ),
                0,
            );

        let removablePatients = 0;

        if (
            patientIds.length > 0 &&
            receiptIds.length > 0
        ) {
            removablePatients =
                await prisma.patient.count({
                    where: {
                        id: {
                            in: patientIds,
                        },

                        receipts: {
                            none: {
                                id: {
                                    notIn:
                                        receiptIds,
                                },
                            },
                        },
                    },
                });
        }

        return {
            success: true,

            message:
                eligibleReceipts.length === 0
                    ? "No completed or cancelled records were found before the selected date."
                    : "Cleanup preview generated successfully.",

            preview: {
                receipts:
                    eligibleReceipts.length,

                patientTests,

                testResults,

                generatedReports,

                removablePatients,
            },
        };
    } catch (error) {
        console.error(
            "Preview cleanup error:",
            error,
        );

        return {
            success: false,
            message:
                error instanceof Error
                    ? error.message
                    : "Unable to preview old records.",
        };
    }
}

/* =========================================================
   DELETE OLD RECORDS
========================================================= */

export async function deleteOldRecordsAction(
    cutoffDateValue: string,
    confirmation: string,
): Promise<CleanupResult> {
    const admin =
        await requireAdmin();

    if (
        confirmation.trim() !==
        "DELETE"
    ) {
        return {
            success: false,
            message:
                'Type "DELETE" exactly to confirm permanent deletion.',
        };
    }

    const cutoffDate =
        parseCutoffDate(cutoffDateValue);

    const validation =
        validateCutoffDate(cutoffDate);

    if (
        !validation.valid ||
        !cutoffDate
    ) {
        return {
            success: false,
            message: validation.message,
        };
    }

    try {
        const eligibleReceipts =
            await prisma.receipt.findMany({
                where: {
                    collectionDate: {
                        lte: cutoffDate,
                    },

                    reportStatus: {
                        in: [
                            ReceiptStatus.COMPLETED,
                            ReceiptStatus.CANCELLED,
                        ],
                    },
                },

                select: {
                    id: true,
                    patientId: true,

                    _count: {
                        select: {
                            patientTests: true,
                            generatedReports: true,
                        },
                    },

                    patientTests: {
                        select: {
                            _count: {
                                select: {
                                    results: true,
                                },
                            },
                        },
                    },
                },
            });

        if (
            eligibleReceipts.length === 0
        ) {
            return {
                success: false,
                message:
                    "There are no eligible records to delete.",
            };
        }

        const receiptIds =
            eligibleReceipts.map(
                (receipt) => receipt.id,
            );

        const patientIds = [
            ...new Set(
                eligibleReceipts.map(
                    (receipt) =>
                        receipt.patientId,
                ),
            ),
        ];

        const patientTests =
            eligibleReceipts.reduce(
                (total, receipt) =>
                    total +
                    receipt._count.patientTests,
                0,
            );

        const generatedReports =
            eligibleReceipts.reduce(
                (total, receipt) =>
                    total +
                    receipt._count.generatedReports,
                0,
            );

        const testResults =
            eligibleReceipts.reduce(
                (receiptTotal, receipt) =>
                    receiptTotal +
                    receipt.patientTests.reduce(
                        (testTotal, test) =>
                            testTotal +
                            test._count.results,
                        0,
                    ),
                0,
            );

        const result =
            await prisma.$transaction(
                async (transaction) => {
                    /*
                     * Receipt deletion automatically
                     * cascades to:
                     *
                     * Receipt
                     * -> PatientTest
                     * -> TestResult
                     *
                     * and:
                     *
                     * Receipt
                     * -> GeneratedReport
                     */
                    const deletedReceipts =
                        await transaction.receipt.deleteMany({
                            where: {
                                id: {
                                    in: receiptIds,
                                },
                            },
                        });

                    /*
                     * Only remove patients that belonged
                     * to deleted receipts AND now have
                     * no receipts left.
                     */
                    const deletedPatients =
                        await transaction.patient.deleteMany({
                            where: {
                                id: {
                                    in: patientIds,
                                },

                                receipts: {
                                    none: {},
                                },
                            },
                        });

                    await transaction.auditLog.create({
                        data: {
                            userId: admin.id,

                            action: "DELETE",

                            entityType:
                                "HISTORICAL_DATA",

                            description:
                                `Deleted historical completed/cancelled records through ${cutoffDateValue}. ` +
                                `Receipts: ${deletedReceipts.count}, ` +
                                `Patient tests: ${patientTests}, ` +
                                `Results: ${testResults}, ` +
                                `Generated reports: ${generatedReports}, ` +
                                `Patients removed: ${deletedPatients.count}.`,

                            newValues: {
                                cutoffDate:
                                    cutoffDateValue,

                                deletedReceipts:
                                    deletedReceipts.count,

                                deletedPatients:
                                    deletedPatients.count,

                                deletedPatientTests:
                                    patientTests,

                                deletedTestResults:
                                    testResults,

                                deletedGeneratedReports:
                                    generatedReports,
                            },
                        },
                    });

                    return {
                        receipts:
                            deletedReceipts.count,

                        patients:
                            deletedPatients.count,
                    };
                },
            );

        return {
            success: true,

            message:
                "Old laboratory records were deleted successfully.",

            deleted: {
                receipts:
                    result.receipts,

                patients:
                    result.patients,

                patientTests,

                testResults,

                generatedReports,
            },
        };
    } catch (error) {
        console.error(
            "Delete old records error:",
            error,
        );

        return {
            success: false,

            message:
                error instanceof Error
                    ? error.message
                    : "Unable to delete old records.",
        };
    }
}