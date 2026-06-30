import React from "react";
import CmsLayout from "@/layouts/cms-layout";
import UserProfileCard from "@/components/cms/user/UserProfileCard";
import ChildrenTable from "@/components/cms/user/ChildrenTable";
import { Link } from "@inertiajs/react";

import type { UserCms } from "@/types/cms/user";

interface UserViewProps {
    user: UserCms;
}

const UserView = ({ user }: UserViewProps) => {
    return (
        <>
            <UserProfileCard
                name={user.name}
                email={user.email}
                status={user.is_blocked ? "Blocked" : "Active"}
                tier={user.roles.join(", ")}
                onEdit={() => {
                    window.location.href = `/cms/user-manager/${user.id}/edit`;
                }}
            />

            <div>
                <h1 className="subtitle-md text-neutral-900">
                    Children Associated
                </h1>
            </div>

            <ChildrenTable children={[]} />
        </>
    );
};

UserView.layout = (page: React.ReactNode) => (
    <CmsLayout
        headerLabel="User Details"
        showSearchBar={false}
        showActionButton={false}
        showNotificationButton={true}
        backUrl="/cms/user-manager"
        wrapperClass="user-management-content-wrapper"
    >
        {page}
    </CmsLayout>
);

export default UserView;
