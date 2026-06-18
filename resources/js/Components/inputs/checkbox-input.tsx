import { fieldError } from "@/components/inputs/first-error-message";
import { useFormContext } from "@inertiajs/react";

type CheckboxInputProps = {
    id: string;
    name: string;
    label: React.ReactNode;
    className?: string;
};

/**
 * Must be rendered inside Inertia `<Form>`. Use value="1" so Laravel boolean validation accepts it.
 */
export default function CheckboxInput({
    id,
    name,
    label,
    className = "checkbox-squared",
}: CheckboxInputProps) {
    const form = useFormContext<Record<string, unknown>>();
    const msg = form
        ? fieldError(form.errors as Record<string, unknown>, name)
        : undefined;

    return (
        <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
                <input
                    type="checkbox"
                    className={className}
                    name={name}
                    id={id}
                    value="1"
                    defaultChecked={false}
                    onChange={() => form?.clearErrors(name)}
                    aria-invalid={Boolean(msg)}
                    aria-describedby={msg ? `${id}-error` : undefined}
                />
                <label className="body-xs text-neutral-600 mb-0" htmlFor={id}>
                    {label}
                </label>
            </div>
            {msg ? (
                <p id={`${id}-error`} className="caption-md text-red-500 mb-0">
                    {msg}
                </p>
            ) : null}
        </div>
    );
}
