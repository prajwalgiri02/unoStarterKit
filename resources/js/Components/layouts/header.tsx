import { Link, router, usePage } from "@inertiajs/react";
import React, { useState, useEffect } from "react";
import type { ActionButtonConfig } from "@/Layouts/cms-layout";
import NotificationModal from "../modals/notification-modal";

interface TopBarProps {
    children?: React.ReactNode;
    headerLabel: string;
    showSearchBar?: boolean;
    searchPlaceholder?: string;
    showNotificationButton?: boolean;
    sidebarOpen?: boolean;
    onSidebarToggle?: () => void;
    onBackButton?: (() => void) | null;
}

export default function TopBar({
    children,
    headerLabel = "",
    showSearchBar = true,
    searchPlaceholder = "Search",
    showNotificationButton = false,
    sidebarOpen = false,
    onSidebarToggle,
    onBackButton,
}: TopBarProps) {
    const { url } = usePage();
    const [search, setSearch] = useState("");
    const [notificationOpen, setNotificationOpen] = useState(false);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        setSearch(params.get("search") || "");
    }, [url]);

    const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            const params = new URLSearchParams(window.location.search);
            const searchValue = (e.target as HTMLInputElement).value;

            if (searchValue) {
                params.set("search", searchValue);
            } else {
                params.delete("search");
            }
            params.delete("page");

            router.get(
                window.location.pathname,
                Object.fromEntries(params.entries()),
                {
                    preserveState: true,
                    replace: true,
                },
            );
        }
    };

    return (
        <>
            <header className="topbar">
                <h1 className="page-title">
                    <button
                        type="button"
                        className="sidebar-toggle"
                        id="sidebarToggle"
                        aria-label="Toggle sidebar"
                        aria-expanded={sidebarOpen}
                        onClick={onSidebarToggle}
                    >
                        <svg
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                        >
                            <polyline points="15 18 9 12 15 6" />
                        </svg>
                    </button>


                    {headerLabel}
                </h1>

                <div className="topbar-actions">
                    {showSearchBar && (
                        <div className="search-box">
                            <img
                                src="/images/Search.png"
                                alt="search"
                            />
                            <input
                                type="search"
                                placeholder={searchPlaceholder}
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                onKeyDown={handleSearch}
                            />
                        </div>
                    )}

                    {showNotificationButton && (
                        <button
                            className="bell-btn"
                            id="bellBtn"
                            aria-label="Notifications"
                            onClick={() => setNotificationOpen(true)}
                        >
                            <img
                                src="/images/notification.png"
                                alt="notification"
                                width="20"
                                height="20"
                            />
                        </button>
                    )}
                </div>
            </header>
            <div className="dashboard-content">{children}</div>
        </>
    );
}

        //   {notificationOpen && (
        //     <NotificationModal
        //         onClose={() => setNotificationOpen(false)}
        //         onMarkAllAsRead={() =>
        //             router.patch(
        //                 "/cms/notifications/mark-all-read",
        //                 {},
        //                 { preserveState: true, preserveScroll: true },
        //             )
        //         }
        //         onClearAll={() =>
        //             router.delete("/cms/notifications/clear-all", {
        //                 preserveState: true,
        //                 preserveScroll: true,
        //             })
        //         }
        //     />
        // )}