import { notFound } from "next/navigation";

import AutoPrintReceipt from "@/components/receipts/auto-print-receipt";
import { requireAdmin } from "@/lib/auth/authorization";
import { prisma } from "@/lib/prisma";

type PrintReceiptPageProps = {
    params: Promise<{
        receiptId: string;
    }>;
};

function formatDate(date: Date) {
    return new Intl.DateTimeFormat("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    }).format(date);
}

function formatDateTime(date: Date) {
    return new Intl.DateTimeFormat("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    }).format(date);
}

function formatAge(
    ageValue: number | null,
    ageUnit: "YEARS" | "MONTHS" | "DAYS",
) {
    if (ageValue === null) {
        return "N/A";
    }

    const labels = {
        YEARS: "Years",
        MONTHS: "Months",
        DAYS: "Days",
    };

    return `${ageValue} ${labels[ageUnit]}`;
}

function formatGender(gender: "MALE" | "FEMALE" | "OTHER") {
    const labels = {
        MALE: "Male",
        FEMALE: "Female",
        OTHER: "Other",
    };

    return labels[gender];
}

function formatMoney(value: {
    toString(): string;
}) {
    return Number(value.toString()).toFixed(2);
}

export default async function PrintReceiptPage({
    params,
}: PrintReceiptPageProps) {
    await requireAdmin();

    const { receiptId } = await params;

    const [receipt, settings] = await Promise.all([
        prisma.receipt.findUnique({
            where: {
                id: receiptId,
            },
            include: {
                patient: true,
                doctor: true,
                collectedBy: {
                    select: {
                        fullName: true,
                    },
                },
                patientTests: {
                    orderBy: {
                        createdAt: "asc",
                    },
                    select: {
                        id: true,
                        testCodeSnapshot: true,
                        testNameSnapshot: true,
                        testPriceSnapshot: true,
                        expectedReportDate: true,
                        sampleRequiredSnapshot: true,
                    },
                },
            },
        }),

        prisma.systemSettings.findFirst({
            select: {
                labName: true,
                logoPath: true,
                address: true,
                phone: true,
                email: true,
                currency: true,
            },
        }),
    ]);

    if (!receipt) {
        notFound();
    }

    const labName = settings?.labName ?? "Life Care Lab";
    const currency = settings?.currency ?? "PKR";

    const receiptNumber = receipt.receiptNumber.toString();
    const mrNumber = receipt.patient.mrNumber.toString();

    const referenceNumber = `${receiptNumber}-${mrNumber}`;

    return (
        <>
            <AutoPrintReceipt />

            <main className="min-h-screen bg-slate-100 px-4 py-6 print:bg-white print:p-0">
                <div className="mx-auto max-w-[850px] rounded-xl bg-white p-8 shadow-xl print:max-w-none print:rounded-none print:p-5 print:shadow-none">
                    {/* Print controls */}
                    <div className="mb-6 flex justify-end gap-3 print:hidden">
                        <button
                            type="button"
                            onClick={undefined}
                            className="rounded-lg bg-blue-600 px-5 py-2.5 font-semibold text-white"
                        >
                            Use Browser Print Dialog
                        </button>
                    </div>

                    {/* Header */}
                    <header className="border-b-2 border-slate-300 pb-5">
                        <div className="flex items-center justify-between gap-5">
                            <div className="flex items-center gap-4">
                                {settings?.logoPath ? (
                                    <img
                                        src={settings.logoPath}
                                        alt={`${labName} logo`}
                                        className="h-24 w-24 object-contain"
                                    />
                                ) : (
                                    <div className="flex h-24 w-24 items-center justify-center rounded-full bg-red-50 text-4xl font-bold text-red-600">
                                        +
                                    </div>
                                )}

                                <div>
                                    <h1 className="text-4xl font-bold text-red-600">
                                        {labName}
                                    </h1>

                                    <p className="mt-2 text-sm font-semibold uppercase tracking-wide text-indigo-800">
                                        {settings?.address ?? "Laboratory Address"}
                                    </p>

                                    <p className="mt-1 text-sm text-slate-700">
                                        Mobile: {settings?.phone ?? "N/A"}
                                        {settings?.email
                                            ? ` · Email: ${settings.email}`
                                            : ""}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </header>

                    {/* Receipt reference area */}
                    <section className="mt-6 grid grid-cols-2 overflow-hidden border border-slate-500">
                        <div className="border-r border-slate-500">
                            <p className="border-b border-slate-500 py-1 text-center text-xs font-semibold">
                                Lab No
                            </p>

                            <div className="px-4 py-5 text-center">
                                <div className="text-3xl font-black tracking-[0.25em] text-slate-900">
                                    ||||||||||||||||||
                                </div>

                                <p className="mt-2 text-xs font-semibold">
                                    {receiptNumber}
                                </p>
                            </div>
                        </div>

                        <div>
                            <p className="border-b border-slate-500 py-1 text-center text-xs font-semibold">
                                Reference No
                            </p>

                            <div className="px-4 py-5 text-center">
                                <div className="text-3xl font-black tracking-[0.18em] text-slate-900">
                                    |||||||||||||||||||||||
                                </div>

                                <p className="mt-2 text-xs font-semibold">
                                    {referenceNumber}
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Patient information */}
                    <section className="mt-5 grid grid-cols-[120px_1fr_1fr] gap-5 border-b-2 border-slate-400 pb-5">
                        <div className="flex h-28 items-center justify-center border-4 border-slate-900">
                            <div className="grid grid-cols-5 gap-1">
                                {Array.from({ length: 25 }).map((_, index) => (
                                    <span
                                        key={index}
                                        className={`h-3 w-3 ${index % 2 === 0
                                                ? "bg-slate-900"
                                                : "bg-white"
                                            }`}
                                    />
                                ))}
                            </div>
                        </div>

                        <dl className="grid grid-cols-[130px_1fr] gap-y-2 text-sm">
                            <dt className="font-semibold">Patient&apos;s Name</dt>
                            <dd className="font-bold">
                                {receipt.patientNameSnapshot}
                            </dd>

                            <dt className="font-semibold">Father/Husband</dt>
                            <dd>
                                {receipt.fatherOrHusbandSnapshot ?? "N/A"}
                            </dd>

                            <dt className="font-semibold">Age/Sex</dt>
                            <dd>
                                {formatAge(receipt.ageValue, receipt.ageUnit)} /{" "}
                                {formatGender(receipt.genderSnapshot)}
                            </dd>

                            <dt className="font-semibold">CNIC No</dt>
                            <dd>{receipt.cnicSnapshot ?? "N/A"}</dd>

                            <dt className="font-semibold">Address</dt>
                            <dd>{receipt.addressSnapshot ?? "N/A"}</dd>
                        </dl>

                        <dl className="grid grid-cols-[120px_1fr] gap-y-2 text-sm">
                            <dt className="font-semibold">Reg. Date</dt>
                            <dd>{formatDateTime(receipt.collectionDate)}</dd>

                            <dt className="font-semibold">Reg. Centre</dt>
                            <dd>{labName}</dd>

                            <dt className="font-semibold">Specimen</dt>
                            <dd>
                                {receipt.specimen ??
                                    (
                                        receipt.patientTests
                                            .map((test) => test.sampleRequiredSnapshot)
                                            .filter(Boolean)
                                            .join(", ") || "N/A"
                                    )}
                            </dd>

                            <dt className="font-semibold">Consultant</dt>
                            <dd>
                                {receipt.doctorNameSnapshot ??
                                    receipt.doctor?.doctorName ??
                                    "SELF"}
                            </dd>

                            <dt className="font-semibold">Contact No</dt>
                            <dd>{receipt.phoneSnapshot ?? "N/A"}</dd>
                        </dl>
                    </section>

                    {/* Tests */}
                    <section className="mt-5">
                        <table className="w-full border-collapse text-sm">
                            <thead>
                                <tr>
                                    <th className="border border-slate-500 px-3 py-2 text-left">
                                        Test Description
                                    </th>

                                    <th className="w-40 border border-slate-500 px-3 py-2 text-center">
                                        Report Date
                                    </th>

                                    <th className="w-32 border border-slate-500 px-3 py-2 text-right">
                                        Charges
                                    </th>
                                </tr>
                            </thead>

                            <tbody>
                                {receipt.patientTests.map((patientTest) => (
                                    <tr key={patientTest.id}>
                                        <td className="border border-slate-500 px-3 py-2">
                                            {patientTest.testNameSnapshot}
                                        </td>

                                        <td className="border border-slate-500 px-3 py-2 text-center">
                                            {patientTest.expectedReportDate
                                                ? formatDate(
                                                    patientTest.expectedReportDate,
                                                )
                                                : formatDate(receipt.collectionDate)}
                                        </td>

                                        <td className="border border-slate-500 px-3 py-2 text-right">
                                            {formatMoney(
                                                patientTest.testPriceSnapshot,
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </section>

                    {/* Billing */}
                    <section className="mt-2 flex justify-end">
                        <table className="w-[330px] border-collapse text-sm">
                            <tbody>
                                <BillingRow
                                    label="Total"
                                    value={`${currency} ${formatMoney(
                                        receipt.subtotal,
                                    )}`}
                                />

                                <BillingRow
                                    label="Discount %"
                                    value={`${formatMoney(
                                        receipt.discountPercent,
                                    )}%`}
                                />

                                <BillingRow
                                    label="Discount Amount"
                                    value={`${currency} ${formatMoney(
                                        receipt.discountAmount,
                                    )}`}
                                />

                                <BillingRow
                                    label="Less"
                                    value={`${currency} ${formatMoney(
                                        receipt.additionalLess,
                                    )}`}
                                />

                                <BillingRow
                                    label="Net Amount"
                                    value={`${currency} ${formatMoney(
                                        receipt.netAmount,
                                    )}`}
                                    strong
                                />

                                <BillingRow
                                    label="Paid"
                                    value={`${currency} ${formatMoney(
                                        receipt.paidAmount,
                                    )}`}
                                />

                                <BillingRow
                                    label="Due Amount"
                                    value={`${currency} ${formatMoney(
                                        receipt.dueAmount,
                                    )}`}
                                    strong
                                />
                            </tbody>
                        </table>
                    </section>

                    {/* Footer barcode */}
                    <footer className="mt-10 text-center">
                        <div className="mx-auto max-w-[420px] text-4xl font-black tracking-[0.17em]">
                            ||||||||||||||||||||||||||||
                        </div>

                        <p className="mt-1 text-xs font-semibold">
                            {referenceNumber}
                        </p>

                        <p className="mt-2 text-sm">
                            Report Reference Number
                        </p>

                        <p className="mt-8 text-xs text-slate-500">
                            Collected by:{" "}
                            {receipt.collectedBy?.fullName ?? "N/A"}
                        </p>
                    </footer>
                </div>
            </main>
        </>
    );
}

function BillingRow({
    label,
    value,
    strong,
}: {
    label: string;
    value: string;
    strong?: boolean;
}) {
    return (
        <tr>
            <th
                className={`px-3 py-1.5 text-right ${strong ? "font-bold" : "font-semibold"
                    }`}
            >
                {label}:
            </th>

            <td
                className={`border border-slate-500 px-3 py-1.5 text-right ${strong ? "font-bold" : ""
                    }`}
            >
                {value}
            </td>
        </tr>
    );
}