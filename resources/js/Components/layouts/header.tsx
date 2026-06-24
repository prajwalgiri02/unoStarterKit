import { Link, router, usePage } from "@inertiajs/react";
import React, { useState, useEffect } from "react";
import PrimaryButton from "../buttons/primary-button";
import type { ActionButtonConfig } from "@/layouts/cms-layout";
import NotificationModal from "../modals/notification-modal";

interface HeaderProps {
    children: React.ReactNode;
    showSearchBar?: boolean;
    showActionButton?: boolean;
    actionButtonLabel?: string;
    actionButtonRoute?: string;
    headerLabel: string;
    showNotificationButton?: boolean;
    mobileMenuOpen?: boolean;
    onMenuToggle?: () => void;
    onBackButton?: (() => void) | null;
    backUrl?: string;
    actionButton?: ActionButtonConfig;
}

export default function Header({
    children,
    showSearchBar = true,
    showActionButton = false,
    actionButtonLabel = "",
    actionButtonRoute = "#",
    headerLabel = "",
    showNotificationButton = false,
    mobileMenuOpen = false,
    onMenuToggle,
    onBackButton,
    backUrl,
    actionButton,
}: HeaderProps) {
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
            <header className="header">
                <div className="header-left">
                    <button
                        type="button"
                        className="menu-toggle"
                        id="menuToggle"
                        aria-label="Toggle navigation menu"
                        aria-expanded={mobileMenuOpen}
                        onClick={onMenuToggle}
                    >
                        <img
                            src="/icons/menubar.svg"
                            alt=""
                            className="menu-bar-icon"
                        />
                    </button>
                    <div className="flex items-center gap-2">
                        {backUrl ? (
                            <Link
                                href={backUrl}
                                className="back-arrow-container"
                            >
                                <img
                                    src="/icons/back-arrow1.svg"
                                    alt="back-arrow"
                                    className="back-arrow-icon"
                                />
                            </Link>
                        ) : onBackButton ? (
                            <div
                                className="back-arrow-container"
                                onClick={() => onBackButton()}
                                style={{ cursor: "pointer" }}
                            >
                                <img
                                    src="/icons/back-arrow1.svg"
                                    alt="back-arrow"
                                    className="back-arrow-icon"
                                />
                            </div>
                        ) : null}
                        <h1 className="header-title mb-0">{headerLabel}</h1>
                    </div>
                </div>
                <div className="header-right">
                    {/* New structured Action Button */}
                    {actionButton?.show && (
                        <div>
                            <PrimaryButton
                                size={actionButton.size || "giant"}
                                textSize={actionButton.textSize}
                                onClick={() =>
                                    actionButton.route &&
                                    router.get(actionButton.route)
                                }
                                className="text-nowrap"
                            >
                                {actionButton.showIcon !== false && (
                                    <img
                                        src="/icons/plus.svg"
                                        alt="plus"
                                        width="24"
                                        height="24"
                                    />
                                )}
                                <span className="body-sm">
                                    {actionButton.label}
                                </span>
                            </PrimaryButton>
                        </div>
                    )}

                    {/* Legacy Action Button */}
                    {!actionButton?.show &&
                        showActionButton &&
                        actionButtonLabel &&
                        actionButtonRoute && (
                            <div>
                                <PrimaryButton
                                    size="giant"
                                    onClick={() =>
                                        router.get(actionButtonRoute)
                                    }
                                    className="text-nowrap"
                                >
                                    <img
                                        src="/icons/plus.svg"
                                        alt="plus"
                                        width="24"
                                        height="24"
                                    />
                                    {actionButtonLabel}
                                </PrimaryButton>
                            </div>
                        )}

                    {showSearchBar && (
                        <div className="search-box">
                            <img
                                src="/icons/search.svg"
                                alt="search"
                                className="search-icon-header"
                            />
                            <input
                                className="header-search-inputs"
                                type="text"
                                placeholder="Search"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                onKeyDown={handleSearch}
                            />
                        </div>
                    )}

                    {showNotificationButton && (
                        <button
                            className="notification-btn"
                            onClick={() => setNotificationOpen(true)}
                        >
                            <img
                                src="/icons/notification1.svg"
                                alt="notification"
                                className="notification-icon"
                            />
                        </button>
                    )}
                </div>
            </header>
            <div className="dashboard-content">{children}</div>
            {notificationOpen && (
                <NotificationModal
                    onClose={() => setNotificationOpen(false)}
                    onMarkAllAsRead={() =>
                        router.patch(
                            "/cms/notifications/mark-all-read",
                            {},
                            { preserveState: true, preserveScroll: true },
                        )
                    }
                    onClearAll={() =>
                        router.delete("/cms/notifications/clear-all", {
                            preserveState: true,
                            preserveScroll: true,
                        })
                    }
                />
            )}
        </>
    );
}
