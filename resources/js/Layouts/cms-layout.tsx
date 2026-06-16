import React, { useState } from 'react';
import Sidebar from '@/Components/layouts/sidebar';
import Header from '@/Components/layouts/header';

export type ActionButtonConfig = {
    show?: boolean;
    label?: string;
    route?: string;
    /** e.g. "giant" | "large" | "medium" — passed through to PrimaryButton */
    size?: string;
    textSize?: string;
    showIcon?: boolean;
};

type CmsLayoutProps = {
    children: React.ReactNode;
    headerLabel: string;
    showSearchBar?: boolean;
    showNotificationButton?: boolean;
    actionButton?: ActionButtonConfig;
    /** URL to navigate back to */
    backUrl?: string;
    /** Callback for back navigation (when no URL is available) */
    onBackButton?: (() => void) | null;
};

export default function CmsLayout({
    children,
    headerLabel,
    showSearchBar = true,
    showNotificationButton = false,
    actionButton,
    backUrl,
    onBackButton,
}: CmsLayoutProps) {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    return (
        <div className="app-wrapper">
            <Sidebar
                mobileMenuOpen={mobileMenuOpen}
                onCloseMobile={() => setMobileMenuOpen(false)}
            />

            <div className="main-content">
                <Header
                    headerLabel={headerLabel}
                    showSearchBar={showSearchBar}
                    showNotificationButton={showNotificationButton}
                    actionButton={actionButton}
                    backUrl={backUrl}
                    onBackButton={onBackButton}
                    mobileMenuOpen={mobileMenuOpen}
                    onMenuToggle={() => setMobileMenuOpen((prev) => !prev)}
                >
                    {children}
                </Header>
            </div>
        </div>
    );
}
