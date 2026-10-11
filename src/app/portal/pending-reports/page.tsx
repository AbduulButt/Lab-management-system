import PendingReportsTable from "@/components/pending-reports/pending-reports-table";
import { requireAuthenticatedUser } from "@/lib/auth/authorization";
import { prisma } from "@/lib/prisma";

export default async function PendingReportsPage() {
  await requireAuthenticatedUser();

    const [receipts, settings] = await Promise.all([
        prisma.receipt.findMany({
            where: {
                patientTests: {
                    some: {
                        status: {
                            not: "COMPLETED",
                        },
                    },
                },
            },
            orderBy: {
                collectionDate: "desc",
            },
            include: {
                patient: {
                    select: {
                        mrNumber: true,
                    },
                },
                patientTests: {
                    select: {
                        id: true,
                        status: true,
                        testCodeSnapshot: true,
                        testNameSnapshot: true,
                    },
                },
            },
        }),

        prisma.systemSettings.findFirst({
            select: {
                labName: true,
            },
        }),
    ]);

    const formattedReceipts = receipts.map((receipt) => {
        const pendingTests = receipt.patientTests.filter(
            (patientTest) =>
                patientTest.status !== "COMPLETED",
        );

        return {
            id: receipt.id,
            receiptNumber: receipt.receiptNumber.toString(),
            mrNumber: receipt.patient.mrNumber.toString(),
            branchName:
                settings?.labName ?? "Life Care Lab",
            patientName: receipt.patientNameSnapshot,
            gender: receipt.genderSnapshot,
            ageValue: receipt.ageValue,
            ageUnit: receipt.ageUnit,
            phone: receipt.phoneSnapshot ?? "N/A",
            specimen:
                receipt.specimen ??
                (receipt.specimenSource === "TAKEN_IN_LAB"
                    ? "Taken in Lab"
                    : "Received from Outside"),
            address: receipt.addressSnapshot ?? "N/A",
            collectionDate:
                receipt.collectionDate.toISOString(),
            pendingTests: pendingTests.map((test) => ({
                id: test.id,
                code: test.testCodeSnapshot,
                name: test.testNameSnapshot,
                status: test.status,
            })),
        };
    });

    return (
        <PendingReportsTable
            receipts={formattedReceipts}
        />
    );
}