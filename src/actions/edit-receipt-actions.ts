"use server";

import {
    AgeUnit,
    Gender,
    PatientTestStatus,
    Prisma,
    ReceiptStatus,
    ReferenceType,
    SpecimenSource,
} from "@/generated/prisma/client";

import type { SampleCollectionActionState } from "@/actions/sample-collection-actions";
import { requireAdmin } from "@/lib/auth/authorization";
import { prisma } from "@/lib/prisma";
import { sampleCollectionSchema } from "@/lib/validation/sample-collection-schema";

function text(value: FormDataEntryValue | null) {
    if (typeof value !== "string") return undefined;
    return value.trim() || undefined;
}

function selectedTests(value: FormDataEntryValue | null) {
    if (typeof value !== "string") return [];

    try {
        const parsed = JSON.parse(value);
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
}

export async function updateReceiptAction(
    receiptId: string,
    _previousState: SampleCollectionActionState,
    formData: FormData,
): Promise<SampleCollectionActionState> {
    try {
        const user = await requireAdmin();

        const parsed = sampleCollectionSchema.safeParse({
            patientName: formData.get("patientName"),
            gender: formData.get("gender"),
            ageValue: formData.get("ageValue"),
            ageUnit: formData.get("ageUnit"),
            phone: text(formData.get("phone")),
            cnic: text(formData.get("cnic")),
            fatherOrHusbandName: text(formData.get("fatherOrHusbandName")),
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
            selectedTests: selectedTests(formData.get("selectedTests")),
            submitMode: formData.get("submitMode"),
        });

        if (!parsed.success) {
            return {
                success: false,
                message: "Please correct the receipt information.",
                fieldErrors: parsed.error.flatten().fieldErrors,
            };
        }

        const data = parsed.data;

        const receipt = await prisma.receipt.findUnique({
            where: { id: receiptId },
            include: {
                patientTests: {
                    include: {
                        _count: {
                            select: { results: true },
                        },
                    },
                },
            },
        });

        if (!receipt) {
            return { success: false, message: "Receipt not found." };
        }

        const selectedTestIds = [
            ...new Set(data.selectedTests.map((item) => item.testId)),
        ];

        const selectedTestRecords = await prisma.test.findMany({
            where: {
                id: { in: selectedTestIds },
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

        if (selectedTestRecords.length !== selectedTestIds.length) {
            return {
                success: false,
                message: "One or more selected tests are invalid or inactive.",
            };
        }

        const doctor = data.doctorId
            ? await prisma.doctor.findUnique({
                where: { id: data.doctorId },
                select: { id: true, doctorName: true },
            })
            : null;

        if (data.referenceType === "DOCTOR" && !doctor) {
            return { success: false, message: "Select a valid doctor." };
        }

        const currentTestIds = new Set(
            receipt.patientTests.map((item) => item.testId),
        );

        const removedTests = receipt.patientTests.filter(
            (item) => !selectedTestIds.includes(item.testId),
        );

        const blockedRemoval = removedTests.find(
            (item) =>
                item._count.results > 0 ||
                item.status === PatientTestStatus.COMPLETED,
        );

        if (blockedRemoval) {
            return {
                success: false,
                message: "A test with saved results cannot be removed from the receipt.",
            };
        }

        const testsToAdd = selectedTestRecords.filter(
            (test) => !currentTestIds.has(test.id),
        );

        const subtotal = selectedTestRecords.reduce(
            (sum, test) => sum.add(test.price),
            new Prisma.Decimal(0),
        );

        const discountPercent = new Prisma.Decimal(data.discountPercent);
        const discountAmount = subtotal.mul(discountPercent).div(100);
        const additionalLess = new Prisma.Decimal(data.additionalLess);
        const totalDiscount = discountAmount.add(additionalLess);
        const netAmount = Prisma.Decimal.max(
            subtotal.sub(totalDiscount),
            new Prisma.Decimal(0),
        );
        const paidAmount = new Prisma.Decimal(data.paidAmount);

        if (paidAmount.greaterThan(netAmount)) {
            return {
                success: false,
                message: "Paid amount cannot exceed net amount.",
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

        await prisma.$transaction(async (transaction) => {
            await transaction.patient.update({
                where: { id: receipt.patientId },
                data: {
                    fullName: data.patientName,
                    fatherOrHusbandName: data.fatherOrHusbandName ?? null,
                    gender: data.gender as Gender,
                    phone: data.phone ?? null,
                    cnic: data.cnic ?? null,
                    address: data.address ?? null,
                },
            });

            if (removedTests.length > 0) {
                await transaction.patientTest.deleteMany({
                    where: {
                        id: { in: removedTests.map((item) => item.id) },
                    },
                });
            }

            if (testsToAdd.length > 0) {
                await transaction.patientTest.createMany({
                    data: testsToAdd.map((test) => ({
                        receiptId,
                        testId: test.id,
                        testCodeSnapshot: test.testCode,
                        testNameSnapshot: test.testName,
                        testPriceSnapshot: test.price,
                        sampleRequiredSnapshot: test.sampleRequired,
                        status: PatientTestStatus.PENDING,
                    })),
                });
            }

            const remainingIncompleteCount =
                await transaction.patientTest.count({
                    where: {
                        receiptId,
                        status: { not: PatientTestStatus.COMPLETED },
                    },
                });

            const reportStatus =
                testsToAdd.length > 0 || remainingIncompleteCount > 0
                    ? ReceiptStatus.PENDING
                    : ReceiptStatus.COMPLETED;

            await transaction.receipt.update({
                where: { id: receiptId },
                data: {
                    doctorId: doctor?.id ?? null,
                    patientNameSnapshot: data.patientName,
                    genderSnapshot: data.gender as Gender,
                    ageValue: data.ageValue,
                    ageUnit: data.ageUnit as AgeUnit,
                    phoneSnapshot: data.phone ?? null,
                    cnicSnapshot: data.cnic ?? null,
                    addressSnapshot: data.address ?? null,
                    fatherOrHusbandSnapshot: data.fatherOrHusbandName ?? null,
                    referenceType: data.referenceType as ReferenceType,
                    doctorNameSnapshot: doctor?.doctorName ?? null,
                    companyNameSnapshot: data.companyName ?? null,
                    specimen: data.specimen ?? null,
                    specimenSource: data.specimenSource as SpecimenSource,
                    collectionDate,
                    subtotal,
                    discountPercent,
                    discountAmount,
                    additionalLess,
                    totalDiscount,
                    netAmount,
                    paidAmount,
                    dueAmount,
                    reportStatus,
                },
            });

            await transaction.auditLog.create({
                data: {
                    userId: user.id,
                    action: "UPDATE",
                    entityType: "RECEIPT",
                    entityId: receiptId,
                    description: `Updated receipt ${receipt.receiptNumber.toString()} for ${data.patientName}.`,
                },
            });
        });

        return {
            success: true,
            message: "Receipt updated successfully.",
            receiptId,
            submitMode: data.submitMode,
        };
    } catch (error) {
        console.error("Update receipt error:", error);

        return {
            success: false,
            message:
                error instanceof Error
                    ? error.message
                    : "Unable to update receipt.",
        };
    }
}