import {
    StyleSheet,
    Text,
    View,
} from "@react-pdf/renderer";

const footerText =
    "All the tests are performed on the most advanced, highly sophisticated, appropriate and state of the art instruments with highly sensitive chemicals under strict conditions and with all care and diligence. However, the above results are NOT the DIAGNOSIS and should be correlated with clinical findings, patient's history, signs and symptoms and other diagnostic tests. Lab to Lab variation may occur. This document is NEVER challengeable at any PLACE/COURT and in any CONDITION.";

const styles = StyleSheet.create({
    container: {
        position: "absolute",
        bottom: 18,
        left: 20,
        right: 20,
    },

    verifiedBox: {
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: "#000",
        paddingVertical: 5,
        alignItems: "center",
    },

    verifiedText: {
        fontSize: 9,
        fontFamily: "Helvetica-Bold",
    },

    note: {
        marginTop: 6,
        textAlign: "center",
        fontSize: 7,
        lineHeight: 1.35,
    },

    noteTitle: {
        fontFamily: "Helvetica-Bold",
    },
});

export default function ReportPdfFooter() {
    return (
        <View style={styles.container} fixed>
            <View style={styles.verifiedBox}>
                <Text style={styles.verifiedText}>
                    Electronically Verified Report,
                    No Signature(s) Required.
                </Text>
            </View>

            <Text style={styles.note}>
                <Text style={styles.noteTitle}>
                    NOTE:
                </Text>{" "}
                {footerText}
            </Text>
        </View>
    );
}