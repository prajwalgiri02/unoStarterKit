import { useState, useEffect } from "react";
import "../css/styles.css";
import type { Conversation, MessageType } from "@/types/cms/message";

interface SortDropdownProps {
    currentSort: string;
    onSortChange: (sort: string) => void;
}

const SortDropdown = ({ currentSort, onSortChange }: SortDropdownProps) => {
    const [isOpen, setIsOpen] = useState(false);

    const getSortLabel = (sort: string) => {
        switch (sort) {
            case "newest":
                return "Newest to Oldest";
            case "oldest":
                return "Oldest to Newest";
            case "name-asc":
                return "Name (A-Z)";
            case "name-desc":
                return "Name (Z-A)";
            default:
                return "Sort by";
        }
    };

    return (
        <div
            className="sort-dropdown position-relative"
            onClick={() => setIsOpen(!isOpen)}
        >
            <span className="body-xs text-neutral-700">
                {getSortLabel(currentSort || "newest")}
            </span>
            <img src="/icons/sorty-by.svg" alt="sort" />

            <ul
                className="sort-menu"
                style={{ display: isOpen ? "block" : "none" }}
            >
                {["newest", "oldest", "name-asc", "name-desc"].map((sort) => (
                    <li
                        key={sort}
                        className="sort-item body-xs"
                        onClick={() => {
                            onSortChange(sort);
                            setIsOpen(false);
                        }}
                    >
                        {getSortLabel(sort)}
                    </li>
                ))}
            </ul>
        </div>
    );
};

interface FilterTabsProps {
    activeFilter: MessageType | "all";
    onFilterChange: (filter: MessageType | "all") => void;
}

const FilterTabs = ({ activeFilter, onFilterChange }: FilterTabsProps) => (
    <div className="filter-tabs">
        <button
            className={`filter-tab all-btn ${activeFilter === "all" ? "active" : ""}`}
            onClick={() => onFilterChange("all")}
        >
            <span className="body-xs">All</span>
        </button>
        <button
            className={`filter-tab ${activeFilter === "contact" ? "active" : ""}`}
            onClick={() => onFilterChange("contact")}
        >
            <span className="body-xs">Contact Us</span>
        </button>
        <button
            className={`filter-tab ${activeFilter === "report" ? "active" : ""}`}
            onClick={() => onFilterChange("report")}
        >
            <span className="body-xs">Reports</span>
        </button>
    </div>
);

interface ConversationItemProps {
    conversation: Conversation;
    isSelected: boolean;
    onSelect: (id: number) => void;
    onDelete: (id: number) => void;
}

const ConversationItem = ({
    conversation,
    isSelected,
    onSelect,
    onDelete,
}: ConversationItemProps) => (
    <tr
        className={`message-item ${isSelected ? "active" : ""}`}
        onClick={() => onSelect(conversation.id)}
        data-id={conversation.id}
        data-type={conversation.type}
    >
        <td>
            <div className="d-flex align-items-center gap-3">
                <div
                    className={`message-avatar body-sm ${conversation.avatar_color}`}
                >
                    {conversation.avatar_text}
                </div>
                <div className="message-info">
                    <div
                        className="message-name body-sm"
                        style={{
                            fontWeight: conversation.is_read
                                ? "normal"
                                : "bold",
                        }}
                    >
                        {conversation.name}
                    </div>
                    <div className="message-email body-xs">
                        {conversation.email}
                    </div>
                </div>
            </div>
        </td>
        <td>
            <div className="d-flex align-items-center justify-content-center">
                <span
                    className={`message-badge caption-md ${conversation.type === "contact" ? "contact-us" : "report"}`}
                >
                    {conversation.type === "contact" ? "Contact Us" : "Report"}
                </span>
            </div>
        </td>
        <td>
            <div className="d-flex align-items-center justify-content-center">
                {conversation.type === "contact" ? (
                    <span className="message-date body-xs">
                        {conversation.date}
                    </span>
                ) : (
                    <span
                        className={`message-badge caption-md ${conversation.status === "pending" ? "pending" : "resolved"}`}
                    >
                        {conversation.status === "pending"
                            ? "Pending"
                            : "Resolved"}
                    </span>
                )}
            </div>
        </td>
        <td
            className="text-end pr-4 actions-cell"
            style={{ position: "relative" }}
        >
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
                        // Close menu
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
        </td>
    </tr>
);

interface ConversationListProps {
    conversations: Conversation[];
    selectedId: number | null;
    onSelect: (id: number) => void;
    activeFilter: MessageType | "all";
    onFilterChange: (filter: MessageType | "all") => void;
    currentSort: string;
    onSortChange: (sort: string) => void;
    onDelete: (id: number) => void;
}

export default function ConversationList({
    conversations,
    selectedId,
    onSelect,
    activeFilter,
    onFilterChange,
    currentSort,
    onSortChange,
    onDelete,
}: ConversationListProps) {
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
        <div className="inbox-panel height-card">
            <div className="inbox-header">
                <h2 className="inbox-title subtitle-md">Inbox</h2>
                <SortDropdown
                    currentSort={currentSort}
                    onSortChange={onSortChange}
                />
            </div>

            <FilterTabs
                activeFilter={activeFilter}
                onFilterChange={onFilterChange}
            />

            <div className="message-list-container table-responsive">
                <table className="table custom-message-table mb-0 border-0">
                    <tbody id="messageList">
                        {conversations.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="text-center p-4">
                                    <span className="body-xs text-neutral-500">
                                        No messages found
                                    </span>
                                </td>
                            </tr>
                        ) : (
                            conversations.map((conv) => (
                                <ConversationItem
                                    key={conv.id}
                                    conversation={conv}
                                    isSelected={selectedId === conv.id}
                                    onSelect={onSelect}
                                    onDelete={(id) => {
                                        onDelete(id);
                                    }}
                                />
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
