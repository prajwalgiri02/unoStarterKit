import { fieldError } from "@/Components/inputs/first-error-message";
import { useFormContext } from "@inertiajs/react";
import type { ReactNode } from "react";

export type FieldStatus = "default" | "success" | "info" | "warning" | "error";
export type FieldVariant = "filled" | "outline";
export type FieldSize = "large" | "medium" | "small";

type StatusStyle = {
    box: string;
    filled: string;
    helper: string;
};

export const fieldSizes: Record<FieldSize, { box: string; icon: string }> = {
    large: { box: "h-12 gap-3 rounded-[20px] px-4", icon: "size-6" },
    medium: { box: "h-10 gap-3 rounded-full px-3", icon: "size-6" },
    small: { box: "h-8 gap-3 rounded-full px-3", icon: "size-4" },
};

const statusStyles: Record<FieldStatus, StatusStyle> = {
    default: {
        box: "border-neutral-200 text-neutral-400 hover:not-focus-within:text-neutral-500 focus-within:border-primary-500 focus-within:text-primary-500",
        filled: "bg-base-white hover:not-focus-within:bg-neutral-25 focus-within:bg-primary-50",
        helper: "text-neutral-600 group-focus-within:text-primary-500",
    },
    success: {
        box: "border-success-500 text-success-500",
        filled: "bg-success-50",
        helper: "text-success-500",
    },
    info: {
        box: "border-info-500 text-info-500",
        filled: "bg-info-50",
        helper: "text-info-500",
    },
    warning: {
        box: "border-warning-500 text-warning-500",
        filled: "bg-warning-50",
        helper: "text-warning-500",
    },
    error: {
        box: "border-error-500 text-error-500",
        filled: "bg-error-50",
        helper: "text-error-500",
    },
};

const disabledStyle: StatusStyle = {
    box: "cursor-not-allowed border-neutral-200 text-neutral-400",
    filled: "bg-neutral-50",
    helper: "text-neutral-600",
};

export const fieldControlClasses =
    "bg-transparent text-body-xs text-neutral-900 outline-none placeholder:text-neutral-500 disabled:cursor-not-allowed disabled:text-neutral-400 disabled:placeholder:text-neutral-400";

export function fieldClasses({
    status,
    variant,
    disabled,
}: {
    status: FieldStatus;
    variant: FieldVariant;
    disabled?: boolean;
}) {
    const style = disabled ? disabledStyle : statusStyles[status];

    return {
        box: `border-[1.5px] transition-colors ${style.box} ${variant === "filled" ? style.filled : "bg-transparent"}`,
        helper: style.helper,
    };
}

export function useFieldError(name: string | undefined, error: string | undefined) {
    const form = useFormContext();

    const errorMessage =
        error || (form && name ? fieldError(form.errors as Record<string, unknown>, name) : undefined);

    const clearError = () => {
        if (form && name) form.clearErrors(name);
    };

    return { errorMessage, clearError };
}

type FieldProps = {
    label?: ReactNode;
    labelFor?: string;
    labelId?: string;
    helper?: ReactNode;
    helperId: string;
    helperClassName: string;
    className?: string;
    children: ReactNode;
};

export default function Field({
    label,
    labelFor,
    labelId,
    helper,
    helperId,
    helperClassName,
    className = "",
    children,
}: FieldProps) {
    return (
        <div className={`group flex w-full flex-col gap-2 ${className}`.trim()}>
            {label &&
                (labelFor ? (
                    <label id={labelId} htmlFor={labelFor} className="text-link-sm text-neutral-600">
                        {label}
                    </label>
                ) : (
                    <span id={labelId} className="text-link-sm text-neutral-600">
                        {label}
                    </span>
                ))}
            {children}
            {helper && (
                <p id={helperId} className={`text-link-sm font-normal ${helperClassName}`}>
                    {helper}
                </p>
            )}
        </div>
    );
}
