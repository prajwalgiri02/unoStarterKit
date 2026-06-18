import { useEffect } from "react";

const DEFAULT_DELETE_ICON = "/icons/delete.svg";

export type DeleteModalProps = {
    /** Controls visibility. When `false` the modal is not rendered. */
    isOpen: boolean;
    /** Called when the user clicks Cancel or the backdrop. */
    onClose: () => void;
    /** Called when the user confirms deletion. */
    onConfirm: () => void;
    /** When `true` both buttons are disabled and the confirm button shows "Deleting…". */
    isDeleting?: boolean;
    /**
     * Name of the item being deleted, used to build the default title:
     * "Are you sure you want to delete {itemName}?"
     */
    itemName?: string;
    /**
     * Override the modal headline. Falls back to a title built from `itemName`,
     * or a generic "Are you sure you want to delete this?" when neither is set.
     */
    title?: string;
    /**
     * Override the body paragraph. Falls back to a generic permanent-action warning.
     */
    description?: string;
    /** Src for the icon displayed above the title. Defaults to `/icons/delete.svg`. */
    deleteIconSrc?: string;
    /**
     * Label for the confirm button. Defaults to "Delete".
     * The loading variant appends "…" automatically.
     */
    confirmLabel?: string;
    /** Label for the cancel button. Defaults to "Cancel". */
    cancelLabel?: string;
};

/**
 * Reusable delete-confirmation modal (matches MiSzn user-management delete dialog).
 *
 * Locks body scroll while open and cleans up on unmount.
 */
export default function DeleteModal({
    isOpen,
    onClose,
    onConfirm,
    isDeleting = false,
    itemName,
    title,
    description,
    deleteIconSrc = DEFAULT_DELETE_ICON,
    confirmLabel = "Delete",
    cancelLabel = "Cancel",
}: DeleteModalProps) {
    useEffect(() => {
        if (!isOpen) return;

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape" && !isDeleting) {
                onClose();
            }
        };

        document.addEventListener("keydown", handleKeyDown);
        document.body.classList.add("modal-open");
        const prevOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";

        return () => {
            document.removeEventListener("keydown", handleKeyDown);
            document.body.classList.remove("modal-open");
            document.body.style.overflow = prevOverflow;
        };
    }, [isOpen, isDeleting, onClose]);

    if (!isOpen) return null;

    const handleBackdropClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget && !isDeleting) {
            onClose();
        }
    };

    const resolvedTitle =
        title ??
        (itemName
            ? `Are you sure you want to delete ${itemName}?`
            : "Are you sure you want to delete this?");

    const resolvedDescription =
        description ??
        "This action is permanent and cannot be undone. All associated data, and account details will be permanently removed from MiSzn.";

    return (
        <>
            <div
                className="modal fade show"
                tabIndex={-1}
                role="dialog"
                aria-modal="true"
                aria-labelledby="deleteModalLabel"
                style={{ display: "block" }}
                onClick={handleBackdropClick}
            >
                <div className="modal-dialog modal-delete-dialog modal-dialog-centered">
                    <div className="modal-content modal-content-delete text-center">
                        <div className="modal-body modal-body-success flex flex-col items-center">
                            <div>
                                <img
                                    src={deleteIconSrc}
                                    alt=""
                                    width={56}
                                    height={56}
                                />
                            </div>

                            <div className="flex flex-col gap-2">
                                <h4
                                    id="deleteModalLabel"
                                    className="title-ex-small text-neutral-900"
                                >
                                    {resolvedTitle}
                                </h4>
                                <p className="body-md text-neutral-700">
                                    {resolvedDescription}
                                </p>
                            </div>

                            <div className="flex flex-col w-full gap-3">
                                <button
                                    type="button"
                                    className="btns btn-gaints btns-primary text-btn-500 w-full flex justify-center items-center"
                                    onClick={onConfirm}
                                    disabled={isDeleting}
                                >
                                    {isDeleting
                                        ? `${confirmLabel}…`
                                        : confirmLabel}
                                </button>
                                <button
                                    type="button"
                                    className="btns btn-gaints btns-secondary text-btn-500 w-full flex justify-center items-center"
                                    onClick={onClose}
                                    disabled={isDeleting}
                                >
                                    {cancelLabel}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div
                className="modal-backdrop fade show"
                aria-hidden="true"
                onClick={isDeleting ? undefined : onClose}
            />
        </>
    );
}
