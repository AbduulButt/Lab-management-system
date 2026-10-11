import {
  Page,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";

import ReportPdfFooter from "./report-pdf-footer";
import ReportPdfHeader from "./report-pdf-header";
import ReportPdfPatientInfo from "./report-pdf-patient-info";

import type {
  PdfReceiptData,
  PdfResultRow,
  PdfTestReport,
} from "./report-pdf-types";

const styles = StyleSheet.create({
  page: {
    paddingTop: 26,
    paddingHorizontal: 20,
    paddingBottom: 75,
    fontSize: 10,
    backgroundColor: "#ffffff",
    fontFamily: "Helvetica",
    color: "#000000",
  },

  noHeaderSpace: {
    height: 10,
  },

  headingRow: {
    marginTop: 18,
    paddingVertical: 6,
    paddingHorizontal: 4,

    borderTopWidth: 0.8,
    borderBottomWidth: 0.8,
    borderColor: "#000000",

    flexDirection: "row",
    alignItems: "center",
  },

  heading: {
    flex: 1,
    fontFamily: "Helvetica-Bold",
    fontSize: 15,
  },

  reportingTime: {
    fontSize: 8.5,
  },

  tableHeader: {
    flexDirection: "row",
    borderBottomWidth: 0.8,
    borderColor: "#000000",
    minHeight: 24,
    alignItems: "center",
  },

  row: {
    flexDirection: "row",
    borderBottomWidth: 0.4,
    borderBottomColor: "#d1d5db",
    minHeight: 20,
    alignItems: "center",
  },

  sectionRow: {
    backgroundColor: "#f3f4f6",
    paddingVertical: 5,
    paddingHorizontal: 6,
    borderBottomWidth: 0.4,
    borderBottomColor: "#d1d5db",
  },

  sectionText: {
    fontFamily: "Helvetica-Bold",
    fontSize: 9.5,
  },

  colTest: {
    width: "38%",
    paddingHorizontal: 6,
    paddingVertical: 5,
    fontSize: 10.5,
    fontFamily: "Helvetica-Bold",
  },

  colReference: {
    width: "24%",
    paddingHorizontal: 6,
    paddingVertical: 5,
    fontSize: 10.5,

    borderLeftWidth: 0.4,
    borderLeftColor: "#d1d5db",
  },

  colUnit: {
    width: "16%",
    paddingHorizontal: 6,
    paddingVertical: 5,
    fontSize: 10.5,

    borderLeftWidth: 0.4,
    borderLeftColor: "#d1d5db",
  },

  colResult: {
    width: "22%",
    paddingHorizontal: 6,
    paddingVertical: 5,
    fontSize: 11,

    borderLeftWidth: 0.4,
    borderLeftColor: "#d1d5db",
  },
  compactRow: {
    minHeight: 14,
  },

  compactSectionRow: {
    paddingVertical: 2,
    paddingHorizontal: 4,
  },

  compactSectionText: {
    fontSize: 9,
  },

  compactCell: {
    paddingHorizontal: 4,
    paddingVertical: 2.5,
    fontSize: 9,
    lineHeight: 1.15,
  },

  headerText: {
    fontFamily: "Helvetica-Bold",
    fontSize: 9.5,
  },
  testValue: {
    fontFamily: "Helvetica-Bold",
  },

  abnormal: {
    color: "#dc2626",
    fontFamily: "Helvetica-Bold",
  },

  interpretationBox: {
    marginTop: 10,
    padding: 8,

    backgroundColor: "#f8fafc",

    borderWidth: 0.5,
    borderColor: "#d1d5db",
  },

  interpretationTitle: {
    fontFamily: "Helvetica-Bold",
    fontSize: 11,
  },

  interpretationText: {
    marginTop: 5,
    fontSize: 9,
    lineHeight: 1.4,
  },

  remarksBox: {
    marginTop: 10,
  },

  remarksTitle: {
    fontFamily: "Helvetica-Bold",
    fontSize: 11,
  },

  remarksText: {
    marginTop: 4,
    fontSize: 10.5,
    lineHeight: 1.4,
  },

});; function abnormalSuffix(
  flag: PdfResultRow["abnormalFlag"],
) {
  if (flag === "HIGH") {
    return " H";
  }

  if (flag === "LOW") {
    return " L";
  }

  if (flag === "ABNORMAL") {
    return " *";
  }

  return "";
}

function isAbnormal(
  flag: PdfResultRow["abnormalFlag"],
) {
  return (
    flag === "HIGH" ||
    flag === "LOW" ||
    flag === "ABNORMAL"
  );
}

function ResultsTable({
  results,
  compact = false,
}: {
  results: PdfResultRow[];
  compact?: boolean;
}) {
  let lastSection: string | null = null;

  return (
    <View>
      <View style={styles.tableHeader}>
        <Text
          style={[
            styles.colTest,
            styles.headerText,
            compact ? styles.compactCell : {},
          ]}
        >
          Test
        </Text>

        <Text
          style={[
            styles.colReference,
            styles.headerText,
            compact ? styles.compactCell : {},
          ]}
        >
          Reference Value
        </Text>

        <Text
          style={[
            styles.colUnit,
            styles.headerText,
            compact ? styles.compactCell : {},
          ]}
        >
          Unit
        </Text>

        <Text
          style={[
            styles.colResult,
            styles.headerText,
            compact ? styles.compactCell : {},
          ]}
        >
          Result
        </Text>
      </View>

      {results.map((result) => {
        const showSection =
          Boolean(result.sectionName) &&
          result.sectionName !== lastSection;

        lastSection = result.sectionName;

        return (
          <View
            key={result.id}
            wrap={false}
          >
            {showSection ? (
              <View
                style={[
                  styles.sectionRow,
                  compact
                    ? styles.compactSectionRow
                    : {},
                ]}
              >
                <Text
                  style={[
                    styles.sectionText,
                    compact
                      ? styles.compactSectionText
                      : {},
                  ]}
                >
                  {result.sectionName}
                </Text>
              </View>
            ) : null}

            <View
              style={[
                styles.row,
                compact ? styles.compactRow : {},
              ]}
            >
              <Text
                style={[
                  styles.colTest,
                  compact ? styles.compactCell : {},
                ]}
              >
                {result.fieldName}
              </Text>

              <Text
                style={[
                  styles.colReference,
                  compact ? styles.compactCell : {},
                ]}
              >
                {result.referenceRange}
              </Text>

              <Text
                style={[
                  styles.colUnit,
                  compact ? styles.compactCell : {},
                ]}
              >
                {result.unit}
              </Text>

              <Text
                style={[
                  styles.colResult,
                  compact ? styles.compactCell : {},
                  isAbnormal(result.abnormalFlag)
                    ? styles.abnormal
                    : {},
                ]}
              >
                {result.resultValue}
                {abnormalSuffix(
                  result.abnormalFlag,
                )}
              </Text>
            </View>
          </View>
        );
      })}
    </View>
  );
}
export default function ReportPdfTestPage({
  data,
  test,
  showHeader,
  logoDataUrl,
}: {
  data: PdfReceiptData;
  test: PdfTestReport;
  showHeader: boolean;
  logoDataUrl: string | null;
}) {
  const useCompactTable =
    test.results.length >= 18;

  return (
    <Page
      size="A4"
      style={styles.page}
      wrap
    >
      {showHeader ? (
        <ReportPdfHeader
          logoDataUrl={logoDataUrl}
        />
      ) : (
        <View style={styles.noHeaderSpace} />
      )}

      <ReportPdfPatientInfo data={data} />

      <View style={styles.headingRow}>
        <Text style={styles.heading}>
          {test.reportHeading.toUpperCase()}
        </Text>

        <Text style={styles.reportingTime}>
          Reporting Time:{" "}
          {test.reportingTime}
        </Text>
      </View>

      <ResultsTable
        results={test.results}
        compact={useCompactTable}
      />

      {test.interpretation ? (
        <View style={styles.interpretationBox}>
          <Text
            style={styles.interpretationTitle}
          >
            Interpretation
          </Text>

          <Text
            style={styles.interpretationText}
          >
            {test.interpretation}
          </Text>
        </View>
      ) : null}

      {test.remarks ? (
        <View style={styles.remarksBox}>
          <Text style={styles.remarksTitle}>
            Remarks
          </Text>

          <Text style={styles.remarksText}>
            {test.remarks}
          </Text>
        </View>
      ) : null}

      <ReportPdfFooter />
    </Page>
  );
}
