import { redirect } from "next/navigation";

import { requireAuthenticatedUser } from "@/lib/auth/authorization";

type PrintReportPageProps = {
    params: Promise<{
        receiptId: string;
    }>;

    searchParams: Promise<{
        header?: string;
    }>;
};

export default async function PrintReportPage({
    params,
    searchParams,
}: PrintReportPageProps) {
    await requireAuthenticatedUser();

    const [{ receiptId }, { header }] =
        await Promise.all([
            params,
            searchParams,
        ]);

    if (!receiptId) {
        redirect("/portal/reports");
    }

    const query =
        header === "false"
            ? "?header=false"
            : "";

    redirect(
        `/api/reports/${receiptId}/pdf${query}`,
    );
}