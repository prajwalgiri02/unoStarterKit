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

function ButtonIcon({ children }: { children: ReactNode }) {
    return (
        <span className="btn-icon" aria-hidden="true">
            {children}
        </span>
    );
}

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
            {iconOnly ? (
                <ButtonIcon>{children}</ButtonIcon>
            ) : (
                <>
                    {startIcon && <ButtonIcon>{startIcon}</ButtonIcon>}
                    {children}
                    {endIcon && <ButtonIcon>{endIcon}</ButtonIcon>}
                </>
            )}
        </button>
    );
}
