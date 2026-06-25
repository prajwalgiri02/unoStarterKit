import { Link, router, usePage } from "@inertiajs/react";
import { useEffect, useRef, forwardRef } from "react";
import { createPortal } from "react-dom";
import { sidebar, CMS_AUTH_SIGN_OUT_PATH } from "@/lib/constants/sidebar";

// ─── Constants ───────────────────────────────────────────────────────────────

const MOBILE_BREAKPOINT = 720;

// ─── Helpers ─────────────────────────────────────────────────────────────────

function isMobile() {
    return window.innerWidth <= MOBILE_BREAKPOINT;
}

function isPathActive(currentPath: string, path?: string): boolean {
    if (!path) return false;
    return currentPath === path || currentPath.startsWith(`${path}/`);
}

// ─── Component ───────────────────────────────────────────────────────────────

interface SidebarProps {
    mobileOpen: boolean;
    onMobileToggle: () => void;
    onCloseMobile: () => void;
}

export default function Sidebar({ mobileOpen, onMobileToggle, onCloseMobile }: SidebarProps) {
    const { url } = usePage();
    const currentPath = url.split("?")[0];

    const sidebarRef = useRef<HTMLElement>(null);
    const menuBtnRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        function handleOutsideClick(e: MouseEvent) {
            if (!isMobile()) return;
            const target = e.target as Node;
            if (
                !sidebarRef.current?.contains(target) &&
                !menuBtnRef.current?.contains(target)
            ) {
                onCloseMobile();
            }
        }
        document.addEventListener("click", handleOutsideClick);
        return () => document.removeEventListener("click", handleOutsideClick);
    }, [onCloseMobile]);

    return (
        <>
            {/* ── Mobile overlay ── */}
            {mobileOpen && (
                <div
                    className="fixed inset-0 z-20 bg-black/40"
                    onClick={onCloseMobile}
                    aria-hidden="true"
                />
            )}

            {/* ── Sidebar ── */}
            <aside
                ref={sidebarRef}
                id="sidebar"
                className="sidebar"
            >
                {/* Header */}
                <div className="sidebar-head">
                    <img className="logo-mark" src="/images/logo.svg" alt="Logo" />
                </div>

                {/* Nav */}
                <nav className="sidebar-nav" aria-label="Main">
                    {sidebar.map((item) => {
                        const active = isPathActive(currentPath, item.path);

                        if (item.path === CMS_AUTH_SIGN_OUT_PATH) {
                            return (
                                <button
                                    key={item.label}
                                    type="button"
                                    className="nav-item logout w-full cursor-pointer border-0 bg-transparent text-left"
                                    onClick={() => router.post(CMS_AUTH_SIGN_OUT_PATH)}
                                >
                                    <img className="nav-icon" src={item.icon} alt={item.label} />
                                    <span>{item.label}</span>
                                </button>
                            );
                        }

                        return (
                            <Link
                                key={item.label}
                                href={item.path ?? "#"}
                                className={`nav-item${active ? " active" : ""}`}
                            >
                                <img className="nav-icon" src={item.icon} alt={item.label} />
                                <span>{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>
            </aside>

            {/* ── Mobile menu button ── */}
            <MobileMenuButton ref={menuBtnRef} onClick={onMobileToggle} />
        </>
    );
}

// ─── Mobile menu button ───────────────────────────────────────────────────────

const MobileMenuButton = forwardRef<HTMLButtonElement, { onClick: () => void }>(
    ({ onClick }, ref) => {
        const topbar = typeof document !== "undefined"
            ? document.querySelector(".topbar")
            : null;

        if (!topbar) return null;

        return createPortal(
            <button
                ref={ref}
                type="button"
                className="menu-btn cursor-pointer border-0 bg-transparent p-0"
                aria-label="Open menu"
                onClick={onClick}
            >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2">
                    <line x1="3" y1="12" x2="21" y2="12" />
                    <line x1="3" y1="6"  x2="21" y2="6"  />
                    <line x1="3" y1="18" x2="21" y2="18" />
                </svg>
            </button>,
            topbar,
        );
    }
);

MobileMenuButton.displayName = "MobileMenuButton";