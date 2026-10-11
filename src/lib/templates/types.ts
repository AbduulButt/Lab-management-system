export type InputType = "NUMBER" | "TEXT" | "SELECT" | "POSITIVE_NEGATIVE";

export type TemplateField = {
    fieldCode: string;
    fieldName: string;
    inputType: InputType;
    femaleRangeText?: string;
    maleRangeText?: string;
    unit?: string;
    options?: string[];
    displayOrder: number;
};

export type TemplateSection = {
    sectionName: string;
    displayOrder: number;
    fields: TemplateField[];
};

export type TestTemplate = {
    key: string;
    aliases: string[];
    title: string;
    sections: TemplateSection[];
};