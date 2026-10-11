import {
    Image,
    StyleSheet,
    Text,
    View,
} from "@react-pdf/renderer";

import type { PdfReceiptData } from "./report-pdf-types";

const styles = StyleSheet.create({
    container: {
        marginTop: 8,
        flexDirection: "row",
    },

    columns: {
        flex: 1,
        flexDirection: "row",
        gap: 12,
    },

    column: {
        flex: 1,
        gap: 4,
    },

    item: {
        minHeight: 20,
    },

    label: {
    fontFamily: "Helvetica",
    fontSize: 8.5,
    color: "#334155",
},

value: {
    marginTop: 1.5,
    fontFamily: "Helvetica-Bold",
    fontSize: 10.5,
    color: "#000000",
    lineHeight: 1.2,
},

    qrArea: {
        width: 70,
        alignItems: "center",
        justifyContent: "flex-start",
    },

    qr: {
        width: 58,
        height: 58,
    },
});

function Info({
    label,
    value,
}: {
    label: string;
    value: string;
}) {
    return (
        <View style={styles.item}>
            <Text style={styles.label}>
                {label}
            </Text>

            <Text style={styles.value}>
                {value || "N/A"}
            </Text>
        </View>
    );
}

export default function ReportPdfPatientInfo({
    data,
}: {
    data: PdfReceiptData;
}) {
    return (
        <View style={styles.container}>
            <View style={styles.columns}>
                <View style={styles.column}>
                    <Info
                        label="Patient Detail:"
                        value={`${data.patientName} (${data.ageAndGender})`}
                    />

                    <Info
                        label="Mobile No:"
                        value={data.phone}
                    />

                    <Info
                        label="Registration Location:"
                        value={data.registrationLocation}
                    />
                </View>

                <View style={styles.column}>
                    <Info
                        label="Registration Date:"
                        value={data.registrationDate}
                    />

                    <Info
                        label="Reference:"
                        value=""
                    />

                    <Info
                        label="Consultant:"
                        value={data.consultant}
                    />
                </View>

                <View style={styles.column}>
                    <Info
                        label="Patient Number:"
                        value={data.mrNumber}
                    />

                    <Info
                        label="Case Number:"
                        value={data.receiptNumber}
                    />

                    <Info
                        label="CNIC No:"
                        value={data.cnic}
                    />
                </View>
            </View>

            <View style={styles.qrArea}>
                {data.qrCodeDataUrl ? (
                    <Image
                        src={data.qrCodeDataUrl}
                        style={styles.qr}
                    />
                ) : null}
            </View>
        </View>
    );
}