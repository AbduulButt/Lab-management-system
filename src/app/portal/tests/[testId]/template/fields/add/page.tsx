import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import TestFieldForm from "@/components/forms/test-field-form";
import { requireAdmin } from "@/lib/auth/authorization";
import { prisma } from "@/lib/prisma";

type AddFieldPageProps = {
    params: Promise<{
        testId: string;
    }>;

    searchParams: Promise<{
        sectionId?: string;
    }>;
};

export default async function AddFieldPage({
    params,
    searchParams,
}: AddFieldPageProps) {
    await requireAdmin();

    const { testId } = await params;
    const { sectionId } = await searchParams;

    const test = await prisma.test.findUnique({
        where: {
            id: testId,
        },
        include: {
            sections: {
                orderBy: {
                    displayOrder: "asc",
                },
                select: {
                    id: true,
                    sectionName: true,
                },
            },
            fields: {
                select: {
                    displayOrder: true,
                },
            },
        },
    });

    if (!test) {
        notFound();
    }

    if (test.sections.length === 0) {
        return (
            <section className="rounded-xl border border-amber-200 bg-amber-50 p-6">
                <h2 className="text-xl font-bold text-amber-900">
                    Create a section first
                </h2>

                <p className="mt-2 text-amber-800">
                    A result field must belong to a template section.
                </p>

                <Link
                    href={`/portal/tests/${testId}/template`}
                    className="mt-5 inline-flex rounded-lg bg-amber-700 px-4 py-2 font-semibold text-white"
                >
                    Return to Template
                </Link>
            </section>
        );
    }

    const nextDisplayOrder =
        test.fields.length === 0
            ? 1
            : Math.max(
                ...test.fields.map((field) => field.displayOrder),
            ) + 1;

    return (
        <div className="space-y-6">
            <div>
                <Link
                    href={`/portal/tests/${testId}/template`}
                    className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-blue-600"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Template
                </Link>

                <h2 className="mt-4 text-2xl font-bold text-slate-900">
                    Add Result Field
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                    Add a row to the {test.testName} result-entry template.
                </p>
            </div>

            <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <TestFieldForm
                    testId={test.id}
                    sections={test.sections}
                    defaultSectionId={sectionId}
                    nextDisplayOrder={nextDisplayOrder}
                />
            </section>
        </div>
    );
}