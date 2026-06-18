import { Link } from "@inertiajs/react";
import { useEffect } from "react";

interface SuccessModalProps {
    title: string;
    description: string;
    buttonText: string;
    buttonLink: string;
}

const SuccessModal = ({
    title,
    description,
    buttonText,
    buttonLink,
}: SuccessModalProps) => {
    useEffect(() => {
        document.body.classList.add("modal-open");
        const prevOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => {
            document.body.classList.remove("modal-open");
            document.body.style.overflow = prevOverflow;
        };
    }, []);

    return (
        <>
            <div
                className="modal fade show d-block"
                id="successModal"
                tabIndex={-1}
                role="dialog"
                aria-modal="true"
                aria-labelledby="successModalLabel"
            >
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content modal-content-success text-center">
                        <div className="modal-body modal-body-success flex flex-col items-center">
                            <div className="success-icon">
                                <img
                                    src="/icons/success.svg"
                                    alt="Success"
                                    width="40"
                                    height="40"
                                />
                            </div>
                            <div className="flex flex-col gap-2">
                                <h4
                                    id="successModalLabel"
                                    className="title-ex-small text-neutral-900 "
                                >
                                    {title}
                                </h4>
                                <p className="body-md text-neutral-700">
                                    {description}
                                </p>
                            </div>
                            <Link
                                href={buttonLink}
                                className="btns btn-gaints btns-primary text-btn-500 w-full text-decoration-none flex justify-center items-center"
                            >
                                {buttonText}
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
            <div className="modal-backdrop fade show" aria-hidden="true" />
        </>
    );
};

export default SuccessModal;
