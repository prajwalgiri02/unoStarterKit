import { fieldError } from "@/Components/inputs/first-error-message";
import { useFormContext } from "@inertiajs/react";
import { CheckIcon, MinusIcon } from "@/Components/icons";
import {
    useEffect,
    useId,
    useRef,
    type ChangeEvent,
    type ComponentProps,
    type ReactNode,
} from "react";

type CheckboxProps = Omit<ComponentProps<"input">, "type"> & {
    label?: ReactNode;
    labelPosition?: "start" | "end";
    shape?: "square" | "circle";
    indeterminate?: boolean;
    error?: string;
};

export default function Checkbox({
    label,
    labelPosition = "end",
    shape = "square",
    indeterminate = false,
    error,
    className = "",
    id,
    name,
    disabled,
    onChange,
    ref,
    ...rest
}: CheckboxProps) {
    const generatedId = useId();
    const inputId = id ?? generatedId;
    const errorId = `${inputId}-error`;
    const innerRef = useRef<HTMLInputElement | null>(null);
    const form = useFormContext();

    useEffect(() => {
        if (innerRef.current) innerRef.current.indeterminate = indeterminate;
    }, [indeterminate]);

    const errorMessage =
        error ||
        (form && name
            ? fieldError(form.errors as Record<string, unknown>, name)
            : undefined);

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        onChange?.(e);
        if (form && name) form.clearErrors(name);
    };

    const setRef = (node: HTMLInputElement | null) => {
        innerRef.current = node;
        if (typeof ref === "function") ref(node);
        else if (ref) ref.current = node;
    };

    const labelNode = label && <span className="min-w-0">{label}</span>;

    return (
        <div className={`flex flex-col gap-1 ${className}`.trim()}>
            <label
                htmlFor={inputId}
                className="inline-flex cursor-pointer items-start gap-3 text-body-md text-neutral-700 has-disabled:cursor-not-allowed has-disabled:text-neutral-400"
            >
                {labelPosition === "start" && labelNode}

                <span className="relative mt-0.5 flex size-5 shrink-0">
                    <input
                        ref={setRef}
                        id={inputId}
                        name={name}
                        type="checkbox"
                        disabled={disabled}
                        onChange={handleChange}
                        aria-invalid={errorMessage ? true : undefined}
                        aria-describedby={errorMessage ? errorId : undefined}
                        className={`peer size-5 cursor-pointer appearance-none border-[1.5px] border-primary-500 bg-base-white outline-none transition-colors hover:bg-primary-50 focus-visible:ring-[3px] focus-visible:ring-primary-50 checked:bg-primary-500 checked:hover:bg-primary-600 indeterminate:bg-primary-500 indeterminate:hover:bg-primary-600 disabled:cursor-not-allowed disabled:border-neutral-200 disabled:bg-base-white disabled:checked:border-primary-200 disabled:checked:bg-primary-200 disabled:indeterminate:border-primary-200 disabled:indeterminate:bg-primary-200 ${shape === "circle" ? "rounded-full" : "rounded-[5px]"}`}
                        {...rest}
                    />
                    <CheckIcon
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-0 m-auto hidden size-3.5 text-base-white peer-checked:block peer-indeterminate:hidden"
                    />
                    <MinusIcon
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-0 m-auto hidden size-3.5 text-base-white peer-indeterminate:block"
                    />
                </span>

                {labelPosition === "end" && labelNode}
            </label>

            {errorMessage && (
                <p id={errorId} className="text-link-sm font-normal text-error-500">
                    {errorMessage}
                </p>
            )}
        </div>
    );
}
