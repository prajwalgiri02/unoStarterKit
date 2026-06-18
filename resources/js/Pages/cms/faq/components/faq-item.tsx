import { useState } from "react";

type FaqItemProps = {
    id: number;
    title: string;
    content: string;
    status: "published" | "draft";
    onEdit?: () => void;
    onDelete?: () => void;
};

export default function FaqItem({
    id,
    title,
    content,
    status,
    onEdit,
    onDelete,
}: FaqItemProps) {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <div
            className={`faq-item ${isExpanded ? "expanded" : ""}`}
            data-id={id}
        >
            <div
                className="faq-header"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <span className="faq-question subtitle-xs">
                    {title}
                    {status === "draft" && (
                        <span className="btns btn-small btns-secondary ms-2">
                            DRAFT
                        </span>
                    )}
                </span>
                <div className="faq-actions">
                    <button
                        className="faq-action-btn edit-btn"
                        title="Edit"
                        onClick={(e) => {
                            e.stopPropagation();
                            onEdit?.();
                        }}
                    >
                        <img
                            src="/icons/edit.svg"
                            alt="Edit"
                            width="24"
                            height="24"
                        />
                    </button>
                    <button
                        className="faq-action-btn delete-btn"
                        title="Delete"
                        onClick={(e) => {
                            e.stopPropagation();
                            onDelete?.();
                        }}
                    >
                        <img
                            src="/icons/delete1.svg"
                            alt="Delete"
                            width="24"
                            height="24"
                        />
                    </button>
                    <div className="faq-toggle">
                        <img
                            src="/icons/down.svg"
                            alt=""
                            width="24"
                            height="24"
                        />
                    </div>
                </div>
            </div>
            <div className="faq-content">
                <p
                    className="faq-answer body-xs"
                    style={{ whiteSpace: "pre-wrap" }}
                >
                    {content}
                </p>
            </div>
        </div>
    );
}
