import PasswordInput from "@/components/inputs/password-input";
import { useState, useEffect } from "react";
import PrimaryButton from "@/components/buttons/primary-button";

interface ConfirmOldPasswordModalProps {
    onConfirm: (password: string) => void;
    onClose: () => void;
    error?: string;
}

export default function ConfirmOldPasswordModal({
    onConfirm,
    onClose,
    error,
}: ConfirmOldPasswordModalProps) {
    const [password, setPassword] = useState("");

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

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onConfirm(password);
    };

    return (
        <>
            <div
                className="modal fade show d-block"
                id="confirmPasswordModal"
                tabIndex={-1}
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
                            <div className="d-flex flex-column gap-2 align-items-center mb-4">
                                <h4 className="title-xs text-neutral-900">
                                    Verify Current Password
                                </h4>
                                <p className="body-md text-neutral-700">
                                    For security purposes, please enter your
                                    current password to confirm these changes.
                                </p>
                            </div>
                            <form onSubmit={handleSubmit} className="w-100">
                                <div className="mb-4 text-start">
                                    <PasswordInput
                                        id="old_password"
                                        name="old_password"
                                        label="Current Password"
                                        placeholder="Enter current password"
                                        value={password}
                                        onChange={(e) =>
                                            setPassword(e.target.value)
                                        }
                                        error={error}
                                    />
                                </div>
                                <PrimaryButton
                                    type="submit"
                                    className="w-100 d-flex justify-content-center align-items-center"
                                    size="giant"
                                >
                                    Confirm Changes
                                </PrimaryButton>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
            <div className="modal-backdrop fade show" onClick={onClose} />
        </>
    );
}
