"use client";
import { useRouter } from "next/navigation";
import { deleteReceiptAction } from "@/actions/receipt-actions";
import Link from "next/link";
import {
    CalendarDays,
    ChevronDown,
    FilePenLine,
    FileText,
    Printer,
    Search,
    Trash2,
} from "lucide-react";
import {
    useMemo,
    useState,
    useTransition,
} from "react";

type ReceiptRow = {
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
    collectedBy: string;
    collectionDate: string;
    reportStatus: string;
    totalTests: number;
    completedTests: number;
};

type ReportsTableProps = {
    receipts: ReceiptRow[];
};

function formatGender(
    gender: ReceiptRow["gender"],
) {
    const values = {
        MALE: "Male",
        FEMALE: "Female",
        OTHER: "Other",
    };

    return values[gender];
}

function formatAge(
    ageValue: number | null,
    ageUnit: ReceiptRow["ageUnit"],
) {
    if (ageValue === null) {
        return "N/A";
    }

    const values = {
        YEARS: "yr",
        MONTHS: "mo",
        DAYS: "day",
    };

    return `${ageValue} ${values[ageUnit]}`;
}

function formatDateTime(value: string) {
    const date = new Date(value);

    return new Intl.DateTimeFormat("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
    }).format(date);
}

function dateInputValue(date: Date) {
    return date.toISOString().slice(0, 10);
}

export default function ReportsTable({
    receipts,
}: ReportsTableProps) {
    const today = new Date();

    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(
        sevenDaysAgo.getDate() - 7,
    );

    const [search, setSearch] = useState("");
    const [branch, setBranch] = useState("ALL");
    const [appliedStartDate, setAppliedStartDate] =
        useState<string | null>(null);

    const [appliedEndDate, setAppliedEndDate] =
        useState<string | null>(null);
    const [quickFilter, setQuickFilter] =
        useState("CUSTOM");
    const [sortBy, setSortBy] = useState("DATE");
    const [entries, setEntries] = useState(10);
    const [currentPage, setCurrentPage] =
        useState(1);
    const [openMenuId, setOpenMenuId] =
        useState<string | null>(null);
    const router = useRouter();

    const [isDeleting, startDeleteTransition] =
        useTransition();

    const [deletingReceiptId, setDeletingReceiptId] =
        useState<string | null>(null);

    const [deleteMessage, setDeleteMessage] =
        useState<{
            type: "success" | "error";
            text: string;
        } | null>(null);

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

        const start = appliedStartDate
            ? new Date(`${appliedStartDate}T00:00:00`)
            : null;

        let endExclusive: Date | null = null;

        if (appliedEndDate) {
            endExclusive = new Date(
                `${appliedEndDate}T00:00:00`,
            );

            endExclusive.setDate(
                endExclusive.getDate() + 1,
            );
        }

        const filtered = receipts.filter(
            (receipt) => {
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
                        .includes(query);

                const matchesBranch =
                    branch === "ALL" ||
                    receipt.branchName === branch;

                const matchesStart =
                    !start ||
                    collectionDate >= start;

                const matchesEnd =
                    !endExclusive ||
                    collectionDate < endExclusive;

                return (
                    matchesSearch &&
                    matchesBranch &&
                    matchesStart &&
                    matchesEnd
                );
            },
        );

        return [...filtered].sort((a, b) => {
            if (sortBy === "LAB_NO") {
                return Number(b.receiptNumber) -
                    Number(a.receiptNumber);
            }

            if (sortBy === "NAME") {
                return a.patientName.localeCompare(
                    b.patientName,
                );
            }

            return (
                new Date(b.collectionDate).getTime() -
                new Date(a.collectionDate).getTime()
            );
        });
    }, [
        branch,
        appliedEndDate,
        receipts,
        search,
        sortBy,
        appliedStartDate,
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

    function applyQuickFilter(value: string) {
        setQuickFilter(value);
        setCurrentPage(1);

        const current = new Date();
        const newStart = new Date(current);

        if (value === "TODAY") {
            setAppliedStartDate(dateInputValue(current));
            setAppliedEndDate(dateInputValue(current));
            return;
        }

        if (value === "LAST_7_DAYS") {
            newStart.setDate(
                current.getDate() - 7,
            );

            setAppliedStartDate(
                dateInputValue(newStart),
            );
            setAppliedEndDate(dateInputValue(current));
            return;
        }

        if (value === "LAST_30_DAYS") {
            newStart.setDate(
                current.getDate() - 30,
            );

            setAppliedStartDate(
                dateInputValue(newStart),
            );
            setAppliedEndDate(dateInputValue(current));
            return;
        }

        if (value === "THIS_MONTH") {
            newStart.setDate(1);

            setAppliedStartDate(
                dateInputValue(newStart),
            );
            setAppliedEndDate(dateInputValue(current));
        }
    }
    function handleDeleteReceipt(
        receiptId: string,
        receiptNumber: string,
        patientName: string,
    ) {
        const confirmed = window.confirm(
            `Delete receipt ${receiptNumber} for ${patientName}?\n\nThis action cannot be undone.`,
        );

        if (!confirmed) {
            return;
        }

        setDeleteMessage(null);
        setDeletingReceiptId(receiptId);
        setOpenMenuId(null);

        startDeleteTransition(async () => {
            const result =
                await deleteReceiptAction(receiptId);

            if (!result.success) {
                setDeleteMessage({
                    type: "error",
                    text: result.message,
                });

                setDeletingReceiptId(null);
                return;
            }

            setDeleteMessage({
                type: "success",
                text: result.message,
            });

            setDeletingReceiptId(null);

            router.refresh();
        });
    }

    return (
        <section className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-slate-900">
                    Sample Receipts
                </h1>

                <p className="mt-2 text-slate-500">
                    View patient receipts, enter results,
                    print receipts, and manage reports.
                </p>
            </div>

            <div className="overflow-visible rounded-2xl border border-slate-200 bg-white shadow-sm">
                {deleteMessage ? (
                    <div
                        className={`rounded-xl border px-4 py-3 text-sm font-semibold ${deleteMessage.type === "success"
                            ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                            : "border-red-200 bg-red-50 text-red-700"
                            }`}
                    >
                        {deleteMessage.text}
                    </div>
                ) : null}
                <div className="border-b border-slate-200 px-6 py-5">
                    <h2 className="text-xl font-bold text-slate-900">
                        Sample Receipts
                    </h2>
                </div>

                <div className="p-6">
                    <div className="grid gap-4 xl:grid-cols-[160px_1fr_1fr_190px_150px_auto]">
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
                                <option value="ALL">
                                    All
                                </option>

                                {branches.map(
                                    (branchName) => (
                                        <option
                                            key={branchName}
                                            value={branchName}
                                        >
                                            {branchName}
                                        </option>
                                    ),
                                )}
                            </select>
                        </label>

                        <label>
                            <span className="mb-2 block text-sm font-semibold text-slate-700">
                                Start Date
                            </span>

                            <input
                                type="date"
                                value={appliedStartDate ?? ""}
                                onChange={(event) => {
                                    setAppliedStartDate(
                                        event.target.value,
                                    );
                                    setQuickFilter("CUSTOM");
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
                                value={appliedEndDate ?? ""}
                                onChange={(event) => {
                                    setAppliedEndDate(
                                        event.target.value,
                                    );
                                    setQuickFilter("CUSTOM");
                                    setCurrentPage(1);
                                }}
                                className="h-11 w-full rounded-lg border border-slate-300 px-3"
                            />
                        </label>

                        <label>
                            <span className="mb-2 block text-sm font-semibold text-slate-700">
                                Quick Filter
                            </span>

                            <select
                                value={quickFilter}
                                onChange={(event) =>
                                    applyQuickFilter(
                                        event.target.value,
                                    )
                                }
                                className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3"
                            >
                                <option value="CUSTOM">
                                    Select Duration
                                </option>

                                <option value="TODAY">
                                    Today
                                </option>

                                <option value="LAST_7_DAYS">
                                    Last 7 Days
                                </option>

                                <option value="LAST_30_DAYS">
                                    Last 30 Days
                                </option>

                                <option value="THIS_MONTH">
                                    This Month
                                </option>
                            </select>
                        </label>

                        <label>
                            <span className="mb-2 block text-sm font-semibold text-slate-700">
                                Sort By
                            </span>

                            <select
                                value={sortBy}
                                onChange={(event) =>
                                    setSortBy(
                                        event.target.value,
                                    )
                                }
                                className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3"
                            >
                                <option value="DATE">
                                    Date
                                </option>

                                <option value="LAB_NO">
                                    Lab No
                                </option>

                                <option value="NAME">
                                    Patient Name
                                </option>
                            </select>
                        </label>

                        <div className="flex items-end">
                            <button
                                type="button"
                                onClick={() => {
                                    if (
                                        appliedStartDate &&
                                        appliedEndDate &&
                                        new Date(appliedStartDate) >
                                        new Date(appliedEndDate)
                                    ) {
                                        alert(
                                            "Start Date cannot be after End Date.",
                                        );
                                        return;
                                    }

                                    setAppliedStartDate(
                                        appliedStartDate || null,
                                    );

                                    setAppliedEndDate(
                                        appliedEndDate || null,
                                    );

                                    setCurrentPage(1);
                                }}
                                className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 font-bold text-white shadow-md transition hover:bg-blue-700"
                            >
                                <CalendarDays className="h-5 w-5" />
                                Run Report
                            </button>
                            <CalendarDays className="h-5 w-5" />
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
                                        setSearch(
                                            event.target.value,
                                        );
                                        setCurrentPage(1);
                                    }}
                                    className="h-10 w-64 rounded-lg border border-slate-300 pl-10 pr-3"
                                />
                            </div>
                        </label>
                    </div>

                    <div className="mt-5 overflow-x-auto rounded-lg border border-slate-200">
                        <table className="min-w-[1500px] w-full border-collapse">
                            <thead className="bg-slate-50">
                                <tr>
                                    <TableHeader>
                                        Lab No
                                    </TableHeader>

                                    <TableHeader>
                                        Branch Name
                                    </TableHeader>

                                    <TableHeader>
                                        MR No
                                    </TableHeader>

                                    <TableHeader>
                                        Name
                                    </TableHeader>

                                    <TableHeader>
                                        Sex
                                    </TableHeader>

                                    <TableHeader>
                                        Age
                                    </TableHeader>

                                    <TableHeader>
                                        Telephone
                                    </TableHeader>

                                    <TableHeader>
                                        Specimen
                                    </TableHeader>

                                    <TableHeader>
                                        Collected by
                                    </TableHeader>

                                    <TableHeader>
                                        Date & Time
                                    </TableHeader>

                                    <TableHeader>
                                        Action
                                    </TableHeader>

                                    <TableHeader>
                                        Option
                                    </TableHeader>
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
                                                {receipt.mrNumber || "—"}
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
                                                {receipt.collectedBy}
                                            </TableCell>

                                            <TableCell>
                                                {formatDateTime(
                                                    receipt.collectionDate,
                                                )}
                                            </TableCell>

                                            <td className="border-l border-slate-200 px-2 py-3">
                                                <div className="flex whitespace-nowrap">
                                                    <Link
                                                        href={`/portal/report-entry/${receipt.id}`}
                                                        className="inline-flex h-9 items-center bg-red-600 px-3 text-xs font-semibold text-white transition hover:bg-red-700"
                                                    >
                                                        Edit Test
                                                    </Link>

                                                    <Link
                                                        href={`/portal/receipts/${receipt.id}/print`}
                                                        target="_blank"
                                                        className="inline-flex h-9 items-center bg-cyan-600 px-3 text-xs font-semibold text-white transition hover:bg-cyan-700"
                                                    >
                                                        Print Receipt
                                                    </Link>

                                                    <Link
                                                        href={`/portal/reports/${receipt.id}/print`}
                                                        target="_blank"
                                                        className="inline-flex h-9 items-center bg-blue-600 px-3 text-xs font-semibold text-white transition hover:bg-blue-700"
                                                    >
                                                        Print Report
                                                    </Link>
                                                </div>
                                            </td>

                                            <td className="relative border-l border-slate-200 px-3 py-3">
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setOpenMenuId(
                                                            openMenuId ===
                                                                receipt.id
                                                                ? null
                                                                : receipt.id,
                                                        )
                                                    }
                                                    className="inline-flex h-9 items-center gap-2 rounded-md bg-blue-600 px-4 text-sm font-semibold text-white transition hover:bg-blue-700"
                                                >
                                                    Actions
                                                    <ChevronDown className="h-4 w-4" />
                                                </button>

                                                {openMenuId ===
                                                    receipt.id ? (
                                                    <div className="absolute right-3 top-14 z-30 w-56 overflow-hidden rounded-lg border border-slate-200 bg-white py-2 shadow-xl">
                                                        <Link
                                                            href={`/portal/sample-collection/${receipt.id}/edit`}
                                                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-100"
                                                        >
                                                            <FilePenLine className="h-4 w-4" />
                                                            Edit Receipt
                                                        </Link>

                                                        <Link
                                                            href={`/portal/report-entry/${receipt.id}`}
                                                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-100"
                                                        >
                                                            <FileText className="h-4 w-4" />
                                                            Edit Test
                                                        </Link>

                                                        <Link
                                                            href={`/portal/receipts/${receipt.id}/print`}
                                                            target="_blank"
                                                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-100"
                                                        >
                                                            <Printer className="h-4 w-4" />
                                                            Print Receipt
                                                        </Link>

                                                        <Link
                                                            href={`/portal/reports/${receipt.id}/print`}
                                                            target="_blank"
                                                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-100"
                                                        >
                                                            <Printer className="h-4 w-4" />
                                                            Print Report
                                                        </Link>

                                                        <button
                                                            type="button"
                                                            disabled={
                                                                isDeleting &&
                                                                deletingReceiptId === receipt.id
                                                            }
                                                            onClick={() =>
                                                                handleDeleteReceipt(
                                                                    receipt.id,
                                                                    receipt.receiptNumber,
                                                                    receipt.patientName,
                                                                )
                                                            }
                                                            className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                                                        >
                                                            <Trash2 className="h-4 w-4" />

                                                            {isDeleting &&
                                                                deletingReceiptId === receipt.id
                                                                ? "Deleting..."
                                                                : "Delete"}
                                                        </button>
                                                    </div>
                                                ) : null}
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
                                            No sample receipts found.
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
                                className="h-10 border border-slate-300 bg-white px-4 text-sm disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                Previous
                            </button>

                            {Array.from(
                                {
                                    length: Math.min(
                                        totalPages,
                                        5,
                                    ),
                                },
                                (_, index) => index + 1,
                            ).map((page) => (
                                <button
                                    key={page}
                                    type="button"
                                    onClick={() =>
                                        setCurrentPage(page)
                                    }
                                    className={`h-10 min-w-10 border-y border-r border-slate-300 px-3 text-sm ${safeCurrentPage === page
                                        ? "bg-slate-900 text-white"
                                        : "bg-white text-slate-700"
                                        }`}
                                >
                                    {page}
                                </button>
                            ))}

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
                                className="h-10 border-y border-r border-slate-300 bg-white px-4 text-sm disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </section >
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