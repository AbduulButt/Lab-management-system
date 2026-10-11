import {
    ArrowLeft,
    FilePlus2,
    Pencil,
    Plus,
    Trash2,
} from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { deleteTestFieldAction } from "@/actions/test-field-actions";
import {
    deleteSectionAction,
    updateSectionAction,
} from "@/actions/template-actions";
import SectionForm from "@/components/forms/section-form";
import { requireAdmin } from "@/lib/auth/authorization";
import { prisma } from "@/lib/prisma";

type TestTemplatePageProps = {
    params: Promise<{
        testId: string;
    }>;
};

export default async function TestTemplatePage({
    params,
}: TestTemplatePageProps) {
    await requireAdmin();

    const { testId } = await params;

    const test = await prisma.test.findUnique({
        where: {
            id: testId,
        },
        include: {
            sections: {
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
            _count: {
                select: {
                    fields: true,
                },
            },
        },
    });

    if (!test) {
        notFound();
    }

    const nextDisplayOrder =
        test.sections.length === 0
            ? 1
            : Math.max(
                ...test.sections.map(
                    (section) => section.displayOrder,
                ),
            ) + 1;

    return (
        <div className="space-y-6">
            <div>
                <Link
                    href="/portal/tests"
                    className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-blue-600"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Test Management
                </Link>

                <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900">
                            {test.testName} Template
                        </h2>

                        <p className="mt-1 text-sm text-slate-500">
                            Configure report sections and result-entry fields.
                        </p>
                    </div>

                    <div className="rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm shadow-sm">
                        <span className="font-semibold text-slate-900">
                            {test.sections.length}
                        </span>{" "}
                        sections ·{" "}
                        <span className="font-semibold text-slate-900">
                            {test._count.fields}
                        </span>{" "}
                        fields
                    </div>
                </div>
            </div>

            <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-slate-900">
                    Add Section
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                    Sections organize related result fields in the entry form
                    and final report.
                </p>

                <div className="mt-5">
                    <SectionForm
                        testId={test.id}
                        nextDisplayOrder={nextDisplayOrder}
                    />
                </div>
            </section>

            <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-200 p-5">
                    <h3 className="font-semibold text-slate-900">
                        Template Sections
                    </h3>

                    <p className="mt-1 text-sm text-slate-500">
                        Add fields to each section after creating it.
                    </p>
                </div>

                {test.sections.length === 0 ? (
                    <div className="flex min-h-64 flex-col items-center justify-center p-8 text-center">
                        <div className="rounded-full bg-slate-100 p-4 text-slate-500">
                            <FilePlus2 className="h-8 w-8" />
                        </div>

                        <h4 className="mt-4 font-semibold text-slate-900">
                            No sections created
                        </h4>

                        <p className="mt-2 max-w-md text-sm text-slate-500">
                            Create a section such as Blood Complete Count or
                            Clinical Interpretation.
                        </p>
                    </div>
                ) : (
                    <div className="divide-y divide-slate-200">
                        {test.sections.map((section) => {
                            const updateAction =
                                updateSectionAction.bind(
                                    null,
                                    test.id,
                                    section.id,
                                );

                            const deleteAction =
                                deleteSectionAction.bind(
                                    null,
                                    test.id,
                                    section.id,
                                );

                            return (
                                <article
                                    key={section.id}
                                    className="p-5"
                                >
                                    <form
                                        action={updateAction}
                                        className="grid gap-4 lg:grid-cols-[1fr_150px_auto]"
                                    >
                                        <div>
                                            <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                                                Section Name
                                            </label>

                                            <input
                                                name="sectionName"
                                                defaultValue={
                                                    section.sectionName
                                                }
                                                required
                                                className="h-10 w-full rounded-lg border border-slate-300 px-3 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                                            />
                                        </div>

                                        <div>
                                            <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                                                Display Order
                                            </label>

                                            <input
                                                name="displayOrder"
                                                type="number"
                                                min="0"
                                                defaultValue={
                                                    section.displayOrder
                                                }
                                                required
                                                className="h-10 w-full rounded-lg border border-slate-300 px-3 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                                            />
                                        </div>

                                        <div className="flex items-end gap-2">
                                            <button
                                                type="submit"
                                                title="Save section changes"
                                                className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 text-sm font-semibold text-blue-700 transition hover:bg-blue-100"
                                            >
                                                <Pencil className="h-4 w-4" />
                                                Save
                                            </button>

                                            <button
                                                type="submit"
                                                form={`delete-section-${section.id}`}
                                                title="Delete section"
                                                className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-red-200 text-red-600 transition hover:bg-red-50"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </form>

                                    <form
                                        id={`delete-section-${section.id}`}
                                        action={deleteAction}
                                    />

                                    <div className="mt-5 overflow-x-auto rounded-lg border border-slate-200">
                                        <div className="flex items-center justify-between gap-4 bg-blue-600 px-4 py-4 text-white">
                                            <div>
                                                <h4 className="font-semibold">
                                                    {test.reportHeading ||
                                                        test.testName}
                                                </h4>

                                                <p className="mt-1 text-sm text-blue-100">
                                                    {section.sectionName}
                                                </p>
                                            </div>

                                            <Link
                                                href={`/portal/tests/${test.id}/template/fields/add?sectionId=${section.id}`}
                                                className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-white px-3 py-2 text-sm font-semibold text-blue-700 transition hover:bg-blue-50"
                                            >
                                                <Plus className="h-4 w-4" />
                                                Add Field
                                            </Link>
                                        </div>

                                        <table className="min-w-full border-collapse">
                                            <thead className="bg-white">
                                                <tr className="border-b border-slate-200">
                                                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">
                                                        Test No
                                                    </th>
                                                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">
                                                        Desc
                                                    </th>
                                                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">
                                                        Result
                                                    </th>
                                                    <th className="px-4 py-3 text-center text-sm font-semibold text-slate-700">
                                                        Abnormal
                                                    </th>
                                                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">
                                                        Female
                                                    </th>
                                                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">
                                                        Male
                                                    </th>
                                                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">
                                                        Unit
                                                    </th>
                                                    <th className="px-4 py-3 text-right text-sm font-semibold text-slate-700">
                                                        Action
                                                    </th>
                                                </tr>
                                            </thead>

                                            <tbody>
                                                <tr className="bg-slate-200">
                                                    <td
                                                        colSpan={8}
                                                        className="px-4 py-3 font-medium text-slate-800"
                                                    >
                                                        {
                                                            section.sectionName
                                                        }
                                                    </td>
                                                </tr>

                                                {section.fields.length ===
                                                    0 ? (
                                                    <tr>
                                                        <td
                                                            colSpan={8}
                                                            className="px-4 py-8 text-center text-sm text-slate-500"
                                                        >
                                                            No fields added to
                                                            this section.
                                                        </td>
                                                    </tr>
                                                ) : (
                                                    section.fields.map(
                                                        (field) => {
                                                            const deleteFieldAction =
                                                                deleteTestFieldAction.bind(
                                                                    null,
                                                                    test.id,
                                                                    field.id,
                                                                );

                                                            return (
                                                                <tr
                                                                    key={
                                                                        field.id
                                                                    }
                                                                    className="border-b border-slate-200 bg-slate-50 last:border-b-0"
                                                                >
                                                                    <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-700">
                                                                        {field.fieldCode ||
                                                                            test.testCode}
                                                                    </td>

                                                                    <td className="px-4 py-3 text-sm font-medium text-slate-900">
                                                                        {
                                                                            field.fieldName
                                                                        }
                                                                    </td>

                                                                    <td className="px-4 py-3">
                                                                        <input
                                                                            disabled
                                                                            defaultValue={
                                                                                field.defaultValue ||
                                                                                ""
                                                                            }
                                                                            className="h-9 w-40 rounded border border-slate-300 bg-white px-2 text-sm text-slate-700 disabled:cursor-not-allowed disabled:opacity-100"
                                                                        />
                                                                    </td>

                                                                    <td className="px-4 py-3 text-center">
                                                                        <input
                                                                            type="checkbox"
                                                                            disabled
                                                                            className="h-4 w-4"
                                                                        />
                                                                    </td>

                                                                    <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-700">
                                                                        {field.femaleRangeText ||
                                                                            "—"}
                                                                    </td>

                                                                    <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-700">
                                                                        {field.maleRangeText ||
                                                                            "—"}
                                                                    </td>

                                                                    <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-700">
                                                                        {field.unit ||
                                                                            "—"}
                                                                    </td>

                                                                    <td className="px-4 py-3 text-right">
                                                                        <form
                                                                            action={
                                                                                deleteFieldAction
                                                                            }
                                                                        >
                                                                            <button
                                                                                type="submit"
                                                                                title="Delete field"
                                                                                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-red-200 text-red-600 transition hover:bg-red-50"
                                                                            >
                                                                                <Trash2 className="h-4 w-4" />
                                                                            </button>
                                                                        </form>
                                                                    </td>
                                                                </tr>
                                                            );
                                                        },
                                                    )
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                )}
            </section>
        </div>
    );
}