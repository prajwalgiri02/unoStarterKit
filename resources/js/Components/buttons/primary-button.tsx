import type { ButtonHTMLAttributes, ReactNode } from "react";

const sizeClasses = {
    giant: "btn-giant",
    large: "btn-large",
    medium: "btn-medium",
    small: "btn-small",
    tiny: "btn-tiny",
} as const;

const variantClasses = {
    filled: "btn-filled",
    outline: "btn-outline",
    clear: "btn-clear",
    contained: "btn-filled",
    outlined: "btn-outline",
    ghost: "btn-clear",
} as const;

type PrimaryButtonProps = Omit<
    ButtonHTMLAttributes<HTMLButtonElement>,
    "type"
> & {
    variant?: keyof typeof variantClasses;
    size?: keyof typeof sizeClasses;
    type?: "button" | "submit" | "reset";
    iconOnly?: boolean;
    children: ReactNode;
};

export default function PrimaryButton({
    variant = "filled",
    size = "giant",
    type = "button",
    iconOnly = false,
    className = "",
    disabled,
    children,
    ...rest
}: PrimaryButtonProps) {
    const composed = [
        "btn",
        sizeClasses[size],
        variantClasses[variant],
        iconOnly ? "btn-icon-only" : "",
        className,
    ]
        .filter(Boolean)
        .join(" ")
        .trim();

    return (
        <button type={type} className={composed} disabled={disabled} {...rest}>
            {children}
        </button>
    );
}
