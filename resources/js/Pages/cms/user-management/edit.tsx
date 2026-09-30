import Button from "@/Components/buttons/button";
import BackLink from "@/Components/common/back-link";
import Input from "@/Components/inputs/input";
import UserProfileCard from "@/Components/users/user-profile-card";
import AppLayout from "@/Layouts/app-layout";
import type { UserDetailPageProps } from "@/Pages/types/cms/user";
import { router } from "@inertiajs/react";
import useFieldForm from "@/lib/use-field-form";
import type { FormEvent } from "react";

function UserEdit({ user: { data: user } }: UserDetailPageProps) {
    const { data, setField, put, processing, errors } = useFieldForm({
        name: user.name,
        email: user.email,
        password: "",
        password_confirmation: "",
    });

    const submit = (e: FormEvent) => {
        e.preventDefault();
        put(`/cms/user-manager/${user.id}`, { preserveScroll: true });
    };

    const toggleBlock = () => {
        router.post(`/cms/user-manager/${user.id}/toggle-block`, {}, { preserveScroll: true });
    };

    return (
        <div className="flex flex-col gap-8">
            <div className="flex flex-col gap-6">
                <BackLink href={`/cms/user-manager/${user.id}`}>User Details</BackLink>
                <UserProfileCard user={user} onToggleBlock={toggleBlock} />
            </div>

            <form onSubmit={submit} className="flex max-w-3xl flex-col gap-8">
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                    <Input
                        label="Full Name"
                        name="name"
                        value={data.name}
                        onChange={(e) => setField("name", e.target.value)}
                        error={errors.name}
                        autoComplete="name"
                    />
                    <Input
                        label="Email Address"
                        type="email"
                        name="email"
                        value={data.email}
                        onChange={(e) => setField("email", e.target.value)}
                        error={errors.email}
                        autoComplete="email"
                    />
                    <Input
                        label="New Password"
                        type="password"
                        name="password"
                        placeholder="Leave blank to keep current"
                        value={data.password}
                        onChange={(e) => setField("password", e.target.value)}
                        error={errors.password}
                        autoComplete="new-password"
                    />
                    <Input
                        label="Confirm New Password"
                        type="password"
                        name="password_confirmation"
                        value={data.password_confirmation}
                        onChange={(e) => setField("password_confirmation", e.target.value)}
                        error={errors.password_confirmation}
                        autoComplete="new-password"
                    />
                </div>

                <div className="flex flex-wrap gap-5">
                    <Button type="submit" disabled={processing}>
                        {processing ? "Saving..." : "Save Changes"}
                    </Button>
                    <Button variant="outline" onClick={() => router.visit(`/cms/user-manager/${user.id}`)}>
                        Cancel
                    </Button>
                </div>
            </form>
        </div>
    );
}

UserEdit.layout = (page: React.ReactNode) => <AppLayout title="User Manager" pageTitle="Edit User">{page}</AppLayout>;

export default UserEdit;
