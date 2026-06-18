export function firstErrorMessage(error: unknown): string | undefined {
    if (typeof error === "string") return error;
    if (Array.isArray(error) && error.length > 0) return String(error[0]);
    return undefined;
}

export function fieldError(
    errors: Record<string, unknown> | undefined,
    name: string,
): string | undefined {
    if (!errors) return undefined;
    return firstErrorMessage(errors[name]);
}
