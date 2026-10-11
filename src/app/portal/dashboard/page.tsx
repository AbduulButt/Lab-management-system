import Link from "next/link";
import {
    Banknote,
    CheckCircle2,
    Clock3,
    FileText,
    FlaskConical,
    Plus,
    ReceiptText,
    TestTube2,
    Users,
} from "lucide-react";

import { requireAuthenticatedUser } from "@/lib/auth/authorization";
import { prisma } from "@/lib/prisma";

function getTodayRange() {
    const start = new Date();

    start.setHours(0, 0, 0, 0);

    const end = new Date(start);

    end.setDate(end.getDate() + 1);

    return {
        start,
        end,
    };
}

function formatCurrency(value: number) {
    return new Intl.NumberFormat("en-PK", {
        style: "currency",
        currency: "PKR",
        maximumFractionDigits: 0,
    }).format(value);
}

function formatDateTime(value: Date) {
    return new Intl.DateTimeFormat("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
    }).format(value);
}

function formatAge(
    ageValue: number | null,
    ageUnit: "YEARS" | "MONTHS" | "DAYS",
) {
    if (ageValue === null) {
        return "N/A";
    }

    const unit = {
        YEARS: "yr",
        MONTHS: "mo",
        DAYS: "day",
    }[ageUnit];

    return `${ageValue} ${unit}`;
}

export default async function DashboardPage() {
    const user = await requireAuthenticatedUser();

    const { start, end } = getTodayRange();

    const [
        todaysPatients,
        todaysReceipts,
        pendingReports,
        completedReportsToday,
        testsPerformedToday,
        todaysCollection,
        recentReceipts,
        recentPendingReceipts,
    ] = await Promise.all([
        prisma.patient.count({
            where: {
                createdAt: {
                    gte: start,
                    lt: end,
                },
            },
        }),

        prisma.receipt.count({
            where: {
                collectionDate: {
                    gte: start,
                    lt: end,
                },
            },
        }),

        prisma.receipt.count({
            where: {
                patientTests: {
                    some: {
                        status: {
                            not: "COMPLETED",
                        },
                    },
                },
            },
        }),

        prisma.receipt.count({
            where: {
                collectionDate: {
                    gte: start,
                    lt: end,
                },

                patientTests: {
                    some: {},
                    every: {
                        status: "COMPLETED",
                    },
                },
            },
        }),

        prisma.patientTest.count({
            where: {
                status: "COMPLETED",

                completedAt: {
                    gte: start,
                    lt: end,
                },
            },
        }),

        prisma.receipt.aggregate({
            where: {
                collectionDate: {
                    gte: start,
                    lt: end,
                },
            },

            _sum: {
                paidAmount: true,
            },
        }),

        prisma.receipt.findMany({
            orderBy: {
                collectionDate: "desc",
            },

            take: 6,

            include: {
                patient: {
                    select: {
                        mrNumber: true,
                    },
                },

                patientTests: {
                    select: {
                        id: true,
                        testNameSnapshot: true,
                        status: true,
                    },
                },
            },
        }),

        prisma.receipt.findMany({
            where: {
                patientTests: {
                    some: {
                        status: {
                            not: "COMPLETED",
                        },
                    },
                },
            },

            orderBy: {
                collectionDate: "desc",
            },

            take: 6,

            include: {
                patientTests: {
                    where: {
                        status: {
                            not: "COMPLETED",
                        },
                    },

                    select: {
                        id: true,
                        testCodeSnapshot: true,
                        testNameSnapshot: true,
                        status: true,
                    },
                },
            },
        }),
    ]);

    const collectionAmount = Number(
        todaysCollection._sum.paidAmount?.toString() ?? 0,
    );

    const stats = [
        {
            title: "Today's Patients",
            value: todaysPatients.toString(),
            description: "Registered today",
            icon: Users,
            iconClass: "bg-blue-50 text-blue-600",
        },
        {
            title: "Today's Receipts",
            value: todaysReceipts.toString(),
            description: "Sample collections",
            icon: ReceiptText,
            iconClass: "bg-cyan-50 text-cyan-600",
        },
        {
            title: "Pending Reports",
            value: pendingReports.toString(),
            description: "Awaiting results",
            icon: Clock3,
            iconClass: "bg-amber-50 text-amber-600",
        },
        {
            title: "Completed Reports",
            value: completedReportsToday.toString(),
            description: "Completed today",
            icon: CheckCircle2,
            iconClass: "bg-emerald-50 text-emerald-600",
        },
        {
            title: "Tests Performed",
            value: testsPerformedToday.toString(),
            description: "Tests completed today",
            icon: TestTube2,
            iconClass: "bg-violet-50 text-violet-600",
        },
        {
            title: "Today's Collection",
            value: formatCurrency(collectionAmount),
            description: "Total paid amount",
            icon: Banknote,
            iconClass: "bg-green-50 text-green-600",
        },
    ];

    return (
        <section className="min-h-screen space-y-7 p-1">
            <div className="flex flex-col gap-4 rounded-2xl border border-white/60 bg-white/90 p-6 shadow-sm backdrop-blur-sm sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-950">
                        Dashboard
                    </h1>

                    <p className="mt-2 text-slate-500">
                        Overview of today&apos;s laboratory activity.
                    </p>
                </div>

                <Link
                    href="/portal/sample-collection"
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 font-semibold text-white shadow-sm transition hover:bg-blue-700"
                >
                    <Plus className="h-5 w-5" />
                    New Sample Collection
                </Link>
            </div>

            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                {stats.map((stat) => {
                    const Icon = stat.icon;

                    return (
                        <div
                            key={stat.title}
                            className="rounded-2xl border border-white/70 bg-white/95 p-7 shadow-sm backdrop-blur-sm"
                        >
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <p className="text-base font-medium text-slate-500">
                                        {stat.title}
                                    </p>

                                    <p className="mt-4 text-4xl font-bold tracking-tight text-slate-950">
                                        {stat.value}
                                    </p>

                                    <p className="mt-3 text-sm text-slate-500">
                                        {stat.description}
                                    </p>
                                </div>

                                <div
                                    className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${stat.iconClass}`}
                                >
                                    <Icon className="h-7 w-7" />
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="grid gap-6 xl:grid-cols-2">
                <DashboardCard
                    title="Recent Sample Collections"
                    description="Latest registered laboratory receipts."
                    actionHref="/portal/reports"
                    actionText="View all reports"
                >
                    {recentReceipts.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[650px] border-collapse">
                                <thead>
                                    <tr className="border-b border-slate-200 bg-slate-50">
                                        <TableHeader>Lab No</TableHeader>
                                        <TableHeader>Patient</TableHeader>
                                        <TableHeader>Tests</TableHeader>
                                        <TableHeader>Paid</TableHeader>
                                        <TableHeader>Date & Time</TableHeader>
                                        <TableHeader />
                                    </tr>
                                </thead>

                                <tbody>
                                    {recentReceipts.map((receipt) => (
                                        <tr
                                            key={receipt.id}
                                            className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50"
                                        >
                                            <TableCell strong>
                                                {receipt.receiptNumber.toString()}
                                            </TableCell>

                                            <TableCell>
                                                <div>
                                                    <p className="font-semibold text-slate-900">
                                                        {receipt.patientNameSnapshot}
                                                    </p>

                                                    <p className="mt-0.5 text-xs text-slate-500">
                                                        MR {receipt.patient.mrNumber.toString()} ·{" "}
                                                        {formatAge(
                                                            receipt.ageValue,
                                                            receipt.ageUnit,
                                                        )}
                                                    </p>
                                                </div>
                                            </TableCell>

                                            <TableCell>
                                                {receipt.patientTests.length}
                                            </TableCell>

                                            <TableCell>
                                                {formatCurrency(
                                                    Number(receipt.paidAmount.toString()),
                                                )}
                                            </TableCell>

                                            <TableCell>
                                                {formatDateTime(receipt.collectionDate)}
                                            </TableCell>

                                            <TableCell>
                                                <Link
                                                    href={`/portal/report-entry/${receipt.id}`}
                                                    className="inline-flex h-8 items-center rounded-lg bg-blue-50 px-3 text-xs font-semibold text-blue-700 hover:bg-blue-100"
                                                >
                                                    Open
                                                </Link>
                                            </TableCell>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <EmptyState
                            icon={FlaskConical}
                            title="No sample collections available"
                            description="New sample collections will appear here."
                        />
                    )}
                </DashboardCard>

                <DashboardCard
                    title="Pending Reports"
                    description="Receipts with incomplete test results."
                    actionHref="/portal/pending-reports"
                    actionText="View pending reports"
                >
                    {recentPendingReceipts.length > 0 ? (
                        <div className="space-y-3">
                            {recentPendingReceipts.map((receipt) => (
                                <div
                                    key={receipt.id}
                                    className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between"
                                >
                                    <div className="min-w-0">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <span className="rounded-lg bg-red-100 px-2.5 py-1 text-xs font-bold text-red-700">
                                                Lab {receipt.receiptNumber.toString()}
                                            </span>

                                            <p className="font-semibold text-slate-900">
                                                {receipt.patientNameSnapshot}
                                            </p>
                                        </div>

                                        <div className="mt-2 flex flex-wrap gap-1.5">
                                            {receipt.patientTests.map((test) => (
                                                <span
                                                    key={test.id}
                                                    className={`rounded-full px-2.5 py-1 text-xs font-semibold ${test.status === "DRAFT"
                                                        ? "bg-amber-100 text-amber-700"
                                                        : "bg-red-100 text-red-700"
                                                        }`}
                                                >
                                                    {test.testCodeSnapshot}
                                                </span>
                                            ))}
                                        </div>

                                        <p className="mt-2 text-xs text-slate-500">
                                            {formatDateTime(receipt.collectionDate)}
                                        </p>
                                    </div>

                                    <Link
                                        href={`/portal/report-entry/${receipt.id}`}
                                        className="inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-lg bg-red-600 px-4 text-sm font-semibold text-white hover:bg-red-700"
                                    >
                                        <FileText className="h-4 w-4" />
                                        Edit Test
                                    </Link>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <EmptyState
                            icon={CheckCircle2}
                            title="No pending reports available"
                            description="All laboratory reports are completed."
                        />
                    )}
                </DashboardCard>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <QuickAction
                    href="/portal/sample-collection"
                    icon={Plus}
                    title="Sample Collection"
                    description="Register a new patient receipt"
                />

                <QuickAction
                    href="/portal/reports"
                    icon={ReceiptText}
                    title="Reports"
                    description="View all patient receipts"
                />

                <QuickAction
                    href="/portal/pending-reports"
                    icon={Clock3}
                    title="Pending Reports"
                    description="Complete outstanding tests"
                />

                {user.role === "ADMIN" ? (
                    <QuickAction
                        href="/portal/tests"
                        icon={FlaskConical}
                        title="Test Management"
                        description="Manage tests and templates"
                    />
                ) : null}
            </div>
        </section>
    );
}

function DashboardCard({
    title,
    description,
    actionHref,
    actionText,
    children,
}: {
    title: string;
    description: string;
    actionHref: string;
    actionText: string;
    children: React.ReactNode;
}) {
    return (
        <div className="overflow-hidden rounded-2xl border border-white/70 bg-white/95 shadow-sm backdrop-blur-sm">
            <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-6 py-5">
                <div>
                    <h2 className="text-xl font-bold text-slate-950">
                        {title}
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                        {description}
                    </p>
                </div>

                <Link
                    href={actionHref}
                    className="shrink-0 text-sm font-semibold text-blue-600 hover:text-blue-700"
                >
                    {actionText}
                </Link>
            </div>

            <div className="p-5">{children}</div>
        </div>
    );
}

function TableHeader({
    children,
}: {
    children?: React.ReactNode;
}) {
    return (
        <th className="px-3 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
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
            className={`px-3 py-3 text-sm text-slate-700 ${strong ? "font-bold text-slate-950" : ""
                }`}
        >
            {children}
        </td>
    );
}

function EmptyState({
    icon: Icon,
    title,
    description,
}: {
    icon: typeof Users;
    title: string;
    description: string;
}) {
    return (
        <div className="flex min-h-64 flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 px-6 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-blue-600 shadow-sm">
                <Icon className="h-7 w-7" />
            </div>

            <p className="mt-4 font-semibold text-slate-900">
                {title}
            </p>

            <p className="mt-1 text-sm text-slate-500">
                {description}
            </p>
        </div>
    );
}

function QuickAction({
    href,
    icon: Icon,
    title,
    description,
}: {
    href: string;
    icon: typeof Plus;
    title: string;
    description: string;
}) {
    return (
        <Link
            href={href}
            className="group rounded-2xl border border-white/70 bg-white/95 p-5 shadow-sm backdrop-blur-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md"
        >
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600 transition group-hover:bg-blue-600 group-hover:text-white">
                <Icon className="h-5 w-5" />
            </div>

            <h3 className="mt-4 font-bold text-slate-950">
                {title}
            </h3>

            <p className="mt-1 text-sm text-slate-500">
                {description}
            </p>
        </Link>
    );
}