import { notFound } from "next/navigation";

import ResultEntryForm from "@/components/report-entry/result-entry-form";
import { requireAuthenticatedUser } from "@/lib/auth/authorization";
import { prisma } from "@/lib/prisma";

type ResultEntryPageProps = {
    params: Promise<{
        receiptId: string;
        patientTestId: string;
    }>;
};

export default async function ResultEntryPage({
    params,
}: ResultEntryPageProps) {
    await requireAuthenticatedUser();

    const { receiptId, patientTestId } = await params;

    const patientTest = await prisma.patientTest.findUnique({
        where: {
            id: patientTestId,
        },
        include: {
            receipt: {
                select: {
                    patientNameSnapshot: true,
                    genderSnapshot: true,
                    ageValue: true,
                    ageUnit: true,
                    receiptNumber: true,
                },
            },
            test: {
                include: {
                    sections: {
                        where: {
                            status: "ACTIVE",
                        },
                        orderBy: [
                            {
                                displayOrder: "asc",
                            },
                            {
                                createdAt: "asc",
                            },
                        ],
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
            },
            results: true,
        },
    });

    if (
        !patientTest ||
        patientTest.receiptId !== receiptId
    ) {
        notFound();
    }

    const resultsByFieldId = new Map(
        patientTest.results.map((result) => [
            result.fieldId,
            result,
        ]),
    );

    return (
        <ResultEntryForm
            receiptId={receiptId}
            patientTestId={patientTest.id}
            patient={{
                name: patientTest.receipt.patientNameSnapshot,
                gender: patientTest.receipt.genderSnapshot,
                ageValue: patientTest.receipt.ageValue,
                ageUnit: patientTest.receipt.ageUnit,
                receiptNumber:
                    patientTest.receipt.receiptNumber.toString(),
            }}
            test={{
                code: patientTest.testCodeSnapshot,
                name: patientTest.testNameSnapshot,
                paragraph: patientTest.test.paragraph,
                status: patientTest.status,
                remarks: patientTest.remarks,
                sections: patientTest.test.sections.map((section) => ({
                    id: section.id,
                    name: section.sectionName,
                    fields: section.fields.map((field) => {
                        const savedResult = resultsByFieldId.get(field.id);

                        return {
                            id: field.id,
                            code: field.fieldCode,
                            name: field.fieldName,
                            inputType: field.inputType,
                            unit: field.unit,
                            maleRangeText: field.maleRangeText,
                            femaleRangeText: field.femaleRangeText,
                            normalText: field.normalText,
                            options: Array.isArray(field.options)
                                ? field.options.filter(
                                    (option): option is string =>
                                        typeof option === "string",
                                )
                                : [],
                            required: field.isRequired,
                            defaultValue: field.defaultValue,
                            savedValue: savedResult?.resultValue ?? "",
                            manuallyAbnormal:
                                savedResult?.isManuallyOverridden ?? false,
                        };
                    }),
                })),
            }}
        />
    );
}