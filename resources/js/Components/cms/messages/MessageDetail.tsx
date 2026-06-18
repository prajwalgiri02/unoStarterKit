import { router } from "@inertiajs/react";
import "../../../css/styles.css";
import type { Conversation } from "@/types/cms/message";
import { useEffect } from "react";

interface DetailHeaderProps {
    conversation: Conversation;
    typeLabel: string;
    typeClass: string;
    showStatus?: boolean;
    avatarId?: string;
    nameId?: string;
    emailId?: string;
    dateId?: string;
    badgeId?: string;
    typeBadgeId?: string;
    statusBadgeId?: string;
    onDelete: (id: number) => void;
}

const DetailHeader = ({
    conversation,
    typeLabel,
    typeClass,
    showStatus,
    avatarId,
    nameId,
    emailId,
    dateId,
    badgeId,
    typeBadgeId,
    statusBadgeId,
    onDelete,
}: DetailHeaderProps) => {
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
                    className={`message-avatar caption-md ${conversation.avatar_color}`}
                    id={avatarId}
                >
                    {conversation.avatar_text}
                </div>
                <div className="message-detail-info">
                    <div className="message-detail-name body-sm" id={nameId}>
                        {conversation.name}
                    </div>
                    <div className="message-detail-email body-xs" id={emailId}>
                        {conversation.email}
                    </div>
                </div>
            </div>

            <div
                className="message-detail-meta"
                style={{ position: "relative" }}
            >
                <span
                    className={`message-badge caption-md ${typeClass}`}
                    id={badgeId || typeBadgeId}
                >
                    {typeLabel}
                </span>
                {showStatus && (
                    <span
                        className={`message-badge caption-md ${conversation.status}`}
                        id={statusBadgeId}
                    >
                        {conversation.status.charAt(0).toUpperCase() +
                            conversation.status.slice(1)}
                    </span>
                )}
                {!showStatus && (
                    <span className="message-date body-xs" id={dateId}>
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
                        // Close other menus
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
    onMarkAction: (id: number, status: string) => void;
    onDelete: (id: number) => void;
}

export default function MessageDetail({
    conversation,
    onBack,
    onMarkAction,
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

    const handleDeleteComment = () => {
        if (confirm("Are you sure you want to delete this comment?")) {
            router.delete(`/cms/comments/${conversation.id}`, {
                preserveScroll: true,
                onSuccess: () => onBack(),
            });
        }
    };

    const handleDeleteUser = () => {
        if (confirm("Are you sure you want to delete this user?")) {
            router.delete(`/cms/users/${conversation.id}`, {
                // Assuming this is the endpoint
                preserveScroll: true,
                onSuccess: () => onBack(),
            });
        }
    };

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

            {conversation.type === "contact" ? (
                <div className="contact-detail-view" id="contactDetailView">
                    <DetailHeader
                        conversation={conversation}
                        typeLabel="Contact Us"
                        typeClass="contact-us"
                        avatarId="detailAvatar"
                        nameId="detailName"
                        emailId="detailEmail"
                        dateId="detailDate"
                        badgeId="detailBadge"
                        onDelete={onDelete}
                    />
                    <div className="message-content body-xs" id="detailContent">
                        {conversation.message.split("\n").map((line, i) => (
                            <p key={i}>{line}</p>
                        ))}
                    </div>
                    {!conversation.is_read && (
                        <button
                            className="btns btn-gaints btns-primary"
                            id="markReadBtn"
                            onClick={() =>
                                onMarkAction(conversation.id, "resolved")
                            }
                        >
                            <span className="text-btn-500">Mark as read</span>
                        </button>
                    )}
                </div>
            ) : (
                <div className="report-detail-view" id="reportDetailView">
                    <DetailHeader
                        conversation={conversation}
                        typeLabel="Report"
                        typeClass="report"
                        showStatus
                        avatarId="reportAvatar"
                        nameId="reportName"
                        emailId="reportEmail"
                        typeBadgeId="reportTypeBadge"
                        statusBadgeId="reportStatusBadge"
                        onDelete={onDelete}
                    />
                    <div className="report-section">
                        <h3 className="report-section-title body-lg">
                            Report Subject
                        </h3>
                        <p
                            className="report-section-content body-xs"
                            id="reportSubject"
                        >
                            {conversation.subject || "No Subject"}
                        </p>
                    </div>
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
                            Reported Comment
                        </h3>
                        <div className="reported-comment">
                            <div className="d-flex flex-column gap-3">
                                <div className="reported-comment-user">
                                    <div
                                        className={`message-avatar body-sm ${conversation.avatar_color}`}
                                        id="reportAvatar"
                                    >
                                        {conversation.avatar_text}
                                    </div>
                                    <div>
                                        <span
                                            className="reported-comment-name body-sm"
                                            id="reportedUserName"
                                        >
                                            {conversation.name}
                                        </span>
                                        <p
                                            className="reported-comment-text body-xs"
                                            id="reportedCommentText"
                                        >
                                            {conversation.message}
                                        </p>
                                    </div>
                                </div>
                                <div className="report-actions">
                                    <button
                                        className="btns btn-small btn-delete-comment"
                                        id="deleteCommentBtn"
                                        onClick={handleDeleteComment}
                                    >
                                        <span className="link-sm">
                                            Delete Comment
                                        </span>
                                    </button>
                                    <button
                                        className="btns btn-small btn-delete-user"
                                        id="deleteUserBtn"
                                        onClick={handleDeleteUser}
                                    >
                                        <span className="link-sm">
                                            Delete User
                                        </span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                    {conversation.status !== "resolved" && (
                        <div className="mt-2">
                            <button
                                className="btns btn-gaints btns-primary"
                                id="markResolvedBtn"
                                onClick={() =>
                                    onMarkAction(conversation.id, "resolved")
                                }
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
