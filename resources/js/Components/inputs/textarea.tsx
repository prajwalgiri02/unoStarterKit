import Field, {
    fieldClasses,
    fieldControlClasses,
    useFieldError,
    type FieldStatus,
    type FieldVariant,
} from "@/Components/inputs/field";
import { useId, type ChangeEvent, type ComponentProps, type ReactNode } from "react";

type TextareaProps = ComponentProps<"textarea"> & {
    label?: ReactNode;
    helperText?: ReactNode;
    error?: string;
    status?: FieldStatus;
    variant?: FieldVariant;
};

export default function Textarea({
    label,
    helperText,
    error,
    status = "default",
    variant = "filled",
    className = "",
    id,
    name,
    rows = 5,
    disabled,
    onChange,
    ...rest
}: TextareaProps) {
    const generatedId = useId();
    const inputId = id ?? generatedId;
    const helperId = `${inputId}-helper`;
    const { errorMessage, clearError } = useFieldError(name, error);

    const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
        onChange?.(e);
        clearError();
    };

    const resolvedStatus: FieldStatus = errorMessage ? "error" : status;
    const helper = errorMessage || helperText;
    const styles = fieldClasses({ status: resolvedStatus, variant, disabled });

    return (
        <Field
            label={label}
            labelFor={inputId}
            helper={helper}
            helperId={helperId}
            helperClassName={styles.helper}
            className={className}
        >
            <div className={`flex w-full rounded-[20px] ${styles.box}`}>
                <textarea
                    id={inputId}
                    name={name}
                    rows={rows}
                    disabled={disabled}
                    onChange={handleChange}
                    aria-invalid={resolvedStatus === "error" || undefined}
                    aria-describedby={helper ? helperId : undefined}
                    className={`block w-full resize-none rounded-[inherit] px-4 py-3 scrollbar-none ${fieldControlClasses}`}
                    {...rest}
                />
            </div>
        </Field>
    );
}
