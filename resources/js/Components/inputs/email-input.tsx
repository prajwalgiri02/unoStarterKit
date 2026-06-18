import { fieldError } from "@/components/inputs/first-error-message";
import { useFormContext } from "@inertiajs/react";

type EmailInputProps = {
    id?: string;
    name?: string;
    label?: string;
    placeholder?: string;
    className?: string;
    defaultValue?: string;
    value?: string;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    error?: string;
    skipBlurValidation?: boolean;
};

/**
 * Must be rendered inside Inertia `<Form>`. Validation rules come from the server (Precognition).
 */
export default function EmailInput({
    id = "inputemail",
    name = "email",
    label = "Email id",
    placeholder = "Enter email Id",
    className = "input-giant body-xs",
    defaultValue: propDefaultValue,
    value,
    onChange,
    error: propError,
    skipBlurValidation = false,
}: EmailInputProps) {
    const form = useFormContext<Record<string, unknown>>();
    const msg =
        propError ||
        (form
            ? fieldError(form.errors as Record<string, unknown>, name)
            : undefined);

    return (
        <div className="d-flex flex-column gap-2">
            <label className="caption-md text-neutral-700" htmlFor={id}>
                {label}
            </label>
            <div>
                <input
                    id={id}
                    name={name}
                    type="email"
                    defaultValue={
                        value !== undefined
                            ? undefined
                            : (propDefaultValue ?? "")
                    }
                    value={value}
                    onChange={(e) => {
                        onChange?.(e);
                        form?.clearErrors(name);
                    }}
                    placeholder={placeholder}
                    autoComplete="email"
                    className={`${className}${msg ? " error" : ""}`}
                    onBlur={() => {
                        if (!skipBlurValidation) {
                            form?.validate(name);
                        }
                    }}
                    aria-invalid={Boolean(msg)}
                    aria-describedby={msg ? `${id}-error` : undefined}
                />
                {msg ? (
                    <p
                        id={`${id}-error`}
                        className="caption-md text-danger mt-1 mb-0"
                    >
                        {msg}
                    </p>
                ) : null}
            </div>
        </div>
    );
}
