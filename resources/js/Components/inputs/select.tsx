import { NavArrowDownIcon } from "@/Components/icons";
import Field, {
    fieldClasses,
    fieldControlClasses,
    fieldSizes,
    useFieldError,
    type FieldSize,
    type FieldStatus,
    type FieldVariant,
} from "@/Components/inputs/field";
import { useId, type ChangeEvent, type ComponentProps, type ReactNode } from "react";

export type SelectOption = {
    value: string;
    label: string;
};

type SelectProps = Omit<ComponentProps<"select">, "children" | "size"> & {
    label?: ReactNode;
    options: SelectOption[];
    placeholder?: string;
    helperText?: ReactNode;
    error?: string;
    status?: FieldStatus;
    variant?: FieldVariant;
    size?: FieldSize;
    startIcon?: ReactNode;
};

const controlPadding: Record<FieldSize, { plain: string; withIcon: string; end: string }> = {
    large: { plain: "pl-4", withIcon: "pl-13", end: "pr-11" },
    medium: { plain: "pl-3", withIcon: "pl-12", end: "pr-10" },
    small: { plain: "pl-3", withIcon: "pl-10", end: "pr-8" },
};

export default function Select({
    label,
    options,
    placeholder,
    helperText,
    error,
    status = "default",
    variant = "filled",
    size = "large",
    startIcon,
    className = "",
    id,
    name,
    disabled,
    onChange,
    ...rest
}: SelectProps) {
    const generatedId = useId();
    const selectId = id ?? generatedId;
    const helperId = `${selectId}-helper`;
    const { errorMessage, clearError } = useFieldError(name, error);

    const handleChange = (e: ChangeEvent<HTMLSelectElement>) => {
        onChange?.(e);
        clearError();
    };

    const resolvedStatus: FieldStatus = errorMessage ? "error" : status;
    const helper = errorMessage || helperText;
    const styles = fieldClasses({ status: resolvedStatus, variant, disabled });
    const sizes = fieldSizes[size];
    const padding = controlPadding[size];
    const iconClassName = `pointer-events-none flex shrink-0 items-center justify-center [&>svg]:size-full ${sizes.icon}`;

    return (
        <Field
            label={label}
            labelFor={selectId}
            helper={helper}
            helperId={helperId}
            helperClassName={styles.helper}
            className={className}
        >
            <div className={`relative flex w-full items-center ${sizes.box} ${styles.box}`}>
                {startIcon && <span className={iconClassName}>{startIcon}</span>}

                <select
                    id={selectId}
                    name={name}
                    disabled={disabled}
                    onChange={handleChange}
                    aria-invalid={resolvedStatus === "error" || undefined}
                    aria-describedby={helper ? helperId : undefined}
                    className={`absolute inset-0 size-full cursor-pointer appearance-none rounded-[inherit] ${padding.end} ${startIcon ? padding.withIcon : padding.plain} ${fieldControlClasses}`}
                    {...rest}
                >
                    {placeholder !== undefined && <option value="">{placeholder}</option>}
                    {options.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>

                <span className={`ml-auto ${iconClassName}`}>
                    <NavArrowDownIcon />
                </span>
            </div>
        </Field>
    );
}
