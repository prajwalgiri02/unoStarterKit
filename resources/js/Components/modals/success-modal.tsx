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
        document.body.classList.add("overflow-hidden");
        return () => {
            document.body.classList.remove("overflow-hidden");
        };
    }, []);

    return (
        <div className="success-overlay" role="dialog" aria-modal="true" aria-labelledby="successModalTitle">
            <div className="success-modal">
                <div className="success-modal__icon">
                    <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <polyline points="20 6 9 17 4 12" />
                    </svg>
                </div>
                <h3 id="successModalTitle" className="success-modal__title">{title}</h3>
                <p className="success-modal__description">{description}</p>
                <Link href={buttonLink} className="btn btn-primary success-modal__btn">
                    {buttonText}
                </Link>
            </div>
        </div>
    );
};

export default SuccessModal;
