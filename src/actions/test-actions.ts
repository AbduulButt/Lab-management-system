"use server";

import { Prisma, RecordStatus } from "@/generated/prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { attachPredefinedTemplateToTest } from "@/actions/predefined-template-actions";
import { requireAdmin } from "@/lib/auth/authorization";
import { prisma } from "@/lib/prisma";
import { testSchema } from "@/lib/validation/test-schema";

export type TestActionState = {
  success: boolean;
  message: string;
  fieldErrors?: Record<string, string[] | undefined>;
};

function optionalText(
  value: FormDataEntryValue | null,
): string | undefined {
  if (typeof value !== "string") {
    return undefined;
  }

  const cleanedValue = value.trim();

  return cleanedValue || undefined;
}

export async function createTestAction(
  _previousState: TestActionState,
  formData: FormData,
): Promise<TestActionState> {
  try {
    const admin = await requireAdmin();

    const parsedResult = testSchema.safeParse({
      testCode: formData.get("testCode"),
      testName: formData.get("testName"),
      shortName: optionalText(formData.get("shortName")),
      sampleRequired: optionalText(formData.get("sampleRequired")),
      reportingTime: optionalText(formData.get("reportingTime")),
      reportHeading: optionalText(formData.get("reportHeading")),
      description: optionalText(formData.get("description")),
      paragraph: optionalText(formData.get("paragraph")),
      price: formData.get("price"),
    });

    if (!parsedResult.success) {
      return {
        success: false,
        message: "Please correct the form information.",
        fieldErrors: parsedResult.error.flatten().fieldErrors,
      };
    }

    const data = parsedResult.data;

    const createdTest = await prisma.$transaction(
      async (transaction) => {
        const test = await transaction.test.create({
          data: {
            testCode: data.testCode.toUpperCase(),
            testName: data.testName,
            shortName: data.shortName || null,
            sampleRequired: data.sampleRequired || null,
            reportingTime: data.reportingTime || null,
            reportHeading: data.reportHeading || null,
            description: data.description || null,
            paragraph: data.paragraph || null,
            price: new Prisma.Decimal(data.price),
            status: RecordStatus.ACTIVE,
            createdById: admin.id,
          },
        });

        await transaction.auditLog.create({
          data: {
            userId: admin.id,
            action: "CREATE",
            entityType: "TEST",
            entityId: test.id,
            description: `Created laboratory test ${test.testName}.`,
          },
        });

        return test;
      },
    );

    /*
     * After the test is created, automatically look for a matching
     * predefined template using its code and name.
     *
     * Examples:
     * CBC      -> CBC template
     * TSH      -> TSH template
     * ANTI HCV -> Anti-HCV template
     *
     * If no predefined template matches, the test is still created
     * normally and can use the manual template builder.
     */
    const templateResult =
      await attachPredefinedTemplateToTest(createdTest.id);

    if (templateResult.attached) {
      revalidatePath(
        `/portal/tests/${createdTest.id}/template`,
      );
    }
  } catch (error) {
    console.error("Create test error:", error);

    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return {
        success: false,
        message: "A test with this code already exists.",
      };
    }

    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Unable to create the test.",
    };
  }

  revalidatePath("/portal/tests");
  redirect("/portal/tests");
}

export async function updateTestAction(
  testId: string,
  _previousState: TestActionState,
  formData: FormData,
): Promise<TestActionState> {
  try {
    const admin = await requireAdmin();

    if (!testId) {
      return {
        success: false,
        message: "Test ID is missing.",
      };
    }

    const existingTest = await prisma.test.findUnique({
      where: {
        id: testId,
      },
    });

    if (!existingTest) {
      return {
        success: false,
        message: "Test not found.",
      };
    }

    const parsedResult = testSchema.safeParse({
      testCode: formData.get("testCode"),
      testName: formData.get("testName"),
      shortName: optionalText(formData.get("shortName")),
      sampleRequired: optionalText(formData.get("sampleRequired")),
      reportingTime: optionalText(formData.get("reportingTime")),
      reportHeading: optionalText(formData.get("reportHeading")),
      description: optionalText(formData.get("description")),
      paragraph: optionalText(formData.get("paragraph")),
      price: formData.get("price"),
    });

    if (!parsedResult.success) {
      return {
        success: false,
        message: "Please correct the form information.",
        fieldErrors: parsedResult.error.flatten().fieldErrors,
      };
    }

    const data = parsedResult.data;

    const updatedTest = await prisma.$transaction(
      async (transaction) => {
        const test = await transaction.test.update({
          where: {
            id: testId,
          },
          data: {
            testCode: data.testCode.toUpperCase(),
            testName: data.testName,
            shortName: data.shortName || null,
            sampleRequired: data.sampleRequired || null,
            reportingTime: data.reportingTime || null,
            reportHeading: data.reportHeading || null,
            description: data.description || null,
            paragraph: data.paragraph || null,
            price: new Prisma.Decimal(data.price),
          },
        });

        await transaction.auditLog.create({
          data: {
            userId: admin.id,
            action: "UPDATE",
            entityType: "TEST",
            entityId: test.id,
            description: `Updated laboratory test ${test.testName}.`,
            oldValues: {
              testCode: existingTest.testCode,
              testName: existingTest.testName,
              price: existingTest.price.toString(),
              paragraph: existingTest.paragraph,
            },
            newValues: {
              testCode: test.testCode,
              testName: test.testName,
              price: test.price.toString(),
              paragraph: test.paragraph,
            },
          },
        });

        return test;
      },
    );

    /*
     * This also handles a test that was first created as a custom test
     * and later renamed to a known predefined test code.
     *
     * Existing matching sections and fields are skipped by the loader,
     * so it does not create duplicates.
     */
    const templateResult =
      await attachPredefinedTemplateToTest(updatedTest.id);

    if (templateResult.attached) {
      revalidatePath(
        `/portal/tests/${updatedTest.id}/template`,
      );
    }
  } catch (error) {
    console.error("Update test error:", error);

    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return {
        success: false,
        message: "Another test already uses this test code.",
      };
    }

    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Unable to update the test.",
    };
  }

  revalidatePath("/portal/tests");
  revalidatePath(`/portal/tests/${testId}/edit`);

  redirect("/portal/tests");
}