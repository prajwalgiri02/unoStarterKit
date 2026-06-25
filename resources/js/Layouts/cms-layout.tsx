import Header from "@/components/layouts/header";
import Sidebar from "@/components/layouts/sidebar";
import type { PageProps } from "../Pages/types/index";
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

const STORAGE_KEY = "sidebarCollapsed";

function readCollapsed(): boolean {
    try {
        return localStorage.getItem(STORAGE_KEY) === "1";
    } catch {
        return false;
    }
}

function persistCollapsed(value: boolean): void {
    try {
        localStorage.setItem(STORAGE_KEY, value ? "1" : "0");
    } catch { /* quota / private mode */ }
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

    const [collapsed, setCollapsed] = useState<boolean>(() => readCollapsed());
    const [mobileOpen, setMobileOpen] = useState(false);

    useEffect(() => {
        setMobileOpen(false);
    }, [url]);

    useEffect(() => {
        if (props.flash?.success) {
            toast.success(props.flash.success, { id: props.flash.success });
        }
        if (props.flash?.error) {
            toast.error(props.flash.error, { id: props.flash.error });
        }
    }, [props.flash]);

    function handleDesktopToggle() {
        setCollapsed((prev) => {
            const next = !prev;
            persistCollapsed(next);
            return next;
        });
    }

    const shellClass = [
        "app-shell",
        collapsed ? "is-collapsed" : "",
        mobileOpen ? "show-sidebar" : "",
    ]
        .filter(Boolean)
        .join(" ");

    return (
        <div className={shellClass}>
            <Sidebar
                mobileOpen={mobileOpen}
                onMobileToggle={() => setMobileOpen((prev) => !prev)}
                onCloseMobile={() => setMobileOpen(false)}
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
                    sidebarOpen={!collapsed}
                    onSidebarToggle={handleDesktopToggle}
                    onBackButton={onBackButton}
                    backUrl={backUrl}
                    actionButton={actionButton}
                />
            </main>
            <Toaster richColors position="bottom-right" />
        </div>
    );
}
