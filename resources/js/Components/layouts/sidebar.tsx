import LogoMark from "@/Components/common/logo-mark";
import { CMS_AUTH_SIGN_OUT_PATH, sidebar } from "@/lib/constants/sidebar";
import { Link, router, usePage } from "@inertiajs/react";
import { ChevronLeftSmallIcon, LogoutIcon } from "@/Components/icons";

type SidebarProps = {
    collapsed: boolean;
    onToggleCollapsed: () => void;
    mobileOpen: boolean;
    onCloseMobile: () => void;
};

function isActive(currentPath: string, path: string) {
    return currentPath === path || currentPath.startsWith(`${path}/`);
}

const itemBase =
    "flex h-11 w-full shrink-0 cursor-pointer overflow-hidden items-center gap-4 rounded-[10px] px-4 text-body-md text-neutral-700 outline-none transition-colors hover:bg-neutral-50 focus-visible:ring-[3px] focus-visible:ring-primary-50";

export default function Sidebar({
    collapsed,
    onToggleCollapsed,
    mobileOpen,
    onCloseMobile,
}: SidebarProps) {
    const { url } = usePage();
    const currentPath = url.split("?")[0];
    const labelHidden = collapsed ? "lg:sr-only" : "";
    const itemClass = `${itemBase} ${collapsed ? "lg:justify-center lg:px-0" : ""}`;

    return (
        <>
            {mobileOpen && (
                <div
                    className="fixed inset-0 z-30 bg-backdrop backdrop-blur-backdrop lg:hidden"
                    onClick={onCloseMobile}
                    aria-hidden="true"
                />
            )}

            <aside
                className={`fixed inset-y-0 left-0 z-40 flex w-[276px] shrink-0 flex-col gap-2 rounded-r-2xl lg:gap-8 bg-base-white shadow-sidebar transition-[width,translate] duration-200 lg:sticky lg:top-0 lg:h-dvh lg:translate-x-0 ${mobileOpen ? "translate-x-0" : "-translate-x-full"} ${collapsed ? "lg:w-24" : ""}`}
            >
                <div className="relative flex shrink-0 justify-center px-4.5 pt-8 pb-4.5">
                    <LogoMark className={`text-primary-500 size-[88px] transition-all ${collapsed ? "lg:size-12" : ""}`} />
                    <button
                        type="button"
                        onClick={onToggleCollapsed}
                        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
                        aria-expanded={!collapsed}
                        className="absolute top-11 -right-3 hidden size-6 cursor-pointer items-center justify-center rounded-full border border-neutral-100 bg-base-white text-neutral-600 outline-none transition-colors hover:text-primary-500 focus-visible:ring-[3px] focus-visible:ring-primary-50 lg:flex"
                    >
                        <ChevronLeftSmallIcon className={`size-4 transition-transform ${collapsed ? "rotate-180" : ""}`} />
                    </button>
                </div>

                <nav aria-label="Main" className="flex flex-1 flex-col gap-6 overflow-y-auto scrollbar-none px-6 pb-8">
                    {sidebar.map(({ label, icon: Icon, path }) => {
                        const active = isActive(currentPath, path);

                        return (
                            <Link
                                key={path}
                                href={path}
                                title={collapsed ? label : undefined}
                                aria-current={active ? "page" : undefined}
                                className={`${itemClass} ${active ? "bg-primary-50 font-medium hover:bg-primary-50" : ""}`}
                            >
                                <Icon className="size-6 shrink-0" />
                                <span className={`whitespace-nowrap ${labelHidden}`}>{label}</span>
                            </Link>
                        );
                    })}

                    <button
                        type="button"
                        title={collapsed ? "Logout" : undefined}
                        onClick={() => router.post(CMS_AUTH_SIGN_OUT_PATH)}
                        className={itemClass}
                    >
                        <LogoutIcon className="size-6 shrink-0" />
                        <span className={`whitespace-nowrap ${labelHidden}`}>Logout</span>
                    </button>
                </nav>
            </aside>
        </>
    );
}
