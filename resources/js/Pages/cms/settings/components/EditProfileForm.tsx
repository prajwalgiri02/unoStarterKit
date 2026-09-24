import { useForm, router, usePage } from "@inertiajs/react";
import FormInput from "@/Components/inputs/email-input";
import Button from "@/Components/buttons/button";
import ConfirmationAccountModal from "./ConfirmationAccountModal";
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
    );

import type { SettingsUser as User } from "@/Pages/types/cms/settings";

interface EditProfileFormProps {
    user: User;
    onCancel: () => void;
}

export default function EditProfileForm({
    user,
    onCancel,
}: EditProfileFormProps) {
    const { url } = usePage();
    const basePath = url.split("?")[0];

    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [pendingEmail, setPendingEmail] = useState("");
    const [otpToken, setOtpToken] = useState("");
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
            return false;
        }
        return true;
    };

    const handleSubmit = (e?: React.FormEvent) => {
        e?.preventDefault();

        if (!validate()) return;

        put(basePath, {
            preserveScroll: true,
            onSuccess: (page) => {
                const flash = page.props.flash as any;
                if (flash?.otp_required) {
                    setPendingEmail(flash.new_email);
                    setOtpToken(flash.otp_token);
                    if (timeLeft === 0) {
                        setTimeLeft(flash.seconds_remaining || 120);
                    }
                    setShowConfirmModal(true);
                } else {
                    onCancel();
                }
            },
        });
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-neutral-200">
            <div className="p-6 flex flex-col gap-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-neutral-900">
                        Profile
                    </h2>
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

                <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

                    <div className="flex flex-col gap-4 pt-4 border-t border-neutral-100">
                        <span className="text-sm font-semibold text-neutral-900">
                            Change Password
                        </span>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FormInput
                                type="password"
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
                            <FormInput
                                type="password"
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

                    <div className="flex items-center gap-3 pt-4">
                        <Button
                            type="submit"
                            disabled={processing}
                            size="giant"
                            className="px-8"
                        >
                            {processing ? "Saving..." : "Save Details"}
                        </Button>
                        <button
                            type="button"
                            className="px-6 py-3 bg-neutral-100 text-neutral-700 rounded-lg font-medium hover:bg-neutral-200 transition-colors"
                            onClick={onCancel}
                            disabled={processing}
                        >
                            Cancel
                        </button>
                    </div>
                </form>

                {showConfirmModal && (
                    <ConfirmationAccountModal
                        email={pendingEmail}
                        token={otpToken}
                        timeLeft={timeLeft}
                        onResendSuccess={() => setTimeLeft(120)}
                        onClose={() => setShowConfirmModal(false)}
                    />
                )}
            </div>
        </div>
    );
}
