import CmsLayout from "@/layouts/cms-layout";
import { useState, useEffect } from "react";
import ProfileDetails from "./components/ProfileDetails";
import EditProfileForm from "./components/EditProfileForm";

import type {
    SettingsUser as User,
    SettingsPageProps as SettingsProps,
} from "@/types/cms/settings";

function Settings({ user, flash }: SettingsProps) {
    const [isEditing, setIsEditing] = useState(false);

    // Automatically exit edit mode when an update is successful
    useEffect(() => {
        if (flash.success && !flash.otp_required) {
            setIsEditing(false);
        }
    }, [flash.success, flash.otp_required]);

    return (
        <>
            {isEditing ? (
                <EditProfileForm
                    user={user}
                    onCancel={() => setIsEditing(false)}
                />
            ) : (
                <ProfileDetails user={user} onEdit={() => setIsEditing(true)} />
            )}
        </>
    );
}

Settings.layout = (page: React.ReactNode) => (
    <CmsLayout
        headerLabel="Settings"
        showSearchBar={false}
        showActionButton={false}
        showNotificationButton={true}
        wrapperClass="legal-help-content-wrapper"
    >
        {page}
    </CmsLayout>
);

export default Settings;
