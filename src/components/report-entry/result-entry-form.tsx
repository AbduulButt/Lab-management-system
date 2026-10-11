"use client";

import Link from "next/link";
import {
    ArrowLeft,
    CheckCircle2,
    Save,
} from "lucide-react";
import { useActionState } from "react";

import {
    saveTestResultsAction,
    type SaveTestResultsState,
} from "@/actions/test-result-actions";

type FieldInputType =
    | "NUMBER"
    | "TEXT"
    | "SELECT"
    | "TEXTAREA"
    | "CHECKBOX"
    | "POSITIVE_NEGATIVE";

type ResultField = {
    id: string;
    code: string | null;
    name: string;
    inputType: FieldInputType;
    unit: string | null;
    maleRangeText: string | null;
    femaleRangeText: string | null;
    normalText: string | null;
    options: string[];
    required: boolean;
    defaultValue: string | null;
    savedValue: string;
    manuallyAbnormal: boolean;
};

type ResultEntryFormProps = {
    receiptId: string;
    patientTestId: string;
    patient: {
        name: string;
        gender: "MALE" | "FEMALE" | "OTHER";
        ageValue: number | null;
        ageUnit: "YEARS" | "MONTHS" | "DAYS";
        receiptNumber: string;
    };
    test: {
        code: string;
        name: string;
        paragraph: string | null;
        status: "PENDING" | "DRAFT" | "COMPLETED";
        remarks: string | null;
        sections: {
            id: string;
            name: string;
            fields: ResultField[];
        }[];
    };
};

const initialState: SaveTestResultsState = {
    success: false,
    message: "",
};

function genderLabel(
    gender: ResultEntryFormProps["patient"]["gender"],
) {
    return {
        MALE: "Male",
        FEMALE: "Female",
        OTHER: "Other",
    }[gender];
}

function ageLabel(
    value: number | null,
    unit: ResultEntryFormProps["patient"]["ageUnit"],
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

function referenceText(
    field: ResultField,
    gender: ResultEntryFormProps["patient"]["gender"],
) {
    if (gender === "FEMALE") {
        return (
            field.femaleRangeText ??
            field.normalText ??
            ""
        );
    }

    if (gender === "MALE") {
        return (
            field.maleRangeText ??
            field.normalText ??
            ""
        );
    }

    return field.normalText ?? "";
}

export default function ResultEntryForm({
    receiptId,
    patientTestId,
    patient,
    test,
}: ResultEntryFormProps) {
    const boundAction = saveTestResultsAction.bind(
        null,
        receiptId,
        patientTestId,
    );

    const [state, action, pending] = useActionState(
        boundAction,
        initialState,
    );

    return (
        <section className="space-y-6">
            <div>
                <Link
                    href={`/portal/report-entry/${receiptId}`}
                    className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-blue-600"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Report Entry
                </Link>

                <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900">
                            {test.name}
                        </h1>

                        <p className="mt-2 text-slate-500">
                            Lab No {patient.receiptNumber} · {patient.name} ·{" "}
                            {ageLabel(patient.ageValue, patient.ageUnit)} /{" "}
                            {genderLabel(patient.gender)}
                        </p>
                    </div>

                    <span
                        className={`rounded-full px-4 py-2 text-sm font-bold ${test.status === "COMPLETED"
                            ? "bg-emerald-100 text-emerald-700"
                            : test.status === "DRAFT"
                                ? "bg-amber-100 text-amber-700"
                                : "bg-red-100 text-red-700"
                            }`}
                    >
                        {test.status}
                    </span>
                </div>
            </div>

            <form action={action} className="space-y-6">
                {state.message ? (
                    <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                        {state.message}
                    </div>
                ) : null}

                <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                    <div className="bg-gradient-to-r from-blue-600 to-blue-500 px-5 py-4 text-white">
                        <h2 className="font-bold">
                            {test.code} - {test.name}
                        </h2>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[980px] border-collapse bg-white text-slate-900">
                            <thead>
                                <tr className="bg-slate-100 text-slate-900">
                                    <th className="w-28 border border-slate-200 px-4 py-3 text-left">
                                        Test No
                                    </th>
                                    <th className="w-28 border border-slate-300 px-4 py-3 text-left font-bold text-slate-900">
                                        Desc
                                    </th>
                                    <th className="w-28 border border-slate-300 px-4 py-3 text-left font-bold text-slate-900">
                                        Result
                                    </th>
                                    <th className="w-28 border border-slate-300 px-4 py-3 text-left font-bold text-slate-900">
                                        Abnormal
                                    </th>
                                    <th className="w-28 border border-slate-300 px-4 py-3 text-left font-bold text-slate-900">
                                        Female
                                    </th>
                                    <th className="w-28 border border-slate-300 px-4 py-3 text-left font-bold text-slate-900">
                                        Male
                                    </th>
                                    <th className="w-28 border border-slate-300 px-4 py-3 text-left font-bold text-slate-900">
                                        Unit
                                    </th>
                                </tr>
                            </thead>

                            <tbody>
                                {test.sections.map((section) => (
                                    <SectionRows
                                        key={section.id}
                                        sectionName={section.name}
                                        fields={section.fields}
                                    />
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                    <label>
                        <span className="mb-2 block font-semibold text-slate-900">
                            Remarks
                        </span>

                        <textarea
                            name="remarks"
                            defaultValue={test.remarks ?? ""}
                            rows={6}
                            className="w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-800 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                            placeholder="Add remarks or additional clinical details..."
                        />
                    </label>

                    {test.paragraph ? (
                        <div className="mt-5 rounded-lg bg-slate-100 px-4 py-3 text-sm text-slate-700">
                            <p className="font-semibold text-slate-900">
                                Report Paragraph
                            </p>

                            <p className="mt-1 whitespace-pre-wrap">
                                {test.paragraph}
                            </p>
                        </div>
                    ) : null}
                </div>

                <div className="flex flex-wrap justify-end gap-3">
                    <button
                        type="submit"
                        name="submitMode"
                        value="draft"
                        disabled={pending}
                        className="inline-flex h-11 items-center gap-2 rounded-lg border border-slate-300 bg-white px-5 font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
                    >
                        <Save className="h-4 w-4" />
                        Save Draft
                    </button>

                    <button
                        type="submit"
                        name="submitMode"
                        value="complete"
                        disabled={pending}
                        className="inline-flex h-11 items-center gap-2 rounded-lg bg-emerald-600 px-5 font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
                    >
                        <CheckCircle2 className="h-4 w-4" />
                        {pending ? "Saving..." : "Save & Complete"}
                    </button>
                </div>
            </form>
        </section>
    );
}

function SectionRows({
    sectionName,
    fields,
}: {
    sectionName: string;
    fields: ResultField[];
}) {
    return (
        <>
            {sectionName ? (
                <tr>
                    <td
                        colSpan={7}
                        className="border border-slate-300 bg-slate-300 px-4 py-3 font-bold text-slate-950"
                    >
                        {sectionName}
                    </td>
                </tr>
            ) : null}

            {fields.map((field) => (
                <tr
                    key={field.id}
                    className="bg-white text-slate-900 transition hover:bg-blue-50"
                >
                    <td className="border border-slate-300 px-4 py-3 font-semibold text-slate-800">
                        {field.code ?? "—"}
                    </td>

                    <td className="border border-slate-300 px-4 py-3 font-semibold text-slate-950">
                        {field.name || "—"}

                        {field.required ? (
                            <span className="ml-1 text-red-600">*</span>
                        ) : null}
                    </td>

                    <td className="border border-slate-300 px-3 py-2 text-slate-900">
                        <ResultControl field={field} />
                    </td>

                    <td className="border border-slate-300 px-4 py-3 text-center text-slate-900">
                        <input
                            type="checkbox"
                            name={`abnormal_${field.id}`}
                            defaultChecked={field.manuallyAbnormal}
                            className="h-4 w-4 accent-red-600"
                        />
                    </td>

                    <td className="border border-slate-300 px-4 py-3 text-sm font-medium text-slate-800">
                        {field.femaleRangeText ??
                            field.normalText ??
                            ""}
                    </td>

                    <td className="border border-slate-300 px-4 py-3 text-sm font-medium text-slate-800">
                        {field.maleRangeText ??
                            field.normalText ??
                            ""}
                    </td>

                    <td className="border border-slate-300 px-4 py-3 font-medium text-slate-800">
                        {field.unit ?? ""}
                    </td>
                </tr>
            ))}
        </>
    );
}

function ResultControl({
    field,
}: {
    field: ResultField;
}) {
    const name = `result_${field.id}`;

    const defaultValue =
        field.savedValue || field.defaultValue || "";

    function moveToNextResultField(
        event:
            | React.KeyboardEvent<HTMLInputElement>
            | React.KeyboardEvent<HTMLSelectElement>,
    ) {
        // Only handle the Enter key.
        if (event.key !== "Enter") {
            return;
        }

        // IMPORTANT:
        // Prevent Enter from submitting the whole report form.
        event.preventDefault();

        const currentField = event.currentTarget;
        const form = currentField.form;

        if (!form) {
            return;
        }

        // Get only the result controls that should participate
        // in Enter-key navigation.
        const resultFields = Array.from(
            form.querySelectorAll<
                HTMLInputElement | HTMLSelectElement
            >('[data-result-control="true"]'),
        );

        const currentIndex =
            resultFields.indexOf(currentField);

        // Find the next result field.
        const nextField =
            resultFields[currentIndex + 1];

        // If this is the final field, do nothing.
        // Most importantly, DO NOT submit the form.
        if (!nextField) {
            return;
        }

        nextField.focus();

        // Automatically highlight an existing value in
        // text/number inputs so it can be replaced quickly.
        if (
            nextField instanceof HTMLInputElement &&
            nextField.type !== "checkbox"
        ) {
            nextField.select();
        }
    }

    if (field.inputType === "SELECT") {
        return (
            <select
                name={name}
                defaultValue={defaultValue}
                data-result-control="true"
                onKeyDown={moveToNextResultField}
                className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 font-medium text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
                <option value="">
                    Select
                </option>

                {field.options.map((option) => (
                    <option
                        key={option}
                        value={option}
                    >
                        {option}
                    </option>
                ))}
            </select>
        );
    }

    if (
        field.inputType ===
        "POSITIVE_NEGATIVE"
    ) {
        return (
            <select
                name={name}
                defaultValue={defaultValue}
                data-result-control="true"
                onKeyDown={moveToNextResultField}
                className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 font-medium text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
                <option value="">
                    Select
                </option>

                <option value="Positive">
                    Positive
                </option>

                <option value="Negative">
                    Negative
                </option>
            </select>
        );
    }

    if (field.inputType === "TEXTAREA") {
        return (
            <textarea
                name={name}
                defaultValue={defaultValue}
                rows={2}
                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
        );
    }

    if (field.inputType === "CHECKBOX") {
        return (
            <input
                type="checkbox"
                name={name}
                defaultChecked={
                    defaultValue === "true"
                }
                className="h-4 w-4"
            />
        );
    }

    return (
        <input
            name={name}
            type={
                field.inputType === "NUMBER"
                    ? "number"
                    : "text"
            }
            step={
                field.inputType === "NUMBER"
                    ? "any"
                    : undefined
            }
            defaultValue={defaultValue}
            data-result-control="true"
            onKeyDown={moveToNextResultField}
            className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 font-medium text-slate-900 outline-none placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        />
    );
}