import { useForm, router } from "@inertiajs/react";
import { useEffect, useState, useRef } from "react";

interface ConfirmationAccountModalProps {
    email: string;
    timeLeft: number;
    onResendSuccess: () => void;
    onClose: () => void;
}

export default function ConfirmationAccountModal({
    email,
    timeLeft,
    onResendSuccess,
    onClose,
}: ConfirmationAccountModalProps) {
    const [otp, setOtp] = useState(["", "", "", "", "", ""]);
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    const { post, processing, errors, setData, setError, clearErrors } =
        useForm({
            otp: "",
            email: email,
        });

    useEffect(() => {
        document.body.classList.add("modal-open");
        const prevOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";

        const handleEscapeKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                onClose();
            }
        };

        document.addEventListener("keydown", handleEscapeKey);

        return () => {
            document.body.classList.remove("modal-open");
            document.body.style.overflow = prevOverflow;
            document.removeEventListener("keydown", handleEscapeKey);
        };
    }, [onClose]);

    // Automatically trigger verification when last digit is entered
    useEffect(() => {
        if (otp.every((digit) => digit !== "")) {
            handleVerify(otp.join(""));
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
        if (timeLeft === 0) {
            // Using router.post here since we don't need to update the modal's specific form state
            router.post(
                "/cms/settings/send-otp",
                { email: email },
                {
                    onSuccess: () => {
                        onResendSuccess();
                    },
                },
            );
        }
    };

    const handleVerify = (code: string) => {
        clearErrors();

        router.post(
            "/cms/settings/verify-otp",
            {
                otp: code,
                email: email,
            },
            {
                onSuccess: () => {
                    onClose();
                },
                onError: (errs) => {
                    // Map errors back to the form state to display them
                    Object.keys(errs).forEach((key) => {
                        setError(key as any, errs[key]);
                    });
                    inputRefs.current[5]?.focus();
                },
            },
        );
    };

    return (
        <>
            <div
                className="modal fade show d-block"
                id="confirmantModal"
                tabIndex={-1}
                aria-labelledby="confirmantModalLabel"
                aria-modal="true"
                role="dialog"
                onClick={onClose}
            >
                <div
                    className="modal-dialog modal-dialog-centered"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="modal-content modal-content-account">
                        <div className="modal-body modal-body-success d-flex flex-column align-items-center text-center">
                            <div className="d-flex flex-column gap-2 align-items-center">
                                <h4 className="title-xs text-neutral-900">
                                    Confirm Account
                                </h4>
                                <p className="body-md text-neutral-700">
                                    We have sent a verification code to your
                                    email{" "}
                                    <span className="body-lg text-neutral-700">
                                        {email}
                                    </span>
                                </p>
                            </div>
                            <div className="w-100">
                                <div
                                    className="d-flex justify-content-center otp-container"
                                    id="otpContainer"
                                >
                                    {otp.map((digit, i) => (
                                        <input
                                            key={i}
                                            ref={(el) => {
                                                inputRefs.current[i] = el;
                                            }}
                                            className={`otp-input body-lg ${errors.otp ? "border-danger text-danger" : ""}`}
                                            type="text"
                                            maxLength={1}
                                            value={digit}
                                            onChange={(e) =>
                                                handleOtpChange(
                                                    i,
                                                    e.target.value,
                                                )
                                            }
                                            onKeyDown={(e) =>
                                                handleKeyDown(i, e)
                                            }
                                            onPaste={handlePaste}
                                            inputMode="numeric"
                                            disabled={processing}
                                        />
                                    ))}
                                </div>
                                {errors.otp && (
                                    <div className="text-danger body-xs mt-2">
                                        {errors.otp}
                                    </div>
                                )}
                            </div>
                            <p className="body-md text-neutral-600 text-center">
                                {timeLeft > 0 ? (
                                    <>
                                        Resend code in <br />
                                        <span
                                            className="body-md text-primary-500"
                                            id="countdown"
                                        >
                                            {formatTime(timeLeft)}
                                        </span>
                                    </>
                                ) : (
                                    <span
                                        className="body-md text-primary-500"
                                        onClick={handleResend}
                                        style={{
                                            cursor: "pointer",
                                            fontWeight: "bold",
                                        }}
                                    >
                                        Resend
                                    </span>
                                )}
                            </p>
                            <button
                                type="button"
                                onClick={onClose}
                                className="btns btn-gaints btns-primary text-btn-500 w-100 d-flex justify-content-center align-items-center text-decoration-none border-0"
                                disabled={processing}
                            >
                                {processing ? "Verifying..." : "Cancel"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <div className="modal-backdrop fade show" onClick={onClose} />
        </>
    );
}
