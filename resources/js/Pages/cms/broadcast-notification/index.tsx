import React from "react";
import CmsLayout from "@/layouts/cms-layout";
import ComposeNotification from "@/components/cms/broadcast-notification/compose-notification";
import SentNotifications from "@/components/cms/broadcast-notification/sent-notifications";

function BroadcastNotification() {
    return (
        <>
            <ComposeNotification />
            <SentNotifications />
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
