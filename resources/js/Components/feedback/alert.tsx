import { DangerIcon, TickCircleIcon } from "@/Components/icons";
import type { ReactNode } from "react";

type AlertTone = "primary" | "success" | "info" | "warning" | "error";

const toneClasses: Record<AlertTone, { outline: string; filled: string; icon: string }> = {
    primary: { outline: "border-primary-300 bg-primary-50", filled: "bg-primary-500", icon: "text-primary-500" },
    success: { outline: "border-success-300 bg-success-50", filled: "bg-success-500", icon: "text-success-500" },
    info: { outline: "border-info-300 bg-info-50", filled: "bg-info-500", icon: "text-info-500" },
    warning: { outline: "border-warning-300 bg-warning-50", filled: "bg-warning-500", icon: "text-warning-500" },
    error: { outline: "border-error-300 bg-error-50", filled: "bg-error-500", icon: "text-error-500" },
};

const defaultIcons: Partial<Record<AlertTone, ReactNode>> = {
    success: <TickCircleIcon />,
    warning: <DangerIcon />,
    error: <DangerIcon />,
};

type AlertProps = {
    tone?: AlertTone;
    variant?: "outline" | "filled";
    title?: ReactNode;
    icon?: ReactNode | false;
    actions?: ReactNode;
    className?: string;
    children?: ReactNode;
};

export default function Alert({
    tone = "primary",
    variant = "outline",
    title,
    icon,
    actions,
    className = "",
    children,
}: AlertProps) {
    const styles = toneClasses[tone];
    const filled = variant === "filled";
    const resolvedIcon = icon === false ? null : (icon ?? defaultIcons[tone]);

    return (
        <div
            role={tone === "error" || tone === "warning" ? "alert" : "status"}
            className={`flex gap-4 rounded-xl p-4 ${filled ? `${styles.filled} text-base-white` : `border-[1.5px] ${styles.outline} text-neutral-800`} ${className}`.trim()}
        >
            {resolvedIcon && (
                <span
                    aria-hidden="true"
                    className={`flex size-6 shrink-0 items-center justify-center [&>svg]:size-full ${filled ? "" : styles.icon}`}
                >
                    {resolvedIcon}
                </span>
            )}
            <div className="flex min-w-0 flex-1 flex-col gap-4">
                <div className="flex flex-col gap-1">
                    {title && <p className="text-body-lg">{title}</p>}
                    {children && <div className="text-body-xs">{children}</div>}
                </div>
                {actions && <div className="flex flex-wrap items-center gap-4">{actions}</div>}
            </div>
        </div>
    );
}
