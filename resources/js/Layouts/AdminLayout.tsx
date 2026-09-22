import React from 'react';
import CmsLayout from '@/Layouts/cms-layout';
import type { ActionButtonConfig } from '@/Layouts/cms-layout';

type AdminLayoutProps = {
    children: React.ReactNode;
    /** Page title shown in the header */
    headerLabel?: string;
    showSearchBar?: boolean;
    showNotificationButton?: boolean;
    actionButton?: ActionButtonConfig;
    backUrl?: string;
    onBackButton?: (() => void) | null;
};

export default function AdminLayout({
    children,
    headerLabel = '',
    showSearchBar = false,
    showNotificationButton = true,
    actionButton,
    backUrl,
    onBackButton,
}: AdminLayoutProps) {
    return (
        <CmsLayout
            headerLabel={headerLabel}
            showSearchBar={showSearchBar}
            showNotificationButton={showNotificationButton}
            actionButton={actionButton}
            backUrl={backUrl}
            onBackButton={onBackButton}
        >
            {children}
        </CmsLayout>
    );
}
