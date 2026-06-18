import { fieldError } from "@/components/inputs/first-error-message";
import { useFormContext } from "@inertiajs/react";

type TextareaInputProps = {
    label?: string;
    error?: string;
} & React.TextareaHTMLAttributes<HTMLTextAreaElement>;

/**
 * Must be rendered inside Inertia `<Form>`. Validation rules come from the server (Precognition).
 */
export default function TextareaInput({
    id = "inputtextarea",
    name = "textarea",
    label,
    placeholder,
    rows = 4,
    className = "input-giant body-xs",
    defaultValue: propDefaultValue,
    value,
    onChange,
    error: propError,
    style,
    ...props
}: TextareaInputProps) {
    const form = useFormContext<Record<string, unknown>>();
    const msg =
        propError ||
        (form
            ? fieldError(form.errors as Record<string, unknown>, name)
            : undefined);

    return (
        <div className="flex flex-col gap-2">
            {label && (
                <label className="caption-md text-neutral-700" htmlFor={id}>
                    {label}
                </label>
            )}
            <textarea
                id={id}
                name={name}
                rows={rows}
                style={style}
                defaultValue={
                    value !== undefined ? undefined : (propDefaultValue ?? "")
                }
                value={value}
                placeholder={placeholder}
                className={`${className}${msg ? " error input-error" : ""}`}
                onBlur={() => form?.validate(name)}
                onChange={(e) => {
                    onChange?.(e);
                    form?.clearErrors(name);
                }}
                aria-invalid={Boolean(msg)}
                aria-describedby={msg ? `${id}-error` : undefined}
                {...props}
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
