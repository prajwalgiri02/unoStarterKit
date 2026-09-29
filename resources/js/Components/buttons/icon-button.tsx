import type { ButtonHTMLAttributes, ReactNode } from "react";

type IconButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "type" | "aria-label"> & {
    label: string;
    tone?: "neutral" | "primary" | "danger";
    children: ReactNode;
};

const toneClasses = {
    neutral: "text-neutral-600 hover:bg-neutral-50",
    primary: "text-primary-500 hover:bg-primary-50",
    danger: "text-error-500 hover:bg-error-50",
} as const;

export default function IconButton({ label, tone = "neutral", className = "", children, ...rest }: IconButtonProps) {
    return (
        <button
            type="button"
            aria-label={label}
            title={label}
            className={`flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-lg outline-none transition-colors focus-visible:ring-[3px] focus-visible:ring-primary-50 disabled:cursor-not-allowed disabled:opacity-50 [&>svg]:size-[18px] ${toneClasses[tone]} ${className}`.trim()}
            {...rest}
        >
            {children}
        </button>
    );
}
