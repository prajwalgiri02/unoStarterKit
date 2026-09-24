import Button from "@/Components/buttons/button";
import OtpInput from "@/Components/inputs/otp-input";
import AuthLayout from "@/Layouts/auth-layout";
import { formatCountdown, secondsUntil } from "@/lib/helper";
import { Form, router, usePage } from "@inertiajs/react";
import { useCallback, useEffect, useState } from "react";

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
    otpLength: number;
};

const VerifyOTP = () => {
    const { otp, email, token, otpLength } = usePage<VerifyOtpPageProps>().props;
    const [otpValue, setOtpValue] = useState("");
    const [secondsLeft, setSecondsLeft] = useState(() =>
        otp ? secondsUntil(otp.expiresAt) : 0,
    );
    const [resendProcessing, setResendProcessing] = useState(false);
    const [errorSuppressed, setErrorSuppressed] = useState(false);

    const handleOtpChange = (val: string) => {
        setOtpValue(val);
        setErrorSuppressed(true);
    };

    useEffect(() => {
        if (!otp?.expiresAt) return;
        const tick = () => setSecondsLeft(secondsUntil(otp.expiresAt));
        tick();
        const id = window.setInterval(tick, 1000);
        return () => window.clearInterval(id);
    }, [otp?.expiresAt]);

    const canResend = secondsLeft <= 0 && !resendProcessing;

    const handleResend = useCallback(() => {
        if (!canResend) return;
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

    return (
        <Form
            id="verifyCodeForm"
            action={`/cms/forgot-password/verify/${token}`}
            method="post"
            disableWhileProcessing
            onError={() => setErrorSuppressed(false)}
            className="flex flex-col gap-6"
        >
            {({ processing, errors }) => {
                const showError = !!errors.otp && !errorSuppressed;

                return (
                    <>
                        <input type="hidden" name="otp" value={otpValue} />

                        <div className="flex flex-col gap-2">
                            <OtpInput
                                length={otpLength}
                                value={otpValue}
                                onChange={handleOtpChange}
                                hasError={showError}
                                disabled={processing}
                            />
                            {showError && (
                                <p className="text-center text-link-sm font-normal text-error-500">
                                    {errors.otp}
                                </p>
                            )}
                        </div>

                        <p className="text-center text-body-md text-neutral-600">
                            {resendProcessing ? (
                                "Sending new code..."
                            ) : secondsLeft > 0 ? (
                                <>
                                    Resend code in{" "}
                                    <span className="font-semibold text-primary-500">
                                        {formatCountdown(secondsLeft)}
                                    </span>
                                </>
                            ) : (
                                <>
                                    Didn&apos;t receive a code?{" "}
                                    <button
                                        type="button"
                                        onClick={handleResend}
                                        className="cursor-pointer font-semibold text-primary-500 transition-colors hover:text-primary-700"
                                    >
                                        Resend
                                    </button>
                                </>
                            )}
                        </p>

                        <Button
                            type="submit"
                            disabled={processing || otpValue.length < otpLength}
                            className="w-full"
                        >
                            {processing ? "Confirming..." : "Confirm"}
                        </Button>
                    </>
                );
            }}
        </Form>
    );
};

const VerifyOTPLayout = ({ children }: { children: React.ReactNode }) => {
    const { email } = usePage<VerifyOtpPageProps>().props;

    return (
        <AuthLayout
            title="Enter Code"
            description={
                <>
                    Please enter the code we&apos;ve sent to{" "}
                    <strong className="font-semibold text-neutral-900">
                        {email ?? "your email"}
                    </strong>
                </>
            }
            backHref="/cms/login"
            wide
        >
            {children}
        </AuthLayout>
    );
};

VerifyOTP.layout = (page: React.ReactNode) => (
    <VerifyOTPLayout>{page}</VerifyOTPLayout>
);

export default VerifyOTP;
