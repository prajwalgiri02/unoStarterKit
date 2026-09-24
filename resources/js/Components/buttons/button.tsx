import type { ButtonHTMLAttributes, ReactNode } from "react";

const sizeClasses = {
    giant: { base: "h-14 text-subtitle-xs", padding: "px-6", icon: "size-6" },
    large: { base: "h-12 text-body-lg", padding: "px-5", icon: "size-6" },
    medium: { base: "h-10 text-body-sm", padding: "px-4", icon: "size-4.5" },
    small: { base: "h-8 text-link-sm", padding: "px-3", icon: "size-4" },
    tiny: { base: "h-6 text-link-sm", padding: "px-2", icon: "size-4" },
} as const;

const filled =
    "border border-transparent bg-primary-500 text-base-white hover:bg-primary-400 focus-visible:bg-primary-500 focus-visible:ring-[3px] focus-visible:ring-primary-50 active:bg-primary-600 disabled:bg-primary-200";

const outline =
    "border-[1.5px] border-primary-500 bg-transparent text-primary-500 hover:bg-primary-50 focus-visible:bg-base-white focus-visible:ring-[3px] focus-visible:ring-primary-50 active:bg-primary-100 disabled:border-primary-200 disabled:bg-primary-200 disabled:text-base-white";

const clear =
    "border border-transparent bg-transparent text-primary-500 hover:bg-primary-50 focus-visible:bg-base-white focus-visible:ring-[3px] focus-visible:ring-primary-50 active:bg-primary-100 disabled:bg-transparent disabled:text-primary-200";

const variantClasses = {
    filled,
    outline,
    clear,
    contained: filled,
    outlined: outline,
    ghost: clear,
} as const;

type ButtonProps = Omit<
    ButtonHTMLAttributes<HTMLButtonElement>,
    "type"
> & {
    variant?: keyof typeof variantClasses;
    size?: keyof typeof sizeClasses;
    type?: "button" | "submit" | "reset";
    iconOnly?: boolean;
    startIcon?: ReactNode;
    endIcon?: ReactNode;
    children: ReactNode;
};

export default function Button({
    variant = "filled",
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
        variantClasses[variant],
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
