import QRCode from "qrcode";

import { prisma } from "@/lib/prisma";

import type {
  PdfReceiptData,
  PdfResultRow,
} from "@/components/reports/pdf/report-pdf-types";

function formatAge(
  ageValue: number | null,
  ageUnit: "YEARS" | "MONTHS" | "DAYS",
) {
  if (ageValue === null) {
    return "N/A";
  }

  const unit = {
    YEARS: "Years",
    MONTHS: "Months",
    DAYS: "Days",
  }[ageUnit];

  return `${ageValue} ${unit}`;
}

function formatGender(
  gender: "MALE" | "FEMALE" | "OTHER",
) {
  return {
    MALE: "Male",
    FEMALE: "Female",
    OTHER: "Other",
  }[gender];
}

function formatDateTime(value: Date | null) {
  if (!value) {
    return "N/A";
  }

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(value);
}

function fallbackReferenceRange(
  gender: "MALE" | "FEMALE" | "OTHER",
  field: {
    femaleRangeText: string | null;
    maleRangeText: string | null;
    normalText: string | null;
  },
) {
  if (gender === "FEMALE") {
    return (
      field.femaleRangeText ??
      field.normalText ??
      ""
    );
  }

  if (gender === "MALE") {
    return (
      field.maleRangeText ??
      field.normalText ??
      ""
    );
  }

  return field.normalText ?? "";
}

export async function getReportPdfData(
  receiptId: string,
): Promise<PdfReceiptData | null> {  const receipt = await prisma.receipt.findUnique({
    where: {
      id: receiptId,
    },
    include: {
      patient: {
        select: {
          mrNumber: true,
        },
      },

      patientTests: {
        where: {
          status: "COMPLETED",
        },
        orderBy: {
          createdAt: "asc",
        },
        include: {
          completedBy: {
            select: {
              fullName: true,
            },
          },

          test: {
            select: {
              testCode: true,
              testName: true,
              reportHeading: true,
              paragraph: true,
            },
          },

          results: {
            include: {
              field: {
                select: {
                  displayOrder: true,
                  femaleRangeText: true,
                  maleRangeText: true,
                  normalText: true,

                  section: {
                    select: {
                      sectionName: true,
                      displayOrder: true,
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  });

  if (!receipt) {
    return null;
  }

  let qrCodeDataUrl: string | null = null;

  try {
    qrCodeDataUrl = await QRCode.toDataURL(
      JSON.stringify({
        receiptId: receipt.id,
        receiptNumber:
          receipt.receiptNumber.toString(),
        patientName:
          receipt.patientNameSnapshot,
      }),
      {
        width: 180,
        margin: 0,
        errorCorrectionLevel: "M",
      },
    );
  } catch (error) {
    console.error(
      "Report QR generation error:",
      error,
    );
  }  return {
    receiptId: receipt.id,

    receiptNumber:
      receipt.receiptNumber.toString(),

    mrNumber:
      receipt.patient.mrNumber.toString(),

    patientName:
      receipt.patientNameSnapshot,

    fatherOrHusband:
      receipt.fatherOrHusbandSnapshot ?? "N/A",

    ageAndGender: `${formatAge(
      receipt.ageValue,
      receipt.ageUnit,
    )} / ${formatGender(
      receipt.genderSnapshot,
    )}`,

    phone:
      receipt.phoneSnapshot ?? "N/A",

    cnic:
      receipt.cnicSnapshot ?? "N/A",

    address:
      receipt.addressSnapshot ?? "N/A",

    specimen:
      receipt.specimen ??
      (
        receipt.specimenSource ===
        "TAKEN_IN_LAB"
          ? "Taken in Lab"
          : "Received from Outside"
      ),

    consultant:
      receipt.doctorNameSnapshot ?? "SELF",

    registrationDate:
      formatDateTime(
        receipt.collectionDate,
      ),

    registrationLocation:
      "OPP. NADRA OFFICE STADIUM ROAD DASKA, SIALKOT",

    qrCodeDataUrl,

    tests: receipt.patientTests.map(
      (patientTest) => {        const results: PdfResultRow[] = [
          ...patientTest.results,
        ]
          .sort((a, b) => {
            const sectionA =
              a.field.section?.displayOrder ?? 0;

            const sectionB =
              b.field.section?.displayOrder ?? 0;

            if (sectionA !== sectionB) {
              return sectionA - sectionB;
            }

            return (
              a.field.displayOrder -
              b.field.displayOrder
            );
          })
          .map((result) => ({
            id: result.id,

            fieldName:
              result.fieldNameSnapshot,

            sectionName:
              result.sectionNameSnapshot ??
              result.field.section?.sectionName ??
              null,

            resultValue:
              result.resultValue ?? "",

            referenceRange:
              result.referenceRangeSnapshot ??
              fallbackReferenceRange(
                receipt.genderSnapshot,
                result.field,
              ),

            unit:
              result.unitSnapshot ?? "",

            abnormalFlag:
              result.abnormalFlag,
          }));

        return {
          id:
            patientTest.id,

          testCode:
            patientTest.test.testCode,

          testName:
            patientTest.test.testName,

          reportHeading:
            patientTest.test.reportHeading ??
            patientTest.test.testName,

          interpretation:
            patientTest.test.paragraph,

          remarks:
            patientTest.remarks,

          reportingTime:
            formatDateTime(
              patientTest.completedAt,
            ),

          verifiedBy:
            patientTest.completedBy?.fullName ??
            null,

          results,
        };
      },
    ),
  };
}