import Badge from "@/Components/badges/badge";
import Button from "@/Components/buttons/button";
import BackLink from "@/Components/common/back-link";
import DetailField from "@/Components/common/detail-field";
import Alert from "@/Components/feedback/alert";
import ConfirmModal from "@/Components/modals/confirm-modal";
import UserProfileCard from "@/Components/users/user-profile-card";
import AppLayout from "@/Layouts/app-layout";
import { formatDate } from "@/lib/helper";
import type { UserDetailPageProps } from "@/Pages/types/cms/user";
import { router } from "@inertiajs/react";
import { useState } from "react";

type Confirmation = "block" | "delete" | null;

function UserView({ user: { data: user } }: UserDetailPageProps) {
    const [confirmation, setConfirmation] = useState<Confirmation>(null);
    const [processing, setProcessing] = useState(false);

    const toggleBlock = () => {
        setProcessing(true);
        router.post(`/cms/user-manager/${user.id}/toggle-block`, {}, {
            preserveScroll: true,
            onSuccess: () => setConfirmation(null),
            onFinish: () => setProcessing(false),
        });
    };

    const deleteUser = () => {
        setProcessing(true);
        router.delete(`/cms/user-manager/${user.id}`, {
            onFinish: () => setProcessing(false),
        });
    };

    const approve = () => {
        router.post(`/cms/admin/users/${user.id}/approve`, {}, { preserveScroll: true });
    };

    return (
        <div className="flex flex-col gap-8">
            <div className="flex flex-col gap-6">
                <BackLink href="/cms/user-manager">User Details</BackLink>
                <UserProfileCard
                    user={user}
                    onToggleBlock={() => (user.is_blocked ? toggleBlock() : setConfirmation("block"))}
                />
            </div>

            {!user.is_approved && (
                <Alert
                    tone="info"
                    title="User Pending Verification"
                    actions={
                        <Button size="medium" onClick={approve}>
                            Approve
                        </Button>
                    }
                >
                    This user is waiting for approval before they can use the platform.
                </Alert>
            )}

            <dl className="grid max-w-3xl grid-cols-1 gap-5 md:grid-cols-2">
                <DetailField label="Full Name">{user.name}</DetailField>
                <DetailField label="Email Address">{user.email}</DetailField>
                <DetailField label="Phone Number">{user.phone ?? "—"}</DetailField>
                <DetailField label="Location">{user.location ?? "—"}</DetailField>
                <DetailField label="Status">
                    <Badge size="tiny" variant="soft" color={user.is_blocked ? "error" : "success"}>
                        {user.is_blocked ? "Blocked" : "Active"}
                    </Badge>
                </DetailField>
                <DetailField label="Verification">
                    <Badge size="tiny" variant="soft" color={user.is_approved ? "success" : "warning"}>
                        {user.is_approved ? "Verified" : "Pending"}
                    </Badge>
                </DetailField>
                <DetailField label="Subscription">{user.subscription_type ?? "—"}</DetailField>
                <DetailField label="Join Date">{formatDate(user.created_at)}</DetailField>
            </dl>

            <div className="flex flex-wrap gap-5">
                <Button onClick={() => router.visit(`/cms/user-manager/${user.id}/edit`)}>Edit User Details</Button>
                <Button variant="outline" tone="danger" onClick={() => setConfirmation("delete")}>
                    Delete User
                </Button>
            </div>

            <ConfirmModal
                open={confirmation === "block"}
                onClose={() => setConfirmation(null)}
                onConfirm={toggleBlock}
                processing={processing}
                title={`Block ${user.name}?`}
                description="Please confirm you want to suspend this user account. Suspended users will be unable to log in, place new requests, or access key platform features until reactivated by admin."
                warning="This action will immediately restrict the user’s access to the platform and may impact any active or pending activity."
                confirmLabel="Block User"
            />

            <ConfirmModal
                open={confirmation === "delete"}
                onClose={() => setConfirmation(null)}
                onConfirm={deleteUser}
                processing={processing}
                title={`Delete ${user.name}?`}
                description="Please confirm you want to permanently delete this user account from the platform."
                warning="This action will affect the user’s account access, profile data and platform history."
                confirmLabel="Delete User"
            />
        </div>
    );
}

UserView.layout = (page: React.ReactNode) => <AppLayout title="User Manager" pageTitle="User Details">{page}</AppLayout>;

export default UserView;
