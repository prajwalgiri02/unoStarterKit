export const EMAIL_PATTERN = /\S+@\S+\.\S+/;

export type StringFieldRules = {
    /** If true, message is default; if string, use as message */
    required?: boolean | string;
    minLength?: number | { value: number; message?: string };
    maxLength?: number | { value: number; message?: string };
};

export type CheckboxFieldRules = {
    required?: boolean | string;
};

function requiredMessage(flag: true | string, fallback: string): string {
    if (flag === true) return fallback;
    return flag;
}

function normalizeLengthRule(
    rule: number | { value: number; message?: string } | undefined,
): { value: number; message?: string } | undefined {
    if (rule === undefined) return undefined;
    if (typeof rule === "number") return { value: rule };
    return rule;
}

export function runStringFieldRules(
    value: string,
    rules: StringFieldRules | undefined,
): string | undefined {
    if (!rules) return undefined;

    const trimmed = value.trim();
    if (rules.required && trimmed.length === 0) {
        return requiredMessage(
            rules.required === true ? true : rules.required,
            "This field is required",
        );
    }

    const min = normalizeLengthRule(rules.minLength);
    if (min !== undefined && value.length < min.value) {
        return min.message ?? `Must be at least ${min.value} characters`;
    }

    const max = normalizeLengthRule(rules.maxLength);
    if (max !== undefined && value.length > max.value) {
        return max.message ?? `Must be at most ${max.value} characters`;
    }

    return undefined;
}

export function runEmailFieldRules(
    value: string,
    rules: StringFieldRules | undefined,
): string | undefined {
    const base = runStringFieldRules(value, rules);
    if (base) return base;

    const trimmed = value.trim();
    if (trimmed.length > 0 && !EMAIL_PATTERN.test(trimmed)) {
        return "Invalid email";
    }

    return undefined;
}

export function runCheckboxFieldRules(
    checked: boolean,
    rules: CheckboxFieldRules | undefined,
): string | undefined {
    if (!rules?.required) return undefined;
    if (checked) return undefined;
    return requiredMessage(
        rules.required === true ? true : rules.required,
        "This field is required",
    );
}
