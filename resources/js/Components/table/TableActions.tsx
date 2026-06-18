import DeleteModal from "@/components/modals/DeleteModal";
import type { PageProps } from "@/types/index";
import { router, usePage } from "@inertiajs/react";
import { useState } from "react";

export type TableActionsProps = {
    /**
     * When provided the **Edit** button is shown.
     * The component navigates to this path when clicked.
     */
    editPath?: string;
    /**
     * When provided the **View** button is shown.
     * The component navigates to this path when clicked.
     */
    viewPath?: string;
    /**
     * When provided the **Delete** button and confirmation modal are shown.
     * The component calls `router.delete(deletePath)` internally on confirm.
     */
    deletePath?: string;
    /**
     * The item name shown in the delete modal:
     * "Are you sure you want to delete {itemName}?"
     */
    itemName?: string;
    /** Class for the wrapping div. Defaults to "phase-actions". */
    className?: string;
};

/**
 * Self-contained row action buttons for data tables.
 *
 * - Icon paths and asset base URL are resolved internally via `usePage`.
 * - Navigation (edit / view) is handled internally — just pass a path string.
 * - The delete confirmation modal state is fully managed inside this component.
 *   The page only needs to supply the actual delete request logic via `onDelete`.
 *
 * Which buttons appear is determined entirely by which props you provide:
 * - `editPath`  → Edit button visible
 * - `viewPath`  → View button visible
 * - `onDelete`  → Delete button + modal visible
 *
 * Usage:
 * ```tsx
 * <TableActions
 *   editPath={`/cms/content/pillar/${row.id}/edit`}
 *   viewPath={`/cms/content/pillar/${row.id}`}
 *   itemName={row.origin_name}
 *   onDelete={({ onSuccess, onFinish }) =>
 *     router.delete(`/cms/content/pillar/${row.id}`, {
 *       preserveScroll: true,
 *       onSuccess,
 *       onFinish,
 *     })
 *   }
 * />
 * ```
 */
export default function TableActions({
    editPath,
    viewPath,
    deletePath,
    itemName,
    className = "phase-actions",
}: TableActionsProps) {
    const { props } = usePage<PageProps>();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const asset = (path: string) =>
        `${props.cms.assetBaseUrl}${path.replace(/^\/+/, "")}`;

    const handleConfirmDelete = () => {
        if (!deletePath) return;
        setIsDeleting(true);
        router.delete(deletePath, {
            preserveScroll: true,
            onSuccess: () => setIsModalOpen(false),
            onFinish: () => setIsDeleting(false),
        });
    };

    return (
        <>
            <div className={className}>
                {editPath && (
                    <button
                        type="button"
                        className="phase-action-btn edit"
                        title="Edit"
                        aria-label="Edit"
                        onClick={() => {
                            router.visit(editPath);
                        }}
                    >
                        <img src={asset("/icons/edit-notify.svg")} alt="Edit" />
                    </button>
                )}

                {viewPath && (
                    <button
                        type="button"
                        className="phase-action-btn view"
                        title="View"
                        aria-label="View"
                        onClick={() => {
                            router.visit(viewPath);
                        }}
                    >
                        <img src={asset("/icons/eye.svg")} alt="View" />
                    </button>
                )}

                {deletePath && (
                    <button
                        type="button"
                        className="phase-action-btn delete"
                        title="Delete"
                        aria-label="Delete"
                        onClick={() => setIsModalOpen(true)}
                    >
                        <img src={asset("/icons/delete-3.svg")} alt="Delete" />
                    </button>
                )}
            </div>

            {deletePath && (
                <DeleteModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onConfirm={handleConfirmDelete}
                    isDeleting={isDeleting}
                    itemName={itemName}
                />
            )}
        </>
    );
}
