import { fieldError } from "@/Components/inputs/first-error-message";
import { useFormContext } from "@inertiajs/react";
import { EyeIcon, EyeSlashIcon } from "@/Components/icons";
import {
    useId,
    useState,
    type ChangeEvent,
    type ComponentProps,
    type ReactNode,
} from "react";

type InputStatus = "default" | "success" | "info" | "warning" | "error";

type StatusStyle = {
    field: string;
    filled: string;
    helper: string;
};

const sizeClasses = {
    large: { field: "h-12 gap-3 rounded-[20px] px-4", icon: "size-6" },
    medium: { field: "h-10 gap-3 rounded-full px-3", icon: "size-6" },
    small: { field: "h-8 gap-3 rounded-full px-3", icon: "size-4" },
} as const;

const statusClasses: Record<InputStatus, StatusStyle> = {
    default: {
        field: "border-neutral-200 text-neutral-400 hover:not-focus-within:text-neutral-500 focus-within:border-primary-500 focus-within:text-primary-500",
        filled: "bg-base-white hover:not-focus-within:bg-neutral-25 focus-within:bg-primary-50",
        helper: "text-neutral-600 group-focus-within:text-primary-500",
    },
    success: {
        field: "border-success-500 text-success-500",
        filled: "bg-success-50",
        helper: "text-success-500",
    },
    info: {
        field: "border-info-500 text-info-500",
        filled: "bg-info-50",
        helper: "text-info-500",
    },
    warning: {
        field: "border-warning-500 text-warning-500",
        filled: "bg-warning-50",
        helper: "text-warning-500",
    },
    error: {
        field: "border-error-500 text-error-500",
        filled: "bg-error-50",
        helper: "text-error-500",
    },
};

const disabledClasses: StatusStyle = {
    field: "cursor-not-allowed border-neutral-200 text-neutral-400",
    filled: "bg-neutral-50",
    helper: "text-neutral-600",
};

type InputProps = Omit<ComponentProps<"input">, "size"> & {
    label?: ReactNode;
    helperText?: ReactNode;
    error?: string;
    status?: InputStatus;
    variant?: "filled" | "outline";
    size?: keyof typeof sizeClasses;
    startIcon?: ReactNode;
    endIcon?: ReactNode;
};

export default function Input({
    label,
    helperText,
    error,
    status = "default",
    variant = "filled",
    size = "large",
    startIcon,
    endIcon,
    className = "",
    id,
    name,
    type = "text",
    disabled,
    onChange,
    ...rest
}: InputProps) {
    const generatedId = useId();
    const inputId = id ?? generatedId;
    const helperId = `${inputId}-helper`;
    const [passwordVisible, setPasswordVisible] = useState(false);
    const form = useFormContext();

    const errorMessage =
        error ||
        (form && name
            ? fieldError(form.errors as Record<string, unknown>, name)
            : undefined);

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        onChange?.(e);
        if (form && name) form.clearErrors(name);
    };

    const isPassword = type === "password";
    const inputType = isPassword && passwordVisible ? "text" : type;

    const resolvedStatus: InputStatus = errorMessage ? "error" : status;
    const helper = errorMessage || helperText;
    const styles = disabled ? disabledClasses : statusClasses[resolvedStatus];
    const sizes = sizeClasses[size];

    const fieldClassName = [
        "flex w-full items-center border-[1.5px] transition-colors",
        sizes.field,
        styles.field,
        variant === "filled" ? styles.filled : "bg-transparent",
    ].join(" ");

    const iconClassName = `flex shrink-0 items-center justify-center [&>svg]:size-full ${sizes.icon}`;

    return (
        <div className={`group flex w-full flex-col gap-2 ${className}`.trim()}>
            {label && (
                <label htmlFor={inputId} className="text-link-sm text-neutral-600">
                    {label}
                </label>
            )}

            <div className={fieldClassName}>
                {startIcon && <span className={iconClassName}>{startIcon}</span>}

                <input
                    id={inputId}
                    name={name}
                    type={inputType}
                    disabled={disabled}
                    onChange={handleChange}
                    aria-invalid={resolvedStatus === "error" || undefined}
                    aria-describedby={helper ? helperId : undefined}
                    className="h-full min-w-0 flex-1 bg-transparent text-body-xs text-neutral-900 outline-none placeholder:text-neutral-500 disabled:cursor-not-allowed disabled:text-neutral-400 disabled:placeholder:text-neutral-400"
                    {...rest}
                />

                {endIcon ? (
                    <span className={iconClassName}>{endIcon}</span>
                ) : (
                    isPassword && (
                        <span className={iconClassName}>
                            <button
                                type="button"
                                disabled={disabled}
                                onClick={() => setPasswordVisible((v) => !v)}
                                aria-label={passwordVisible ? "Hide password" : "Show password"}
                                aria-pressed={passwordVisible}
                                className="flex size-full cursor-pointer items-center justify-center rounded-full outline-none focus-visible:ring-2 focus-visible:ring-primary-200 disabled:cursor-not-allowed [&>svg]:size-full"
                            >
                                {passwordVisible ? <EyeSlashIcon /> : <EyeIcon />}
                            </button>
                        </span>
                    )
                )}
            </div>

            {helper && (
                <p id={helperId} className={`text-link-sm font-normal ${styles.helper}`}>
                    {helper}
                </p>
            )}
        </div>
    );
}
