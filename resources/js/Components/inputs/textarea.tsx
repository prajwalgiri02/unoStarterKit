import { fieldError } from "@/Components/inputs/first-error-message";
import { useFormContext } from "@inertiajs/react";
import { useId, type ChangeEvent, type ComponentProps, type ReactNode } from "react";

type TextareaProps = ComponentProps<"textarea"> & {
    label?: ReactNode;
    helperText?: ReactNode;
    error?: string;
};

export default function Textarea({
    label,
    helperText,
    error,
    className = "",
    id,
    name,
    rows = 5,
    disabled,
    onChange,
    ...rest
}: TextareaProps) {
    const generatedId = useId();
    const inputId = id ?? generatedId;
    const helperId = `${inputId}-helper`;
    const form = useFormContext();

    const errorMessage =
        error ||
        (form && name ? fieldError(form.errors as Record<string, unknown>, name) : undefined);
    const helper = errorMessage || helperText;

    const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
        onChange?.(e);
        if (form && name) form.clearErrors(name);
    };

    const stateClasses = disabled
        ? "cursor-not-allowed bg-neutral-50 text-neutral-400"
        : errorMessage
          ? "border-error-500 bg-error-50"
          : "border-neutral-200 bg-base-white hover:not-focus:bg-neutral-25 focus:border-primary-500 focus:bg-primary-50";

    return (
        <div className={`group flex w-full flex-col gap-2 ${className}`.trim()}>
            {label && (
                <label htmlFor={inputId} className="text-link-sm text-neutral-600">
                    {label}
                </label>
            )}
            <textarea
                id={inputId}
                name={name}
                rows={rows}
                disabled={disabled}
                onChange={handleChange}
                aria-invalid={errorMessage ? true : undefined}
                aria-describedby={helper ? helperId : undefined}
                className={`w-full resize-y rounded-[20px] border-[1.5px] px-4 py-3 text-body-xs text-neutral-900 outline-none transition-colors placeholder:text-neutral-500 ${stateClasses}`}
                {...rest}
            />
            {helper && (
                <p
                    id={helperId}
                    className={`text-link-sm font-normal ${errorMessage ? "text-error-500" : "text-neutral-600 group-focus-within:text-primary-500"}`}
                >
                    {helper}
                </p>
            )}
        </div>
    );
}
