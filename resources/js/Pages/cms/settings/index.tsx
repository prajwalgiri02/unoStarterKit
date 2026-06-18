import CmsLayout from "@/layouts/cms-layout";
import { useState, useEffect } from "react";
import ProfileDetails from "./components/ProfileDetails";
import EditProfileForm from "./components/EditProfileForm";
import { usePage } from "@inertiajs/react";

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

const SettingsLayout = ({ children }: { children: React.ReactNode }) => {
    const { url } = usePage();
    const parts = url.split("/").filter(Boolean);
    const lastPart = parts[parts.length - 1];
    const label =
        lastPart === "settings"
            ? "Settings"
            : lastPart.charAt(0).toUpperCase() +
              lastPart.slice(1).replace(/-/g, " ");

    return (
        <CmsLayout
            headerLabel={label}
            showSearchBar={false}
            showActionButton={false}
            showNotificationButton={true}
            wrapperClass="legal-help-content-wrapper"
        >
            {children}
        </CmsLayout>
    );
};

Settings.layout = (page: React.ReactNode) => <SettingsLayout>{page}</SettingsLayout>;

export default Settings;
