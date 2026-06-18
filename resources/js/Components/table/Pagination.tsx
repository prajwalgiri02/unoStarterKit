import React from "react";
import { Link } from "@inertiajs/react";
import { decodePaginationLabel } from "@/lib/security";

interface PaginationProps {
    links: {
        url: string | null;
        label: string;
        active: boolean;
    }[];
    meta?: {
        current_page: number;
        from: number;
        to: number;
        total: number;
        per_page: number;
    };
    onPerPageChange?: (perPage: number) => void;
}

const Pagination = ({ links, meta, onPerPageChange }: PaginationProps) => {
    if (!links || links.length === 0) return null;

    // First and Last logic
    const firstLink =
        links.find((l) => l.label.toLowerCase().includes("1")) || links[1];

    // Find last numerical link for "Last" button
    const lastNumLink = [...links]
        .reverse()
        .find((l) => !isNaN(Number(l.label)));

    const prevLink = links[0];
    const nextLink = links[links.length - 1];

    return (
        <div className="table-pagination">
            <div className="pagination-info">
                <div className="items-per-page">
                    <span className="caption-md">Items per page</span>
                    <div className="dropdown-select-sm">
                        <select
                            className="body-xs text-neutral-600"
                            value={meta?.per_page || 10}
                            onChange={(e) =>
                                onPerPageChange?.(Number(e.target.value))
                            }
                        >
                            <option value="10">10</option>
                            <option value="25">25</option>
                            <option value="50">50</option>
                            <option value="100">100</option>
                        </select>
                        <img src="/icons/small-drop.svg" alt="Arrow Down" />
                    </div>
                </div>
                {meta && (
                    <span className="records-count caption-md">
                        Records of {meta.to} of {meta.total}
                    </span>
                )}
            </div>

            <div className="pagination-controls flex flex-wrap md:flex-nowrap items-center gap-2">
                <Link
                    href={firstLink?.url || "#"}
                    className={`pagination-btn caption-md ${!firstLink?.url ? "disabled" : ""}`}
                    id="prevPageBtn"
                    preserveScroll
                    preserveState
                >
                    First
                </Link>

                {links.slice(1, -1).map((link, index) => (
                    <Link
                        key={index}
                        href={link.url || "#"}
                        className={`pagination-btn caption-md ${link.active ? "active" : ""} ${!link.url ? "disabled" : ""}`}
                        preserveScroll
                        preserveState
                    >
                        {decodePaginationLabel(link.label)}
                    </Link>
                ))}

                <Link
                    href={lastNumLink?.url || "#"}
                    className={`pagination-btn caption-md ${!lastNumLink?.url ? "disabled" : ""}`}
                    id="nextPageBtn"
                    preserveScroll
                    preserveState
                >
                    Last
                </Link>

                <div className="pagination-nav">
                    <Link
                        href={prevLink?.url || "#"}
                        className={`pagination-nav-btn ${!prevLink?.url ? "disabled" : ""}`}
                        id="firstPageBtn"
                        preserveScroll
                        preserveState
                    >
                        <img src="/icons/prev.svg" alt="prev" />
                    </Link>
                    <Link
                        href={nextLink?.url || "#"}
                        className={`pagination-nav-btn ${!nextLink?.url ? "disabled" : ""}`}
                        id="lastPageBtn"
                        preserveScroll
                        preserveState
                    >
                        <img src="/icons/next.svg" alt="next" />
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Pagination;
