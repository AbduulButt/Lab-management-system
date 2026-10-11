"use client";

import Link from "next/link";
import {
    CalendarDays,
    FilePenLine,
    Search,
} from "lucide-react";
import { useMemo, useState } from "react";

type PendingTest = {
    id: string;
    code: string;
    name: string;
    status: "PENDING" | "DRAFT" | "COMPLETED";
};

type PendingReceipt = {
    id: string;
    receiptNumber: string;
    mrNumber: string;
    branchName: string;
    patientName: string;
    gender: "MALE" | "FEMALE" | "OTHER";
    ageValue: number | null;
    ageUnit: "YEARS" | "MONTHS" | "DAYS";
    phone: string;
    specimen: string;
    address: string;
    collectionDate: string;
    pendingTests: PendingTest[];
};

type PendingReportsTableProps = {
    receipts: PendingReceipt[];
};

function formatGender(
    gender: PendingReceipt["gender"],
) {
    return {
        MALE: "Male",
        FEMALE: "Female",
        OTHER: "Other",
    }[gender];
}

function formatAge(
    ageValue: number | null,
    ageUnit: PendingReceipt["ageUnit"],
) {
    if (ageValue === null) {
        return "N/A";
    }

    return `${ageValue} ${{
        YEARS: "yr",
        MONTHS: "mo",
        DAYS: "day",
    }[ageUnit]
        }`;
}

function formatDateTime(value: string) {
    return new Intl.DateTimeFormat("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
    }).format(new Date(value));
}

function dateInputValue(date: Date) {
    return date.toISOString().slice(0, 10);
}

export default function PendingReportsTable({
    receipts,
}: PendingReportsTableProps) {
    const today = new Date();

    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(
        sevenDaysAgo.getDate() - 7,
    );

    const [search, setSearch] = useState("");
    const [branch, setBranch] = useState("ALL");
    const [startDate, setStartDate] = useState(
        dateInputValue(sevenDaysAgo),
    );
    const [endDate, setEndDate] = useState(
        dateInputValue(today),
    );
    const [entries, setEntries] = useState(10);
    const [currentPage, setCurrentPage] =
        useState(1);

    const branches = useMemo(
        () =>
            Array.from(
                new Set(
                    receipts.map(
                        (receipt) => receipt.branchName,
                    ),
                ),
            ),
        [receipts],
    );

    const filteredReceipts = useMemo(() => {
        const query = search
            .trim()
            .toLowerCase();

        const start = startDate
            ? new Date(`${startDate}T00:00:00`)
            : null;

        const end = endDate
            ? new Date(`${endDate}T23:59:59`)
            : null;

        return receipts.filter((receipt) => {
            const collectionDate = new Date(
                receipt.collectionDate,
            );

            const matchesSearch =
                !query ||
                receipt.receiptNumber
                    .toLowerCase()
                    .includes(query) ||
                receipt.mrNumber
                    .toLowerCase()
                    .includes(query) ||
                receipt.patientName
                    .toLowerCase()
                    .includes(query) ||
                receipt.phone
                    .toLowerCase()
                    .includes(query) ||
                receipt.pendingTests.some(
                    (test) =>
                        test.code
                            .toLowerCase()
                            .includes(query) ||
                        test.name
                            .toLowerCase()
                            .includes(query),
                );

            const matchesBranch =
                branch === "ALL" ||
                receipt.branchName === branch;

            const matchesStart =
                !start || collectionDate >= start;

            const matchesEnd =
                !end || collectionDate <= end;

            return (
                matchesSearch &&
                matchesBranch &&
                matchesStart &&
                matchesEnd
            );
        });
    }, [
        branch,
        endDate,
        receipts,
        search,
        startDate,
    ]);

    const totalPages = Math.max(
        1,
        Math.ceil(
            filteredReceipts.length / entries,
        ),
    );

    const safeCurrentPage = Math.min(
        currentPage,
        totalPages,
    );

    const startIndex =
        (safeCurrentPage - 1) * entries;

    const visibleReceipts =
        filteredReceipts.slice(
            startIndex,
            startIndex + entries,
        );

    return (
        <section className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-slate-900">
                    Pending Reports
                </h1>

                <p className="mt-2 text-slate-500">
                    Receipts with one or more incomplete test
                    results.
                </p>
            </div>

            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-200 bg-gradient-to-r from-red-600 to-rose-500 px-6 py-5 text-white">
                    <h2 className="text-xl font-bold">
                        Pending Sample Receipts
                    </h2>

                    <p className="mt-1 text-sm text-red-100">
                        Completed receipts are removed automatically.
                    </p>
                </div>

                <div className="p-6">
                    <div className="grid gap-4 lg:grid-cols-[180px_1fr_1fr_auto]">
                        <label>
                            <span className="mb-2 block text-sm font-semibold text-slate-700">
                                Branch
                            </span>

                            <select
                                value={branch}
                                onChange={(event) => {
                                    setBranch(event.target.value);
                                    setCurrentPage(1);
                                }}
                                className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3"
                            >
                                <option value="ALL">All</option>

                                {branches.map((branchName) => (
                                    <option
                                        key={branchName}
                                        value={branchName}
                                    >
                                        {branchName}
                                    </option>
                                ))}
                            </select>
                        </label>

                        <label>
                            <span className="mb-2 block text-sm font-semibold text-slate-700">
                                Start Date
                            </span>

                            <input
                                type="date"
                                value={startDate}
                                onChange={(event) => {
                                    setStartDate(event.target.value);
                                    setCurrentPage(1);
                                }}
                                className="h-11 w-full rounded-lg border border-slate-300 px-3"
                            />
                        </label>

                        <label>
                            <span className="mb-2 block text-sm font-semibold text-slate-700">
                                End Date
                            </span>

                            <input
                                type="date"
                                value={endDate}
                                onChange={(event) => {
                                    setEndDate(event.target.value);
                                    setCurrentPage(1);
                                }}
                                className="h-11 w-full rounded-lg border border-slate-300 px-3"
                            />
                        </label>

                        <div className="flex items-end">
                            <button
                                type="button"
                                className="inline-flex h-11 items-center gap-2 rounded-lg bg-red-600 px-5 font-semibold text-white transition hover:bg-red-700"
                            >
                                <CalendarDays className="h-5 w-5" />
                                Run Report
                            </button>
                        </div>
                    </div>

                    <div className="mt-7 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <label className="flex items-center gap-2 text-slate-700">
                            Show

                            <select
                                value={entries}
                                onChange={(event) => {
                                    setEntries(
                                        Number(event.target.value),
                                    );
                                    setCurrentPage(1);
                                }}
                                className="h-10 rounded-lg border border-slate-300 bg-white px-3"
                            >
                                <option value={10}>10</option>
                                <option value={25}>25</option>
                                <option value={50}>50</option>
                                <option value={100}>100</option>
                            </select>

                            entries
                        </label>

                        <label className="flex items-center gap-2">
                            <span className="font-medium text-slate-700">
                                Search:
                            </span>

                            <div className="relative">
                                <Search className="pointer-events-none absolute left-3 top-2.5 h-5 w-5 text-slate-400" />

                                <input
                                    value={search}
                                    onChange={(event) => {
                                        setSearch(event.target.value);
                                        setCurrentPage(1);
                                    }}
                                    placeholder="Lab no, name, phone or test"
                                    className="h-10 w-72 rounded-lg border border-slate-300 pl-10 pr-3"
                                />
                            </div>
                        </label>
                    </div>

                    <div className="mt-5 overflow-x-auto rounded-lg border border-slate-200">
                        <table className="min-w-[1450px] w-full border-collapse">
                            <thead className="bg-slate-50">
                                <tr>
                                    <TableHeader>Lab No</TableHeader>
                                    <TableHeader>Branch Name</TableHeader>
                                    <TableHeader>MR No</TableHeader>
                                    <TableHeader>Name</TableHeader>
                                    <TableHeader>Sex</TableHeader>
                                    <TableHeader>Age</TableHeader>
                                    <TableHeader>Telephone</TableHeader>
                                    <TableHeader>Specimen</TableHeader>
                                    <TableHeader>Address</TableHeader>
                                    <TableHeader>Date & Time</TableHeader>
                                    <TableHeader>Pending Tests</TableHeader>
                                    <TableHeader>Action</TableHeader>
                                </tr>
                            </thead>

                            <tbody>
                                {visibleReceipts.map(
                                    (receipt, index) => (
                                        <tr
                                            key={receipt.id}
                                            className={`border-t border-slate-200 ${index % 2 === 0
                                                ? "bg-slate-50"
                                                : "bg-white"
                                                }`}
                                        >
                                            <TableCell strong>
                                                {receipt.receiptNumber}
                                            </TableCell>

                                            <TableCell>
                                                {receipt.branchName}
                                            </TableCell>

                                            <TableCell>
                                                {receipt.mrNumber}
                                            </TableCell>

                                            <TableCell strong>
                                                {receipt.patientName}
                                            </TableCell>

                                            <TableCell>
                                                {formatGender(
                                                    receipt.gender,
                                                )}
                                            </TableCell>

                                            <TableCell>
                                                {formatAge(
                                                    receipt.ageValue,
                                                    receipt.ageUnit,
                                                )}
                                            </TableCell>

                                            <TableCell>
                                                {receipt.phone}
                                            </TableCell>

                                            <TableCell>
                                                {receipt.specimen}
                                            </TableCell>

                                            <TableCell>
                                                {receipt.address}
                                            </TableCell>

                                            <TableCell>
                                                {formatDateTime(
                                                    receipt.collectionDate,
                                                )}
                                            </TableCell>

                                            <td className="border-l border-slate-200 px-3 py-3">
                                                <div className="flex max-w-[270px] flex-wrap gap-1.5">
                                                    {receipt.pendingTests.map(
                                                        (test) => (
                                                            <span
                                                                key={test.id}
                                                                className={`rounded-full px-2.5 py-1 text-xs font-semibold ${test.status === "DRAFT"
                                                                    ? "bg-amber-100 text-amber-700"
                                                                    : "bg-red-100 text-red-700"
                                                                    }`}
                                                            >
                                                                {test.code}
                                                            </span>
                                                        ),
                                                    )}
                                                </div>
                                            </td>

                                            <td className="border-l border-slate-200 px-3 py-3">
                                                <Link
                                                    href={`/portal/report-entry/${receipt.id}`}
                                                    className="inline-flex h-9 items-center gap-2 rounded-lg bg-red-600 px-4 text-sm font-semibold text-white transition hover:bg-red-700"
                                                >
                                                    <FilePenLine className="h-4 w-4" />
                                                    Edit Test
                                                </Link>
                                            </td>
                                        </tr>
                                    ),
                                )}

                                {visibleReceipts.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={12}
                                            className="px-6 py-16 text-center text-slate-500"
                                        >
                                            No pending reports found.
                                        </td>
                                    </tr>
                                ) : null}
                            </tbody>
                        </table>
                    </div>

                    <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <p className="text-sm text-slate-600">
                            Showing{" "}
                            {filteredReceipts.length === 0
                                ? 0
                                : startIndex + 1}{" "}
                            to{" "}
                            {Math.min(
                                startIndex + entries,
                                filteredReceipts.length,
                            )}{" "}
                            of {filteredReceipts.length} entries
                        </p>

                        <div className="flex items-center">
                            <button
                                type="button"
                                disabled={safeCurrentPage === 1}
                                onClick={() =>
                                    setCurrentPage((page) =>
                                        Math.max(1, page - 1),
                                    )
                                }
                                className="h-10 border border-slate-300 bg-white px-4 text-sm disabled:opacity-50"
                            >
                                Previous
                            </button>

                            <span className="inline-flex h-10 min-w-10 items-center justify-center border-y border-r border-slate-300 bg-slate-900 px-3 text-sm text-white">
                                {safeCurrentPage}
                            </span>

                            <button
                                type="button"
                                disabled={
                                    safeCurrentPage === totalPages
                                }
                                onClick={() =>
                                    setCurrentPage((page) =>
                                        Math.min(
                                            totalPages,
                                            page + 1,
                                        ),
                                    )
                                }
                                className="h-10 border-y border-r border-slate-300 bg-white px-4 text-sm disabled:opacity-50"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

function TableHeader({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <th className="border-r border-slate-200 px-3 py-3 text-left text-sm font-bold text-slate-900">
            {children}
        </th>
    );
}

function TableCell({
    children,
    strong,
}: {
    children: React.ReactNode;
    strong?: boolean;
}) {
    return (
        <td
            className={`border-l border-slate-200 px-3 py-3 text-sm text-slate-800 ${strong ? "font-semibold" : ""
                }`}
        >
            {children}
        </td>
    );
}