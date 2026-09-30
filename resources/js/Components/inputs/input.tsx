import { EyeIcon, EyeSlashIcon } from "@/Components/icons";
import Field, {
    fieldClasses,
    fieldControlClasses,
    fieldSizes,
    useFieldError,
    type FieldSize,
    type FieldStatus,
    type FieldVariant,
} from "@/Components/inputs/field";
import { useId, useState, type ChangeEvent, type ComponentProps, type ReactNode } from "react";

type InputProps = Omit<ComponentProps<"input">, "size"> & {
    label?: ReactNode;
    helperText?: ReactNode;
    error?: string;
    status?: FieldStatus;
    variant?: FieldVariant;
    size?: FieldSize;
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
    const { errorMessage, clearError } = useFieldError(name, error);

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        onChange?.(e);
        clearError();
    };

    const isPassword = type === "password";
    const inputType = isPassword && passwordVisible ? "text" : type;

    const resolvedStatus: FieldStatus = errorMessage ? "error" : status;
    const helper = errorMessage || helperText;
    const styles = fieldClasses({ status: resolvedStatus, variant, disabled });
    const sizes = fieldSizes[size];
    const iconClassName = `flex shrink-0 items-center justify-center [&>svg]:size-full ${sizes.icon}`;

    return (
        <Field
            label={label}
            labelFor={inputId}
            helper={helper}
            helperId={helperId}
            helperClassName={styles.helper}
            className={className}
        >
            <div className={`flex w-full items-center ${sizes.box} ${styles.box}`}>
                {startIcon && <span className={iconClassName}>{startIcon}</span>}

                <input
                    id={inputId}
                    name={name}
                    type={inputType}
                    disabled={disabled}
                    onChange={handleChange}
                    aria-invalid={resolvedStatus === "error" || undefined}
                    aria-describedby={helper ? helperId : undefined}
                    className={`h-full min-w-0 flex-1 autofill-none ${fieldControlClasses}`}
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
        </Field>
    );
}
