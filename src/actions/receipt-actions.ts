"use server";

import { revalidatePath } from "next/cache";

import { requireAuthenticatedUser } from "@/lib/auth/authorization";
import { prisma } from "@/lib/prisma";

export type DeleteReceiptResult = {
    success: boolean;
    message: string;
};

export async function deleteReceiptAction(
    receiptId: string,
): Promise<DeleteReceiptResult> {
    try {
        const user = await requireAuthenticatedUser();

        if (!receiptId) {
            return {
                success: false,
                message: "Receipt ID is missing.",
            };
        }

        const receipt = await prisma.receipt.findUnique({
            where: {
                id: receiptId,
            },
            include: {
                patientTests: {
                    include: {
                        _count: {
                            select: {
                                results: true,
                            },
                        },
                    },
                },
                patient: {
                    select: {
                        id: true,
                        receipts: {
                            select: {
                                id: true,
                            },
                        },
                    },
                },
            },
        });

        if (!receipt) {
            return {
                success: false,
                message: "Receipt was not found.",
            };
        }

        const testWithSavedResults = receipt.patientTests.find(
            (patientTest) =>
                patientTest._count.results > 0 ||
                patientTest.status === "COMPLETED" ||
                patientTest.status === "DRAFT",
        );

        if (testWithSavedResults) {
            return {
                success: false,
                message:
                    "This receipt cannot be deleted because test results have already been saved.",
            };
        }

        await prisma.$transaction(async (transaction) => {
            await transaction.auditLog.create({
                data: {
                    userId: user.id,
                    action: "DELETE",
                    entityType: "RECEIPT",
                    entityId: receipt.id,
                    description: `Deleted receipt ${receipt.receiptNumber.toString()} for ${receipt.patientNameSnapshot}.`,
                    oldValues: {
                        receiptNumber: receipt.receiptNumber.toString(),
                        patientName: receipt.patientNameSnapshot,
                        patientId: receipt.patientId,
                        selectedTestCount: receipt.patientTests.length,
                        netAmount: receipt.netAmount.toString(),
                        paidAmount: receipt.paidAmount.toString(),
                        dueAmount: receipt.dueAmount.toString(),
                    },
                },
            });

            /*
             * PatientTest records should normally be removed automatically
             * through the Receipt → PatientTest cascade relation.
             *
             * Deleting explicitly also makes the intended behavior clear.
             */
            await transaction.patientTest.deleteMany({
                where: {
                    receiptId: receipt.id,
                },
            });

            await transaction.receipt.delete({
                where: {
                    id: receipt.id,
                },
            });

            /*
             * Delete the patient only if this was their only receipt.
             */
            if (receipt.patient.receipts.length === 1) {
                await transaction.patient.delete({
                    where: {
                        id: receipt.patient.id,
                    },
                });
            }
        });

        revalidatePath("/portal/reports");
        revalidatePath("/portal/pending-reports");

        return {
            success: true,
            message: "Receipt deleted successfully.",
        };
    } catch (error) {
        console.error("Delete receipt error:", error);

        return {
            success: false,
            message:
                error instanceof Error
                    ? error.message
                    : "Unable to delete the receipt.",
        };
    }
}