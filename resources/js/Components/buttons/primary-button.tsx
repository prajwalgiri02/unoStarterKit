import type { ButtonHTMLAttributes, ReactNode } from "react";

/**
 * Size scale, measured from the design spec (Group 8):
 * giant=56px, large=48px, medium=40px, small=32px tall, full-pill radius (h/2).
 * `tiny` was left unspecified in the source design — sized proportionally below;
 * confirm against design before shipping.
 */
const sizeClasses = {
    giant: "btn-giant",
    large: "btn-large",
    medium: "btn-medium",
    small: "btn-small",
    tiny: "btn-tiny",
} as const;

type PrimaryButtonProps = Omit<
    ButtonHTMLAttributes<HTMLButtonElement>,
    "type"
> & {
    /**
     * `contained` = filled primary (solid bg, white text/icon)
     * `outlined`  = border + primary text, transparent/white bg
     * `ghost`     = no border, no bg until hover/press, text-only
     */
    variant?: "contained" | "outlined" | "ghost";
    /** Default: `giant` (matches sign-in / login). */
    size?: keyof typeof sizeClasses;
    type?: "button" | "submit" | "reset";
    textSize?: string;
    /** Render only the icon slot (square button) instead of label + icon. */
    iconOnly?: boolean;
    children: ReactNode;
};

const variantClasses = {
    contained: "btn-primary",
    outlined: "btn-secondary",
    ghost: "btn-ghost",
} as const;

export default function PrimaryButton({
    variant = "contained",
    size = "giant",
    type = "button",
    textSize = "text-btn-500",
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
        textSize,
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