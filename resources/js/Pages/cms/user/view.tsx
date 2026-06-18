import React from "react";
import CmsLayout from "@/layouts/cms-layout";
import "../../../css/user-management.css";
import UserProfileCard from "@/components/cms/user/UserProfileCard";
import ChildrenTable from "@/components/cms/user/ChildrenTable";

import type { UserDetailPageProps } from "@/types/cms/user";

const UserView = ({ user: { data: user } }: UserDetailPageProps) => {
    return (
        <>
            <UserProfileCard
                name={user.name}
                email={user.email}
                status={user.status}
                tier={user.tier}
                onEdit={() => {}}
            />

            <div>
                <h1 className="subtitle-md text-neutral-900">
                    Children Associated
                </h1>
            </div>

            <ChildrenTable children={user.children} />
        </>
    );
};

UserView.layout = (page: React.ReactNode) => (
    <CmsLayout
        headerLabel="User Details"
        showSearchBar={true}
        showActionButton={false}
        showNotificationButton={true}
        backUrl="/cms/user"
        wrapperClass="user-management-content-wrapper"
    >
        {page}
    </CmsLayout>
);

export default UserView;
