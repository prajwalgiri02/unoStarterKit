import { NavArrowDownIcon } from "@/Components/icons";
import { fieldError } from "@/Components/inputs/first-error-message";
import { useFormContext } from "@inertiajs/react";
import { useId, type ChangeEvent, type ComponentProps, type ReactNode } from "react";

export type SelectOption = {
    value: string;
    label: string;
};

type SelectProps = Omit<ComponentProps<"select">, "children"> & {
    label?: ReactNode;
    options: SelectOption[];
    placeholder?: string;
    error?: string;
};

export default function Select({
    label,
    options,
    placeholder,
    error,
    className = "",
    id,
    name,
    disabled,
    onChange,
    ...rest
}: SelectProps) {
    const generatedId = useId();
    const selectId = id ?? generatedId;
    const errorId = `${selectId}-error`;
    const form = useFormContext();

    const errorMessage =
        error ||
        (form && name ? fieldError(form.errors as Record<string, unknown>, name) : undefined);

    const handleChange = (e: ChangeEvent<HTMLSelectElement>) => {
        onChange?.(e);
        if (form && name) form.clearErrors(name);
    };

    const stateClasses = disabled
        ? "cursor-not-allowed bg-neutral-50 text-neutral-400"
        : errorMessage
          ? "border-error-500 bg-error-50"
          : "border-neutral-200 bg-base-white hover:not-focus:bg-neutral-25 focus:border-primary-500 focus:bg-primary-50";

    return (
        <div className={`flex w-full flex-col gap-2 ${className}`.trim()}>
            {label && (
                <label htmlFor={selectId} className="text-link-sm text-neutral-600">
                    {label}
                </label>
            )}
            <div className="relative">
                <select
                    id={selectId}
                    name={name}
                    disabled={disabled}
                    onChange={handleChange}
                    aria-invalid={errorMessage ? true : undefined}
                    aria-describedby={errorMessage ? errorId : undefined}
                    className={`h-12 w-full cursor-pointer appearance-none rounded-[20px] border-[1.5px] pr-11 pl-4 text-body-xs text-neutral-900 outline-none transition-colors ${stateClasses}`}
                    {...rest}
                >
                    {placeholder !== undefined && <option value="">{placeholder}</option>}
                    {options.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
                <NavArrowDownIcon className="pointer-events-none absolute top-1/2 right-4 size-5 -translate-y-1/2 text-neutral-400" />
            </div>
            {errorMessage && (
                <p id={errorId} className="text-link-sm font-normal text-error-500">
                    {errorMessage}
                </p>
            )}
        </div>
    );
}
