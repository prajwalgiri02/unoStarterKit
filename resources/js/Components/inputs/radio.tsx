import { useId, type ComponentProps, type ReactNode } from "react";

type RadioProps = Omit<ComponentProps<"input">, "type"> & {
    label?: ReactNode;
    labelPosition?: "start" | "end";
};

export default function Radio({
    label,
    labelPosition = "end",
    className = "",
    id,
    ...rest
}: RadioProps) {
    const generatedId = useId();
    const inputId = id ?? generatedId;

    const labelNode = label && <span className="min-w-0">{label}</span>;

    return (
        <label
            htmlFor={inputId}
            className={`inline-flex cursor-pointer items-start gap-3 text-body-md text-neutral-700 has-disabled:cursor-not-allowed has-disabled:text-neutral-400 ${className}`.trim()}
        >
            {labelPosition === "start" && labelNode}

            <span className="relative mt-0.5 flex size-5 shrink-0">
                <input
                    id={inputId}
                    type="radio"
                    className="peer size-5 cursor-pointer appearance-none rounded-full border-[1.5px] border-primary-500 bg-base-white outline-none transition-colors hover:bg-primary-50 focus-visible:ring-[3px] focus-visible:ring-primary-50 disabled:cursor-not-allowed disabled:border-neutral-200 disabled:bg-base-white"
                    {...rest}
                />
                <span
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 m-auto size-2.5 scale-0 rounded-full bg-primary-500 transition-transform peer-checked:scale-100 peer-disabled:bg-neutral-200"
                />
            </span>

            {labelPosition === "end" && labelNode}
        </label>
    );
}
