import { Link, router, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronDown } from 'lucide-react';
import { STORAGE_KEYS } from '@/lib/constants/storage-keys';
import { CMS_AUTH_SIGN_OUT_PATH, sidebar } from '@/lib/constants/sidebar';
import { getItem, saveItem } from '@/services/storage.service';

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
    const currentPath = url.split('?')[0];

    const [collapsed, setCollapsed] = useState(() => readSidebarCollapsed());

    const [openGroups, setOpenGroups] = useState<Set<number>>(() => {
        if (typeof window === 'undefined') {
            return new Set();
        }
        const path = window.location.pathname.split('?')[0];
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
            {/* Mobile overlay */}
            <div
                className={`sidebar-overlay${mobileMenuOpen ? ' active' : ''}`}
                id="sidebarOverlay"
                onClick={onCloseMobile}
                role="presentation"
                aria-hidden={!mobileMenuOpen}
            />

            <aside
                className={`sidebar${collapsed ? ' collapsed' : ''}${mobileMenuOpen ? ' active' : ''}`}
                id="sidebar"
            >
                <div className="sidebar-header">
                    {/* Logo */}
                    <Link href="/" className="sidebar-logo-link">
                        <div className="sidebar-logo-icon">
                            <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="22" height="22">
                                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                            </svg>
                        </div>
                        <span className="sidebar-logo-text">Uno</span>
                    </Link>

                    <button
                        className="sidebar-collapse-btn"
                        id="sidebarCollapseBtn"
                        type="button"
                        onClick={toggleCollapsed}
                        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                    >
                        <ChevronLeft
                            size={20}
                            style={{
                                transform: collapsed ? 'rotate(180deg)' : 'none',
                                transition: 'transform 0.2s',
                            }}
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
                        const Icon = item.icon;

                        if (hasSubmenu) {
                            return (
                                <div className="nav-item-group" key={item.label}>
                                    <button
                                        type="button"
                                        className={`nav-item has-submenu${activeItem ? ' active' : ''}${groupOpen ? ' expanded' : ''}`}
                                        onClick={() => toggleGroup(index)}
                                    >
                                        <span className="nav-icon">
                                            <Icon size={20} className="nav-icon-img" />
                                        </span>
                                        <span className="nav-text">{item.label}</span>
                                        <span className="nav-arrow">
                                            <ChevronDown
                                                size={16}
                                                style={{
                                                    transform: groupOpen ? 'rotate(180deg)' : 'none',
                                                    transition: 'transform 0.2s',
                                                }}
                                            />
                                        </span>
                                    </button>

                                    {groupOpen && (
                                        <div className="nav-submenu">
                                            {item.sub_items?.map((subItem) => {
                                                const SubIcon = subItem.icon;
                                                return (
                                                    <Link
                                                        key={subItem.label}
                                                        href={subItem.path ?? '#'}
                                                        className={`nav-item nav-subitem${isPathActive(currentPath, subItem.path) ? ' active' : ''}`}
                                                    >
                                                        <span className="nav-icon">
                                                            <SubIcon size={18} className="nav-icon-img" />
                                                        </span>
                                                        <span className="nav-text">{subItem.label}</span>
                                                    </Link>
                                                );
                                            })}
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
                                    className="nav-item nav-logout"
                                    onClick={() => router.post(CMS_AUTH_SIGN_OUT_PATH)}
                                >
                                    <span className="nav-icon">
                                        <Icon size={20} className="nav-icon-img" />
                                    </span>
                                    <span className="nav-text">{item.label}</span>
                                </button>
                            );
                        }

                        return (
                            <Link
                                key={item.label}
                                href={item.path ?? '#'}
                                className={`nav-item${activeItem ? ' active' : ''}`}
                            >
                                <span className="nav-icon">
                                    <Icon size={20} className="nav-icon-img" />
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
