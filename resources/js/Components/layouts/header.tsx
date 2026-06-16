import { Link, router, usePage } from '@inertiajs/react';
import React, { useState, useEffect } from 'react';
import { Menu, ChevronLeft, Search, Bell, Plus } from 'lucide-react';
import PrimaryButton from '@/Components/buttons/primary-button';
import type { ActionButtonConfig } from '@/layouts/cms-layout';

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
    actionButtonLabel = '',
    actionButtonRoute = '#',
    headerLabel = '',
    showNotificationButton = false,
    mobileMenuOpen = false,
    onMenuToggle,
    onBackButton,
    backUrl,
    actionButton,
}: HeaderProps) {
    const { url } = usePage();
    const [search, setSearch] = useState('');

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        setSearch(params.get('search') || '');
    }, [url]);

    const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            const params = new URLSearchParams(window.location.search);
            const searchValue = (e.target as HTMLInputElement).value;

            if (searchValue) {
                params.set('search', searchValue);
            } else {
                params.delete('search');
            }
            params.delete('page');

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
                        <Menu size={22} className="menu-bar-icon" />
                    </button>

                    <div className="header-title-group">
                        {backUrl ? (
                            <Link href={backUrl} className="back-arrow-container">
                                <ChevronLeft size={20} className="back-arrow-icon" />
                            </Link>
                        ) : onBackButton ? (
                            <button
                                type="button"
                                className="back-arrow-container"
                                onClick={onBackButton}
                            >
                                <ChevronLeft size={20} className="back-arrow-icon" />
                            </button>
                        ) : null}

                        <h1 className="header-title">{headerLabel}</h1>
                    </div>
                </div>

                <div className="header-right">
                    {/* Structured action button */}
                    {actionButton?.show && (
                        <PrimaryButton
                            size={(actionButton.size as any) || 'giant'}
                            onClick={() =>
                                actionButton.route && router.get(actionButton.route)
                            }
                            className="text-nowrap"
                        >
                            {actionButton.showIcon !== false && (
                                <Plus size={18} />
                            )}
                            <span>{actionButton.label}</span>
                        </PrimaryButton>
                    )}

                    {/* Legacy action button */}
                    {!actionButton?.show &&
                        showActionButton &&
                        actionButtonLabel &&
                        actionButtonRoute && (
                            <PrimaryButton
                                size="giant"
                                onClick={() => router.get(actionButtonRoute)}
                                className="text-nowrap"
                            >
                                <Plus size={18} />
                                {actionButtonLabel}
                            </PrimaryButton>
                        )}

                    {showSearchBar && (
                        <div className="search-box">
                            <Search size={16} className="search-icon-header" />
                            <input
                                className="header-search-input"
                                type="text"
                                placeholder="Search"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                onKeyDown={handleSearch}
                            />
                        </div>
                    )}

                    {showNotificationButton && (
                        <button type="button" className="notification-btn">
                            <Bell size={20} className="notification-icon" />
                        </button>
                    )}
                </div>
            </header>

            <div className="dashboard-content">{children}</div>
        </>
    );
}
