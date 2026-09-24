import Button from "@/Components/buttons/button";
import Avatar from "@/Components/common/avatar";
import Card from "@/Components/common/card";
import DetailField from "@/Components/common/detail-field";
import Input from "@/Components/inputs/input";
import OtpModal from "@/Components/modals/otp-modal";
import AppLayout from "@/Layouts/app-layout";
import type { SettingsPageProps, SettingsUser } from "@/Pages/types/cms/settings";
import { router, useForm } from "@inertiajs/react";
import { useEffect, useState, type FormEvent } from "react";

type OtpState = { token: string; email: string };

function ProfileHeading({ user }: { user: SettingsUser }) {
    return (
        <div className="flex items-center gap-4">
            <Avatar name={user.name} size="large" />
            <div className="flex min-w-0 flex-col gap-2">
                <p className="truncate text-subtitle-lg font-medium text-neutral-800">{user.name}</p>
                <p className="truncate text-body-md text-neutral-500">{user.email}</p>
            </div>
        </div>
    );
}

function Settings({ user }: SettingsPageProps) {
    const [editing, setEditing] = useState(false);
    const [otp, setOtp] = useState<OtpState | null>(null);
    const [secondsLeft, setSecondsLeft] = useState(0);
    const [otpError, setOtpError] = useState<string>();
    const [verifying, setVerifying] = useState(false);
    const [resending, setResending] = useState(false);

    const { data, setData, put, processing, errors, reset, clearErrors } = useForm({
        name: user.name,
        email: user.email,
        password: "",
        password_confirmation: "",
    });

    useEffect(() => {
        if (secondsLeft <= 0) return;
        const timer = window.setInterval(() => setSecondsLeft((s) => Math.max(0, s - 1)), 1000);
        return () => window.clearInterval(timer);
    }, [secondsLeft]);

    const cancel = () => {
        reset();
        clearErrors();
        setEditing(false);
    };

    const submit = (e: FormEvent) => {
        e.preventDefault();
        put("/cms/settings", {
            preserveScroll: true,
            onSuccess: (page) => {
                const next = page.props.flash as SettingsPageProps["flash"] & { otp_token?: string };
                if (next?.otp_required && next.otp_token) {
                    setOtp({ token: next.otp_token, email: next.new_email ?? data.email });
                    setSecondsLeft(next.seconds_remaining ?? 120);
                    setOtpError(undefined);
                } else {
                    setEditing(false);
                    reset("password", "password_confirmation");
                }
            },
        });
    };

    const verify = (code: string) => {
        if (!otp) return;
        setVerifying(true);
        setOtpError(undefined);
        router.post(`/cms/settings/verify/${otp.token}`, { otp: code }, {
            preserveScroll: true,
            onSuccess: () => {
                setOtp(null);
                setEditing(false);
            },
            onError: (errs) => setOtpError(errs.otp ?? Object.values(errs)[0]),
            onFinish: () => setVerifying(false),
        });
    };

    const resend = () => {
        if (!otp) return;
        setResending(true);
        router.post(`/cms/settings/resend/${otp.token}`, {}, {
            preserveScroll: true,
            onSuccess: () => setSecondsLeft(120),
            onFinish: () => setResending(false),
        });
    };

    if (!editing) {
        return (
            <Card
                title="Profile"
                actions={
                    <Button size="medium" onClick={() => setEditing(true)}>
                        Edit Details
                    </Button>
                }
            >
                <div className="flex max-w-3xl flex-col gap-6">
                    <ProfileHeading user={user} />
                    <dl className="grid grid-cols-1 gap-5 md:grid-cols-2">
                        <DetailField label="Full Name">{user.name}</DetailField>
                        <DetailField label="Email">{user.email}</DetailField>
                        <DetailField label="Password">••••••••••••</DetailField>
                    </dl>
                </div>
            </Card>
        );
    }

    return (
        <Card title="Profile">
            <form onSubmit={submit} className="flex max-w-3xl flex-col gap-6">
                <ProfileHeading user={user} />
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                    <Input
                        label="Full Name"
                        name="name"
                        value={data.name}
                        onChange={(e) => setData("name", e.target.value)}
                        error={errors.name}
                        autoComplete="name"
                    />
                    <Input
                        label="Email"
                        type="email"
                        name="email"
                        value={data.email}
                        onChange={(e) => setData("email", e.target.value)}
                        error={errors.email}
                        autoComplete="email"
                    />
                </div>
                <h3 className="text-subtitle-lg font-medium text-neutral-800">Change Password</h3>
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                    <Input
                        label="New Password"
                        type="password"
                        name="password"
                        size="medium"
                        value={data.password}
                        onChange={(e) => setData("password", e.target.value)}
                        error={errors.password}
                        autoComplete="new-password"
                    />
                    <Input
                        label="Confirm New Password"
                        type="password"
                        name="password_confirmation"
                        size="medium"
                        value={data.password_confirmation}
                        onChange={(e) => setData("password_confirmation", e.target.value)}
                        error={errors.password_confirmation}
                        autoComplete="new-password"
                    />
                </div>
                <div className="flex flex-wrap gap-5">
                    <Button type="submit" disabled={processing}>
                        {processing ? "Saving..." : "Save Changes"}
                    </Button>
                    <Button variant="outline" onClick={cancel} disabled={processing}>
                        Cancel
                    </Button>
                </div>
            </form>

            {otp && (
                <OtpModal
                    open
                    email={otp.email}
                    secondsLeft={secondsLeft}
                    error={otpError}
                    processing={verifying}
                    resending={resending}
                    onVerify={verify}
                    onResend={resend}
                    onClose={() => setOtp(null)}
                />
            )}
        </Card>
    );
}

Settings.layout = (page: React.ReactNode) => <AppLayout title="Settings">{page}</AppLayout>;

export default Settings;
