import LogoMark from "@/Components/common/logo-mark";
import Popover from "@/Components/common/popover";
import { formatRelativeTime } from "@/lib/helper";
import type { AppNotification } from "@/Pages/types";
import { router } from "@inertiajs/react";
import { MoreIcon, NotificationBingIcon, NotificationIcon, TrashLinearIcon } from "@/Components/icons";
import { useState } from "react";

type NotificationDropdownProps = {
    notifications: AppNotification[];
};

const visitOptions = { preserveScroll: true, preserveState: true } as const;

const menuItemClass =
    "flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-left text-body-xs text-neutral-700 outline-none transition-colors hover:bg-neutral-50 focus-visible:bg-neutral-50 disabled:cursor-not-allowed disabled:text-neutral-400 disabled:hover:bg-transparent";

export default function NotificationDropdown({ notifications }: NotificationDropdownProps) {
    const [open, setOpen] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);

    const hasUnread = notifications.some((n) => !n.read);
    const isEmpty = notifications.length === 0;

    const markAllAsRead = () => {
        setMenuOpen(false);
        router.patch("/cms/notifications/mark-all-read", {}, visitOptions);
    };

    const clearAll = () => {
        setMenuOpen(false);
        router.delete("/cms/notifications/clear-all", visitOptions);
    };

    return (
        <Popover
            open={open}
            onOpenChange={setOpen}
            trigger={
                <button
                    type="button"
                    onClick={() => setOpen((v) => !v)}
                    aria-label="Notifications"
                    aria-expanded={open}
                    aria-haspopup="dialog"
                    className="relative flex size-12 cursor-pointer items-center justify-center rounded-[10px] bg-primary-500 text-base-white outline-none transition-colors hover:bg-primary-600 focus-visible:ring-[3px] focus-visible:ring-primary-100"
                >
                    <NotificationIcon className="size-6" />
                    {hasUnread && (
                        <span className="absolute top-2.5 right-3 size-2 rounded-full bg-error-500 ring-2 ring-primary-500" />
                    )}
                </button>
            }
        >
            <div
                role="dialog"
                aria-label="Notifications"
                className="w-[392px] max-w-[calc(100vw-2rem)] rounded-2xl border border-neutral-200 bg-base-white shadow-lg"
            >
                <div className="flex items-center justify-between gap-4 border-b border-neutral-100 px-6 py-5">
                    <h2 className="text-body-lg font-semibold text-neutral-900">Notifications</h2>
                    <Popover
                        open={menuOpen}
                        onOpenChange={setMenuOpen}
                        trigger={
                            <button
                                type="button"
                                onClick={() => setMenuOpen((v) => !v)}
                                aria-label="Notification options"
                                aria-expanded={menuOpen}
                                className="flex size-8 cursor-pointer items-center justify-center rounded-full text-neutral-600 outline-none transition-colors hover:bg-neutral-50 focus-visible:ring-[3px] focus-visible:ring-primary-50"
                            >
                                <MoreIcon className="h-1 w-5" />
                            </button>
                        }
                    >
                        <div className="flex w-[304px] max-w-[calc(100vw-2rem)] flex-col gap-2.5 rounded-[20px] border border-neutral-200 bg-base-white px-3 py-6 shadow-lg">
                            <button type="button" onClick={markAllAsRead} disabled={!hasUnread} className={menuItemClass}>
                                <NotificationBingIcon className="size-5 shrink-0" />
                                Mark all as read
                            </button>
                            <button type="button" onClick={clearAll} disabled={isEmpty} className={menuItemClass}>
                                <TrashLinearIcon className="size-5 shrink-0" />
                                Clear all notifications
                            </button>
                        </div>
                    </Popover>
                </div>

                {isEmpty ? (
                    <p className="px-6 py-10 text-center text-body-xs text-neutral-500">
                        No notifications yet
                    </p>
                ) : (
                    <ul className="max-h-[600px] overflow-y-auto rounded-b-2xl">
                        {notifications.map((n) => (
                            <li
                                key={n.id}
                                className={`flex justify-between gap-6 px-6 py-3 ${n.read ? "" : "bg-primary-50"}`}
                            >
                                <div className="flex min-w-0 items-center gap-3">
                                    <span className="flex size-[38px] shrink-0 items-center justify-center rounded-full bg-primary-500 text-base-white">
                                        <LogoMark className="size-5" />
                                    </span>
                                    <div className="min-w-0 text-body-xs text-neutral-900">
                                        <p className="font-medium">{n.title}</p>
                                        {n.message && <p className="line-clamp-2">{n.message}</p>}
                                    </div>
                                </div>
                                <div className="flex shrink-0 flex-col items-end gap-1">
                                    <span className="text-link-sm font-normal whitespace-nowrap text-neutral-400">
                                        {formatRelativeTime(n.created_at)}
                                    </span>
                                    {!n.read && (
                                        <span className="size-[5px] rounded-full bg-primary-500">
                                            <span className="sr-only">Unread</span>
                                        </span>
                                    )}
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </Popover>
    );
}
