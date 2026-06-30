import React from "react";
import CmsLayout from "@/layouts/cms-layout";
import ComposeNotification from "@/components/cms/broadcast-notification/compose-notification";
import SentNotifications from "@/components/cms/broadcast-notification/sent-notifications";
import type { BroadcastNotificationPageProps } from "@/types/cms/notification";

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
