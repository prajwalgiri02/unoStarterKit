import { useId, type ComponentProps, type ReactNode } from "react";

type ToggleProps = Omit<ComponentProps<"input">, "type"> & {
    label?: ReactNode;
    labelPosition?: "start" | "end";
};

export default function Toggle({
    label,
    labelPosition = "end",
    className = "",
    id,
    ...rest
}: ToggleProps) {
    const generatedId = useId();
    const inputId = id ?? generatedId;

    const labelNode = label && <span className="min-w-0">{label}</span>;

    return (
        <label
            htmlFor={inputId}
            className={`inline-flex cursor-pointer items-start gap-4 text-body-md text-neutral-700 has-disabled:cursor-not-allowed has-disabled:text-neutral-400 ${className}`.trim()}
        >
            {labelPosition === "start" && labelNode}

            <span className="relative mt-0.5 flex h-5 w-9.5 shrink-0">
                <input
                    id={inputId}
                    type="checkbox"
                    role="switch"
                    className="peer h-5 w-9.5 cursor-pointer appearance-none rounded-full bg-neutral-200 outline-none transition-colors hover:bg-neutral-300 focus-visible:ring-[3px] focus-visible:ring-primary-50 checked:bg-primary-500 checked:hover:bg-primary-700 disabled:cursor-not-allowed disabled:bg-neutral-100 disabled:checked:bg-primary-50"
                    {...rest}
                />
                <span
                    aria-hidden="true"
                    className="pointer-events-none absolute top-0.5 left-0.5 size-4 rounded-full bg-base-white transition-transform duration-200 peer-checked:translate-x-4.5"
                />
            </span>

            {labelPosition === "end" && labelNode}
        </label>
    );
}
