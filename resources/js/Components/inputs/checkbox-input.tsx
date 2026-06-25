import { fieldError } from "@/components/inputs/first-error-message";
import { useFormContext } from "@inertiajs/react";

type CheckboxInputProps = {
    id: string;
    name: string;
    label: React.ReactNode;
    className?: string;
    defaultChecked?: boolean;
};

export default function CheckboxInput({
    id,
    name,
    label,
    className = "checkbox",
    defaultChecked = false,
}: CheckboxInputProps) {
    const form = useFormContext<Record<string, unknown>>();

    const msg = form
        ? fieldError(form.errors as Record<string, unknown>, name)
        : undefined;

    return (
        <>
            <label className={className} htmlFor={id}>
                <input
                    type="checkbox"
                    id={id}
                    name={name}
                    value="1"
                    defaultChecked={defaultChecked}
                    onChange={() => form?.clearErrors(name)}
                    aria-invalid={Boolean(msg)}
                    aria-describedby={msg ? `${id}-error` : undefined}
                />

                <span className="box" aria-hidden="true"></span>
                <span>{label}</span>
            </label>

            {msg ? (
                <p
                    id={`${id}-error`}
                    className="caption-md text-red-500 mb-0"
                >
                    {msg}
                </p>
            ) : null}
        </>
    );
}