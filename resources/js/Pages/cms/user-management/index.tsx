import Badge from "@/Components/badges/badge";
import Button from "@/Components/buttons/button";
import IconButton from "@/Components/buttons/icon-button";
import Avatar from "@/Components/common/avatar";
import Card from "@/Components/common/card";
import { ArrowDownIcon, EditIcon, TrashIcon } from "@/Components/icons";
import HeaderSearch from "@/Components/layouts/header-search";
import ConfirmModal from "@/Components/modals/confirm-modal";
import DataTable, { type Column } from "@/Components/table/data-table";
import Pagination from "@/Components/table/pagination";
import AppLayout from "@/Layouts/app-layout";
import type { UserCms, UserListPageProps } from "@/Pages/types/cms/user";
import { Link, router } from "@inertiajs/react";
import { useState } from "react";

function NameCell({ user }: { user: UserCms }) {
    return (
        <Link
            href={`/cms/user-manager/${user.id}`}
            className="flex items-center gap-3 rounded text-neutral-600 outline-none hover:text-primary-500 focus-visible:ring-[3px] focus-visible:ring-primary-50"
        >
            <Avatar name={user.name} src={user.avatar} />
            <span className="truncate">{user.name}</span>
        </Link>
    );
}

function ApprovalBadge({ approved }: { approved: boolean }) {
    return (
        <Badge size="tiny" variant="soft" color={approved ? "success" : "warning"}>
            {approved ? "Approved" : "Pending"}
        </Badge>
    );
}

function UserManagement({ users, pendingUsers }: UserListPageProps) {
    const [pendingOpen, setPendingOpen] = useState(true);
    const [userToDelete, setUserToDelete] = useState<UserCms | null>(null);
    const [deleting, setDeleting] = useState(false);

    const pending = pendingUsers.data;

    const approve = (user: UserCms) => {
        router.post(`/cms/admin/users/${user.id}/approve`, {}, { preserveScroll: true });
    };

    const confirmDelete = () => {
        if (!userToDelete) return;
        setDeleting(true);
        router.delete(`/cms/user-manager/${userToDelete.id}`, {
            preserveScroll: true,
            onSuccess: () => setUserToDelete(null),
            onFinish: () => setDeleting(false),
        });
    };

    const pendingColumns: Column<UserCms>[] = [
        { key: "name", header: "Name", render: (user) => <NameCell user={user} /> },
        { key: "location", header: "Location", render: (user) => user.location ?? "—" },
        { key: "approval", header: "Approval", render: () => <ApprovalBadge approved={false} /> },
        {
            key: "actions",
            header: "Actions",
            className: "w-32",
            render: (user) => (
                <Button size="tiny" onClick={() => approve(user)}>
                    Approve
                </Button>
            ),
        },
    ];

    const userColumns: Column<UserCms>[] = [
        { key: "name", header: "Name", render: (user) => <NameCell user={user} /> },
        { key: "location", header: "Location", render: (user) => user.location ?? "—" },
        { key: "approval", header: "Approval", render: (user) => <ApprovalBadge approved={user.is_approved} /> },
        {
            key: "status",
            header: "Status",
            render: (user) => (
                <Badge size="tiny" variant="soft" color={user.is_blocked ? "error" : "success"}>
                    {user.is_blocked ? "Blocked" : "Active"}
                </Badge>
            ),
        },
        {
            key: "action",
            header: "Action",
            className: "w-24",
            render: (user) => (
                <div className="flex items-center gap-1">
                    <IconButton label={`Edit ${user.name}`} onClick={() => router.visit(`/cms/user-manager/${user.id}/edit`)}>
                        <EditIcon />
                    </IconButton>
                    <IconButton label={`Delete ${user.name}`} tone="danger" onClick={() => setUserToDelete(user)}>
                        <TrashIcon />
                    </IconButton>
                </div>
            ),
        },
    ];

    return (
        <div className="flex flex-col gap-6">
            {pending.length > 0 && (
                <Card>
                    <button
                        type="button"
                        onClick={() => setPendingOpen((v) => !v)}
                        aria-expanded={pendingOpen}
                        className="flex w-fit cursor-pointer items-center gap-3 rounded-lg text-left outline-none focus-visible:ring-[3px] focus-visible:ring-primary-50"
                    >
                        <span className="text-subtitle-lg font-medium text-neutral-800">Users Pending Approval</span>
                        <span className="flex size-8 items-center justify-center rounded-full bg-primary-500 text-body-sm font-bold text-neutral-50">
                            {pending.length}
                        </span>
                        <ArrowDownIcon className={`size-6 text-primary-500 transition-transform ${pendingOpen ? "" : "-rotate-90"}`} />
                    </button>
                    {pendingOpen && (
                        <DataTable columns={pendingColumns} rows={pending} rowKey={(user) => user.id} caption="Users pending approval" />
                    )}
                </Card>
            )}

            <Card title="All Users">
                <DataTable columns={userColumns} rows={users.data} rowKey={(user) => user.id} caption="All users" emptyMessage="No users found" />
                {users.meta && (
                    <Pagination links={users.meta.links} from={users.meta.from} to={users.meta.to} total={users.meta.total} />
                )}
            </Card>

            <ConfirmModal
                open={userToDelete !== null}
                onClose={() => setUserToDelete(null)}
                onConfirm={confirmDelete}
                processing={deleting}
                title={`Delete ${userToDelete?.name ?? "user"}?`}
                description="Please confirm you want to permanently delete this user account from the platform."
                warning="This action will affect the user’s account access, profile data and platform history."
                confirmLabel="Delete User"
            />
        </div>
    );
}

UserManagement.layout = (page: React.ReactNode) => (
    <AppLayout title="User Manager" actions={<HeaderSearch placeholder="Search Users.." />}>
        {page}
    </AppLayout>
);

export default UserManagement;
