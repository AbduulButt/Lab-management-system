"use client";

import { useActionState, useEffect, useRef } from "react";
import { LoaderCircle, Plus } from "lucide-react";
import { useFormStatus } from "react-dom";

import {
    createSectionAction,
    type TemplateActionState,
} from "@/actions/template-actions";

type SectionFormProps = {
    testId: string;
    nextDisplayOrder: number;
};

const initialState: TemplateActionState = {
    success: false,
    message: "",
};

function SubmitButton() {
    const { pending } = useFormStatus();

    return (
        <button
            type="submit"
            disabled={pending}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
            {pending ? (
                <>
                    <LoaderCircle className="h-5 w-5 animate-spin" />
                    Adding...
                </>
            ) : (
                <>
                    <Plus className="h-5 w-5" />
                    Add Section
                </>
            )}
        </button>
    );
}

export default function SectionForm({
    testId,
    nextDisplayOrder,
}: SectionFormProps) {
    const formRef = useRef<HTMLFormElement>(null);

    const action = createSectionAction.bind(null, testId);

    const [state, formAction] = useActionState(action, initialState);

    useEffect(() => {
        if (state.success) {
            formRef.current?.reset();
        }
    }, [state.success]);

    return (
        <form
            ref={formRef}
            action={formAction}
            className="space-y-4"
        >
            {state.message ? (
                <div
                    className={`rounded-lg border px-4 py-3 text-sm ${state.success
                            ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                            : "border-red-200 bg-red-50 text-red-700"
                        }`}
                >
                    {state.message}
                </div>
            ) : null}

            <div className="grid gap-4 md:grid-cols-[1fr_160px_auto] md:items-end">
                <div>
                    <label
                        htmlFor="sectionName"
                        className="mb-2 block text-sm font-medium text-slate-700"
                    >
                        Section Name
                    </label>

                    <input
                        id="sectionName"
                        name="sectionName"
                        type="text"
                        required
                        placeholder="Example: Blood Complete Count"
                        className="h-11 w-full rounded-lg border border-slate-300 px-3 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                    />

                    {state.fieldErrors?.sectionName?.[0] ? (
                        <p className="mt-1 text-sm text-red-600">
                            {state.fieldErrors.sectionName[0]}
                        </p>
                    ) : null}
                </div>

                <div>
                    <label
                        htmlFor="displayOrder"
                        className="mb-2 block text-sm font-medium text-slate-700"
                    >
                        Display Order
                    </label>

                    <input
                        id="displayOrder"
                        name="displayOrder"
                        type="number"
                        min="0"
                        defaultValue={nextDisplayOrder}
                        required
                        className="h-11 w-full rounded-lg border border-slate-300 px-3 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                    />

                    {state.fieldErrors?.displayOrder?.[0] ? (
                        <p className="mt-1 text-sm text-red-600">
                            {state.fieldErrors.displayOrder[0]}
                        </p>
                    ) : null}
                </div>

                <SubmitButton />
            </div>
        </form>
    );
}