"use client";

import { useActionState } from "react";
import { Database, LoaderCircle } from "lucide-react";
import { useFormStatus } from "react-dom";

import {
  initializeStandardTestsAction,
  type InitializeStandardTestsState,
} from "@/actions/initialize-standard-tests";

const initialState: InitializeStandardTestsState = {
  success: false,
  message: "",
  created: 0,
  existing: 0,
  templatesAttached: 0,
  failed: 0,
};

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-5 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? (
        <>
          <LoaderCircle className="h-5 w-5 animate-spin" />
          Initializing...
        </>
      ) : (
        <>
          <Database className="h-5 w-5" />
          Initialize Standard Tests
        </>
      )}
    </button>
  );
}

export default function InitializeStandardTestsButton() {
  const [state, formAction] = useActionState(
    initializeStandardTestsAction,
    initialState,
  );

  return (
    <div className="space-y-3">
      <form action={formAction}>
        <SubmitButton />
      </form>

      {state.message ? (
        <div
          className={`rounded-lg border px-4 py-3 text-sm ${
            state.success
              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
              : "border-amber-200 bg-amber-50 text-amber-800"
          }`}
        >
          <p className="font-semibold">{state.message}</p>
          <p className="mt-1">
            Created: {state.created} · Existing: {state.existing} · Templates
            processed: {state.templatesAttached} · Failed: {state.failed}
          </p>
        </div>
      ) : null}
    </div>
  );
}