import { useForm, router } from "@inertiajs/react";
import TextInput from "@/components/inputs/text-input";
import EmailInput from "@/components/inputs/email-input";
import PasswordInput from "@/components/inputs/password-input";
import PrimaryButton from "@/components/buttons/primary-button";
import ConfirmationAccountModal from "./ConfirmationAccountModal";
import ConfirmOldPasswordModal from "./ConfirmOldPasswordModal";
import { useState, useEffect } from "react";
import { z } from "zod";

const profileSchema = z
    .object({
        name: z
            .string()
            .min(1, "Name is required")
            .max(255, "Name is too long"),
        email: z
            .string()
            .min(1, "Email is required")
            .email("Invalid email format")
            .max(255, "Email is too long"),
        password: z.string().optional().or(z.literal("")),
        password_confirmation: z.string().optional().or(z.literal("")),
        old_password: z.string().optional(),
    })
    .refine(
        (data) => {
            if (data.password && data.password.length > 0) {
                return data.password.length >= 8;
            }
            return true;
        },
        {
            message: "Password must be at least 8 characters",
            path: ["password"],
        },
    )
    .refine(
        (data) => {
            if (data.password && data.password.length > 0) {
                return data.password === data.password_confirmation;
            }
            return true;
        },
        {
            message: "Passwords do not match",
            path: ["password_confirmation"],
        },
    )
    .refine(
        (data) => {
            if (
                data.password &&
                data.password.length > 0 &&
                data.old_password
            ) {
                return data.password !== data.old_password;
            }
            return true;
        },
        {
            message: "Same old password cannot be used",
            path: ["password"],
        },
    );

import type { SettingsUser as User } from "@/types/cms/settings";

interface EditProfileFormProps {
    user: User;
    onCancel: () => void;
}

export default function EditProfileForm({
    user,
    onCancel,
}: EditProfileFormProps) {
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [showOldPasswordModal, setShowOldPasswordModal] = useState(false);
    const [pendingEmail, setPendingEmail] = useState("");
    const [timeLeft, setTimeLeft] = useState(0);

    const {
        data,
        setData,
        put,
        processing,
        errors,
        reset,
        clearErrors,
        setError,
    } = useForm({
        name: user.name,
        email: user.email,
        password: "",
        password_confirmation: "",
        old_password: "",
    });

    // Background timer for OTP cooldown
    useEffect(() => {
        if (timeLeft > 0) {
            const timer = setInterval(() => {
                setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
            }, 1000);
            return () => clearInterval(timer);
        }
    }, [timeLeft]);

    const getInitials = (name: string) => {
        return name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);
    };

    const validate = () => {
        clearErrors();
        const result = profileSchema.safeParse(data);

        if (!result.success) {
            result.error.issues.forEach((issue) => {
                setError(issue.path[0] as any, issue.message);
            });

            // Close modal if the same password was used
            if (
                data.password &&
                data.old_password &&
                data.password === data.old_password
            ) {
                setShowOldPasswordModal(false);
                setData("old_password", "");
            }

            return false;
        }
        return true;
    };

    const handleSubmit = (e?: React.FormEvent) => {
        e?.preventDefault();

        if (!validate()) return;

        // If password is being changed and we haven't asked for old password yet
        if (data.password && !data.old_password && !showOldPasswordModal) {
            setShowOldPasswordModal(true);
            return;
        }

        put("/cms/settings", {
            preserveScroll: true,
            onSuccess: (page) => {
                const flash = page.props.flash as any;
                if (flash?.otp_required) {
                    setPendingEmail(flash.new_email);
                    // Only sync from server if our local timer is not already running.
                    // This preserves the background countdown when the user re-clicks Save.
                    if (timeLeft === 0) {
                        setTimeLeft(flash.seconds_remaining || 120);
                    }
                    setShowConfirmModal(true);
                } else {
                    onCancel();
                }
                setShowOldPasswordModal(false);
            },
        });
    };

    const handleConfirmOldPassword = (password: string) => {
        setData("old_password", password);
    };

    // Trigger submit when old_password is set from modal
    useEffect(() => {
        if (data.old_password && showOldPasswordModal) {
            handleSubmit();
        }
    }, [data.old_password]);

    return (
        <div className="legal-content-card">
            <div className="legal-card-content d-flex flex-column gap-4">
                <div className="d-flex align-items-center justify-content-between">
                    <h2 className="subtitle-md">Profile</h2>
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

                <form onSubmit={handleSubmit} className="legal-form">
                    <div className="row g-4">
                        <div className="col-md-6 col-12">
                            <TextInput
                                id="name"
                                name="name"
                                label="Full Name"
                                placeholder="Enter full name"
                                value={data.name}
                                onChange={(e) =>
                                    setData("name", e.target.value)
                                }
                                error={errors.name}
                            />
                        </div>
                        <div className="col-md-6 col-12">
                            <EmailInput
                                id="email"
                                name="email"
                                label="Email"
                                placeholder="Enter email"
                                value={data.email}
                                onChange={(e) =>
                                    setData("email", e.target.value)
                                }
                                error={errors.email}
                            />
                        </div>
                        <div className="col-12 p-0 m-0"></div>
                        <div className="col-12">
                            <span className="subtitle-xs">Change Password</span>
                        </div>
                        <div className="col-md-6 col-12">
                            <PasswordInput
                                id="password"
                                name="password"
                                label="Create New Password"
                                placeholder="Enter new password"
                                value={data.password}
                                onChange={(e) =>
                                    setData("password", e.target.value)
                                }
                                error={errors.password}
                            />
                        </div>
                        <div className="col-md-6 col-12">
                            <PasswordInput
                                id="password_confirmation"
                                name="password_confirmation"
                                label="Confirm New Password"
                                placeholder="Re-enter password"
                                value={data.password_confirmation}
                                onChange={(e) =>
                                    setData(
                                        "password_confirmation",
                                        e.target.value,
                                    )
                                }
                                error={errors.password_confirmation}
                            />
                        </div>
                    </div>
                    <div className="d-flex mt-4 gap-2">
                        <PrimaryButton
                            type="submit"
                            disabled={processing}
                            size="giant"
                        >
                            {processing ? "Saving..." : "Save Details"}
                        </PrimaryButton>
                        <button
                            type="button"
                            className="btns btn-gaints btns-secondary text-btn-500"
                            onClick={onCancel}
                            disabled={processing}
                        >
                            Cancel
                        </button>
                    </div>
                </form>

                {showOldPasswordModal && (
                    <ConfirmOldPasswordModal
                        onConfirm={(pwd) => {
                            setData("old_password", pwd);
                        }}
                        onClose={() => setShowOldPasswordModal(false)}
                        error={errors.old_password}
                    />
                )}

                {showConfirmModal && (
                    <ConfirmationAccountModal
                        email={pendingEmail}
                        timeLeft={timeLeft}
                        onResendSuccess={() => setTimeLeft(120)}
                        onClose={() => setShowConfirmModal(false)}
                    />
                )}
            </div>
        </div>
    );
}
