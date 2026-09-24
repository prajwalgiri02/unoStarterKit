import { useEffect, useRef, type ReactNode } from "react";

const sizeClasses = {
    small: "max-w-[352px]",
    medium: "max-w-[480px]",
    large: "max-w-[640px]",
} as const;

type ModalProps = {
    open: boolean;
    onClose?: () => void;
    dismissible?: boolean;
    size?: keyof typeof sizeClasses;
    labelledBy?: string;
    className?: string;
    children: ReactNode;
};

export default function Modal({
    open,
    onClose,
    dismissible = true,
    size = "small",
    labelledBy,
    className = "",
    children,
}: ModalProps) {
    const ref = useRef<HTMLDialogElement>(null);

    useEffect(() => {
        const dialog = ref.current;
        if (!dialog) return;
        if (open && !dialog.open) dialog.showModal();
        if (!open && dialog.open) dialog.close();
    }, [open]);

    useEffect(() => {
        if (!open) return;
        document.documentElement.classList.add("overflow-hidden");
        return () => document.documentElement.classList.remove("overflow-hidden");
    }, [open]);

    return (
        <dialog
            ref={ref}
            aria-labelledby={labelledBy}
            onCancel={(e) => {
                e.preventDefault();
                if (dismissible) onClose?.();
            }}
            onClick={(e) => {
                if (dismissible && e.target === e.currentTarget) onClose?.();
            }}
            className={`m-auto w-[calc(100%-2rem)] rounded-2xl bg-base-white p-0 text-neutral-900 shadow-xl backdrop:bg-backdrop backdrop:backdrop-blur-backdrop ${sizeClasses[size]} ${className}`.trim()}
        >
            <div className="px-8 py-[34px]">{children}</div>
        </dialog>
    );
}
