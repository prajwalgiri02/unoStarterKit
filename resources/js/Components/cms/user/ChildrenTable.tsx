import React, { useState, useEffect } from "react";
import { Link, router } from "@inertiajs/react";
import DeleteModal from "@/components/modals/DeleteModal";

interface Child {
    id: number;
    name: string;
    age: number;
    phase: string;
    phase_colors: {
        primary: string;
        light: string;
        dark: string;
    } | null;
    waypoint: string;
    avatar: string;
    gender: string;
}

interface ChildrenTableProps {
    children: Child[];
}

const ChildrenTable = ({ children }: ChildrenTableProps) => {
    const [showActions, setShowActions] = useState<number | null>(null);
    const [childToDelete, setChildToDelete] = useState<Child | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = () => {
        if (!childToDelete) return;
        setIsDeleting(true);
        router.delete(`/cms/user/children/${childToDelete.id}`, {
            onSuccess: () => {
                setChildToDelete(null);
                setIsDeleting(false);
                setShowActions(null);
            },
            onError: () => {
                setIsDeleting(false);
            },
        });
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (!(event.target as HTMLElement).closest(".actions-cell")) {
                setShowActions(null);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () =>
            document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const toggleActions = (id: number) => {
        setShowActions(showActions === id ? null : id);
    };

    return (
        <>
            <div className="user-table-card settings-card user-details-card">
                <div className="user-table-content">
                    <div className="table-wrapper table-responsive">
                        <table className="user-table">
                            <thead>
                                <tr>
                                    <th>Child Name</th>
                                    <th>Age</th>
                                    <th>Illumination Phase</th>
                                    <th>Waypoint</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {children.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={5}
                                            className="text-center py-4 text-muted"
                                        >
                                            No children associated.
                                        </td>
                                    </tr>
                                ) : (
                                    children.map((child) => (
                                        <tr key={child.id} data-id={child.id}>
                                            <td>
                                                <div className="user-cell">
                                                    <div
                                                        className={`user-avatar ${
                                                            child.gender.toLowerCase() ===
                                                            "female"
                                                                ? "orange"
                                                                : "teal"
                                                        }`}
                                                    >
                                                        <img
                                                            src={child.avatar}
                                                            alt={child.name}
                                                            width="23"
                                                            height="23"
                                                        />
                                                    </div>
                                                    <div className="user-info">
                                                        <div className="user-name body-xs">
                                                            {child.name}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <span className="children-count body-xs">
                                                    {child.age}
                                                </span>
                                            </td>
                                            <td>
                                                <span
                                                    className={`subscription-badge subscription-badge-user link-sm ${child.phase.toLowerCase()}`}
                                                    style={
                                                        child.phase_colors
                                                            ? {
                                                                  backgroundColor:
                                                                      child
                                                                          .phase_colors
                                                                          .light,
                                                                  color: child
                                                                      .phase_colors
                                                                      .dark,
                                                              }
                                                            : {}
                                                    }
                                                >
                                                    {child.phase}
                                                </span>
                                            </td>
                                            <td className="date-cell body-xs">
                                                {child.waypoint}
                                            </td>
                                            <td className="actions-cell">
                                                <button
                                                    className="actions-btn"
                                                    data-id={child.id}
                                                    onClick={() =>
                                                        toggleActions(child.id)
                                                    }
                                                >
                                                    <img
                                                        src="/icons/three-dots.svg"
                                                        alt="Actions"
                                                        width="20"
                                                        height="20"
                                                    />
                                                </button>
                                                <div
                                                    className={`context-menu ${showActions === child.id ? "active" : ""}`}
                                                >
                                                    <Link
                                                        href={`/cms/user/children/${child.id}`}
                                                        className="context-menu-item body-xs"
                                                        data-action="view"
                                                    >
                                                        View Details
                                                    </Link>
                                                    <a
                                                        href="#"
                                                        className="context-menu-item body-xs"
                                                        data-action="delete"
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            setChildToDelete(
                                                                child,
                                                            );
                                                        }}
                                                    >
                                                        Delete
                                                    </a>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <DeleteModal
                isOpen={!!childToDelete}
                onClose={() => setChildToDelete(null)}
                onConfirm={handleDelete}
                isDeleting={isDeleting}
                title="Are you sure you want to delete this Child?"
                confirmLabel="Delete Child"
            />
        </>
    );
};

export default ChildrenTable;
