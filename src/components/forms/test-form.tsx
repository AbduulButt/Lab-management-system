"use client";

import { useActionState } from "react";
import { LoaderCircle, Save } from "lucide-react";
import { useFormStatus } from "react-dom";

import {
    createTestAction,
    updateTestAction,
    type TestActionState,
} from "@/actions/test-actions";

type TestFormData = {
    id: string;
    testCode: string;
    testName: string;
    shortName: string | null;
    price: string;
    sampleRequired: string | null;
    reportingTime: string | null;
    reportHeading: string | null;
    description: string | null;
    paragraph: string | null;
};

type TestFormProps = {
    test?: TestFormData;
};

const initialState: TestActionState = {
    success: false,
    message: "",
};

function SubmitButton({
    isEditing,
}: {
    isEditing: boolean;
}) {
    const { pending } = useFormStatus();

    return (
        <button
            type="submit"
            disabled={pending}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
            {pending ? (
                <>
                    <LoaderCircle className="h-5 w-5 animate-spin" />
                    Saving...
                </>
            ) : (
                <>
                    <Save className="h-5 w-5" />
                    {isEditing ? "Save Changes" : "Save Test"}
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

    return (
        <p className="mt-1 text-sm text-red-600">
            {errors[0]}
        </p>
    );
}

const inputClassName =
    "h-11 w-full rounded-lg border border-slate-300 px-3 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100";

const textareaClassName =
    "w-full resize-y rounded-lg border border-slate-300 px-3 py-3 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100";

export default function TestForm({
    test,
}: TestFormProps) {
    const isEditing = Boolean(test);

    const selectedAction = test
        ? updateTestAction.bind(null, test.id)
        : createTestAction;

    const [state, formAction] = useActionState(
        selectedAction,
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
                    <label
                        htmlFor="testCode"
                        className="mb-2 block text-sm font-medium text-slate-700"
                    >
                        Test Code <span className="text-red-500">*</span>
                    </label>

                    <input
                        id="testCode"
                        name="testCode"
                        type="text"
                        required
                        defaultValue={test?.testCode ?? ""}
                        placeholder="Example: CBC"
                        className={inputClassName}
                    />

                    <FieldError errors={state.fieldErrors?.testCode} />
                </div>

                <div>
                    <label
                        htmlFor="testName"
                        className="mb-2 block text-sm font-medium text-slate-700"
                    >
                        Test Name <span className="text-red-500">*</span>
                    </label>

                    <input
                        id="testName"
                        name="testName"
                        type="text"
                        required
                        defaultValue={test?.testName ?? ""}
                        placeholder="Complete Blood Count"
                        className={inputClassName}
                    />

                    <FieldError errors={state.fieldErrors?.testName} />
                </div>

                <div>
                    <label
                        htmlFor="shortName"
                        className="mb-2 block text-sm font-medium text-slate-700"
                    >
                        Short Name
                    </label>

                    <input
                        id="shortName"
                        name="shortName"
                        type="text"
                        defaultValue={test?.shortName ?? ""}
                        placeholder="CBC"
                        className={inputClassName}
                    />

                    <FieldError errors={state.fieldErrors?.shortName} />
                </div>

                <div>
                    <label
                        htmlFor="price"
                        className="mb-2 block text-sm font-medium text-slate-700"
                    >
                        Charges <span className="text-red-500">*</span>
                    </label>

                    <input
                        id="price"
                        name="price"
                        type="number"
                        required
                        min="0"
                        step="0.01"
                        defaultValue={test?.price ?? "0"}
                        className={inputClassName}
                    />

                    <FieldError errors={state.fieldErrors?.price} />
                </div>

                <div>
                    <label
                        htmlFor="sampleRequired"
                        className="mb-2 block text-sm font-medium text-slate-700"
                    >
                        Sample Required
                    </label>

                    <input
                        id="sampleRequired"
                        name="sampleRequired"
                        type="text"
                        defaultValue={test?.sampleRequired ?? ""}
                        placeholder="Blood / Serum / Urine"
                        className={inputClassName}
                    />

                    <FieldError errors={state.fieldErrors?.sampleRequired} />
                </div>

                <div>
                    <label
                        htmlFor="reportingTime"
                        className="mb-2 block text-sm font-medium text-slate-700"
                    >
                        Reporting Time
                    </label>

                    <input
                        id="reportingTime"
                        name="reportingTime"
                        type="text"
                        defaultValue={test?.reportingTime ?? ""}
                        placeholder="Same Day / Next Day"
                        className={inputClassName}
                    />

                    <FieldError errors={state.fieldErrors?.reportingTime} />
                </div>

                <div className="md:col-span-2">
                    <label
                        htmlFor="reportHeading"
                        className="mb-2 block text-sm font-medium text-slate-700"
                    >
                        Report Heading
                    </label>

                    <input
                        id="reportHeading"
                        name="reportHeading"
                        type="text"
                        defaultValue={test?.reportHeading ?? ""}
                        placeholder="ENDOCRINOLOGY REPORT"
                        className={inputClassName}
                    />

                    <FieldError errors={state.fieldErrors?.reportHeading} />
                </div>

                <div className="md:col-span-2">
                    <label
                        htmlFor="description"
                        className="mb-2 block text-sm font-medium text-slate-700"
                    >
                        Description
                    </label>

                    <textarea
                        id="description"
                        name="description"
                        rows={4}
                        defaultValue={test?.description ?? ""}
                        placeholder="Enter test description..."
                        className={textareaClassName}
                    />

                    <FieldError errors={state.fieldErrors?.description} />
                </div>

                <div className="md:col-span-2">
                    <label
                        htmlFor="paragraph"
                        className="mb-2 block text-sm font-medium text-slate-700"
                    >
                        Report Paragraph
                    </label>

                    <textarea
                        id="paragraph"
                        name="paragraph"
                        rows={7}
                        defaultValue={test?.paragraph ?? ""}
                        placeholder="Enter the explanation that will appear below this test in the final report."
                        className={textareaClassName}
                    />

                    <p className="mt-1 text-xs text-slate-500">
                        This paragraph will appear below the test result in
                        the final laboratory report.
                    </p>

                    <FieldError errors={state.fieldErrors?.paragraph} />
                </div>
            </div>

            <div className="flex justify-end border-t border-slate-200 pt-6">
                <SubmitButton isEditing={isEditing} />
            </div>
        </form>
    );
}