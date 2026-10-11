"use client";

import { useActionState, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Building2, FlaskConical, Printer, Save, Search, TestTube2, Trash2, UserRound } from "lucide-react";
import { updateReceiptAction } from "@/actions/edit-receipt-actions";
import {
  createSampleCollectionAction,
  type SampleCollectionActionState,
} from "@/actions/sample-collection-actions";

type TestOption = {
  id: string;
  testCode: string;
  testName: string;
  price: string;
  sampleRequired: string | null;
  reportingTime: string | null;
};

type DoctorOption = {
  id: string;
  doctorName: string;
};
export type SampleCollectionInitialData = {
  patientName: string;
  gender: "MALE" | "FEMALE" | "OTHER";
  ageValue: number;
  ageUnit: "YEARS" | "MONTHS" | "DAYS";

  phone: string;
  cnic: string;
  fatherOrHusbandName: string;
  address: string;

  referenceType: string;
  doctorId: string;
  companyName: string;

  specimen: string;
  specimenSource: string;

  collectionDate: string;
  collectionTime: string;

  discountPercent: number;
  additionalLess: number;
  paidAmount: number;

  selectedTestIds: string[];
};

const initialState: SampleCollectionActionState = {
  success: false,
  message: "",
  receiptId: undefined,
  submitMode: undefined,
};

export default function SampleCollectionForm({
  tests,
  doctors,
  labName,
  mode = "create",
  receiptId,
  initialData,
}: {
  tests: TestOption[];
  doctors: DoctorOption[];
  labName: string;

  mode?: "create" | "edit";
  receiptId?: string;
  initialData?: SampleCollectionInitialData;
}) {
  const formAction =
    mode === "edit"
      ? updateReceiptAction.bind(null, receiptId!)
      : createSampleCollectionAction;

  const [state, action, pending] =
    useActionState(
      formAction,
      initialState,
    );
  const [selectedIds, setSelectedIds] =
    useState<string[]>(
      initialData?.selectedTestIds ?? [],
    );
  const [search, setSearch] = useState("");
  const [highlightedTestIndex, setHighlightedTestIndex] =
    useState(-1);
  const [discountPercent, setDiscountPercent] =
    useState(
      initialData?.discountPercent ?? 0,
    );
  const [additionalLess, setAdditionalLess] =
    useState(
      initialData?.additionalLess ?? 0,
    );
  const [paidAmount, setPaidAmount] =
    useState(
      initialData?.paidAmount ?? 0,
    );
  const [referenceType, setReferenceType] =
    useState(
      initialData?.referenceType ?? "SELF",
    );
  const router = useRouter();
  const printTabRef = useRef<Window | null>(null);

  useEffect(() => {
    if (!state.success || !state.receiptId) {
      return;
    }

    if (state.submitMode === "save-print") {
      const receiptUrl =
        `/portal/receipts/${state.receiptId}/print`;

      if (
        printTabRef.current &&
        !printTabRef.current.closed
      ) {
        printTabRef.current.location.href = receiptUrl;
        printTabRef.current.focus();
      } else {
        window.open(receiptUrl, "_blank");
      }

      printTabRef.current = null;
      return;
    }

    router.push("/portal/reports");
    router.refresh();
  }, [
    router,
    state.receiptId,
    state.submitMode,
    state.success,
  ]);

  useEffect(() => {
    if (
      state.success ||
      !state.message ||
      !printTabRef.current
    ) {
      return;
    }

    if (!printTabRef.current.closed) {
      printTabRef.current.close();
    }

    printTabRef.current = null;
  }, [state.message, state.success]);

  function preparePrintTab() {
    const newTab = window.open("", "_blank");

    if (!newTab) {
      alert(
        "The new receipt tab was blocked. Please allow popups and redirects for this website.",
      );
      return;
    }

    newTab.document.title = "Preparing Receipt";
    newTab.document.body.innerHTML = `
      <div style="
        min-height:100vh;
        display:flex;
        align-items:center;
        justify-content:center;
        font-family:Arial,sans-serif;
        background:#f1f5f9;
        color:#0f172a;
      ">
        <div style="
          background:white;
          padding:32px;
          border-radius:16px;
          text-align:center;
          box-shadow:0 10px 30px rgba(15,23,42,0.12);
        ">
          <h2 style="margin:0 0 10px;">Preparing receipt...</h2>
          <p style="margin:0;color:#64748b;">
            Please wait while the sample collection is saved.
          </p>
        </div>
      </div>
    `;

    printTabRef.current = newTab;
  }

  const selected = useMemo(
    () =>
      selectedIds
        .map((id) => tests.find((test) => test.id === id))
        .filter((test): test is TestOption => Boolean(test)),
    [selectedIds, tests],
  );

  const results = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return [];
    return tests
      .filter(
        (test) =>
          !selectedIds.includes(test.id) &&
          `${test.testCode} ${test.testName}`.toLowerCase().includes(q),
      )
      .slice(0, 8);
  }, [search, selectedIds, tests]);

  function addSelectedTest(test: TestOption) {
    setSelectedIds((current) =>
      current.includes(test.id)
        ? current
        : [...current, test.id],
    );

    setSearch("");
    setHighlightedTestIndex(-1);
  }
  function handleSearchKeyDown(
    event: React.KeyboardEvent<HTMLInputElement>,
  ) {
    if (results.length === 0) return;

    if (event.key === "ArrowDown") {
      event.preventDefault();

      setHighlightedTestIndex((current) =>
        current < results.length - 1
          ? current + 1
          : 0,
      );
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();

      setHighlightedTestIndex((current) =>
        current > 0
          ? current - 1
          : results.length - 1,
      );
    }

    if (event.key === "Enter") {
      event.preventDefault();

      const selected =
        results[
        highlightedTestIndex >= 0
          ? highlightedTestIndex
          : 0
        ];

      if (selected) {
        addSelectedTest(selected);
      }
    }

    if (event.key === "Escape") {
      setHighlightedTestIndex(-1);
      setSearch("");
    }
  }

  const subtotal = selected.reduce(
    (sum, test) => sum + Number(test.price),
    0,
  );
  const discountAmount = (subtotal * discountPercent) / 100;
  const totalDiscount = discountAmount + additionalLess;
  const netAmount = Math.max(subtotal - totalDiscount, 0);
  const dueAmount = Math.max(netAmount - paidAmount, 0);

  const now = new Date();
  const date = now.toISOString().slice(0, 10);
  const time = `${String(now.getHours()).padStart(2, "0")}:${String(
    now.getMinutes(),
  ).padStart(2, "0")}`;

  return (
    <form action={action} className="space-y-6">
      <input
        type="hidden"
        name="selectedTests"
        value={JSON.stringify(selectedIds.map((testId) => ({ testId })))}
      />

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl shadow-blue-100/50">
        <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-600 px-6 py-6 text-white sm:px-8">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-100">Registration Desk</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight">
            {mode === "edit"
              ? "Edit Patient Receipt"
              : "Patient Registration / Sample Collection"}
          </h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-blue-100">
            {mode === "edit"
              ? "Update patient details, selected tests, and billing information for this receipt."
              : "Enter patient details, choose laboratory tests in any order, calculate billing automatically, and save or print the receipt."}
          </p>
        </div>

        {state.message ? (
          <div className="m-6 rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
            {state.message}
          </div>
        ) : null}

        <div className="grid gap-6 bg-slate-50/80 p-6 sm:p-8 xl:grid-cols-2">
          <div className="rounded-2xl border border-blue-100 bg-white p-5 shadow-sm"><div className="mb-5 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-blue-700"><div className="flex items-center gap-3"><UserRound className="h-5 w-5" /><div><h2 className="font-bold">Patient Information</h2><p className="text-sm text-blue-600">Enter the patient's personal and contact details.</p></div></div></div><div className="grid gap-4 sm:grid-cols-2">
            <Field name="patientName" label="Patient Name" required
              defaultValue={initialData?.patientName} />
            <Select
              name="gender"
              label="Gender"
              options={[
                ["MALE", "Male"],
                ["FEMALE", "Female"],
                ["OTHER", "Other"],
              ]}
            />
            <Field name="ageValue" defaultValue={
              initialData?.ageValue?.toString()
            } label="Age" type="number" required />
            <Select
              name="ageUnit"
              label="Age Unit"
              options={[
                ["YEARS", "Years"],
                ["MONTHS", "Months"],
                ["DAYS", "Days"],
              ]}
            />
            <Field name="phone" label="Telephone / Mobile" />
            <Field name="cnic" label="CNIC" />
            <Field name="fatherOrHusbandName" label="Father / Husband" />
            <Field name="address" label="Address" />

            <div className="sm:col-span-2 mt-2 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-emerald-700">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-white p-2 shadow-sm">
                  <Save className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="font-bold">Billing Summary</h2>
                  <p className="text-sm text-emerald-600">Amounts update automatically when tests or discounts change.</p>
                </div>
              </div>
            </div>

            <ReadOnly label="Subtotal" value={subtotal} />
            <Field
              name="discountPercent"
              label="Discount %"
              type="number"
              value={discountPercent}
              onChange={(value) => setDiscountPercent(Number(value))}
            />
            <ReadOnly label="Discount Amount" value={discountAmount} />
            <Field
              name="additionalLess"
              label="Less (-)"
              type="number"
              value={additionalLess}
              onChange={(value) => setAdditionalLess(Number(value))}
            />
            <ReadOnly label="Total Discount" value={totalDiscount} />
            <ReadOnly label="Net Amount" value={netAmount} />
            <Field
              name="paidAmount"
              label="Paid"
              type="number"
              value={paidAmount}
              onChange={(value) => setPaidAmount(Number(value))}
            />
            <ReadOnly label="Due" value={dueAmount} />
          </div></div>

          <div className="space-y-5">
            <div className="rounded-2xl border border-indigo-100 bg-white p-5 shadow-sm">
              <div className="mb-5 rounded-xl border border-indigo-100 bg-indigo-50 px-4 py-3 text-indigo-700"><div className="flex items-center gap-3"><Building2 className="h-5 w-5" /><div><h2 className="font-bold">Collection Details</h2><p className="text-sm text-indigo-600">Specify date, time, reference, and specimen information.</p></div></div></div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field
                  name="collectionDate"
                  label="Date"
                  type="date"
                  defaultValue={
                    initialData?.collectionDate ?? date
                  }
                  required
                />
                <Field
                  name="collectionTime"
                  label="Time"
                  type="time"
                  defaultValue={
                    initialData?.collectionTime ?? time
                  }
                  required
                />
                <label>
                  <span className="mb-2 block text-sm font-medium">Branch</span>
                  <input
                    readOnly
                    value={labName}
                    className="h-12 w-full rounded-xl border border-slate-300 bg-slate-100 px-4 font-semibold text-slate-700 shadow-sm"
                  />
                </label>
                <Select
                  name="referenceType"
                  label="Ref By"
                  value={referenceType}
                  onChange={setReferenceType}
                  options={[
                    ["SELF", "Self"],
                    ["DOCTOR", "Doctor"],
                    ["COMPANY", "Company"],
                    ["OTHER", "Other"],
                  ]}
                />

                {referenceType === "DOCTOR" ? (
                  <label>
                    <span className="mb-2 block text-sm font-medium">Doctor</span>
                    <select
                      name="doctorId"
                      defaultValue={initialData?.doctorId ?? ""}
                      className="h-12 w-full rounded-xl border border-slate-300 bg-white px-4 text-slate-800 shadow-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                    >
                      <option value="">Select doctor</option>
                      {doctors.map((doctor) => (
                        <option key={doctor.id} value={doctor.id}>
                          {doctor.doctorName}
                        </option>
                      ))}
                    </select>
                  </label>
                ) : null}

                {referenceType === "COMPANY" ? (
                  <Field name="companyName" label="Company" />
                ) : null}

                <Select
                  name="specimenSource"
                  label="Specimen Source"
                  options={[
                    ["TAKEN_IN_LAB", "Taken in Lab"],
                    ["RECEIVED_FROM_OUTSIDE", "Received from Outside"],
                  ]}
                />
                <Field name="specimen" label="Specimen" />
              </div></div>

            <div className="rounded-2xl border border-cyan-100 bg-white p-5 shadow-sm">
              <div className="mb-5 rounded-xl border border-cyan-100 bg-cyan-50 px-4 py-3 text-cyan-700"><div className="flex items-center gap-3"><TestTube2 className="h-5 w-5" /><div><h2 className="font-bold">Laboratory Tests</h2><p className="text-sm text-cyan-600">Search and add tests at any time while completing the form.</p></div></div></div>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                <input
                  value={search}
                  onChange={(event) => {
                    setSearch(event.target.value);
                    setHighlightedTestIndex(-1);
                  }}
                  onKeyDown={handleSearchKeyDown}
                  placeholder="Search Tests"
                  className="h-12 w-full rounded-xl border-2 border-cyan-300 bg-white pl-10 pr-4 text-base font-semibold text-slate-900 shadow-sm outline-none transition placeholder:font-normal placeholder:text-slate-400 focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
                />
                {results.length > 0 ? (
                  <div className="absolute z-30 mt-2 w-full overflow-hidden rounded-xl border border-blue-200 bg-white shadow-xl shadow-slate-300/60">
                    {results.map((test, index) => (
                      <button
                        key={test.id}
                        type="button"
                        onClick={() => addSelectedTest(test)}
                        onMouseEnter={() =>
                          setHighlightedTestIndex(index)
                        }
                        className={`flex w-full items-center justify-between gap-4 border-b border-slate-200 px-5 py-4 text-left text-slate-900 transition last:border-b-0 ${index === highlightedTestIndex
                          ? "bg-blue-100"
                          : "bg-white hover:bg-blue-50"
                          }`}
                      >
                        <div className="min-w-0">
                          <p className="truncate text-base font-bold text-slate-900">
                            {test.testCode} — {test.testName}
                          </p>

                          <p className="mt-1 text-sm font-medium text-slate-500">
                            {test.sampleRequired ?? "Sample not specified"}
                          </p>
                        </div>

                        <span className="shrink-0 rounded-lg bg-blue-100 px-3 py-1.5 text-sm font-bold text-blue-800">
                          PKR {Number(test.price).toFixed(2)}
                        </span>
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>

              <div className="overflow-x-auto rounded-lg border">
                <table className="min-w-full">
                  <thead className="bg-gradient-to-r from-cyan-700 to-blue-700 text-white">
                    <tr>
                      <th className="px-3 py-3 text-left">Test ID</th>
                      <th className="px-3 py-3 text-left">Test Desc</th>
                      <th className="px-3 py-3 text-left">Charges</th>
                      <th className="px-3 py-3 text-left">Carry Out</th>
                      <th className="px-3 py-3 text-left">Report</th>
                      <th className="px-3 py-3" />
                    </tr>
                  </thead>
                  <tbody>
                    {selected.map((test) => (
                      <tr key={test.id} className="border-t border-slate-200 odd:bg-white even:bg-slate-50 hover:bg-blue-50">
                        <td className="px-3 py-3">{test.testCode}</td>
                        <td className="px-3 py-3">{test.testName}</td>
                        <td className="px-3 py-3">
                          PKR {Number(test.price).toFixed(2)}
                        </td>
                        <td className="px-3 py-3">
                          {test.sampleRequired ?? "—"}
                        </td>
                        <td className="px-3 py-3">
                          {test.reportingTime ?? "—"}
                        </td>
                        <td className="px-3 py-3 text-right">
                          <button
                            type="button"
                            onClick={() =>
                              setSelectedIds((current) =>
                                current.filter((id) => id !== test.id),
                              )
                            }
                            className="rounded-lg border border-red-200 p-2 text-red-600"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                    {selected.length === 0 ? (
                      <tr><td colSpan={6} className="px-4 py-12 text-center"><FlaskConical className="mx-auto h-10 w-10 text-cyan-300" /><p className="mt-3 font-semibold text-slate-700">No tests selected</p><p className="mt-1 text-sm text-slate-500">Search above and add tests whenever you are ready.</p></td></tr>
                    ) : null}
                  </tbody>
                </table>
              </div></div>
          </div>
        </div>

        <div className="flex flex-wrap justify-end gap-3 border-t border-slate-200 bg-white p-6">
          <button
            type="submit"
            name="submitMode"
            value="save-print"
            onClick={preparePrintTab}
            disabled={pending}
            className="inline-flex h-12 items-center gap-2 rounded-xl bg-cyan-600 px-6 font-semibold text-white shadow-md shadow-cyan-200 transition hover:bg-cyan-700 disabled:opacity-60"
          >
            <Printer className="h-5 w-5" />
            {mode === "edit"
              ? "Update & Print"
              : "Save & Print"}
          </button>
          <button
            type="submit"
            name="submitMode"
            value="save"
            disabled={pending}
            className="inline-flex h-12 items-center gap-2 rounded-xl bg-blue-600 px-7 font-semibold text-white shadow-md shadow-blue-200 transition hover:bg-blue-700 disabled:opacity-60"
          >
            <Save className="h-5 w-5" />
            {pending
              ? "Saving..."
              : mode === "edit"
                ? "Update Receipt"
                : "Save"}
          </button>
        </div>
      </div>
    </form>
  );
}

function Field({
  name,
  label,
  type = "text",
  required,
  defaultValue,
  value,
  onChange,
}: {
  name: string;
  label: string;
  type?: string;
  required?: boolean;
  defaultValue?: string;
  value?: number;
  onChange?: (value: string) => void;
}) {
  return (
    <label>
      <span className="mb-2 block text-sm font-semibold text-slate-700">{label}</span>
      <input
        name={name}
        type={type}
        required={required}
        defaultValue={defaultValue}
        value={value}
        onChange={
          onChange
            ? (event) => onChange(event.target.value)
            : undefined
        }
        className="h-12 w-full rounded-xl border border-slate-300 bg-white px-4 text-slate-800 shadow-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
      />
    </label>
  );
}

function Select({
  name,
  label,
  options,
  value,
  onChange,
}: {
  name: string;
  label: string;
  options: [string, string][];
  value?: string;
  onChange?: (value: string) => void;
}) {
  return (
    <label>
      <span className="mb-2 block text-sm font-semibold text-slate-700">{label}</span>
      <select
        name={name}
        value={value}
        defaultValue={value ? undefined : options[0]?.[0]}
        onChange={
          onChange
            ? (event) => onChange(event.target.value)
            : undefined
        }
        className="h-12 w-full rounded-xl border border-slate-300 bg-white px-4 text-slate-800 shadow-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
      >
        {options.map(([optionValue, optionLabel]) => (
          <option key={optionValue} value={optionValue}>
            {optionLabel}
          </option>
        ))}
      </select>
    </label>
  );
}

function ReadOnly({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <label>
      <span className="mb-2 block text-sm font-semibold text-slate-700">{label}</span>
      <input
        readOnly
        value={value.toFixed(2)}
        className="h-12 w-full rounded-xl border border-emerald-200 bg-emerald-50 px-4 font-bold text-emerald-800 shadow-sm"
      />
    </label>
  );
}