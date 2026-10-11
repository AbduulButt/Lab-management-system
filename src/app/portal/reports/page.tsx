import ReportsTable from "@/components/reports/reports-table";
import { requireAuthenticatedUser } from "@/lib/auth/authorization";
import { prisma } from "@/lib/prisma";

type ReportsPageProps = {
    searchParams: Promise<{
        startDate?: string;
        endDate?: string;
    }>;
};

export default async function ReportsPage({
    searchParams,
}: ReportsPageProps) {
    await requireAuthenticatedUser();

    const params = await searchParams;

    const startDateValue = params.startDate ?? "";
    const endDateValue = params.endDate ?? "";

    let startDate: Date | undefined;
    let endDateExclusive: Date | undefined;

    if (startDateValue) {
        startDate = new Date(
            `${startDateValue}T00:00:00`,
        );
    }

    if (endDateValue) {
        endDateExclusive = new Date(
            `${endDateValue}T00:00:00`,
        );

        // Move to the beginning of the next day.
        // This makes the selected End Date fully inclusive.
        endDateExclusive.setDate(
            endDateExclusive.getDate() + 1,
        );
    }

    const [receipts, settings] = await Promise.all([
        prisma.receipt.findMany({
            where:
                startDate || endDateExclusive
                    ? {
                        collectionDate: {
                            ...(startDate
                                ? {
                                    gte: startDate,
                                }
                                : {}),

                            ...(endDateExclusive
                                ? {
                                    lt: endDateExclusive,
                                }
                                : {}),
                        },
                    }
                    : undefined,

            orderBy: {
                collectionDate: "desc",
            },

            include: {
                patient: {
                    select: {
                        mrNumber: true,
                    },
                },

                collectedBy: {
                    select: {
                        fullName: true,
                    },
                },

                patientTests: {
                    select: {
                        id: true,
                        status: true,
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

    const formattedReceipts = receipts.map(
        (receipt) => ({
            id: receipt.id,

            receiptNumber:
                receipt.receiptNumber.toString(),

            mrNumber: receipt.patient?.mrNumber
                ? receipt.patient.mrNumber.toString()
                : "",

            branchName:
                settings?.labName ?? "Life Care Lab",

            patientName:
                receipt.patientNameSnapshot,

            gender: receipt.genderSnapshot,

            ageValue: receipt.ageValue,

            ageUnit: receipt.ageUnit,

            phone: receipt.phoneSnapshot ?? "N/A",

            specimen:
                receipt.specimen ??
                (receipt.specimenSource ===
                    "TAKEN_IN_LAB"
                    ? "Taken in Lab"
                    : "Received from Outside"),

            collectedBy:
                receipt.collectedBy?.fullName ??
                "N/A",

            collectionDate:
                receipt.collectionDate.toISOString(),

            reportStatus: receipt.reportStatus,

            totalTests:
                receipt.patientTests.length,

            completedTests:
                receipt.patientTests.filter(
                    (patientTest) =>
                        patientTest.status ===
                        "COMPLETED",
                ).length,
        }),
    );

    return (
        <ReportsTable
            receipts={formattedReceipts}
        />
    );
}