export type PdfAbnormalFlag =
    | "NOT_CHECKED"
    | "NORMAL"
    | "LOW"
    | "HIGH"
    | "ABNORMAL";

export type PdfResultRow = {
    id: string;

    fieldName: string;

    sectionName: string | null;

    resultValue: string;

    referenceRange: string;

    unit: string;

    abnormalFlag: PdfAbnormalFlag;
};

export type PdfTestReport = {
    id: string;

    testCode: string;

    testName: string;

    reportHeading: string;

    interpretation: string | null;

    remarks: string | null;

    reportingTime: string;

    verifiedBy: string | null;

    results: PdfResultRow[];
};

export type PdfReceiptData = {
    receiptId: string;

    receiptNumber: string;

    mrNumber: string;

    patientName: string;

    fatherOrHusband: string;

    ageAndGender: string;

    phone: string;

    cnic: string;

    address: string;

    specimen: string;

    consultant: string;

    registrationDate: string;

    registrationLocation: string;

    qrCodeDataUrl: string | null;

    tests: PdfTestReport[];
};

export type ReportPdfDocumentProps = {
    data: PdfReceiptData;

    showHeader: boolean;

    logoDataUrl: string | null;
};