import type { Conversation } from "@/types/cms/message";
import { useEffect } from "react";

const AVATAR_COLORS = ["orange", "teal", "blue", "pink"] as const;

function getAvatarText(name: string): string {
    return name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .substring(0, 2);
}

function getAvatarColor(id: number): string {
    return AVATAR_COLORS[id % AVATAR_COLORS.length];
}

interface DetailHeaderProps {
    conversation: Conversation;
    onDelete: (id: number) => void;
}

const DetailHeader = ({ conversation, onDelete }: DetailHeaderProps) => {
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (!(event.target as Element).closest(".actions-btn")) {
                document
                    .querySelectorAll(".context-menu.active")
                    .forEach((m) => {
                        m.classList.remove("active");
                    });
            }
        };
        document.addEventListener("click", handleClickOutside);
        return () => document.removeEventListener("click", handleClickOutside);
    }, []);

    return (
        <div className="message-detail-header">
            <div className="message-detail-user">
                <div
                    className={`message-avatar caption-md ${getAvatarColor(conversation.id)}`}
                >
                    {getAvatarText(conversation.name)}
                </div>
                <div className="message-detail-info">
                    <div className="message-detail-name body-sm">
                        {conversation.name}
                    </div>
                    <div className="message-detail-email body-xs">
                        {conversation.email}
                    </div>
                </div>
            </div>

            <div
                className="message-detail-meta"
                style={{ position: "relative" }}
            >
                <span
                    className={`message-badge caption-md ${conversation.type === "contact_us" ? "contact-us" : "report"}`}
                >
                    {conversation.type_label}
                </span>
                {conversation.type === "dispute" && (
                    <span
                        className={`message-badge caption-md ${conversation.status}`}
                    >
                        {conversation.status_label}
                    </span>
                )}
                {conversation.type === "contact_us" && (
                    <span className="message-date body-xs">
                        {conversation.date}
                    </span>
                )}
                <button
                    className="actions-btn"
                    onClick={(e) => {
                        e.stopPropagation();
                        const menu = e.currentTarget.nextElementSibling;
                        if (menu) {
                            menu.classList.toggle("active");
                        }
                        document
                            .querySelectorAll(".context-menu.active")
                            .forEach((m) => {
                                if (m !== menu) m.classList.remove("active");
                            });
                    }}
                >
                    <img src="/icons/message-dots.svg" alt="action" />
                </button>
                <div className="context-menu">
                    <div
                        className="context-menu-item danger body-xs"
                        onClick={(e) => {
                            e.stopPropagation();
                            onDelete(conversation.id);
                            e.currentTarget.parentElement?.classList.remove(
                                "active",
                            );
                        }}
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                            className="w-6 h-6"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                            />
                        </svg>
                        <span>Delete</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

interface MessageDetailProps {
    conversation: Conversation | null;
    onBack: () => void;
    onMarkResolved: (id: number) => void;
    onDelete: (id: number) => void;
}

export default function MessageDetail({
    conversation,
    onBack,
    onMarkResolved,
    onDelete,
}: MessageDetailProps) {
    if (!conversation) {
        return (
            <div
                className="message-detail-panel height-card"
                id="messageDetailPanel"
            >
                <div className="empty-detail" id="emptyDetail">
                    <div className="empty-detail-icon">
                        <img src="/icons/message-back.svg" alt="Message Icon" />
                    </div>
                    <p className="empty-detail-text">
                        Select a message to view details
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div
            className="message-detail-panel height-card active"
            id="messageDetailPanel"
        >
            <button
                className="mobile-back-btn"
                id="mobileBackBtn"
                onClick={onBack}
            >
                <svg viewBox="0 0 24 24" fill="none" strokeWidth="2">
                    <path
                        d="M15 18l-6-6 6-6"
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                </svg>
                Back
            </button>

            {conversation.type === "contact_us" ? (
                <div className="contact-detail-view" id="contactDetailView">
                    <DetailHeader
                        conversation={conversation}
                        onDelete={onDelete}
                    />
                    <div className="message-content body-xs" id="detailContent">
                        {conversation.message.split("\n").map((line, i) => (
                            <p key={i}>{line}</p>
                        ))}
                    </div>
                    {conversation.status !== "resolved" && (
                        <button
                            className="btns btn-gaints btns-primary"
                            id="markReadBtn"
                            onClick={() => onMarkResolved(conversation.id)}
                        >
                            <span className="text-btn-500">Mark as Resolved</span>
                        </button>
                    )}
                </div>
            ) : (
                <div className="report-detail-view" id="reportDetailView">
                    <DetailHeader
                        conversation={conversation}
                        onDelete={onDelete}
                    />
                    <div className="report-section">
                        <h3 className="report-section-title body-lg">
                            Reported Date
                        </h3>
                        <p className="report-date body-xs" id="reportDate">
                            {conversation.date}
                        </p>
                    </div>
                    <div className="report-section">
                        <h3 className="report-section-title body-sm">
                            Message
                        </h3>
                        <div className="reported-comment">
                            <div className="flex flex-col gap-3">
                                <div className="reported-comment-user">
                                    <div
                                        className={`message-avatar body-sm ${getAvatarColor(conversation.id)}`}
                                    >
                                        {getAvatarText(conversation.name)}
                                    </div>
                                    <div>
                                        <span className="reported-comment-name body-sm">
                                            {conversation.name}
                                        </span>
                                        <p className="reported-comment-text body-xs">
                                            {conversation.message}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    {conversation.status !== "resolved" && (
                        <div className="mt-2">
                            <button
                                className="btns btn-gaints btns-primary"
                                id="markResolvedBtn"
                                onClick={() => onMarkResolved(conversation.id)}
                            >
                                <span className="text-btn-500">
                                    Mark Resolved
                                </span>
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
