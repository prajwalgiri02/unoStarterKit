import Button from "@/Components/buttons/button";
import AuthLayout from "@/Layouts/auth-layout";
import { Form, router, usePage } from "@inertiajs/react";
import { useCallback, useEffect, useRef, useState } from "react";
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
    otpLength: number;
};

type OtpInputProps = {
    digitCount: number;
    value: string;
    onChange: (val: string) => void;
    hasError?: boolean;
};

const OtpInput = ({ digitCount, value, onChange, hasError }: OtpInputProps) => {
    const digits = Array.from({ length: digitCount }, (_, i) => value[i] ?? "");
    const refs = useRef<Array<HTMLInputElement | null>>([]);

    const focus = (index: number) => {
        refs.current[index]?.focus();
    };

    const handleChange = (index: number, char: string) => {
        if (!/^\d$/.test(char)) return;
        const next = digits.map((d, i) => (i === index ? char : d));
        onChange(next.join("").trimEnd());
        if (index < digitCount - 1) focus(index + 1);
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Backspace") {
            e.preventDefault();
            if (digits[index]) {
                const next = digits.map((d, i) => (i === index ? "" : d));
                onChange(next.join("").trimEnd());
            } else if (index > 0) {
                const next = digits.map((d, i) => (i === index - 1 ? "" : d));
                onChange(next.join("").trimEnd());
                focus(index - 1);
            }
        } else if (e.key === "ArrowLeft" && index > 0) {
            focus(index - 1);
        } else if (e.key === "ArrowRight" && index < digitCount - 1) {
            focus(index + 1);
        }
    };

    const handlePaste = (e: React.ClipboardEvent) => {
        e.preventDefault();
        const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, digitCount);
        onChange(pasted);
        focus(Math.min(pasted.length, digitCount - 1));
    };

    return (
        <div className="code-input-row" id="codeRow">
            {Array.from({ length: digitCount }, (_, i) => (
                <input
                    key={i}
                    ref={(el) => { refs.current[i] = el; }}
                    className={`code-input${hasError ? " is-error" : ""}`}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digits[i] ?? ""}
                    aria-label={`Digit ${i + 1}`}
                    onChange={(e) => handleChange(i, e.target.value.slice(-1))}
                    onKeyDown={(e) => handleKeyDown(i, e)}
                    onPaste={handlePaste}
                    onFocus={(e) => e.target.select()}
                />
            ))}
        </div>
    );
};

const VerifyOTP = () => {
    const { otp, email, token, otpLength } = usePage<VerifyOtpPageProps>().props;
    const [otpValue, setOtpValue] = useState("");
    const [secondsLeft, setSecondsLeft] = useState(() => (otp ? secondsUntil(otp.expiresAt) : 0));
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

    const resendDisabled = secondsLeft > 0 || resendProcessing;

    return (
        <Form
            id="verifyCodeForm"
            action={`/cms/forgot-password/verify/${token}`}
            method="post"
            disableWhileProcessing
            onError={() => setErrorSuppressed(false)}
        >
            {({ processing, errors }) => {
                const showError = !!errors.otp && !errorSuppressed;
                return (
                <>
                    <input type="hidden" name="otp" value={otpValue} />

                    <OtpInput digitCount={otpLength} value={otpValue} onChange={handleOtpChange} hasError={showError} />

                    {showError && (
                        <p className="caption-md text-red-500 mt-2 mb-0">{errors.otp}</p>
                    )}

                    {!showError && secondsLeft < 0 && (
                        <p className="caption-md text-neutral-700 mt-2 mb-0">
                            This code has expired. Resend a new code.
                        </p>
                    )}

                    <div className="flex flex-col gap-4 mt-10">
                        <p className="resend-text">
                            {resendProcessing ? (
                                "Sending new code..."
                            ) : secondsLeft > 0 ? (
                                <>Resend code in <strong>{formatCountdown(secondsLeft)}</strong></>
                            ) : (
                                <>
                                    Didn&apos;t receive a code?{" "}
                                    <a type="button" onClick={handleResend}>
                                     <strong className="cursor-pointer">Resend</strong>   
                                    </a>
                                </>
                            )}  
                        </p>

                        <Button
                            type="submit"
                            disabled={processing || otpValue.length < otpLength}
                        >
                            {processing ? "Confirming..." : "Confirm"}
                        </Button>
                    </div>
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
            headerTitle="Enter Code"
            headerDescription={
                <>
                    Please enter the code we&apos;ve sent to{" "}
                    <strong>{email ?? "your email"}</strong>
                </>
            }
            goBack={true}
            goBackLabelText="Back"
            goBackUrl="/cms/login"
        >
            {children}
        </AuthLayout>
    );
};

VerifyOTP.layout = (page: React.ReactNode) => <VerifyOTPLayout>{page}</VerifyOTPLayout>;

export default VerifyOTP;
