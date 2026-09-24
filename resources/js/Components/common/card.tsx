import type { ReactNode } from "react";

type CardProps = {
    title?: ReactNode;
    actions?: ReactNode;
    className?: string;
    children?: ReactNode;
};

export default function Card({ title, actions, className = "", children }: CardProps) {
    return (
        <section
            className={`flex flex-col gap-5 rounded-[20px] border border-neutral-200 bg-base-white px-5 py-5 sm:px-[30px] ${className}`.trim()}
        >
            {(title || actions) && (
                <div className="flex flex-wrap items-center justify-between gap-4">
                    {title && <h2 className="text-subtitle-lg font-medium text-neutral-900">{title}</h2>}
                    {actions && <div className="flex flex-wrap items-center gap-3">{actions}</div>}
                </div>
            )}
            {children}
        </section>
    );
}
