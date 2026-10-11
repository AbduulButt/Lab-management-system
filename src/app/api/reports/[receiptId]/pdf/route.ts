import { renderToBuffer } from "@react-pdf/renderer";

import ReportPdfDocument from "@/components/reports/pdf/report-pdf-document";

import { getCurrentUser } from "@/lib/auth/session";
import { getReportPdfData } from "@/lib/reports/report-pdf-data";
import { loadReportLogoDataUrl } from "@/lib/reports/load-report-logo";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type PdfRouteContext = {
    params: Promise<{
        receiptId: string;
    }>;
};

export async function GET(
    request: Request,
    context: PdfRouteContext,
) {
    try {
        /*
         * Any logged-in active user may view/print reports.
         *
         * ADMIN
         * RECEPTIONIST
         * TECHNICIAN
         */
        const user = await getCurrentUser();

        if (!user) {
            return new Response(
                "You must be logged in to view this report.",
                {
                    status: 401,
                },
            );
        }

        const { receiptId } =
            await context.params;

        if (!receiptId) {
            return new Response(
                "Receipt ID is missing.",
                {
                    status: 400,
                },
            );
        }

        const url = new URL(request.url);

        const showHeader =
            url.searchParams.get("header") !==
            "false";

        const [data, logoDataUrl] =
            await Promise.all([
                getReportPdfData(receiptId),
                loadReportLogoDataUrl(),
            ]);

        if (!data) {
            return new Response(
                "Receipt not found.",
                {
                    status: 404,
                },
            );
        }

        if (data.tests.length === 0) {
            return new Response(
                "No completed tests found.",
                {
                    status: 409,
                },
            );
        }

        const document =
            ReportPdfDocument({
                data,
                showHeader,
                logoDataUrl,
            });

        const pdfBuffer =
            await renderToBuffer(document);

        return new Response(
            new Uint8Array(pdfBuffer),
            {
                status: 200,

                headers: {
                    "Content-Type":
                        "application/pdf",

                    "Content-Disposition":
                        `inline; filename="Lab-Report-${data.receiptNumber}.pdf"`,

                    "Cache-Control":
                        "no-store, no-cache, must-revalidate",

                    Pragma: "no-cache",

                    Expires: "0",
                },
            },
        );
    } catch (error) {
        console.error(
            "Generate Report PDF Error:",
            error,
        );

        return new Response(
            error instanceof Error
                ? error.message
                : "Unable to generate PDF.",
            {
                status: 500,
            },
        );
    }
}