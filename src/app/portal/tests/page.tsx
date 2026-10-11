import {
    CircleOff,
    FlaskConical,
    Pencil,
    Plus,
    Search,
    Settings2,
} from "lucide-react";
import Link from "next/link";

import { RecordStatus } from "@/generated/prisma/client";
import { requireAdmin } from "@/lib/auth/authorization";
import { prisma } from "@/lib/prisma";
import InitializeStandardTestsButton from "@/components/initialize-standard-tests-button";

type TestsPageProps = {
    searchParams: Promise<{
        q?: string;
    }>;
};

function formatCurrency(value: string): string {
    const amount = Number(value);

    return new Intl.NumberFormat("en-PK", {
        style: "currency",
        currency: "PKR",
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
    }).format(amount);
}

export default async function TestsPage({
    searchParams,
}: TestsPageProps) {
    await requireAdmin();
    const parameters = await searchParams;

    const query = parameters.q?.trim() ?? "";

    const tests = await prisma.test.findMany({
        where: query
            ? {
                OR: [
                    {
                        testCode: {
                            contains: query,
                            mode: "insensitive",
                        },
                    },
                    {
                        testName: {
                            contains: query,
                            mode: "insensitive",
                        },
                    },
                    {
                        shortName: {
                            contains: query,
                            mode: "insensitive",
                        },
                    },
                ],
            }
            : undefined,

        orderBy: {
            testName: "asc",
        },

        include: {
            _count: {
                select: {
                    sections: true,
                    fields: true,
                },
            },
        },
    });


    return (
        <div className="space-y-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900">
                        Test Management
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                        Manage laboratory tests, prices, report paragraphs and templates.
                    </p>
                </div>

                <Link
                    href="/portal/tests/add"
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 text-sm font-semibold text-white transition hover:bg-blue-700"
                >
                    <Plus className="h-5 w-5" />
                    Add New Test
                </Link>
            </div>

            <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 p-5">
                    <div>
                        <h3 className="font-semibold text-slate-900">
                            Existing Tests
                        </h3>

                        <p className="mt-1 text-sm text-slate-500">
                            {tests.length} test{tests.length === 1 ? "" : "s"} found
                        </p>
                    </div>

                    <form className="relative w-full sm:w-80">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                        <input
                            type="search"
                            name="q"
                            defaultValue={query}
                            placeholder="Search code or test name..."
                            className="h-10 w-full rounded-lg border border-slate-300 pl-10 pr-4 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                        />
                    </form>
                </div>

                {tests.length === 0 ? (
                    <div className="flex min-h-72 flex-col items-center justify-center p-8 text-center">
                        <div className="rounded-full bg-slate-100 p-4 text-slate-500">
                            <FlaskConical className="h-8 w-8" />
                        </div>

                        <h3 className="mt-4 font-semibold text-slate-900">
                            No tests found
                        </h3>

                        <p className="mt-2 max-w-sm text-sm text-slate-500">
                            Add your first laboratory test or change the search term.
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-200">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                                        Code
                                    </th>

                                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                                        Test
                                    </th>

                                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                                        Sample
                                    </th>

                                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                                        Reporting
                                    </th>

                                    <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                                        Price
                                    </th>

                                    <th className="px-5 py-3 text-center text-xs font-semibold uppercase tracking-wide text-slate-500">
                                        Template
                                    </th>

                                    <th className="px-5 py-3 text-center text-xs font-semibold uppercase tracking-wide text-slate-500">
                                        Status
                                    </th>

                                    <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <div className="flex flex-wrap items-center gap-3">
                                <InitializeStandardTestsButton />

                                <Link
                                    href="/portal/tests/add"
                                    className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 text-sm font-semibold text-white transition hover:bg-blue-700"
                                >
                                    <Plus className="h-5 w-5" />
                                    Add New Test
                                </Link>
                            </div>

                            <tbody className="divide-y divide-slate-200 bg-white">
                                {tests.map((test) => (
                                    <tr key={test.id} className="hover:bg-slate-50">
                                        <td className="whitespace-nowrap px-5 py-4 text-sm font-semibold text-blue-700">
                                            {test.testCode}
                                        </td>

                                        <td className="px-5 py-4">
                                            <p className="font-medium text-slate-900">
                                                {test.testName}
                                            </p>

                                            {test.shortName ? (
                                                <p className="mt-1 text-xs text-slate-500">
                                                    {test.shortName}
                                                </p>
                                            ) : null}
                                        </td>

                                        <td className="px-5 py-4 text-sm text-slate-600">
                                            {test.sampleRequired || "—"}
                                        </td>

                                        <td className="px-5 py-4 text-sm text-slate-600">
                                            {test.reportingTime || "—"}
                                        </td>

                                        <td className="whitespace-nowrap px-5 py-4 text-right text-sm font-semibold text-slate-900">
                                            {formatCurrency(test.price.toString())}
                                        </td>

                                        <td className="px-5 py-4 text-center text-sm text-slate-600">
                                            {test._count.sections} sections /{" "}
                                            {test._count.fields} fields
                                        </td>

                                        <td className="px-5 py-4 text-center">
                                            <span
                                                className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${test.status === RecordStatus.ACTIVE
                                                    ? "bg-emerald-100 text-emerald-700"
                                                    : "bg-slate-200 text-slate-600"
                                                    }`}
                                            >
                                                {test.status === RecordStatus.ACTIVE
                                                    ? "Active"
                                                    : "Inactive"}
                                            </span>
                                        </td>

                                        <td className="px-5 py-4">
                                            <div className="flex justify-end gap-2">
                                                <Link
                                                    href={`/portal/tests/${test.id}/template`}
                                                    title="Manage template"
                                                    className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-300 text-slate-600 transition hover:border-blue-500 hover:bg-blue-50 hover:text-blue-700"
                                                >
                                                    <Settings2 className="h-4 w-4" />
                                                </Link>

                                                <Link
                                                    href={`/portal/tests/${test.id}/edit`}
                                                    title="Edit test"
                                                    className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-300 text-slate-600 transition hover:border-blue-500 hover:bg-blue-50 hover:text-blue-700"
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                </Link>

                                                <button
                                                    type="button"
                                                    disabled
                                                    title="Status action will be added next"
                                                    className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-300"
                                                >
                                                    <CircleOff className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>
        </div>
    );
}