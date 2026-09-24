import { X } from "lucide-react";
import type { ComponentProps, ReactNode } from "react";

const sizeClasses = {
    medium: { base: "h-10 text-body-sm", padding: "px-3", square: "size-10", icon: "size-6", remove: "size-6" },
    small: { base: "h-8 text-link-sm", padding: "px-3", square: "size-8", icon: "size-5", remove: "size-5" },
    tiny: { base: "h-6 text-link-sm leading-4", padding: "px-2", square: "size-6", icon: "size-3", remove: "size-4" },
} as const;

const colorClasses = {
    primary: {
        filled: "bg-primary-500 text-base-white",
        outline: "border-primary-500 bg-primary-50 text-primary-500",
    },
    success: {
        filled: "bg-success-500 text-base-white",
        outline: "border-success-500 bg-success-50 text-success-500",
    },
    info: {
        filled: "bg-info-500 text-base-white",
        outline: "border-info-500 bg-info-50 text-info-500",
    },
    warning: {
        filled: "bg-warning-500 text-base-white",
        outline: "border-warning-500 bg-warning-50 text-warning-500",
    },
    error: {
        filled: "bg-error-500 text-base-white",
        outline: "border-error-500 bg-error-50 text-error-500",
    },
    neutral: {
        filled: "bg-base-white text-neutral-500",
        outline: "border-neutral-500 bg-base-white text-neutral-500",
    },
} as const;

export type BadgeColor = keyof typeof colorClasses;

type BadgeProps = ComponentProps<"span"> & {
    color?: BadgeColor;
    variant?: "filled" | "outline";
    size?: keyof typeof sizeClasses;
    iconOnly?: boolean;
    startIcon?: ReactNode;
    onRemove?: () => void;
    removeLabel?: string;
    children: ReactNode;
};

export default function Badge({
    color = "primary",
    variant = "filled",
    size = "medium",
    iconOnly = false,
    startIcon,
    onRemove,
    removeLabel = "Remove",
    className = "",
    children,
    ...rest
}: BadgeProps) {
    const sizes = sizeClasses[size];

    const composed = [
        "inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-full",
        iconOnly ? sizes.square : `${sizes.base} ${sizes.padding}`,
        variant === "outline" ? "border-[1.5px]" : "",
        colorClasses[color][variant],
        className,
    ]
        .filter(Boolean)
        .join(" ");

    const iconClassName = `flex shrink-0 items-center justify-center [&>svg]:size-full ${sizes.icon}`;

    if (iconOnly) {
        return (
            <span className={composed} {...rest}>
                <span className={iconClassName} aria-hidden="true">
                    {children}
                </span>
            </span>
        );
    }

    return (
        <span className={composed} {...rest}>
            {startIcon && (
                <span className={iconClassName} aria-hidden="true">
                    {startIcon}
                </span>
            )}
            {children}
            {onRemove && (
                <button
                    type="button"
                    onClick={onRemove}
                    aria-label={removeLabel}
                    className={`flex shrink-0 cursor-pointer items-center justify-center rounded-full outline-none focus-visible:ring-2 focus-visible:ring-current [&>svg]:size-full ${sizes.remove}`}
                >
                    <X />
                </button>
            )}
        </span>
    );
}
