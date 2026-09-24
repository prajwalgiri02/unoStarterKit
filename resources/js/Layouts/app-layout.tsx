import Header from "@/Components/layouts/header";
import Sidebar from "@/Components/layouts/sidebar";
import type { PageProps } from "@/Pages/types";
import { usePage } from "@inertiajs/react";
import { useEffect, useState, type ReactNode } from "react";
import { notify } from "@/lib/toast";
import { Toaster } from "sonner";

type AppLayoutProps = {
    title: ReactNode;
    backHref?: string;
    actions?: ReactNode;
    children: ReactNode;
};

const COLLAPSED_KEY = "sidebarCollapsed";

function readCollapsed() {
    try {
        return localStorage.getItem(COLLAPSED_KEY) === "1";
    } catch {
        return false;
    }
}

export default function AppLayout({ title, backHref, actions, children }: AppLayoutProps) {
    const { url, props } = usePage<PageProps>();
    const [collapsed, setCollapsed] = useState(readCollapsed);
    const [mobileOpen, setMobileOpen] = useState(false);

    useEffect(() => setMobileOpen(false), [url]);

    useEffect(() => {
        if (props.flash?.success) notify.success(props.flash.success);
        if (props.flash?.error) notify.error(props.flash.error);
    }, [props.flash]);

    const toggleCollapsed = () => {
        const next = !collapsed;
        setCollapsed(next);
        try {
            localStorage.setItem(COLLAPSED_KEY, next ? "1" : "0");
        } catch {}
    };

    return (
        <div className="flex min-h-dvh bg-neutral-25">
            <Sidebar
                collapsed={collapsed}
                onToggleCollapsed={toggleCollapsed}
                mobileOpen={mobileOpen}
                onCloseMobile={() => setMobileOpen(false)}
            />

            <div className="flex min-w-0 flex-1 flex-col">
                <Header
                    title={title}
                    backHref={backHref}
                    actions={actions}
                    onOpenMenu={() => setMobileOpen(true)}
                />
                <main className="flex-1 px-4 py-6 sm:px-6">{children}</main>
            </div>

            <Toaster position="bottom-right" />
        </div>
    );
}
