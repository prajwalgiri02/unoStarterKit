import { fieldError } from "@/components/inputs/first-error-message";
import { useFormContext } from "@inertiajs/react";
import { useState } from "react";

type InertiaForm = ReturnType<typeof useFormContext<Record<string, unknown>>>;

type PasswordFieldRowProps = {
    form: InertiaForm;
    id: string;
    name: string;
    label: string;
    placeholder: string;
    autoComplete: string;
    className: string;
    show: boolean;
    onToggleShow: () => void;
    /** When true, do not run Precognition validate on blur (e.g. password before confirmation is filled). */
    skipBlurValidation?: boolean;
    /** If set, called on blur instead of validate(name) (e.g. validate password + confirmation together). */
    onBlurValidate?: () => void;
    /** When set, onChange clears errors for both this field and the paired field (password + confirmation). */
    pairedWithName?: string;
    value?: string;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    error?: string;
};

function PasswordFieldRow({
    form,
    id,
    name,
    label,
    placeholder,
    autoComplete,
    className,
    show,
    onToggleShow,
    skipBlurValidation = false,
    onBlurValidate,
    pairedWithName,
    value,
    onChange,
    error: propError,
}: PasswordFieldRowProps) {
    const msg =
        propError ||
        (form
            ? fieldError(form.errors as Record<string, unknown>, name)
            : undefined);

    const handleBlur = () => {
        if (!form || skipBlurValidation) {
            return;
        }
        if (onBlurValidate) {
            onBlurValidate();
            return;
        }
        void form.validate(name);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onChange?.(e);
        if (!form) {
            return;
        }
        if (pairedWithName) {
            form.clearErrors(name, pairedWithName);
        } else {
            form.clearErrors(name);
        }
    };

    return (
        <div className="flex flex-col gap-2">
            <label className="caption-md text-neutral-700" htmlFor={id}>
                {label}
            </label>
            <div className="relative">
                <input
                    id={id}
                    name={name}
                    type={show ? "text" : "password"}
                    defaultValue={value !== undefined ? undefined : ""}
                    value={value}
                    placeholder={placeholder}
                    autoComplete={autoComplete}
                    className={`${className}${msg ? " error" : ""}`}
                    onBlur={handleBlur}
                    onChange={handleChange}
                    aria-invalid={Boolean(msg)}
                    aria-describedby={msg ? `${id}-error` : undefined}
                />
                <button
                    type="button"
                    className="eye-button"
                    onClick={onToggleShow}
                    aria-label={show ? "Hide password" : "Show password"}
                >
                    <img
                        className="eye-slash"
                        src="/icons/eye-slash.svg"
                        alt="hide password"
                        style={{ display: show ? "none" : "block" }}
                    />
                    <img
                        className="eye-open"
                        src="/icons/eye-open.svg"
                        alt="show password"
                        style={{ display: show ? "block" : "none" }}
                    />
                </button>
            </div>
            {msg ? (
                <p
                    id={`${id}-error`}
                    className="caption-md text-red-500 mt-1 mb-0"
                >
                    {msg}
                </p>
            ) : null}
        </div>
    );
}

type PasswordInputProps = {
    id?: string;
    name?: string;
    label?: string;
    placeholder?: string;
    className?: string;
    /** When true, renders a second field for `password_confirmation` (Laravel convention). */
    confirmed?: boolean;
    confirmId?: string;
    confirmationName?: string;
    confirmLabel?: string;
    confirmPlaceholder?: string;
    value?: string;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    error?: string;
    skipBlurValidation?: boolean;
};

/**
 * Must be rendered inside Inertia `<Form>`. Validation rules come from the server (Precognition).
 */
export default function PasswordInput({
    id = "inputpassword",
    name = "password",
    label,
    placeholder,
    className = "input-giant body-xs password-input",
    confirmed = false,
    confirmId,
    confirmationName = "password_confirmation",
    confirmLabel = "Confirm Password",
    confirmPlaceholder = "Repeat password",
    value,
    onChange,
    error,
    skipBlurValidation = false,
}: PasswordInputProps) {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const form = useFormContext<Record<string, unknown>>();

    const primaryLabel = label ?? (confirmed ? "Create Password" : "Password");
    const primaryPlaceholder =
        placeholder ?? (confirmed ? "Enter new password" : "Enter password");
    const primaryAutoComplete = confirmed ? "new-password" : "current-password";

    const resolvedConfirmId = confirmId ?? `${id}-confirm`;

    if (!confirmed) {
        return (
            <PasswordFieldRow
                form={form}
                id={id}
                name={name}
                label={primaryLabel}
                placeholder={primaryPlaceholder}
                autoComplete={primaryAutoComplete}
                className={className}
                show={showPassword}
                onToggleShow={() => setShowPassword((prev) => !prev)}
                skipBlurValidation={skipBlurValidation}
                value={value}
                onChange={onChange}
                error={error}
            />
        );
    }

    const validatePasswordPair = () => {
        if (!form) {
            return;
        }
        void form.validate({
            only: [name, confirmationName],
        });
    };

    return (
        <div className="flex flex-col gap-4">
            <PasswordFieldRow
                form={form}
                id={id}
                name={name}
                label={primaryLabel}
                placeholder={primaryPlaceholder}
                autoComplete={primaryAutoComplete}
                className={className}
                show={showPassword}
                onToggleShow={() => setShowPassword((prev) => !prev)}
                skipBlurValidation
                pairedWithName={confirmationName}
                value={value}
                onChange={onChange}
                error={error}
            />
            <PasswordFieldRow
                form={form}
                id={resolvedConfirmId}
                name={confirmationName}
                label={confirmLabel}
                placeholder={confirmPlaceholder}
                autoComplete="new-password"
                className={className}
                show={showConfirm}
                onToggleShow={() => setShowConfirm((prev) => !prev)}
                onBlurValidate={validatePasswordPair}
                pairedWithName={name}
                // Confirmation field usually doesn't have direct value/onChange in this setup
                // but we could pass them if needed. For now, name is enough for the form context.
            />
        </div>
    );
}
