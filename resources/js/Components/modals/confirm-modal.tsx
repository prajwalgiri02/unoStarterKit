import Button from "@/Components/buttons/button";
import Alert from "@/Components/feedback/alert";
import { CloseCircleIcon } from "@/Components/icons";
import Modal from "@/Components/modals/modal";
import { useId, type ReactNode } from "react";

type ConfirmModalProps = {
    open: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: ReactNode;
    description?: ReactNode;
    warning?: ReactNode;
    confirmLabel: string;
    cancelLabel?: string;
    processing?: boolean;
    children?: ReactNode;
};

export default function ConfirmModal({
    open,
    onClose,
    onConfirm,
    title,
    description,
    warning,
    confirmLabel,
    cancelLabel = "Cancel",
    processing = false,
    children,
}: ConfirmModalProps) {
    const titleId = useId();

    return (
        <Modal open={open} onClose={onClose} size="medium" labelledBy={titleId}>
            <div className="flex flex-col gap-[30px]">
                <div className="flex items-start justify-between gap-4">
                    <h2 id={titleId} className="text-title-md text-neutral-900">
                        {title}
                    </h2>
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Close"
                        className="flex size-6 shrink-0 cursor-pointer items-center justify-center rounded-full text-neutral-500 outline-none transition-colors hover:text-neutral-700 focus-visible:ring-[3px] focus-visible:ring-primary-50"
                    >
                        <CloseCircleIcon className="size-6" />
                    </button>
                </div>
                {description && <p className="text-body-xs text-neutral-700">{description}</p>}
                {children}
                {warning && <Alert tone="warning">{warning}</Alert>}
                <div className="flex flex-col gap-3 sm:flex-row">
                    <Button className="flex-1" onClick={onConfirm} disabled={processing}>
                        {confirmLabel}
                    </Button>
                    <Button variant="outline" className="flex-1" onClick={onClose} disabled={processing}>
                        {cancelLabel}
                    </Button>
                </div>
            </div>
        </Modal>
    );
}
