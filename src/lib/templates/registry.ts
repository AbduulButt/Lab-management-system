import { PREDEFINED_TEMPLATES } from "./templates";
import type { TestTemplate } from "./types";

function normalize(value: string): string {
    return value
        .trim()
        .toUpperCase()
        .replace(/[^A-Z0-9]+/g, " ")
        .replace(/\s+/g, " ")
        .trim();
}

export function findPredefinedTemplate(
    testCode: string,
    testName?: string | null,
): TestTemplate | null {
    const values = [testCode, testName ?? ""].map(normalize).filter(Boolean);

    return (
        PREDEFINED_TEMPLATES.find((template) => {
            const aliases = [template.key, ...template.aliases].map(normalize);
            return values.some((value) =>
                aliases.some(
                    (alias) =>
                        value === alias ||
                        value.includes(alias) ||
                        alias.includes(value),
                ),
            );
        }) ?? null
    );
}