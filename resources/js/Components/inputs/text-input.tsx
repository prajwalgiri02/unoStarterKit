import { fieldError } from "@/components/inputs/first-error-message";
import { useFormContext } from "@inertiajs/react";

type TextInputProps = {
    id?: string;
    name?: string;
    label?: string;
    type?: React.HTMLInputTypeAttribute;
    placeholder?: string;
    autoComplete?: string;
    inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
    className?: string;
    defaultValue?: string | number;
    value?: string | number;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    error?: string;
    readOnly?: boolean;
    disabled?: boolean;
};

/**
 * Must be rendered inside Inertia `<Form>`. Validation rules come from the server (Precognition).
 */
export default function TextInput({
    id = "inputtext",
    name = "text",
    label = "Text",
    type = "text",
    placeholder,
    autoComplete,
    inputMode,
    className = "input-giant body-xs",
    defaultValue: propDefaultValue,
    value,
    onChange,
    error: propError,
    defaultValue = "",
    readOnly = false,
    disabled = false,
}: TextInputProps) {
    const form = useFormContext<Record<string, unknown>>();
    const msg =
        propError ||
        (form
            ? fieldError(form.errors as Record<string, unknown>, name)
            : undefined);

    return (
        <div className="flex flex-col gap-2">
            <label className="caption-md text-neutral-700" htmlFor={id}>
                {label}
            </label>
            <input
                id={id}
                name={name}
                type={type}
                defaultValue={
                    value !== undefined ? undefined : (propDefaultValue ?? "")
                }
                value={value}
                onChange={(e) => {
                    onChange?.(e);
                    form?.clearErrors(name);
                }}
                placeholder={placeholder}
                autoComplete={autoComplete}
                inputMode={inputMode}
                className={`${className}${msg ? " error input-error" : ""}`}
                onBlur={() => form?.validate(name)}
                readOnly={readOnly}
                disabled={disabled}
                aria-invalid={Boolean(msg)}
                aria-describedby={msg ? `${id}-error` : undefined}
            />
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
