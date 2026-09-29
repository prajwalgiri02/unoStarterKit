import type { ReactNode } from "react";

type DetailFieldProps = {
    label: ReactNode;
    children: ReactNode;
};

export default function DetailField({ label, children }: DetailFieldProps) {
    return (
        <div className="flex flex-col gap-1 border-b border-neutral-400/10 pb-2.5">
            <dt className="text-body-xs text-neutral-600">{label}</dt>
            <dd className="min-h-6 text-body-md break-words text-neutral-900">{children}</dd>
        </div>
    );
}
