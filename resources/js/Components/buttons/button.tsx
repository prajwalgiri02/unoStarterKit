import type { ButtonHTMLAttributes, ReactNode } from "react";

const sizeClasses = {
    giant: { base: "h-14 text-subtitle-xs", padding: "px-6", icon: "size-6" },
    large: { base: "h-12 text-body-lg", padding: "px-5", icon: "size-6" },
    medium: { base: "h-10 text-body-sm", padding: "px-4", icon: "size-4.5" },
    small: { base: "h-8 text-link-sm", padding: "px-3", icon: "size-4" },
    tiny: { base: "h-6 text-link-sm", padding: "px-2", icon: "size-4" },
} as const;

const toneClasses = {
    primary: {
        filled: "border border-transparent bg-primary-500 text-base-white hover:bg-primary-400 focus-visible:bg-primary-500 focus-visible:ring-[3px] focus-visible:ring-primary-50 active:bg-primary-600 disabled:bg-primary-200",
        outline: "border-[1.5px] border-primary-500 bg-transparent text-primary-500 hover:bg-primary-50 focus-visible:bg-base-white focus-visible:ring-[3px] focus-visible:ring-primary-50 active:bg-primary-100 disabled:border-primary-200 disabled:bg-primary-200 disabled:text-base-white",
        clear: "border border-transparent bg-transparent text-primary-500 hover:bg-primary-50 focus-visible:bg-base-white focus-visible:ring-[3px] focus-visible:ring-primary-50 active:bg-primary-100 disabled:bg-transparent disabled:text-primary-200",
    },
    danger: {
        filled: "border border-transparent bg-error-500 text-base-white hover:bg-error-400 focus-visible:bg-error-500 focus-visible:ring-[3px] focus-visible:ring-error-50 active:bg-error-600 disabled:bg-error-200",
        outline: "border-[1.5px] border-error-500 bg-transparent text-error-500 hover:bg-error-50 focus-visible:bg-base-white focus-visible:ring-[3px] focus-visible:ring-error-50 active:bg-error-100 disabled:border-error-200 disabled:bg-error-200 disabled:text-base-white",
        clear: "border border-transparent bg-transparent text-error-500 hover:bg-error-50 focus-visible:bg-base-white focus-visible:ring-[3px] focus-visible:ring-error-50 active:bg-error-100 disabled:bg-transparent disabled:text-error-200",
    },
} as const;

type ButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "type"> & {
    variant?: "filled" | "outline" | "clear";
    tone?: keyof typeof toneClasses;
    size?: keyof typeof sizeClasses;
    type?: "button" | "submit" | "reset";
    iconOnly?: boolean;
    startIcon?: ReactNode;
    endIcon?: ReactNode;
    children: ReactNode;
};

export default function Button({
    variant = "filled",
    tone = "primary",
    size = "giant",
    type = "button",
    iconOnly = false,
    startIcon,
    endIcon,
    className = "",
    disabled,
    children,
    ...rest
}: ButtonProps) {
    const sizes = sizeClasses[size];

    const composed = [
        "inline-flex cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-[40px] outline-none transition-all duration-200 disabled:pointer-events-none disabled:cursor-not-allowed",
        sizes.base,
        iconOnly ? "aspect-square px-0" : sizes.padding,
        toneClasses[tone][variant],
        className,
    ]
        .filter(Boolean)
        .join(" ");

    const icon = (content: ReactNode) => (
        <span
            className={`flex shrink-0 items-center justify-center [&>svg]:size-full ${sizes.icon}`}
            aria-hidden="true"
        >
            {content}
        </span>
    );

    return (
        <button type={type} className={composed} disabled={disabled} {...rest}>
            {iconOnly ? (
                icon(children)
            ) : (
                <>
                    {startIcon && icon(startIcon)}
                    {children}
                    {endIcon && icon(endIcon)}
                </>
            )}
        </button>
    );
}
