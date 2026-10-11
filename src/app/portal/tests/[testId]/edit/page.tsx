import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import TestForm from "@/components/forms/test-form";
import { requireAdmin } from "@/lib/auth/authorization";
import { prisma } from "@/lib/prisma";


type EditTestPageProps = {
    params: Promise<{
        testId: string;
    }>;
};

export default async function EditTestPage({
    params,
}: EditTestPageProps) {
    await requireAdmin();

    const { testId } = await params;

    const test = await prisma.test.findUnique({
        where: {
            id: testId,
        },
        select: {
            id: true,
            testCode: true,
            testName: true,
            shortName: true,
            price: true,
            sampleRequired: true,
            reportingTime: true,
            reportHeading: true,
            description: true,
            paragraph: true,
        },
    });

    if (!test) {
        notFound();
    }

    const formTest = {
        ...test,
        price: test.price.toString(),
    };

    return (
        <div className="space-y-6">
            <div className="flex items-start justify-between gap-4">
                <div>
                    <Link
                        href="/portal/tests"
                        className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-blue-600"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Test Management
                    </Link>

                    <h2 className="mt-4 text-2xl font-bold text-slate-900">
                        Edit Test
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                        Update {test.testName}, its charges and report paragraph.
                    </p>
                </div>
            </div>

            <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <TestForm test={formTest} />
            </section>
        </div>
    );
}