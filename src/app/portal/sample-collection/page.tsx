import SampleCollectionForm from "@/components/sample-collection/sample-collection-form";
import { requireAuthenticatedUser } from "@/lib/auth/authorization";
import { prisma } from "@/lib/prisma";

export default async function SampleCollectionPage() {
    await requireAuthenticatedUser();

    const [tests, doctors, settings] = await Promise.all([
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
            select: { id: true, doctorName: true },
        }),
        prisma.systemSettings.findFirst({
            select: { labName: true },
        }),
    ]);

    return (
        <SampleCollectionForm
            tests={tests.map((test) => ({
                ...test,
                price: test.price.toString(),
            }))}
            doctors={doctors}
            labName={settings?.labName ?? "Life Care Lab"}
        />
    );
}
