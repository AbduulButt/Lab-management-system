"use client";

import AutoPrintReport from "@/components/reports/auto-print-report";
import ReportFooter from "@/components/reports/report-footer";
import ReportHeader from "@/components/reports/report-header";

type AbnormalFlag =
    | "NOT_CHECKED"
    | "NORMAL"
    | "LOW"
    | "HIGH"
    | "ABNORMAL";

type PrintableResult = {
    id: string;
    fieldName: string;
    sectionName: string | null;
    resultValue: string;
    referenceRange: string;
    unit: string;
    abnormalFlag: AbnormalFlag;
    displayOrder: number;
};

type PrintableTest = {
    id: string;
    testCode: string;
    testName: string;
    reportHeading: string | null;
    paragraph: string | null;
    remarks: string | null;
    completedAt: string | null;
    completedBy: string | null;
    results: PrintableResult[];
};

type PrintableReceipt = {
    id: string;
    receiptNumber: string;
    mrNumber: string;
    patientName: string;
    fatherOrHusband: string;
    age: string;
    gender: string;
    phone: string;
    cnic: string;
    address: string;
    specimen: string;
    consultant: string;
    registrationDate: string;
    collectionDate: string;
    tests: PrintableTest[];
};

type ReportSettings = {
    logoPath: string | null;
};

type ReportPrintViewProps = {
    receipt: PrintableReceipt;
    settings: ReportSettings;
    showHeader: boolean;
};

function abnormalIndicator(flag: AbnormalFlag) {
    if (flag === "LOW") {
        return " L";
    }

    if (flag === "HIGH") {
        return " H";
    }

    if (flag === "ABNORMAL") {
        return " *";
    }

    return "";
}

function isAbnormal(flag: AbnormalFlag) {
    return (
        flag === "LOW" ||
        flag === "HIGH" ||
        flag === "ABNORMAL"
    );
}

function formatDateTime(value: string | null) {
    if (!value) {
        return "N/A";
    }

    return new Intl.DateTimeFormat("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
    }).format(new Date(value));
}

export default function ReportPrintView({
    receipt,
    settings,
    showHeader,
}: ReportPrintViewProps) {
    return (
        <>
            <AutoPrintReport />

            <main className="min-h-screen bg-slate-200 px-4 py-6 print:bg-white print:p-0">
                <div className="mx-auto max-w-[820px] bg-white px-6 py-5 shadow-xl print:max-w-none print:px-4 print:py-3 print:shadow-none">
                    {receipt.tests.map((patientTest, testIndex) => (
                        <article
                            key={patientTest.id}
                            className={`flex min-h-[1050px] flex-col bg-white px-6 py-5 ${testIndex < receipt.tests.length - 1
                                ? "break-after-page"
                                : ""
                                }`}
                        >
                            <div className="flex-1">
                                {showHeader ? (
                                    <ReportHeader
                                        logoPath={settings.logoPath}
                                    />
                                ) : (
                                    <div className="h-3" />
                                )}

                                <PatientInformation receipt={receipt} />

                                <section className="mt-3">
                                    <div className="flex items-end justify-between border-y border-black py-1">
                                        <h2 className="text-[13px] font-bold uppercase">
                                            {patientTest.reportHeading ??
                                                patientTest.testName}
                                        </h2>

                                        <p className="text-[9px]">
                                            Reporting Time:{" "}
                                            {formatDateTime(
                                                patientTest.completedAt,
                                            )}
                                        </p>
                                    </div>

                                    <ResultsTable
                                        results={patientTest.results}
                                    />

                                    {patientTest.paragraph ? (
                                        <div className="mt-3 border-t border-slate-300 pt-2 text-[10px] leading-4">
                                            <p className="font-bold">
                                                Interpretation
                                            </p>

                                            <p className="mt-1 whitespace-pre-wrap">
                                                {patientTest.paragraph}
                                            </p>
                                        </div>
                                    ) : null}

                                    {patientTest.remarks ? (
                                        <div className="mt-3 text-[10px] leading-4">
                                            <p className="font-bold">
                                                Remarks
                                            </p>

                                            <p className="mt-1 whitespace-pre-wrap">
                                                {patientTest.remarks}
                                            </p>
                                        </div>
                                    ) : null}

                                    {patientTest.completedBy ? (
                                        <p className="mt-5 text-right text-[9px]">
                                            Verified by:{" "}
                                            <span className="font-semibold">
                                                {patientTest.completedBy}
                                            </span>
                                        </p>
                                    ) : null}
                                </section>
                            </div>

                            <ReportFooter />
                        </article>
                    ))}
                </div>
            </main>
        </>
    );
}

function PatientInformation({
    receipt,
}: {
    receipt: PrintableReceipt;
}) {
    return (
        <section className="mt-2 grid grid-cols-3 gap-x-6 gap-y-1 text-[9px] leading-4">
            <Info
                label="Patient Detail"
                value={`${receipt.patientName} (${receipt.age}) / ${receipt.gender}`}
            />
            <Info
                label="Registration Date"
                value={receipt.registrationDate}
            />
            <Info
                label="Patient Number"
                value={receipt.mrNumber}
            />

            <Info
                label="Mobile No"
                value={receipt.phone}
            />
            <Info
                label="Reference"
                value={receipt.consultant}
            />
            <Info
                label="Case Number"
                value={receipt.receiptNumber}
            />

            <Info
                label="Registration Location"
                value="OPP. NADRA OFFICE STADIUM ROAD DASKA, SIALKOT"
            />
            <Info
                label="Consultant"
                value={receipt.consultant}
            />
            <Info
                label="CNIC No"
                value={receipt.cnic}
            />

            <Info
                label="Specimen"
                value={receipt.specimen}
            />
            <Info
                label="Address"
                value={receipt.address}
            />
            <Info
                label="Collection Date"
                value={receipt.collectionDate}
            />
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
        <div>
            <p className="text-[8px] text-slate-600">
                {label}
            </p>
            <p className="font-semibold text-black">
                {value || "N/A"}
            </p>
        </div>
    );
}

function ResultsTable({
    results,
}: {
    results: PrintableResult[];
}) {
    let lastSection: string | null = null;

    return (
        <table className="mt-1 w-full border-collapse text-[10px]">
            <thead>
                <tr className="border-b border-black">
                    <th className="w-[38%] px-1 py-1 text-left font-bold">
                        Test
                    </th>
                    <th className="w-[24%] px-1 py-1 text-left font-bold">
                        Reference Value
                    </th>
                    <th className="w-[16%] px-1 py-1 text-left font-bold">
                        Unit
                    </th>
                    <th className="w-[22%] px-1 py-1 text-left font-bold">
                        Result
                    </th>
                </tr>
            </thead>

            <tbody>
                {results.map((result) => {
                    const shouldShowSection =
                        Boolean(result.sectionName) &&
                        result.sectionName !== lastSection;

                    lastSection = result.sectionName;

                    return (
                        <FragmentRows
                            key={result.id}
                            result={result}
                            showSection={shouldShowSection}
                        />
                    );
                })}
            </tbody>
        </table>
    );
}

function FragmentRows({
    result,
    showSection,
}: {
    result: PrintableResult;
    showSection: boolean;
}) {
    return (
        <>
            {showSection ? (
                <tr>
                    <td
                        colSpan={4}
                        className="border-y border-slate-300 bg-slate-100 px-1 py-1 font-bold uppercase"
                    >
                        {result.sectionName}
                    </td>
                </tr>
            ) : null}

            <tr className="border-b border-slate-200">
                <td className="px-1 py-1">
                    {result.fieldName}
                </td>

                <td className="px-1 py-1">
                    {result.referenceRange}
                </td>

                <td className="px-1 py-1">
                    {result.unit}
                </td>

                <td
                    className={`px-1 py-1 ${isAbnormal(result.abnormalFlag)
                        ? "font-bold text-red-700 print:text-black"
                        : ""
                        }`}
                >
                    {result.resultValue}
                    {abnormalIndicator(result.abnormalFlag)}
                </td>
            </tr>
        </>
    );
}