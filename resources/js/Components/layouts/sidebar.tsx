import { Link, router, usePage } from "@inertiajs/react";
import { useEffect, useState } from "react";
import { STORAGE_KEYS } from "@/lib/constants/storage-keys";
import { CMS_AUTH_SIGN_OUT_PATH, sidebar } from "@/lib/constants/sidebar";
import { getItem, saveItem } from "@/services/storage.service";

function isPathActive(currentPath: string, path?: string): boolean {
    if (!path) return false;
    return currentPath === path || currentPath.startsWith(`${path}/`);
}

/** Index of the sidebar group whose sub-items include the current route, if any. */
function activeSubmenuParentIndex(currentPath: string): number | null {
    for (let i = 0; i < sidebar.length; i++) {
        const item = sidebar[i];
        if (!item.sub_items?.length) continue;
        if (item.sub_items.some((sub) => isPathActive(currentPath, sub.path))) {
            return i;
        }
    }
    return null;
}

function openGroupsForPath(currentPath: string): Set<number> {
    const parent = activeSubmenuParentIndex(currentPath);
    return parent !== null ? new Set([parent]) : new Set();
}

function readSidebarCollapsed(): boolean {
    return getItem<boolean>(STORAGE_KEYS.SIDEBAR_COLLAPSED) === true;
}

function persistSidebarCollapsed(collapsed: boolean): void {
    try {
        saveItem(STORAGE_KEYS.SIDEBAR_COLLAPSED, collapsed);
    } catch {
        /* quota / private mode */
    }
}

function persistSidebarOpenGroups(groups: Set<number>): void {
    try {
        saveItem(STORAGE_KEYS.SIDEBAR_OPEN_GROUPS, [...groups]);
    } catch {
        /* quota / private mode */
    }
}

type SidebarProps = {
    mobileMenuOpen?: boolean;
    onCloseMobile?: () => void;
};

export default function Sidebar({
    mobileMenuOpen = false,
    onCloseMobile,
}: SidebarProps) {
    const { url } = usePage();
    const currentPath = url.split("?")[0];

    const [collapsed, setCollapsed] = useState(() => readSidebarCollapsed());

    const [openGroups, setOpenGroups] = useState<Set<number>>(() => {
        if (typeof window === "undefined") {
            return new Set();
        }
        const path = window.location.pathname.split("?")[0];
        return openGroupsForPath(path);
    });

    useEffect(() => {
        const next = openGroupsForPath(currentPath);
        setOpenGroups((prev) => {
            if (
                prev.size === next.size &&
                [...prev].every((i) => next.has(i))
            ) {
                return prev;
            }
            persistSidebarOpenGroups(next);
            return next;
        });
    }, [currentPath]);

    const toggleCollapsed = () => {
        setCollapsed((prev) => {
            const next = !prev;
            persistSidebarCollapsed(next);
            return next;
        });
    };

    const toggleGroup = (index: number) => {
        setOpenGroups((prev) => {
            const next = new Set(prev);
            if (next.has(index)) {
                next.delete(index);
            } else {
                next.add(index);
            }
            persistSidebarOpenGroups(next);
            return next;
        });
    };

    return (
        <>
            <div
                className={`sidebar-overlay${mobileMenuOpen ? " active" : ""}`}
                id="sidebarOverlay"
                onClick={onCloseMobile}
                role="presentation"
                aria-hidden={!mobileMenuOpen}
            />
            <aside
                className={`sidebar${collapsed ? " collapsed" : ""}${mobileMenuOpen ? " active" : ""}`}
                id="sidebar"
            >
                <div className="sidebar-header">
                    <img src="/images/logo3.svg" alt="Logo" className="logo" />
                    <button
                        className="sidebar-collapse-btn"
                        id="sidebarCollapseBtn"
                        type="button"
                        onClick={toggleCollapsed}
                    >
                        <img
                            src="/icons/chevron-left.svg"
                            alt="Sidebar collapse"
                            style={{ width: "20px", height: "20px" }}
                        />
                    </button>
                </div>

                <nav className="nav-menu no-scrollbar">
                    {sidebar.map((item, index) => {
                        const hasSubmenu = Boolean(item.sub_items?.length);
                        const groupOpen = openGroups.has(index);
                        const activeItem =
                            isPathActive(currentPath, item.path) ||
                            item.sub_items?.some((sub) =>
                                isPathActive(currentPath, sub.path),
                            );

                        if (hasSubmenu) {
                            return (
                                <div
                                    className="nav-item-group"
                                    key={item.label}
                                >
                                    <button
                                        type="button"
                                        className={`nav-item body-md has-submenu border-0  w-100 text-start${activeItem ? " active" : ""}${groupOpen ? " expanded" : ""}`}
                                        onClick={() => toggleGroup(index)}
                                    >
                                        <span className="nav-icon">
                                            <item.icon
                                                className="nav-icon-img"
                                                size={20}
                                            />
                                        </span>
                                        <span className="nav-text">
                                            {item.label}
                                        </span>
                                        <span className="nav-arrow">
                                            <img
                                                src="/icons/dropdown.svg"
                                                alt="Arrow Down"
                                                style={{
                                                    transform: groupOpen
                                                        ? "rotate(180deg)"
                                                        : "none",
                                                }}
                                            />
                                        </span>
                                    </button>
                                    {groupOpen && (
                                        <div className="nav-submenu">
                                            {item.sub_items?.map((subItem) => (
                                                <Link
                                                    key={subItem.label}
                                                    href={subItem.path ?? "#"}
                                                    className={`nav-item body-md${isPathActive(currentPath, subItem.path) ? " active" : ""}`}
                                                >
                                                    <span className="nav-icon">
                                                        <subItem.icon
                                                            className="nav-icon-img"
                                                            size={20}
                                                        />
                                                    </span>
                                                    <span className="nav-text">
                                                        {subItem.label}
                                                    </span>
                                                </Link>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            );
                        }

                        if (item.path === CMS_AUTH_SIGN_OUT_PATH) {
                            return (
                                <button
                                    key={item.label}
                                    type="button"
                                    className="nav-item body-md border-0 bg-transparent w-100 text-start"
                                    onClick={() =>
                                        router.post(CMS_AUTH_SIGN_OUT_PATH)
                                    }
                                >
                                    <span className="nav-icon">
                                        <item.icon
                                            className="nav-icon-img"
                                            size={20}
                                        />
                                    </span>
                                    <span className="nav-text">
                                        {item.label}
                                    </span>
                                </button>
                            );
                        }

                        return (
                            <Link
                                key={item.label}
                                href={item.path ?? "#"}
                                className={`nav-item body-md${activeItem ? " active" : ""}`}
                            >
                                <span className="nav-icon">
                                    <item.icon
                                        className="nav-icon-img"
                                        size={20}
                                    />
                                </span>
                                <span className="nav-text">{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>
            </aside>
        </>
    );
}
