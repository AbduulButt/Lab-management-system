import type { ReactElement } from "react";
import {
    Document,
    type DocumentProps,
} from "@react-pdf/renderer";

import ReportPdfTestPage from "./report-pdf-test-page";
import type {
    ReportPdfDocumentProps,
} from "./report-pdf-types";

export default function ReportPdfDocument({
    data,
    showHeader,
    logoDataUrl,
}: ReportPdfDocumentProps): ReactElement<DocumentProps> {
    return (
        <Document
            title={`Lab Report ${data.receiptNumber}`}
            author="Life Care Lab"
            subject={`Laboratory report for ${data.patientName}`}
            creator="Life Care Lab Management System"
        >
            {data.tests.map((test) => (
                <ReportPdfTestPage
                    key={test.id}
                    data={data}
                    test={test}
                    showHeader={showHeader}
                    logoDataUrl={logoDataUrl}
                />
            ))}
        </Document>
    );
}