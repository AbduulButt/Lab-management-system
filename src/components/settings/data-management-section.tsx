"use client";

import {
    AlertTriangle,
    CalendarDays,
    Database,
    Eye,
    FileText,
    FlaskConical,
    Trash2,
    UserRound,
} from "lucide-react";

import {
    useEffect,
    useState,
    useTransition,
} from "react";

import {
    deleteOldRecordsAction,
    getDatabaseRecordInfoAction,
    previewOldRecordsAction,
    type CleanupPreview,
    type DatabaseRecordInfo,
} from "@/actions/data-management-actions";

/*
 * Records newer than 2 months are protected.
 */
function maximumCleanupDate() {
    const date = new Date();

    date.setMonth(
        date.getMonth() - 2,
    );

    const year =
        date.getFullYear();

    const month = String(
        date.getMonth() + 1,
    ).padStart(2, "0");

    const day = String(
        date.getDate(),
    ).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

/*
 * Used for displaying:
 *
 * Last Record Saved
 * Oldest Record
 * Latest Safe Delete Date
 */
function formatDate(
    value: string | null,
) {
    if (!value) {
        return "No records";
    }

    return new Intl.DateTimeFormat(
        "en-GB",
        {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        },
    ).format(
        new Date(value),
    );
}

export default function DataManagementSection() {
    const [cutoffDate, setCutoffDate] =
        useState("");

    const [confirmation, setConfirmation] =
        useState("");

    const [preview, setPreview] =
        useState<CleanupPreview | null>(
            null,
        );

    /*
     * Database date information:
     *
     * Last saved receipt
     * Oldest receipt
     * Latest safe deletion date
     */
    const [recordInfo, setRecordInfo] =
        useState<DatabaseRecordInfo | null>(
            null,
        );

    const [message, setMessage] =
        useState<{
            type: "success" | "error";
            text: string;
        } | null>(null);

    const [
        isPreviewing,
        startPreviewTransition,
    ] = useTransition();

    const [
        isDeleting,
        startDeleteTransition,
    ] = useTransition();

    /*
     * Load database record information
     * when the Settings page opens.
     */
    useEffect(() => {
        let active = true;

        async function loadRecordInfo() {
            const result =
                await getDatabaseRecordInfoAction();

            if (
                active &&
                result.success
            ) {
                setRecordInfo(
                    result.info,
                );
            }
        }

        void loadRecordInfo();

        return () => {
            active = false;
        };
    }, []);

    function handlePreview() {
        setMessage(null);
        setPreview(null);
        setConfirmation("");

        startPreviewTransition(
            async () => {
                const result =
                    await previewOldRecordsAction(
                        cutoffDate,
                    );

                if (!result.success) {
                    setMessage({
                        type: "error",
                        text: result.message,
                    });

                    return;
                }

                setPreview(
                    result.preview,
                );

                setMessage({
                    type: "success",
                    text: result.message,
                });
            },
        );
    }

    function handleDelete() {
        if (!preview) {
            setMessage({
                type: "error",
                text:
                    "Preview the records before deleting them.",
            });

            return;
        }

        if (
            confirmation !== "DELETE"
        ) {
            setMessage({
                type: "error",
                text:
                    'Type "DELETE" exactly before continuing.',
            });

            return;
        }

        const confirmed =
            window.confirm(
                `This will permanently delete ${preview.receipts} old receipt(s) and their related results.\n\nThis action cannot be undone.\n\nContinue?`,
            );

        if (!confirmed) {
            return;
        }

        startDeleteTransition(
            async () => {
                const result =
                    await deleteOldRecordsAction(
                        cutoffDate,
                        confirmation,
                    );

                if (!result.success) {
                    setMessage({
                        type: "error",
                        text: result.message,
                    });

                    return;
                }

                setMessage({
                    type: "success",
                    text: result.message,
                });

                setPreview(null);
                setConfirmation("");
                setCutoffDate("");

                /*
                 * Refresh the information cards
                 * after records are deleted.
                 */
                const infoResult =
                    await getDatabaseRecordInfoAction();

                if (
                    infoResult.success
                ) {
                    setRecordInfo(
                        infoResult.info,
                    );
                }
            },
        );
    }

    const nothingToDelete =
        preview?.receipts === 0;

    return (
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            {/* HEADER */}
            <div className="border-b border-slate-200 bg-gradient-to-r from-slate-50 to-blue-50 px-6 py-5">
                <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
                        <Database className="h-6 w-6" />
                    </div>

                    <div>
                        <h2 className="text-xl font-bold text-slate-900">
                            Data Management
                        </h2>

                        <p className="mt-1 text-sm text-slate-500">
                            Preview and permanently remove old completed laboratory records.
                        </p>
                    </div>
                </div>
            </div>

            <div className="space-y-6 p-6">
                {/* DATABASE DATE INFORMATION */}
                {recordInfo ? (
                    <div className="grid gap-4 md:grid-cols-3">
                        {/* LAST RECORD SAVED */}
                        <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
                            <p className="text-xs font-bold uppercase tracking-wide text-blue-600">
                                Last Record Saved
                            </p>

                            <p className="mt-2 text-base font-bold text-slate-900">
                                {formatDate(
                                    recordInfo.lastSavedDate,
                                )}
                            </p>

                            <p className="mt-1 text-xs text-slate-500">
                                Most recently created patient receipt.
                            </p>
                        </div>

                        {/* OLDEST RECORD */}
                        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                            <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                                Oldest Record
                            </p>

                            <p className="mt-2 text-base font-bold text-slate-900">
                                {formatDate(
                                    recordInfo.oldestSavedDate,
                                )}
                            </p>

                            <p className="mt-1 text-xs text-slate-500">
                                Earliest receipt stored in the database.
                            </p>
                        </div>

                        {/* LATEST SAFE DELETE DATE */}
                        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                            <p className="text-xs font-bold uppercase tracking-wide text-emerald-600">
                                Latest Safe Delete Date
                            </p>

                            <p className="mt-2 text-base font-bold text-slate-900">
                                {formatDate(
                                    recordInfo.latestDeletableDate,
                                )}
                            </p>

                            <p className="mt-1 text-xs text-slate-500">
                                Records newer than this date are protected.
                            </p>
                        </div>
                    </div>
                ) : null}

                {/* SAFETY WARNING */}
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                    <div className="flex gap-3">
                        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />

                        <div>
                            <p className="font-bold text-amber-900">
                                Permanent deletion
                            </p>

                            <p className="mt-1 text-sm leading-6 text-amber-800">
                                Only completed or cancelled receipts older than 2 months can be removed.
                                Pending laboratory work is never included.
                            </p>
                        </div>
                    </div>
                </div>

                {/* DATE + PREVIEW */}
                <div className="grid gap-5 lg:grid-cols-[1fr_auto] lg:items-end">
                    <label>
                        <span className="mb-2 flex items-center gap-2 text-sm font-bold text-slate-800">
                            <CalendarDays className="h-4 w-4 text-blue-600" />
                            Delete records on or before
                        </span>

                        <input
                            type="date"
                            value={cutoffDate}
                            max={maximumCleanupDate()}
                            onChange={(event) => {
                                setCutoffDate(
                                    event.target.value,
                                );

                                setPreview(null);
                                setConfirmation("");
                                setMessage(null);
                            }}
                            className="h-12 w-full rounded-xl border border-slate-300 bg-white px-4 font-semibold text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                        />
                    </label>

                    <button
                        type="button"
                        disabled={
                            !cutoffDate ||
                            isPreviewing ||
                            isDeleting
                        }
                        onClick={handlePreview}
                        className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 font-bold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        <Eye className="h-5 w-5" />

                        {isPreviewing
                            ? "Checking..."
                            : "Preview Records"}
                    </button>
                </div>

                {/* MESSAGE */}
                {message ? (
                    <div
                        className={`rounded-xl border px-4 py-3 text-sm font-semibold ${message.type === "success"
                                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                                : "border-red-200 bg-red-50 text-red-700"
                            }`}
                    >
                        {message.text}
                    </div>
                ) : null}

                {/* PREVIEW RESULTS */}
                {preview ? (
                    <div className="space-y-5">
                        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
                            <StatCard
                                title="Receipts"
                                value={preview.receipts}
                                icon={FileText}
                            />

                            <StatCard
                                title="Patient Tests"
                                value={preview.patientTests}
                                icon={FlaskConical}
                            />

                            <StatCard
                                title="Results"
                                value={preview.testResults}
                                icon={Database}
                            />

                            <StatCard
                                title="Report Records"
                                value={
                                    preview.generatedReports
                                }
                                icon={FileText}
                            />

                            <StatCard
                                title="Patients"
                                value={
                                    preview.removablePatients
                                }
                                icon={UserRound}
                            />
                        </div>

                        {!nothingToDelete ? (
                            <div className="rounded-2xl border border-red-200 bg-red-50/60 p-5">
                                <h3 className="text-lg font-bold text-red-900">
                                    Confirm permanent cleanup
                                </h3>

                                <p className="mt-2 text-sm leading-6 text-red-700">
                                    This operation cannot be undone.
                                    Create a database backup before deleting important historical records.
                                </p>

                                <label className="mt-5 block">
                                    <span className="mb-2 block text-sm font-bold text-slate-800">
                                        Type DELETE to continue
                                    </span>

                                    <input
                                        value={confirmation}
                                        onChange={(event) =>
                                            setConfirmation(
                                                event.target.value,
                                            )
                                        }
                                        placeholder="DELETE"
                                        className="h-12 w-full rounded-xl border border-red-300 bg-white px-4 font-bold uppercase tracking-wider text-slate-900 outline-none focus:border-red-500 focus:ring-4 focus:ring-red-100"
                                    />
                                </label>

                                <button
                                    type="button"
                                    disabled={
                                        confirmation !==
                                        "DELETE" ||
                                        isDeleting
                                    }
                                    onClick={handleDelete}
                                    className="mt-4 inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-red-600 px-6 font-bold text-white shadow-sm transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-40"
                                >
                                    <Trash2 className="h-5 w-5" />

                                    {isDeleting
                                        ? "Deleting..."
                                        : "Delete Old Records"}
                                </button>
                            </div>
                        ) : null}
                    </div>
                ) : null}
            </div>
        </section>
    );
}

function StatCard({
    title,
    value,
    icon: Icon,
}: {
    title: string;
    value: number;
    icon: React.ComponentType<{
        className?: string;
    }>;
}) {
    return (
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-700">
                    <Icon className="h-5 w-5" />
                </div>

                <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                        {title}
                    </p>

                    <p className="mt-1 text-xl font-bold text-slate-900">
                        {value}
                    </p>
                </div>
            </div>
        </div>
    );
}