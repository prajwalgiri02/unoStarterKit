import type { ButtonHTMLAttributes, ReactNode } from "react";

const sizeClasses = {
    giant: "btn-gaints",
    large: "btn-large",
    medium: "btn-medium",
    small: "btn-small",
} as const;

type PrimaryButtonProps = Omit<
    ButtonHTMLAttributes<HTMLButtonElement>,
    "type"
> & {
    /** Default: `contained` (filled primary). `outlined` uses border + primary text. */
    variant?: "contained" | "outlined" | "ghost";
    /** Default: `giant` (matches sign-in login). */
    size?: keyof typeof sizeClasses;
    type?: "button" | "submit" | "reset";
    textSize?: string;
    children: ReactNode;
};

const variantClasses = {
    contained: "btns-primary",
    outlined: "btns-secondary",
    ghost: "btns-ghost",
} as const;

export default function PrimaryButton({
    variant = "contained",
    size = "giant",
    type = "button",
    textSize = "text-btn-500",
    className = "",
    disabled,
    children,
    ...rest
}: PrimaryButtonProps) {
    const composed =
        `btns ${sizeClasses[size]} ${variantClasses[variant]} ${textSize} ${className}`.trim();

    return (
        <button type={type} className={composed} disabled={disabled} {...rest}>
            {children}
        </button>
    );
}
