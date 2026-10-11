import { notFound } from "next/navigation";

import SampleCollectionForm from "@/components/sample-collection/sample-collection-form";
import { requireAuthenticatedUser } from "@/lib/auth/authorization";
import { prisma } from "@/lib/prisma";

type EditReceiptPageProps = {
    params: Promise<{
        receiptId: string;
    }>;
};

function dateValue(date: Date) {
    return date.toISOString().slice(0, 10);
}

function timeValue(date: Date) {
    return `${String(date.getHours()).padStart(2, "0")}:${String(
        date.getMinutes(),
    ).padStart(2, "0")}`;
}

export default async function EditReceiptPage({
    params,
}: EditReceiptPageProps) {
    await requireAuthenticatedUser();

    const { receiptId } = await params;

    const [receipt, tests, doctors, settings] =
        await Promise.all([
            prisma.receipt.findUnique({
                where: { id: receiptId },
                include: {
                    patientTests: {
                        select: { testId: true },
                    },
                },
            }),

            prisma.test.findMany({
                where: { status: "ACTIVE" },
                orderBy: { testName: "asc" },
                select: {
                    id: true,
                    testCode: true,
                    testName: true,
                    price: true,
                    sampleRequired: true,
                    reportingTime: true,
                },
            }),

            prisma.doctor.findMany({
                where: { status: "ACTIVE" },
                orderBy: { doctorName: "asc" },
                select: {
                    id: true,
                    doctorName: true,
                },
            }),

            prisma.systemSettings.findFirst({
                select: { labName: true },
            }),
        ]);

    if (!receipt) {
        notFound();
    }

    return (
        <SampleCollectionForm
            mode="edit"
            receiptId={receipt.id}
            tests={tests.map((test) => ({
                ...test,
                price: test.price.toString(),
            }))}
            doctors={doctors}
            labName={settings?.labName ?? "Life Care Lab"}
            initialData={{
                patientName: receipt.patientNameSnapshot,
                gender: receipt.genderSnapshot,
                ageValue: receipt.ageValue ?? 0,
                ageUnit: receipt.ageUnit,
                phone: receipt.phoneSnapshot ?? "",
                cnic: receipt.cnicSnapshot ?? "",
                fatherOrHusbandName:
                    receipt.fatherOrHusbandSnapshot ?? "",
                address: receipt.addressSnapshot ?? "",
                referenceType: receipt.referenceType,
                doctorId: receipt.doctorId ?? "",
                companyName: receipt.companyNameSnapshot ?? "",
                specimen: receipt.specimen ?? "",
                specimenSource: receipt.specimenSource,
                collectionDate: dateValue(receipt.collectionDate),
                collectionTime: timeValue(receipt.collectionDate),
                discountPercent: Number(
                    receipt.discountPercent.toString(),
                ),
                additionalLess: Number(
                    receipt.additionalLess.toString(),
                ),
                paidAmount: Number(receipt.paidAmount.toString()),
                selectedTestIds: receipt.patientTests.map(
                    (patientTest) => patientTest.testId,
                ),
            }}
        />
    );
}