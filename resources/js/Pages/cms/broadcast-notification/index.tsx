import React from "react";
import CmsLayout from "@/Layouts/cms-layout";
import ComposeNotification from "@/Components/cms/broadcast-notification/compose-notification";
import SentNotifications from "@/Components/cms/broadcast-notification/sent-notifications";
import type { BroadcastNotificationPageProps } from "@/Pages/types/cms/notification";

function BroadcastNotification({ notifications }: BroadcastNotificationPageProps) {
    return (
        <>
            <ComposeNotification />
            <SentNotifications notifications={notifications} />
        </>
    );
}

BroadcastNotification.layout = (page: React.ReactNode) => (
    <CmsLayout
        headerLabel="Broadcast Notification"
        showSearchBar={false}
        showNotificationButton={true}
        wrapperClass="legal-help-content-wrapper"
    >
        {page}
    </CmsLayout>
);

export default BroadcastNotification;
