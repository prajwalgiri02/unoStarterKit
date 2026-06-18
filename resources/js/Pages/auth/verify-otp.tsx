import PrimaryButton from "@/components/buttons/primary-button";
import TextButton from "@/components/buttons/text-button";
import TextInput from "@/components/inputs/text-input";
import AuthLayout from "@/layouts/auth-layout";
import { Form, router, usePage } from "@inertiajs/react";
import { useCallback, useEffect, useState } from "react";
import { secondsUntil, formatCountdown } from "@/lib/helper";

export type OtpPayload = {
    requestReason: string;
    createdAt: string;
    updatedAt: string;
    expiresAt: string;
    verifiedAt: string | null;
};

type VerifyOtpPageProps = {
    otp: OtpPayload;
    email: string;
    token: string;
};

const VerifyOTP = () => {
    const { otp, email, token } = usePage<VerifyOtpPageProps>().props;
    const [secondsLeft, setSecondsLeft] = useState(() =>
        otp ? secondsUntil(otp.expiresAt) : 0,
    );
    const [resendProcessing, setResendProcessing] = useState(false);

    useEffect(() => {
        if (!otp?.expiresAt) return;
        const tick = () => setSecondsLeft(secondsUntil(otp.expiresAt));
        tick();
        const id = window.setInterval(tick, 1000);
        return () => window.clearInterval(id);
    }, [otp?.expiresAt]);

    const canResend = secondsLeft <= 0 && !resendProcessing;

    const handleResend = useCallback(() => {
        if (!canResend) {
            return;
        }
        setResendProcessing(true);
        router.post(
            `/cms/forgot-password/resend/${token}`,
            { email },
            {
                preserveScroll: true,
                onFinish: () => setResendProcessing(false),
            },
        );
    }, [canResend, email, token]);

    const resendDisabled = secondsLeft > 0 || resendProcessing;

    return (
        <Form
            id="verifyCodeForm"
            action={`/cms/forgot-password/verify/${token}`}
            method="post"
            validationTimeout={500}
            disableWhileProcessing
        >
            {({ processing }) => (
                <>
                    <input type="hidden" name="email" value={email} />
                    <div className="flex flex-col gap-4">
                        <TextInput
                            id="otp"
                            name="otp"
                            label="Code"
                            autoComplete="one-time-code"
                            placeholder="Enter code"
                        />
                    </div>
                    <p className="caption-md text-neutral-600 mt-2 mb-0">
                        {secondsLeft < 0 && (
                            <span className="text-neutral-700">
                                This code has expired. Resend a new code.
                            </span>
                        )}
                    </p>
                    <div className="flex flex-col gap-4 mt-10">
                        <PrimaryButton type="submit" disabled={processing}>
                            {processing ? "Verifying..." : "Verify"}
                        </PrimaryButton>

                        <p className="body-sm text-neutral-600 text-center mb-0">
                            Didn&apos;t receive a code?{" "}
                            <TextButton
                                type="button"
                                disabled={resendDisabled}
                                onClick={handleResend}
                                className={resendDisabled ? "opacity-50" : ""}
                                aria-label={
                                    secondsLeft > 0
                                        ? `Resend available in ${formatCountdown(secondsLeft)}`
                                        : "Resend code"
                                }
                            >
                                {resendProcessing
                                    ? "Sending..."
                                    : secondsLeft > 0
                                      ? `Resend in ${formatCountdown(secondsLeft)}`
                                      : "Resend code"}
                            </TextButton>
                        </p>
                    </div>
                </>
            )}
        </Form>
    );
};

VerifyOTP.layout = (page: React.ReactNode) => (
    <AuthLayout
        headerTitle="Verify Code"
        headerDescription="An authentication code has been sent to your email."
        goBack={true}
        goBackLabelText="Back to signin"
        goBackUrl="/cms/login"
    >
        {page}
    </AuthLayout>
);

export default VerifyOTP;
