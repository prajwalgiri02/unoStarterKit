import type { SettingsUser as User } from "@/Pages/types/cms/settings";

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
        <div className="bg-white rounded-xl shadow-sm border border-neutral-200">
            <div className="p-6 flex flex-column gap-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-neutral-900">
                        Profile
                    </h2>
                    <button
                        type="button"
                        className="px-4 py-2 bg-neutral-100 text-neutral-700 rounded-lg font-medium hover:bg-neutral-200 transition-colors"
                        onClick={onEdit}
                    >
                        Edit Profile
                    </button>
                </div>
                <div className="flex flex-col md:flex-row gap-4 items-center">
                    <div className="w-16 h-16 rounded-full bg-primary-500 flex items-center justify-center text-white text-xl font-bold">
                        {getInitials(user.name)}
                    </div>
                    <div className="flex flex-col gap-1 text-center md:text-left">
                        <p className="text-lg font-semibold text-neutral-900">
                            {user.name}
                        </p>
                        <div className="text-sm text-neutral-500">
                            {user.email}
                        </div>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-medium text-neutral-500 uppercase tracking-wider">
                            Full Name
                        </label>
                        <p className="text-base text-neutral-900 font-medium">
                            {user.name}
                        </p>
                        <div className="h-px bg-neutral-100 w-full mt-1"></div>
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-medium text-neutral-500 uppercase tracking-wider">
                            Email
                        </label>
                        <p className="text-base text-neutral-900 font-medium">
                            {user.email}
                        </p>
                        <div className="h-px bg-neutral-100 w-full mt-1"></div>
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-medium text-neutral-500 uppercase tracking-wider">
                            Password
                        </label>
                        <p className="text-base text-neutral-900 font-medium">
                            ************
                        </p>
                        <div className="h-px bg-neutral-100 w-full mt-1"></div>
                    </div>
                </div>
            </div>
        </div>
    );
}
