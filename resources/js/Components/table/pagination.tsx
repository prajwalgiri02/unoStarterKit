import { ArrowLeftIcon, ArrowRightIcon } from "@/Components/icons";
import { decodePaginationLabel } from "@/lib/security";
import { Link } from "@inertiajs/react";

type PaginationLink = {
    url: string | null;
    label: string;
    active: boolean;
};

type PaginationProps = {
    links: PaginationLink[];
    from?: number | null;
    to?: number | null;
    total?: number;
};

const itemClass =
    "flex size-8 items-center justify-center rounded-full text-body-xs outline-none transition-colors focus-visible:ring-[3px] focus-visible:ring-primary-50";

export default function Pagination({ links, from, to, total }: PaginationProps) {
    if (links.length <= 3) return null;

    const prev = links[0];
    const next = links[links.length - 1];
    const pages = links.slice(1, -1);

    const arrow = (link: PaginationLink, label: string, icon: React.ReactNode) =>
        link.url ? (
            <Link href={link.url} preserveScroll aria-label={label} className={`${itemClass} text-neutral-600 hover:bg-neutral-50`}>
                {icon}
            </Link>
        ) : (
            <span aria-hidden="true" className={`${itemClass} text-neutral-300`}>
                {icon}
            </span>
        );

    return (
        <nav aria-label="Pagination" className="flex flex-wrap items-center justify-between gap-4 pt-2">
            {total !== undefined && (
                <p className="text-body-xs text-neutral-600">
                    Showing {from ?? 0}–{to ?? 0} of {total}
                </p>
            )}
            <div className="flex items-center gap-1">
                {arrow(prev, "Previous page", <ArrowLeftIcon className="size-4" />)}
                {pages.map((link, index) =>
                    link.url ? (
                        <Link
                            key={index}
                            href={link.url}
                            preserveScroll
                            aria-current={link.active ? "page" : undefined}
                            className={`${itemClass} ${link.active ? "bg-primary-500 text-base-white" : "text-neutral-700 hover:bg-neutral-50"}`}
                        >
                            {decodePaginationLabel(link.label)}
                        </Link>
                    ) : (
                        <span key={index} className={`${itemClass} text-neutral-400`}>
                            {decodePaginationLabel(link.label)}
                        </span>
                    ),
                )}
                {arrow(next, "Next page", <ArrowRightIcon className="size-4" />)}
            </div>
        </nav>
    );
}
