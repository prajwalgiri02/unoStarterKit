// @module:notifications
import NotificationDropdown from "@/Components/notifications/notification-dropdown";
import type { PageProps } from "@/Pages/types";
import { usePage } from "@inertiajs/react";
// @endmodule:notifications
import { Link } from "@inertiajs/react";
import { ArrowLeftIcon, MenuIcon } from "@/Components/icons";
import type { ReactNode } from "react";

type HeaderProps = {
    title: ReactNode;
    backHref?: string;
    actions?: ReactNode;
    onOpenMenu: () => void;
};

export default function Header({ title, backHref, actions, onOpenMenu }: HeaderProps) {
    // @module:notifications
    const { inboxNotifications = [] } = usePage<PageProps>().props;

    // @endmodule:notifications
    return (
        <header className="sticky top-0 z-20 flex h-[90px] shrink-0 items-center justify-between gap-4 border-b border-neutral-200 bg-base-white px-4 sm:px-[30px]">
            <div className="flex min-w-0 items-center gap-3">
                <button
                    type="button"
                    onClick={onOpenMenu}
                    aria-label="Open menu"
                    className="flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-[10px] text-neutral-700 outline-none transition-colors hover:bg-neutral-50 focus-visible:ring-[3px] focus-visible:ring-primary-50 lg:hidden"
                >
                    <MenuIcon className="size-6" />
                </button>
                {backHref && (
                    <Link
                        href={backHref}
                        aria-label="Back"
                        className="flex size-8 shrink-0 items-center justify-center rounded-full text-neutral-600 outline-none transition-colors hover:bg-neutral-50 focus-visible:ring-[3px] focus-visible:ring-primary-50"
                    >
                        <ArrowLeftIcon className="size-5" />
                    </Link>
                )}
                <h1 className="truncate text-title-sm text-neutral-900">{title}</h1>
            </div>

            <div className="flex shrink-0 items-center gap-5">
                {actions}
                {/* @module:notifications */}
                <NotificationDropdown notifications={inboxNotifications} />
                {/* @endmodule:notifications */}
            </div>
        </header>
    );
}
