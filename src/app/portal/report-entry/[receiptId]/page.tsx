import { notFound } from "next/navigation";

import ReportEntryView from "@/components/report-entry/report-entry-view";
import { requireAuthenticatedUser } from "@/lib/auth/authorization";
import { prisma } from "@/lib/prisma";

type ReportEntryPageProps = {
    params: Promise<{
        receiptId: string;
    }>;
};

export default async function ReportEntryPage({
    params,
}: ReportEntryPageProps) {
    await requireAuthenticatedUser();

    const { receiptId } = await params;

    const [receipt, settings, recentReceipts] = await Promise.all([
        prisma.receipt.findUnique({
            where: {
                id: receiptId,
            },
            include: {
                patient: {
                    select: {
                        mrNumber: true,
                    },
                },
                doctor: {
                    select: {
                        doctorName: true,
                    },
                },
                patientTests: {
                    orderBy: {
                        createdAt: "asc",
                    },
                    select: {
                        id: true,
                        testCodeSnapshot: true,
                        testNameSnapshot: true,
                        status: true,
                        results: {
                            select: {
                                id: true,
                            },
                        },
                    },
                },
            },
        }),

        prisma.systemSettings.findFirst({
            select: {
                labName: true,
            },
        }),

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
            take: 50,
            select: {
                id: true,
                receiptNumber: true,
                patientNameSnapshot: true,
            },
        }),
    ]);

    if (!receipt) {
        notFound();
    }

    return (
        <ReportEntryView
            receipt={{
                id: receipt.id,
                receiptNumber: receipt.receiptNumber.toString(),
                mrNumber: receipt.patient.mrNumber.toString(),
                patientName: receipt.patientNameSnapshot,
                fatherOrHusband:
                    receipt.fatherOrHusbandSnapshot ?? "N/A",
                ageValue: receipt.ageValue,
                ageUnit: receipt.ageUnit,
                gender: receipt.genderSnapshot,
                registrationDate: receipt.collectionDate.toISOString(),
                registrationCenter:
                    settings?.labName ?? "Life Care Lab",
                specimen:
                    receipt.specimen ??
                    (receipt.specimenSource === "TAKEN_IN_LAB"
                        ? "Taken in Lab"
                        : "Received from Outside"),
                consultant:
                    receipt.doctorNameSnapshot ??
                    receipt.doctor?.doctorName ??
                    "SELF",
                address: receipt.addressSnapshot ?? "N/A",
                contactNumber: receipt.phoneSnapshot ?? "N/A",
                cnic: receipt.cnicSnapshot ?? "N/A",
                tests: receipt.patientTests.map((patientTest) => ({
                    id: patientTest.id,
                    testCode: patientTest.testCodeSnapshot,
                    testName: patientTest.testNameSnapshot,
                    status: patientTest.status,
                    hasResults: patientTest.results.length > 0,
                })),
            }}
            recentReceipts={recentReceipts.map((item) => ({
                id: item.id,
                receiptNumber: item.receiptNumber.toString(),
                patientName: item.patientNameSnapshot,
            }))}
        />
    );
}