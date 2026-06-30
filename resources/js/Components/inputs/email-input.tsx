import { fieldError } from "@/components/inputs/first-error-message";
import { useFormContext } from "@inertiajs/react";
import { useState } from "react";

export type FormInputProps = {
    id?: string;
    name?: string;
    label?: string;
    type?: React.HTMLInputTypeAttribute;
    placeholder?: string;
    className?: string;
    defaultValue?: string | number;
    value?: string | number;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    error?: string;
    skipBlurValidation?: boolean;
    autoComplete?: string;
    inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
    readOnly?: boolean;
    disabled?: boolean;
    // Password confirmation mode - renders a paired confirmation field
    confirmed?: boolean;
    confirmId?: string;
    confirmationName?: string;
    confirmLabel?: string;
    confirmPlaceholder?: string;
};

type FieldProps = {
    id: string;
    name: string;
    label: string;
    type: React.HTMLInputTypeAttribute;
    placeholder?: string;
    className: string;
    autoComplete?: string;
    inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
    readOnly: boolean;
    disabled: boolean;
    value?: string | number;
    defaultValue?: string | number;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    error?: string;
    skipBlurValidation: boolean;
    showToggle?: boolean;
    onToggleShow?: () => void;
    pairedWithName?: string;
    onBlurValidate?: () => void;
};

function InputField({
    id,
    name,
    label,
    type,
    placeholder,
    className,
    autoComplete,
    inputMode,
    readOnly,
    disabled,
    value,
    defaultValue: propDefaultValue,
    onChange,
    error: propError,
    skipBlurValidation,
    showToggle,
    onToggleShow,
    pairedWithName,
    onBlurValidate,
}: FieldProps) {
    const form = useFormContext<Record<string, unknown>>();
    const isPassword = type === "password";
    const inputType = isPassword ? (showToggle ? "text" : "password") : type;

    const msg =
        propError ||
        (form
            ? fieldError(form.errors as Record<string, unknown>, name)
            : undefined);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onChange?.(e);
        if (form) {
            if (pairedWithName) {
                form.clearErrors(name, pairedWithName);
            } else {
                form.clearErrors(name);
            }
        }
    };

    const handleBlur = () => {
        if (!skipBlurValidation && form) {
            if (onBlurValidate) {
                onBlurValidate();
            } else {
                void form.validate(name);
            }
        }
    };

    return (
        <div className="form-group login-form-group">
            <label className="form-label" htmlFor={id}>
                {label}
            </label>
            <div className={isPassword ? "relative input-wrap" : undefined}>
                <input
                    id={id}
                    name={name}
                    type={inputType}
                    defaultValue={
                        value !== undefined
                            ? undefined
                            : (propDefaultValue ?? "")
                    }
                    value={value}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder={placeholder}
                    autoComplete={autoComplete}
                    inputMode={inputMode}
                    className={`${className}${msg ? " has-error error" : ""}`}
                    readOnly={readOnly}
                    disabled={disabled}
                    aria-invalid={Boolean(msg)}
                    aria-describedby={msg ? `${id}-error` : undefined}
                />
                {isPassword && onToggleShow && (
                    <button
                        type="button"
                        className="input-icon-right"
                        onClick={onToggleShow}
                        aria-label={showToggle ? "Hide password" : "Show password"}
                    >
                        <img
                            className="eye-slash"
                            src="/icons/eye-slash.svg"
                            alt="hide password"
                            style={{ display: showToggle ? "none" : "block" }}
                        />
                        <img
                            className="eye-open"
                            src="/icons/eye-open.svg"
                            alt="show password"
                            style={{ display: showToggle ? "block" : "none" }}
                        />
                    </button>
                )}
            </div>
            {msg && (
                <p id={`${id}-error`} className="field-error">
                    {msg}
                </p>
            )}
        </div>
    );
}

export default function FormInput({
    id,
    name = "input",
    label,
    type = "text",
    placeholder,
    className = "form-control",
    defaultValue: propDefaultValue,
    value,
    onChange,
    error,
    skipBlurValidation = false,
    autoComplete,
    inputMode,
    readOnly = false,
    disabled = false,
    confirmed = false,
    confirmId,
    confirmationName = "password_confirmation",
    confirmLabel = "Confirm Password",
    confirmPlaceholder = "Repeat password",
}: FormInputProps) {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const form = useFormContext<Record<string, unknown>>();

    const isPassword = type === "password";
    const resolvedId = id ?? `input-${name}`;

    const resolvedAutoComplete =
        autoComplete ??
        (type === "email"
            ? "email"
            : isPassword
              ? confirmed
                  ? "new-password"
                  : "current-password"
              : undefined);

    const resolvedLabel =
        label ??
        (isPassword
            ? confirmed
                ? "Create Password"
                : "Password"
            : type === "email"
              ? "Email"
              : "");

    const [passwordValue, setPasswordValue] = useState(
        value !== undefined ? String(value) : String(propDefaultValue ?? ""),
    );
    const [confirmValue, setConfirmValue] = useState("");

    if (isPassword && confirmed) {
        const resolvedConfirmId = confirmId ?? `${resolvedId}-confirm`;

        const validatePair = () => {
            if (!form) return;
            void form.validate({ only: [name, confirmationName] });
        };

        return (
            <div className="flex flex-col gap-4">
                <InputField
                    id={resolvedId}
                    name={name}
                    label={resolvedLabel}
                    type="password"
                    placeholder={placeholder ?? "Enter new password"}
                    className={className}
                    autoComplete="new-password"
                    readOnly={readOnly}
                    disabled={disabled}
                    value={passwordValue}
                    onChange={(e) => {
                        setPasswordValue(e.target.value);
                        onChange?.(e);
                    }}
                    error={error}
                    skipBlurValidation
                    showToggle={showPassword}
                    onToggleShow={() => setShowPassword((p) => !p)}
                    pairedWithName={confirmationName}
                />
                <InputField
                    id={resolvedConfirmId}
                    name={confirmationName}
                    label={confirmLabel}
                    type="password"
                    placeholder={confirmPlaceholder}
                    className={className}
                    autoComplete="new-password"
                    readOnly={readOnly}
                    disabled={disabled}
                    value={confirmValue}
                    onChange={(e) => setConfirmValue(e.target.value)}
                    skipBlurValidation={skipBlurValidation}
                    showToggle={showConfirm}
                    onToggleShow={() => setShowConfirm((p) => !p)}
                    pairedWithName={name}
                    onBlurValidate={skipBlurValidation ? undefined : validatePair}
                />
            </div>
        );
    }

    return (
        <InputField
            id={resolvedId}
            name={name}
            label={resolvedLabel}
            type={type}
            placeholder={placeholder}
            className={className}
            autoComplete={resolvedAutoComplete}
            inputMode={inputMode}
            readOnly={readOnly}
            disabled={disabled}
            value={value}
            defaultValue={propDefaultValue}
            onChange={onChange}
            error={error}
            skipBlurValidation={skipBlurValidation}
            showToggle={isPassword ? showPassword : undefined}
            onToggleShow={
                isPassword ? () => setShowPassword((p) => !p) : undefined
            }
        />
    );
}
