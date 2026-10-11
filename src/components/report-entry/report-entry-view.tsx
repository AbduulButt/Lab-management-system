"use client";

import Link from "next/link";
import {
    CheckCircle2,
    FileText,
    Printer,
    Search,
    Send,
} from "lucide-react";
import { useMemo, useState } from "react";

type PatientTestRow = {
    id: string;
    testCode: string;
    testName: string;
    status: "PENDING" | "DRAFT" | "COMPLETED";
    hasResults: boolean;
};

type ReceiptData = {
    id: string;
    receiptNumber: string;
    mrNumber: string;
    patientName: string;
    fatherOrHusband: string;
    ageValue: number | null;
    ageUnit: "YEARS" | "MONTHS" | "DAYS";
    gender: "MALE" | "FEMALE" | "OTHER";
    registrationDate: string;
    registrationCenter: string;
    specimen: string;
    consultant: string;
    address: string;
    contactNumber: string;
    cnic: string;
    tests: PatientTestRow[];
};

type RecentReceipt = {
    id: string;
    receiptNumber: string;
    patientName: string;
};

function formatGender(
    gender: ReceiptData["gender"],
) {
    return {
        MALE: "Male",
        FEMALE: "Female",
        OTHER: "Other",
    }[gender];
}

function formatAge(
    value: number | null,
    unit: ReceiptData["ageUnit"],
) {
    if (value === null) {
        return "N/A";
    }

    return `${value} ${{
            YEARS: "Years",
            MONTHS: "Months",
            DAYS: "Days",
        }[unit]
        }`;
}

function formatDateTime(value: string) {
    return new Intl.DateTimeFormat("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
    }).format(new Date(value));
}

export default function ReportEntryView({
    receipt,
    recentReceipts,
}: {
    receipt: ReceiptData;
    recentReceipts: RecentReceipt[];
}) {
    const [search, setSearch] = useState("");
    const [selectedTests, setSelectedTests] = useState<string[]>([]);

    const filteredReceipts = useMemo(() => {
        const query = search.trim().toLowerCase();

        if (!query) {
            return recentReceipts;
        }

        return recentReceipts.filter(
            (item) =>
                item.receiptNumber.toLowerCase().includes(query) ||
                item.patientName.toLowerCase().includes(query),
        );
    }, [recentReceipts, search]);

    function toggleTest(testId: string) {
        setSelectedTests((current) =>
            current.includes(testId)
                ? current.filter((id) => id !== testId)
                : [...current, testId],
        );
    }

    return (
        <section className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-slate-900">
                    Report Entry
                </h1>

                <p className="mt-2 text-slate-500">
                    Select a test to open its predefined result template.
                </p>
            </div>

            <div className="grid gap-6 xl:grid-cols-[240px_minmax(0,1fr)]">
                <aside className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                    <div className="border-b border-slate-200 p-4">
                        <div className="relative">
                            <Search className="pointer-events-none absolute left-3 top-2.5 h-5 w-5 text-slate-400" />

                            <input
                                value={search}
                                onChange={(event) => setSearch(event.target.value)}
                                placeholder="Filter records"
                                className="h-10 w-full rounded-lg border border-slate-300 pl-10 pr-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                            />
                        </div>
                    </div>

                    <div className="border-b border-slate-200 bg-slate-50 px-4 py-3">
                        <p className="font-bold text-slate-900">
                            Lab No
                        </p>
                    </div>

                    <div className="max-h-[680px] overflow-y-auto">
                        {filteredReceipts.map((item) => {
                            const active = item.id === receipt.id;

                            return (
                                <Link
                                    key={item.id}
                                    href={`/portal/report-entry/${item.id}`}
                                    className={`block border-b border-slate-200 px-4 py-4 transition ${active
                                            ? "bg-blue-50"
                                            : "bg-white hover:bg-slate-50"
                                        }`}
                                >
                                    <span
                                        className={`inline-flex rounded-md border px-3 py-2 font-semibold ${active
                                                ? "border-blue-500 bg-blue-600 text-white"
                                                : "border-red-300 text-red-600"
                                            }`}
                                    >
                                        {item.receiptNumber}
                                    </span>

                                    <p className="mt-2 truncate text-xs text-slate-500">
                                        {item.patientName}
                                    </p>
                                </Link>
                            );
                        })}
                    </div>
                </aside>

                <div className="space-y-6">
                    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                        <div className="grid gap-x-10 gap-y-4 lg:grid-cols-3">
                            <Info label="Receipt No" value={receipt.receiptNumber} />
                            <Info label="Case No" value={receipt.mrNumber} />
                            <Info
                                label="Reg Date"
                                value={formatDateTime(receipt.registrationDate)}
                            />

                            <Info label="Patient Name" value={receipt.patientName} />
                            <Info
                                label="Father / Husband"
                                value={receipt.fatherOrHusband}
                            />
                            <Info
                                label="Age / Sex"
                                value={`${formatAge(
                                    receipt.ageValue,
                                    receipt.ageUnit,
                                )} / ${formatGender(receipt.gender)}`}
                            />

                            <Info
                                label="Reg Center"
                                value={receipt.registrationCenter}
                            />
                            <Info label="Specimen" value={receipt.specimen} />
                            <Info label="Consultant" value={receipt.consultant} />

                            <Info label="Address" value={receipt.address} />
                            <Info
                                label="Contact No"
                                value={receipt.contactNumber}
                            />
                            <Info label="CNIC No" value={receipt.cnic} />
                        </div>

                        <div className="mt-6 flex flex-wrap gap-3">
                            <Link
                                href={`/portal/reports/${receipt.id}/print`}
                                target="_blank"
                                className="inline-flex h-10 items-center gap-2 rounded-lg bg-blue-600 px-4 font-semibold text-white hover:bg-blue-700"
                            >
                                <Printer className="h-4 w-4" />
                                Print Report with Header
                            </Link>

                            <Link
                                href={`/portal/reports/${receipt.id}/print?header=false`}
                                target="_blank"
                                className="inline-flex h-10 items-center gap-2 rounded-lg bg-emerald-600 px-4 font-semibold text-white hover:bg-emerald-700"
                            >
                                <Printer className="h-4 w-4" />
                                Print Report without Header
                            </Link>

                            <button
                                type="button"
                                disabled={selectedTests.length === 0}
                                className="inline-flex h-10 items-center gap-2 rounded-lg bg-red-600 px-4 font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                <FileText className="h-4 w-4" />
                                Print Combined Selected Reports
                            </button>

                            <button
                                type="button"
                                className="inline-flex h-10 items-center gap-2 rounded-lg bg-sky-500 px-4 font-semibold text-white hover:bg-sky-600"
                            >
                                <Send className="h-4 w-4" />
                                Send SMS
                            </button>
                        </div>
                    </div>

                    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                        <div className="border-b border-slate-200 px-6 py-4">
                            <h2 className="text-lg font-bold text-slate-900">
                                Patient Tests
                            </h2>

                            <p className="mt-1 text-sm text-slate-500">
                                Red means pending. Green means results are completed.
                            </p>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[760px] border-collapse">
                                <thead className="bg-slate-50">
                                    <tr>
                                        <th className="w-16 px-4 py-3" />
                                        <th className="px-4 py-3 text-left font-bold text-slate-900">
                                            Test ID
                                        </th>
                                        <th className="px-4 py-3 text-left font-bold text-slate-900">
                                            Test Description
                                        </th>
                                        <th className="w-40 px-4 py-3 text-left font-bold text-slate-900">
                                            Status
                                        </th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {receipt.tests.map((test) => {
                                        const completed =
                                            test.status === "COMPLETED";

                                        return (
                                            <tr
                                                key={test.id}
                                                className={`border-t border-white text-white ${completed
                                                        ? "bg-emerald-600 hover:bg-emerald-700"
                                                        : "bg-red-500 hover:bg-red-600"
                                                    }`}
                                            >
                                                <td className="px-4 py-4 text-center">
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedTests.includes(test.id)}
                                                        onChange={() => toggleTest(test.id)}
                                                        className="h-4 w-4"
                                                    />
                                                </td>

                                                <td className="px-4 py-4 font-bold">
                                                    {test.testCode}
                                                </td>

                                                <td className="px-4 py-4">
                                                    <Link
                                                        href={`/portal/report-entry/${receipt.id}/tests/${test.id}`}
                                                        className="block font-semibold underline-offset-4 hover:underline"
                                                    >
                                                        {test.testName}
                                                    </Link>
                                                </td>

                                                <td className="px-4 py-4">
                                                    <span className="inline-flex items-center gap-2 font-semibold">
                                                        {completed ? (
                                                            <CheckCircle2 className="h-4 w-4" />
                                                        ) : null}

                                                        {completed
                                                            ? "Completed"
                                                            : test.status === "DRAFT"
                                                                ? "Draft"
                                                                : "Pending"}
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    })}

                                    {receipt.tests.length === 0 ? (
                                        <tr>
                                            <td
                                                colSpan={4}
                                                className="px-6 py-14 text-center text-slate-500"
                                            >
                                                No tests are attached to this receipt.
                                            </td>
                                        </tr>
                                    ) : null}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

function Info({
    label,
    value,
}: {
    label: string;
    value: string;
}) {
    return (
        <div className="grid grid-cols-[120px_1fr] gap-3 text-sm">
            <span className="font-medium text-slate-600">
                {label}
            </span>

            <span className="font-bold text-slate-900">
                {value}
            </span>
        </div>
    )
}