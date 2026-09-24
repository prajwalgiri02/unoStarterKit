import Button from "@/Components/buttons/button";
import { CloseCircleIcon } from "@/Components/icons";
import OtpInput from "@/Components/inputs/otp-input";
import Modal from "@/Components/modals/modal";
import { formatCountdown } from "@/lib/helper";
import { useId, useState } from "react";

type OtpModalProps = {
    open: boolean;
    email: string;
    length?: number;
    secondsLeft: number;
    error?: string;
    processing?: boolean;
    resending?: boolean;
    onVerify: (code: string) => void;
    onResend: () => void;
    onClose: () => void;
};

export default function OtpModal({
    open,
    email,
    length = 6,
    secondsLeft,
    error,
    processing = false,
    resending = false,
    onVerify,
    onResend,
    onClose,
}: OtpModalProps) {
    const titleId = useId();
    const [code, setCode] = useState("");

    return (
        <Modal open={open} onClose={onClose} labelledBy={titleId} size="medium">
            <div className="flex flex-col gap-6">
                <div className="flex items-start justify-between gap-4">
                    <h2 id={titleId} className="text-title-md text-neutral-900">
                        Enter Code
                    </h2>
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Close"
                        className="flex size-6 shrink-0 cursor-pointer items-center justify-center rounded-full text-neutral-500 outline-none hover:text-neutral-700 focus-visible:ring-[3px] focus-visible:ring-primary-50"
                    >
                        <CloseCircleIcon className="size-6" />
                    </button>
                </div>
                <p className="text-body-xs text-neutral-700">
                    Please enter the code we&apos;ve sent to <strong className="font-semibold text-neutral-900">{email}</strong>
                </p>
                <div className="flex flex-col gap-2">
                    <OtpInput length={length} value={code} onChange={setCode} hasError={!!error} disabled={processing} />
                    {error && <p className="text-center text-link-sm font-normal text-error-500">{error}</p>}
                </div>
                <p className="text-center text-body-md text-neutral-600">
                    {resending ? (
                        "Sending new code..."
                    ) : secondsLeft > 0 ? (
                        <>
                            Resend code in <span className="font-semibold text-primary-500">{formatCountdown(secondsLeft)}</span>
                        </>
                    ) : (
                        <>
                            Didn&apos;t receive a code?{" "}
                            <button
                                type="button"
                                onClick={onResend}
                                className="cursor-pointer font-semibold text-primary-500 hover:text-primary-700"
                            >
                                Resend
                            </button>
                        </>
                    )}
                </p>
                <Button className="w-full" disabled={processing || code.length < length} onClick={() => onVerify(code)}>
                    {processing ? "Confirming..." : "Confirm"}
                </Button>
            </div>
        </Modal>
    );
}
