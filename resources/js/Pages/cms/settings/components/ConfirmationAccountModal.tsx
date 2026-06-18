import { useForm, router, usePage } from "@inertiajs/react";
import { useEffect, useState, useRef } from "react";

interface ConfirmationAccountModalProps {
    email: string;
    token: string;
    timeLeft: number;
    onResendSuccess: () => void;
    onClose: () => void;
}

export default function ConfirmationAccountModal({
    email,
    token,
    timeLeft,
    onResendSuccess,
    onClose,
}: ConfirmationAccountModalProps) {
    const { url } = usePage();
    const basePath = url.split("?")[0];

    const [otp, setOtp] = useState(["", "", "", "", "", ""]);
    const [isVerifying, setIsVerifying] = useState(false);
    const [isResending, setIsResending] = useState(false);
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    const { errors, setError, clearErrors } = useForm();

    useEffect(() => {
        document.body.style.overflow = "hidden";

        const handleEscapeKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                onClose();
            }
        };

        document.addEventListener("keydown", handleEscapeKey);

        return () => {
            document.body.style.overflow = "";
            document.removeEventListener("keydown", handleEscapeKey);
        };
    }, [onClose]);

    // Automatically trigger verification when last digit is entered
    useEffect(() => {
        const code = otp.join("");
        if (code.length === 6 && !otp.includes("")) {
            handleVerify(code);
        }
    }, [otp]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
    };

    const handleOtpChange = (index: number, value: string) => {
        if (!/^\d*$/.test(value)) return;

        const newOtp = [...otp];
        newOtp[index] = value.slice(-1);
        setOtp(newOtp);

        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (
        index: number,
        e: React.KeyboardEvent<HTMLInputElement>,
    ) => {
        if (e.key === "Backspace" && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handlePaste = (e: React.ClipboardEvent) => {
        e.preventDefault();
        const pasteData = e.clipboardData.getData("text").slice(0, 6).split("");
        const newOtp = [...otp];
        pasteData.forEach((char, i) => {
            if (/^\d$/.test(char)) {
                newOtp[i] = char;
            }
        });
        setOtp(newOtp);
        const nextIndex = Math.min(pasteData.length, 5);
        inputRefs.current[nextIndex]?.focus();
    };

    const handleResend = () => {
        if (timeLeft === 0 && !isResending) {
            setIsResending(true);
            router.post(
                `${basePath}/resend/${token}`,
                {},
                {
                    onSuccess: () => {
                        onResendSuccess();
                    },
                    onFinish: () => {
                        setIsResending(false);
                    },
                },
            );
        }
    };

    const handleVerify = (code: string) => {
        if (code.length !== 6 || isVerifying || !token) return;
        
        setIsVerifying(true);
        clearErrors();

        router.post(
            `${basePath}/verify/${token}`,
            {
                otp: code,
                email: email,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    onClose();
                },
                onError: (errs) => {
                    Object.keys(errs).forEach((key) => {
                        setError(key as any, errs[key]);
                    });
                    inputRefs.current[5]?.focus();
                },
                onFinish: () => {
                    setIsVerifying(false);
                },
            },
        );
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div
                className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all">
                <div className="p-8 flex flex-col items-center text-center gap-6">
                    <div className="flex flex-col gap-2">
                        <h4 className="text-2xl font-bold text-neutral-900">
                            Confirm Account
                        </h4>
                        <p className="text-neutral-600">
                            We have sent a verification code to your email{" "}
                            <span className="font-semibold text-neutral-900">
                                {email}
                            </span>
                        </p>
                    </div>

                    <div className="w-full">
                        <div className="flex justify-center gap-3">
                            {otp.map((digit, i) => (
                                <input
                                    key={i}
                                    ref={(el) => {
                                        inputRefs.current[i] = el;
                                    }}
                                    className={`w-12 h-14 text-center text-2xl font-bold border-2 rounded-xl transition-all focus:ring-4 focus:ring-primary-500/20 focus:border-primary-500 outline-none ${
                                        errors.otp
                                            ? "border-red-500 text-red-500 bg-red-50"
                                            : "border-neutral-200 text-neutral-900 bg-neutral-50"
                                    }`}
                                    type="text"
                                    maxLength={1}
                                    value={digit}
                                    onChange={(e) =>
                                        handleOtpChange(i, e.target.value)
                                    }
                                    onKeyDown={(e) => handleKeyDown(i, e)}
                                    onPaste={handlePaste}
                                    inputMode="numeric"
                                    disabled={isVerifying}
                                />
                            ))}
                        </div>
                        {errors.otp && (
                            <div className="text-red-500 text-sm font-medium mt-3">
                                {errors.otp}
                            </div>
                        )}
                        {errors.email && (
                            <div className="text-red-500 text-sm font-medium mt-1">
                                {errors.email}
                            </div>
                        )}
                    </div>

                    <div className="text-neutral-600">
                        {timeLeft > 0 ? (
                            <p>
                                Resend code in{" "}
                                <span className="font-bold text-primary-600 tabular-nums">
                                    {formatTime(timeLeft)}
                                </span>
                            </p>
                        ) : (
                            <button
                                onClick={handleResend}
                                disabled={isResending}
                                className="text-primary-600 font-bold hover:text-primary-700 transition-colors disabled:opacity-50"
                            >
                                {isResending ? "Sending..." : "Resend Code"}
                            </button>
                        )}
                    </div>

                    <div className="flex flex-col w-full gap-3">
                        <button
                            type="button"
                            onClick={() => handleVerify(otp.join(""))}
                            className="w-full py-4 bg-primary-600 text-white rounded-xl font-bold text-lg hover:bg-primary-700 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={isVerifying || otp.some(digit => digit === "")}
                        >
                            {isVerifying ? "Verifying..." : "Verify Code"}
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            className="w-full py-4 bg-neutral-100 text-neutral-700 rounded-xl font-bold text-lg hover:bg-neutral-200 transition-all disabled:opacity-50"
                            disabled={isVerifying}
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
