import type { SettingsUser as User } from "@/types/cms/settings";

interface ProfileDetailsProps {
    user: User;
    onEdit: () => void;
}

export default function ProfileDetails({ user, onEdit }: ProfileDetailsProps) {
    const getInitials = (name: string) => {
        return name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);
    };

    return (
        <div className="legal-content-card settings-card">
            <div className="legal-card-content d-flex flex-column gap-4">
                <div className="d-flex align-items-center justify-content-between">
                    <h2 className="subtitle-md">Profile</h2>
                    <button
                        type="button"
                        className="btns btn-medium btns-secondary"
                        onClick={onEdit}
                    >
                        Edit Profile
                    </button>
                </div>
                <div className="d-flex flex-column flex-md-row gap-3 align-items-center">
                    <div className="user-details-avatar user-settings text-white subtitle-md">
                        {getInitials(user.name)}
                    </div>
                    <div className="d-flex gap-2 flex-column">
                        <p className="subtitle-xs">{user.name}</p>
                        <div className="body-xs">{user.email}</div>
                    </div>
                </div>
                <div className="row g-4">
                    <div className="col-md-4 col-12">
                        <label className="body-xs text-neutral-600 mb-1">
                            Full Name
                        </label>
                        <p className="body-md text-neutral-900">{user.name}</p>
                        <div className="border-bottom border-neutral-200 mt-2"></div>
                    </div>
                    <div className="col-md-5 col-12">
                        <label className="body-xs text-neutral-600 mb-1">
                            Email
                        </label>
                        <p className="body-md text-neutral-900">{user.email}</p>
                        <div className="border-bottom border-neutral-200 mt-2"></div>
                    </div>
                    <div className="col-md-4 col-12">
                        <label className="body-xs text-neutral-600 mb-1">
                            Password
                        </label>
                        <p className="body-md text-neutral-900">************</p>
                        <div className="border-bottom border-neutral-200 mt-2"></div>
                    </div>
                </div>
            </div>
        </div>
    );
}
