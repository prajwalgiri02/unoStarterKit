import React from "react";
import CmsLayout from "@/Layouts/cms-layout";
import { useForm, Link } from "@inertiajs/react";
import FormInput from "@/Components/inputs/email-input";
import PrimaryButton from "@/Components/buttons/primary-button";

import type { UserCms } from "@/Pages/types/cms/user";

interface UserEditProps {
    user: UserCms;
}

function UserEdit({ user }: UserEditProps) {
    const { data, setData, put, processing, errors } = useForm({
        name: user.name,
        email: user.email,
        password: "",
        password_confirmation: "",
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/cms/user-manager/${user.id}`, {
            preserveScroll: true,
        });
    };

    return (
        <div className="legal-content-card">
            <div className="legal-card-content flex flex-col gap-6">
                <div className="flex items-center justify-between">
                    <h2 className="subtitle-md text-neutral-900">Edit User</h2>
                    <Link
                        href={`/cms/user-manager/${user.id}`}
                        className="body-xs text-neutral-500 hover:text-neutral-700"
                    >
                        Cancel
                    </Link>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormInput
                            id="name"
                            name="name"
                            label="Full Name"
                            placeholder="Enter full name"
                            value={data.name}
                            onChange={(e) => setData("name", e.target.value)}
                            error={errors.name}
                        />
                        <FormInput
                            type="email"
                            id="email"
                            name="email"
                            label="Email"
                            placeholder="Enter email"
                            value={data.email}
                            onChange={(e) => setData("email", e.target.value)}
                            error={errors.email}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormInput
                            type="password"
                            id="password"
                            name="password"
                            label="New Password"
                            placeholder="Leave blank to keep current"
                            value={data.password}
                            onChange={(e) =>
                                setData("password", e.target.value)
                            }
                            error={errors.password}
                        />
                        <FormInput
                            type="password"
                            id="password_confirmation"
                            name="password_confirmation"
                            label="Confirm New Password"
                            placeholder="Confirm new password"
                            value={data.password_confirmation}
                            onChange={(e) =>
                                setData("password_confirmation", e.target.value)
                            }
                            error={errors.password_confirmation}
                        />
                    </div>

                    <div className="flex items-center gap-3 pt-2">
                        <PrimaryButton
                            type="submit"
                            disabled={processing}
                            size="giant"
                        >
                            {processing ? "Saving..." : "Save Changes"}
                        </PrimaryButton>
                        <Link
                            href={`/cms/user-manager/${user.id}`}
                            className="btns btn-large btns-secondary"
                        >
                            Cancel
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
}

UserEdit.layout = (page: React.ReactNode) => (
    <CmsLayout
        headerLabel="Edit User"
        showSearchBar={false}
        showActionButton={false}
        showNotificationButton={true}
        backUrl="/cms/user-manager"
        wrapperClass="user-management-content-wrapper"
    >
        {page}
    </CmsLayout>
);

export default UserEdit;
