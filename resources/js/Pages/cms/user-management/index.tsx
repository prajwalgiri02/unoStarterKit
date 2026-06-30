import React, { useState } from "react";
import CmsLayout from "@/layouts/cms-layout";
import { router, Link } from "@inertiajs/react";
import Pagination from "@/components/table/Pagination";
import DeleteModal from "@/components/modals/DeleteModal";
import FilterRow from "@/components/common/FilterRow";

import type { UserCms, UserListPageProps } from "@/types/cms/user";
import type { UserFilterState } from "@/types/ui/filters";

function UserManagement({
    users,
    stats = {
        total_parents: 0,
        total_children: 0,
        active_users: 0,
        premium_users: 0,
    },
    phases = [],
    tiers = [],
    filters = { search: "" },
}: UserListPageProps) {
    const [userToDelete, setUserToDelete] = useState<UserCms | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = () => {
        if (!userToDelete) return;
        setIsDeleting(true);
        router.delete(`/cms/user-manager/${userToDelete.id}`, {
            onSuccess: () => {
                setUserToDelete(null);
                setIsDeleting(false);
            },
            onError: () => {
                setIsDeleting(false);
            },
        });
    };

    React.useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (!(event.target as Element).closest(".actions-btn")) {
                document
                    .querySelectorAll(".context-menu.active")
                    .forEach((m) => {
                        m.classList.remove("active");
                    });
            }
        };
        document.addEventListener("click", handleClickOutside);
        return () => document.removeEventListener("click", handleClickOutside);
    }, []);

    const updateFilters = (newFilters: Partial<UserFilterState>) => {
        const query = {
            ...filters,
            ...newFilters,
        };

        // Remove empty values
        Object.keys(query).forEach(
            (key) =>
                (query[key as keyof UserFilterState] === "" ||
                    query[key as keyof UserFilterState] === undefined) &&
                delete query[key as keyof UserFilterState],
        );

        router.get("/cms/user-manager", query, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    const handleSort = (column: string) => {
        let nextOrder: "asc" | "desc" | "" = "asc";
        if (filters.sort_by === column) {
            if (filters.sort_order === "asc") nextOrder = "desc";
            else if (filters.sort_order === "desc") nextOrder = "";
        }
        updateFilters({
            sort_by: nextOrder ? column : "",
            sort_order: nextOrder,
        });
    };

    const renderSortIcon = (column: string) => {
        if (filters.sort_by !== column) return null;
        return (
            <img
                src={
                    filters.sort_order === "asc"
                        ? "/icons/up.svg"
                        : "/icons/down.svg"
                }
                alt="sort"
                className="ms-1"
                style={{ width: "10px", height: "10px" }}
            />
        );
    };

    const phaseOptions = [
        { value: "", label: "Phase" },
        ...phases.map((p) => ({ value: p.id.toString(), label: p.name })),
    ];

    const tierOptions = [
        { value: "", label: "Tier" },
        ...tiers.map((t) => ({ value: t, label: t })),
    ];

    const ageGroupOptions = [
        { value: "", label: "Age Group" },
        ...Array.from(
            new Set(phases.map((p) => `${p.age_from}-${p.age_to}`)),
        ).map((range) => ({
            value: range,
            label: range,
        })),
    ];

    return (
        <>
            {/* Filter Row */}
            <FilterRow
                items={[
                    {
                        value: filters.phase_id || "",
                        onChange: (val) => updateFilters({ phase_id: val }),
                        options: phaseOptions,
                    },
                    {
                        value: filters.tier || "",
                        onChange: (val) => updateFilters({ tier: val }),
                        options: tierOptions,
                    },
                    {
                        value: filters.age_group || "",
                        onChange: (val) => updateFilters({ age_group: val }),
                        options: ageGroupOptions,
                    },
                ]}
            />

            {/* Stats Cards */}
            <div className="user-stats-grid">
                <div className="user-stat-card">
                    <span className="user-stat-label body-xs">
                        Total Parents
                    </span>
                    <span className="user-stat-value title-xs">
                        {stats.total_parents}
                    </span>
                </div>
                <div className="user-stat-card">
                    <span className="user-stat-label body-xs">
                        Total Children
                    </span>
                    <span className="user-stat-value title-xs">
                        {stats.total_children}
                    </span>
                </div>
                <div className="user-stat-card">
                    <span className="user-stat-label body-xs">
                        Active Users
                    </span>
                    <span className="user-stat-value title-xs">
                        {stats.active_users}
                    </span>
                </div>
                <div className="user-stat-card">
                    <span className="user-stat-label body-xs">
                        Premium Users
                    </span>
                    <span className="user-stat-value title-xs">
                        {stats.premium_users}
                    </span>
                </div>
            </div>

            {/* User Table Card */}
            <div className="user-table-card">
                <div className="user-table-content">
                    <div className="table-wrapper table-responsive">
                        <table className="user-table">
                            <thead>
                                <tr>
                                    <th>User</th>
                                    <th>Roles</th>
                                    <th>Approved</th>
                                    <th>Join Date</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.data.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={6}
                                            className="text-center py-4 text-muted"
                                        >
                                            No users found.
                                        </td>
                                    </tr>
                                ) : null}
                                {users.data.map((user) => (
                                    <tr key={user.id} data-id={user.id}>
                                        <td>
                                            <div className="user-cell">
                                                <div
                                                    className={`user-avatar ${["orange", "teal", "pink", "blue", "purple", "yellow"][user.id % 6]}`}
                                                >
                                                    {user.name
                                                        .split(" ")
                                                        .map((n) => n[0])
                                                        .join("")
                                                        .toUpperCase()
                                                        .substring(0, 2)}
                                                </div>
                                                <div className="user-info">
                                                    <div className="user-name body-xs">
                                                        {user.name}
                                                    </div>
                                                    <div className="user-email caption-md">
                                                        {user.email}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <span className="body-xs">
                                                {user.roles.join(", ")}
                                            </span>
                                        </td>
                                        <td>
                                            <span
                                                className={`subscription-badge link-sm ${user.is_approved ? "approved" : "pending"}`}
                                            >
                                                {user.is_approved
                                                    ? "Approved"
                                                    : "Pending"}
                                            </span>
                                        </td>
                                        <td className="date-cell body-xs">
                                            {new Date(
                                                user.created_at,
                                            ).toLocaleDateString()}
                                        </td>
                                        <td>
                                            <span
                                                className={`badge-tiny link-sm user-status-badge status-badge-sub ${user.is_blocked ? "blocked" : "active"}`}
                                            >
                                                {user.is_blocked
                                                    ? "Blocked"
                                                    : "Active"}
                                            </span>
                                        </td>
                                        <td className="actions-cell">
                                            <button
                                                className="actions-btn"
                                                data-id={user.id}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    const menu =
                                                        e.currentTarget
                                                            .nextElementSibling;
                                                    if (menu) {
                                                        menu.classList.toggle(
                                                            "active",
                                                        );
                                                    }
                                                    // Close other menus
                                                    document
                                                        .querySelectorAll(
                                                            ".context-menu.active",
                                                        )
                                                        .forEach((m) => {
                                                            if (m !== menu)
                                                                m.classList.remove(
                                                                    "active",
                                                                );
                                                        });
                                                }}
                                            >
                                                <img
                                                    src="/icons/three-dots.svg"
                                                    alt="Actions"
                                                    width="20"
                                                    height="20"
                                                />
                                            </button>
                                            <div className="context-menu">
                                                <Link
                                                    href={`/cms/user-manager/${user.id}`}
                                                    className="context-menu-item body-xs"
                                                    data-action="view"
                                                >
                                                    View Details
                                                </Link>
                                                <Link
                                                    href={`/cms/user-manager/${user.id}/edit`}
                                                    className="context-menu-item body-xs"
                                                    data-action="edit"
                                                >
                                                    Edit
                                                </Link>
                                                <a
                                                    href="#"
                                                    className="context-menu-item body-xs"
                                                    data-action="export"
                                                >
                                                    Export
                                                </a>
                                                <a
                                                    href="#"
                                                    className="context-menu-item body-xs"
                                                    data-action="delete"
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        setUserToDelete(user);
                                                    }}
                                                >
                                                    Delete
                                                </a>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* <Pagination
                        links={users.meta.links}
                        meta={users.meta}
                        onPerPageChange={(val) =>
                            updateFilters({ per_page: val.toString() })
                        }
                    /> */}
                </div>
            </div>

            <DeleteModal
                isOpen={!!userToDelete}
                onClose={() => setUserToDelete(null)}
                onConfirm={handleDelete}
                isDeleting={isDeleting}
                title="Are you sure you want to delete this User?"
                confirmLabel="Delete User"
            />
        </>
    );
}

UserManagement.layout = (page: React.ReactNode) => (
    <CmsLayout
        headerLabel="User Management"
        showSearchBar={true}
        showActionButton={false}
        showNotificationButton={true}
        wrapperClass="user-management-content-wrapper"
    >
        {page}
    </CmsLayout>
);

export default UserManagement;
