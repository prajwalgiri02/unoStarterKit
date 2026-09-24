import Avatar from "@/Components/common/avatar";
import Toggle from "@/Components/inputs/toggle";
import type { UserCms } from "@/Pages/types/cms/user";

type UserProfileCardProps = {
    user: UserCms;
    onToggleBlock: () => void;
};

export default function UserProfileCard({ user, onToggleBlock }: UserProfileCardProps) {
    return (
        <section className="flex flex-wrap items-center justify-between gap-4 rounded-[20px] border border-neutral-200 bg-base-white px-5 py-4">
            <div className="flex min-w-0 items-center gap-3">
                <Avatar name={user.name} src={user.avatar} size="xlarge" />
                <div className="flex min-w-0 flex-col gap-0.5">
                    <p className="text-subtitle-sm text-neutral-900">{user.name}</p>
                    <div className="flex flex-col gap-0.5 py-1">
                        <span className="text-link-sm font-normal text-neutral-500">Email</span>
                        <span className="truncate text-body-xs text-neutral-900">{user.email}</span>
                    </div>
                </div>
            </div>
            <Toggle
                label={<span className="text-body-lg text-neutral-600">Block User</span>}
                labelPosition="start"
                checked={user.is_blocked}
                onChange={onToggleBlock}
            />
        </section>
    );
}
