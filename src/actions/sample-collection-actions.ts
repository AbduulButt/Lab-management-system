"use server";

import {
  AgeUnit,
  Gender,
  Prisma,
  ReceiptStatus,
  ReferenceType,
  SpecimenSource,
} from "@/generated/prisma/client";

import { requireAuthenticatedUser } from "@/lib/auth/authorization";
import { prisma } from "@/lib/prisma";
import { sampleCollectionSchema } from "@/lib/validation/sample-collection-schema";

export type SampleCollectionActionState = {
  success: boolean;
  message: string;
  receiptId?: string;
  submitMode?: "save" | "save-print";
  fieldErrors?: Record<string, string[] | undefined>;
};

function text(value: FormDataEntryValue | null) {
  if (typeof value !== "string") {
    return undefined;
  }

  return value.trim() || undefined;
}

function selectedTests(value: FormDataEntryValue | null) {
  if (typeof value !== "string") {
    return [];
  }

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function createSampleCollectionAction(
  _previousState: SampleCollectionActionState,
  formData: FormData,
): Promise<SampleCollectionActionState> {
  try {
    const user = await requireAuthenticatedUser();

    const parsed = sampleCollectionSchema.safeParse({
      patientName: formData.get("patientName"),
      gender: formData.get("gender"),
      ageValue: formData.get("ageValue"),
      ageUnit: formData.get("ageUnit"),
      phone: text(formData.get("phone")),
      cnic: text(formData.get("cnic")),
      fatherOrHusbandName: text(
        formData.get("fatherOrHusbandName"),
      ),
      address: text(formData.get("address")),
      referenceType: formData.get("referenceType"),
      doctorId: text(formData.get("doctorId")),
      companyName: text(formData.get("companyName")),
      specimen: text(formData.get("specimen")),
      specimenSource: formData.get("specimenSource"),
      collectionDate: formData.get("collectionDate"),
      collectionTime: formData.get("collectionTime"),
      discountPercent: formData.get("discountPercent"),
      additionalLess: formData.get("additionalLess"),
      paidAmount: formData.get("paidAmount"),
      selectedTests: selectedTests(
        formData.get("selectedTests"),
      ),
      submitMode: formData.get("submitMode"),
    });

    if (!parsed.success) {
      return {
        success: false,
        message: "Please correct the sample collection form.",
        fieldErrors: parsed.error.flatten().fieldErrors,
      };
    }

    const data = parsed.data;

    const ids = [
      ...new Set(
        data.selectedTests.map((item) => item.testId),
      ),
    ];

    const tests = await prisma.test.findMany({
      where: {
        id: {
          in: ids,
        },
        status: "ACTIVE",
      },
      select: {
        id: true,
        testCode: true,
        testName: true,
        price: true,
        sampleRequired: true,
      },
    });

    if (tests.length !== ids.length) {
      return {
        success: false,
        message: "One or more tests are invalid.",
      };
    }

    const doctor = data.doctorId
      ? await prisma.doctor.findUnique({
        where: {
          id: data.doctorId,
        },
        select: {
          id: true,
          doctorName: true,
        },
      })
      : null;

    if (
      data.referenceType === "DOCTOR" &&
      !doctor
    ) {
      return {
        success: false,
        message: "Select a valid doctor.",
      };
    }

    const subtotal = tests.reduce(
      (sum, test) => sum.add(test.price),
      new Prisma.Decimal(0),
    );

    const discountPercent = new Prisma.Decimal(
      data.discountPercent,
    );

    const discountAmount = subtotal
      .mul(discountPercent)
      .div(100);

    const additionalLess = new Prisma.Decimal(
      data.additionalLess,
    );

    const totalDiscount =
      discountAmount.add(additionalLess);

    const netAmount = Prisma.Decimal.max(
      subtotal.sub(totalDiscount),
      new Prisma.Decimal(0),
    );

    const paidAmount = new Prisma.Decimal(
      data.paidAmount,
    );

    if (paidAmount.greaterThan(netAmount)) {
      return {
        success: false,
        message:
          "Paid amount cannot exceed net amount.",
      };
    }

    const dueAmount = netAmount.sub(paidAmount);

    const collectionDate = new Date(
      `${data.collectionDate}T${data.collectionTime}:00`,
    );

    if (Number.isNaN(collectionDate.getTime())) {
      return {
        success: false,
        message: "Collection date or time is invalid.",
      };
    }

    const receipt = await prisma.$transaction(
      async (transaction) => {
        const patient =
          await transaction.patient.create({
            data: {
              fullName: data.patientName,
              fatherOrHusbandName:
                data.fatherOrHusbandName ?? null,
              gender: data.gender as Gender,
              phone: data.phone ?? null,
              cnic: data.cnic ?? null,
              address: data.address ?? null,
            },
          });

        const createdReceipt =
          await transaction.receipt.create({
            data: {
              patientId: patient.id,
              doctorId: doctor?.id ?? null,

              patientNameSnapshot: data.patientName,
              genderSnapshot:
                data.gender as Gender,
              ageValue: data.ageValue,
              ageUnit: data.ageUnit as AgeUnit,
              phoneSnapshot: data.phone ?? null,
              cnicSnapshot: data.cnic ?? null,
              addressSnapshot:
                data.address ?? null,
              fatherOrHusbandSnapshot:
                data.fatherOrHusbandName ?? null,

              referenceType:
                data.referenceType as ReferenceType,
              doctorNameSnapshot:
                doctor?.doctorName ?? null,
              companyNameSnapshot:
                data.companyName ?? null,

              specimen: data.specimen ?? null,
              specimenSource:
                data.specimenSource as SpecimenSource,
              collectionDate,

              subtotal,
              discountPercent,
              discountAmount,
              additionalLess,
              totalDiscount,
              netAmount,
              paidAmount,
              dueAmount,

              reportStatus:
                ReceiptStatus.PENDING,
              collectedById: user.id,
            },
          });

        await transaction.patientTest.createMany({
          data: tests.map((test) => ({
            receiptId: createdReceipt.id,
            testId: test.id,
            testCodeSnapshot: test.testCode,
            testNameSnapshot: test.testName,
            testPriceSnapshot: test.price,
            sampleRequiredSnapshot:
              test.sampleRequired,
            status: "PENDING",
          })),
        });

        return createdReceipt;
      },
    );

    return {
      success: true,
      message:
        "Sample collection saved successfully.",
      receiptId: receipt.id,
      submitMode: data.submitMode,
    };
  } catch (error) {
    console.error(
      "Create sample collection error:",
      error,
    );

    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Unable to save receipt.",
    };
  }
}