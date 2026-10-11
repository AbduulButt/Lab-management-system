"use client";

import { useActionState } from "react";
import { LoaderCircle, Save } from "lucide-react";
import { useFormStatus } from "react-dom";

import {
    createTestFieldAction,
    type TestFieldActionState,
} from "@/actions/test-field-actions";

type SectionOption = {
    id: string;
    sectionName: string;
};

type TestFieldFormProps = {
    testId: string;
    sections: SectionOption[];
    defaultSectionId?: string;
    nextDisplayOrder: number;
};

const initialState: TestFieldActionState = {
    success: false,
    message: "",
};

const inputClass =
    "h-11 w-full rounded-lg border border-slate-300 px-3 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100";

function SubmitButton() {
    const { pending } = useFormStatus();

    return (
        <button
            type="submit"
            disabled={pending}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60"
        >
            {pending ? (
                <>
                    <LoaderCircle className="h-5 w-5 animate-spin" />
                    Saving...
                </>
            ) : (
                <>
                    <Save className="h-5 w-5" />
                    Save Field
                </>
            )}
        </button>
    );
}

function FieldError({
    errors,
}: {
    errors?: string[];
}) {
    if (!errors?.length) {
        return null;
    }

    return <p className="mt-1 text-sm text-red-600">{errors[0]}</p>;
}

export default function TestFieldForm({
    testId,
    sections,
    defaultSectionId,
    nextDisplayOrder,
}: TestFieldFormProps) {
    const action = createTestFieldAction.bind(null, testId);

    const [state, formAction] = useActionState(
        action,
        initialState,
    );

    return (
        <form action={formAction} className="space-y-6">
            {state.message ? (
                <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {state.message}
                </div>
            ) : null}

            <div className="grid gap-6 md:grid-cols-2">
                <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                        Section <span className="text-red-500">*</span>
                    </label>

                    <select
                        name="sectionId"
                        required
                        defaultValue={defaultSectionId ?? ""}
                        className={inputClass}
                    >
                        <option value="" disabled>
                            Select section
                        </option>

                        {sections.map((section) => (
                            <option key={section.id} value={section.id}>
                                {section.sectionName}
                            </option>
                        ))}
                    </select>

                    <FieldError errors={state.fieldErrors?.sectionId} />
                </div>

                <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                        Test No / Field Code
                    </label>

                    <input
                        name="fieldCode"
                        placeholder="Example: CBC or 257"
                        className={inputClass}
                    />
                </div>

                <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                        Description <span className="text-red-500">*</span>
                    </label>

                    <input
                        name="fieldName"
                        required
                        placeholder="Example: Haemoglobin (Hb)"
                        className={inputClass}
                    />

                    <FieldError errors={state.fieldErrors?.fieldName} />
                </div>

                <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                        Result Input Type
                    </label>

                    <select
                        name="inputType"
                        defaultValue="NUMBER"
                        className={inputClass}
                    >
                        <option value="NUMBER">Number</option>
                        <option value="TEXT">Text</option>
                        <option value="SELECT">Dropdown</option>
                        <option value="TEXTAREA">Textarea</option>
                        <option value="CHECKBOX">Checkbox</option>
                        <option value="POSITIVE_NEGATIVE">
                            Positive / Negative
                        </option>
                    </select>
                </div>

                <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                        Female Reference Value
                    </label>

                    <input
                        name="femaleRangeText"
                        placeholder="Example: 11.5 - 16.0 or < 01"
                        className={inputClass}
                    />
                </div>

                <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                        Male Reference Value
                    </label>

                    <input
                        name="maleRangeText"
                        placeholder="Example: 13 - 18 or < 01"
                        className={inputClass}
                    />
                </div>

                <div className="rounded-lg border border-slate-200 p-4">
                    <p className="mb-4 text-sm font-semibold text-slate-900">
                        Female numeric range
                    </p>

                    <div className="grid grid-cols-2 gap-3">
                        <input
                            name="femaleMin"
                            type="number"
                            step="any"
                            placeholder="Minimum"
                            className={inputClass}
                        />

                        <input
                            name="femaleMax"
                            type="number"
                            step="any"
                            placeholder="Maximum"
                            className={inputClass}
                        />
                    </div>
                </div>

                <div className="rounded-lg border border-slate-200 p-4">
                    <p className="mb-4 text-sm font-semibold text-slate-900">
                        Male numeric range
                    </p>

                    <div className="grid grid-cols-2 gap-3">
                        <input
                            name="maleMin"
                            type="number"
                            step="any"
                            placeholder="Minimum"
                            className={inputClass}
                        />

                        <input
                            name="maleMax"
                            type="number"
                            step="any"
                            placeholder="Maximum"
                            className={inputClass}
                        />
                    </div>
                </div>

                <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                        Unit
                    </label>

                    <input
                        name="unit"
                        placeholder="Example: %, g/dL, mIU/L"
                        className={inputClass}
                    />
                </div>

                <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                        Display Order
                    </label>

                    <input
                        name="displayOrder"
                        type="number"
                        min="0"
                        required
                        defaultValue={nextDisplayOrder}
                        className={inputClass}
                    />
                </div>

                <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                        Default Result
                    </label>

                    <input
                        name="defaultValue"
                        placeholder="Example: 00"
                        className={inputClass}
                    />
                </div>

                <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                        Normal Text
                    </label>

                    <input
                        name="normalText"
                        placeholder="Example: Negative"
                        className={inputClass}
                    />
                </div>

                <div className="md:col-span-2">
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                        Dropdown Options
                    </label>

                    <textarea
                        name="optionsText"
                        rows={3}
                        placeholder={"Enter one option per line:\nNegative\nPositive"}
                        className="w-full rounded-lg border border-slate-300 px-3 py-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                    />
                </div>
            </div>

            <div className="grid gap-3 rounded-lg bg-slate-50 p-4 sm:grid-cols-2 lg:grid-cols-4">
                <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" name="isRequired" />
                    Required
                </label>

                <label className="flex items-center gap-2 text-sm">
                    <input
                        type="checkbox"
                        name="autoAbnormal"
                        defaultChecked
                    />
                    Auto abnormal
                </label>

                <label className="flex items-center gap-2 text-sm">
                    <input
                        type="checkbox"
                        name="showOnReport"
                        defaultChecked
                    />
                    Show on report
                </label>

                <label className="flex items-center gap-2 text-sm">
                    <input
                        type="checkbox"
                        name="showInEntry"
                        defaultChecked
                    />
                    Show in entry
                </label>
            </div>

            <div className="flex justify-end border-t border-slate-200 pt-6">
                <SubmitButton />
            </div>
        </form>
    );
}