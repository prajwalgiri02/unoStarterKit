import Header from "@/components/layouts/header";
import Sidebar from "@/components/layouts/sidebar";
import type { PageProps } from "@/types/index";
import { usePage } from "@inertiajs/react";
import { useEffect, useState } from "react";
import { Toaster, toast } from "sonner";

export interface ActionButtonConfig {
    show: boolean;
    label: string;
    route: string;
    size?: "small" | "medium" | "large" | "giant";
    textSize?: string;
    showIcon?: boolean;
}

interface CmsLayoutProps {
    children: React.ReactNode;
    headerLabel: string;
    showSearchBar?: boolean;
    showActionButton?: boolean;
    actionButtonLabel?: string;
    actionButtonRoute?: string;
    showNotificationButton?: boolean;
    onBackButton?: (() => void) | null;
    backUrl?: string;
    wrapperClass?: string;
    actionButton?: ActionButtonConfig;
}

export default function CmsLayout({
    children,
    headerLabel,
    showSearchBar,
    showActionButton,
    actionButtonLabel,
    actionButtonRoute,
    showNotificationButton,
    onBackButton,
    backUrl,
    wrapperClass,
    actionButton,
}: CmsLayoutProps) {
    const { url, props } = usePage<PageProps>();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        setMobileMenuOpen(false);
    }, [url]);

    useEffect(() => {
        if (props.flash?.success) {
            toast.success(props.flash.success, {
                id: props.flash.success,
            });
        }
        if (props.flash?.error) {
            toast.error(props.flash.error, {
                id: props.flash.error,
            });
        }
    }, [props.flash]);

    // useEffect(() => {
    //     if (props.errors && Object.keys(props.errors).length > 0) {
    //         Object.values(props.errors).forEach((error: any) => {
    //             toast.error(error);
    //         });
    //     }
    // }, [props.errors]);

    return (
        <div className="app-container">
            <Sidebar
                mobileMenuOpen={mobileMenuOpen}
                onCloseMobile={() => setMobileMenuOpen(false)}
            />
            <main
                className={`main-content ${wrapperClass || ""}`}
                id="mainContent"
            >
                <Header
                    children={children}
                    headerLabel={headerLabel}
                    showSearchBar={showSearchBar}
                    showActionButton={showActionButton}
                    actionButtonLabel={actionButtonLabel}
                    actionButtonRoute={actionButtonRoute}
                    showNotificationButton={showNotificationButton}
                    mobileMenuOpen={mobileMenuOpen}
                    onMenuToggle={() => setMobileMenuOpen((open) => !open)}
                    onBackButton={onBackButton}
                    backUrl={backUrl}
                    actionButton={actionButton}
                />
            </main>
            <Toaster richColors position="bottom-right" />
        </div>
    );
}
