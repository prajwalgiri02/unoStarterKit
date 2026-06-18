import {
    useEffect,
    useMemo,
    useState,
    type HTMLAttributes,
    type ReactNode,
} from "react";

export type ColumnDef<T> = {
    /** Unique key for this column (used as React key). */
    key: string;
    /** Column header label. */
    header: string;
    /** Render function for each cell in this column. */
    render: (row: T) => ReactNode;
    /** Optional class applied to every `<td>` in this column. */
    className?: string;
    /** Optional class applied to the `<th>` for this column. */
    headerClassName?: string;
};

/** Rows with a numeric or string `id` field get automatic key extraction and `data-id`. */
type WithId = { id: string | number };

type DataTableProps<T> = {
    /** Column definitions — order determines display order. */
    columns: ColumnDef<T>[];
    /** Array of data rows. */
    data: T[];
    /**
     * Extracts a unique React key from each row.
     * Omit when rows have an `id` field — the component uses it automatically.
     */
    keyExtractor?: (row: T, index: number) => string | number;
    /** Shown when `data` is empty. Defaults to "No records found." */
    emptyMessage?: string;
    /** Class for the outer wrapper div. Defaults to "phase-table-card table-responsive". */
    wrapperClassName?: string;
    /** Class for the `<table>` element. Defaults to "phase-table table". */
    tableClassName?: string;
    /**
     * Return extra HTML attributes spread onto each `<tr>`.
     * `data-id` is set automatically when rows have an `id` field — no need
     * to pass `rowProps` just for that.
     */
    rowProps?: (row: T) => HTMLAttributes<HTMLTableRowElement>;
    /** Enables local client-side pagination. */
    paginate?: boolean;
    /** Number of records shown per page initially. */
    defaultPerPage?: number;
    /** Allowed options for records shown per page. */
    perPageOptions?: number[];
};

function resolveKey<T>(
    row: T,
    index: number,
    keyExtractor?: (row: T, index: number) => string | number,
): string | number {
    if (keyExtractor) return keyExtractor(row, index);
    if (row && typeof row === "object" && "id" in row) {
        return (row as WithId).id;
    }
    return index;
}

/**
 * Generic, reusable data table.
 *
 * - `keyExtractor` is optional when rows have an `id` field.
 * - `data-id` is applied to every `<tr>` automatically when rows have an `id`.
 * - Extra `<tr>` attributes can still be added via `rowProps`.
 *
 * Usage:
 * ```tsx
 * <DataTable
 *   columns={[
 *     { key: "name", header: "Name", render: (row) => row.name },
 *     { key: "actions", header: "Actions", render: (row) => <TableActions ... /> },
 *   ]}
 *   data={items}
 *   emptyMessage="No items found."
 * />
 * ```
 */
export default function DataTable<T>({
    columns,
    data,
    keyExtractor,
    emptyMessage = "No records found.",
    wrapperClassName = "phase-table-card table-responsive",
    tableClassName = "phase-table table",
    rowProps,
    paginate = true,
    defaultPerPage = 10,
    perPageOptions = [10, 25, 50, 100],
}: DataTableProps<T>) {
    const normalizedPerPageOptions = useMemo(() => {
        const uniqueOptions = Array.from(
            new Set(perPageOptions.filter((value) => value > 0)),
        );
        if (uniqueOptions.length === 0) return [10, 25, 50, 100];
        return uniqueOptions.sort((a, b) => a - b);
    }, [perPageOptions]);

    const initialPerPage = normalizedPerPageOptions.includes(defaultPerPage)
        ? defaultPerPage
        : normalizedPerPageOptions[0];

    const [currentPage, setCurrentPage] = useState(1);
    const [perPage, setPerPage] = useState(initialPerPage);

    useEffect(() => {
        setPerPage(initialPerPage);
    }, [initialPerPage]);

    const totalRecords = data.length;
    const totalPages = paginate
        ? Math.max(1, Math.ceil(totalRecords / perPage))
        : 1;

    useEffect(() => {
        if (currentPage > totalPages) {
            setCurrentPage(totalPages);
        }
    }, [currentPage, totalPages]);

    const paginatedData = useMemo(() => {
        if (!paginate) return data;
        const start = (currentPage - 1) * perPage;
        return data.slice(start, start + perPage);
    }, [currentPage, data, paginate, perPage]);

    const fromRecord = totalRecords === 0 ? 0 : (currentPage - 1) * perPage + 1;
    const toRecord =
        totalRecords === 0 ? 0 : Math.min(currentPage * perPage, totalRecords);
    const visiblePageNumbers = useMemo(() => {
        if (totalPages <= 3) {
            return Array.from({ length: totalPages }, (_, i) => i + 1);
        }
        const start = Math.max(1, Math.min(currentPage - 1, totalPages - 2));
        return [start, start + 1, start + 2];
    }, [currentPage, totalPages]);

    const goToPage = (page: number) => {
        setCurrentPage(Math.max(1, Math.min(page, totalPages)));
    };

    const handlePerPageChange = (value: number) => {
        setPerPage(value);
        setCurrentPage(1);
    };

    return (
        <div
            className={wrapperClassName}
            style={{
                display: "flex",
                flexDirection: "column",
            }}
        >
            <table className={tableClassName}>
                <thead>
                    <tr>
                        {columns.map((col) => (
                            <th key={col.key} className={col.headerClassName}>
                                {col.header}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {totalRecords === 0 ? (
                        <tr>
                            <td
                                colSpan={columns.length}
                                className="text-center body-xs py-4"
                            >
                                {emptyMessage}
                            </td>
                        </tr>
                    ) : (
                        paginatedData.map((row, index) => {
                            const absoluteIndex = paginate
                                ? (currentPage - 1) * perPage + index
                                : index;
                            const key = resolveKey(
                                row,
                                absoluteIndex,
                                keyExtractor,
                            );
                            const autoDataId =
                                row && typeof row === "object" && "id" in row
                                    ? { "data-id": (row as WithId).id }
                                    : {};
                            const extra = rowProps ? rowProps(row) : {};

                            return (
                                <tr key={key} {...autoDataId} {...extra}>
                                    {columns.map((col) => (
                                        <td
                                            key={col.key}
                                            className={col.className}
                                        >
                                            {col.render(row)}
                                        </td>
                                    ))}
                                </tr>
                            );
                        })
                    )}
                </tbody>
            </table>
            {paginate && (
                <div className="table-pagination mt-auto">
                    <div className="pagination-info">
                        <div className="items-per-page">
                            <span className="caption-md">Items per page</span>
                            <div className="dropdown-select-sm">
                                <select
                                    className="body-xs text-neutral-600"
                                    value={perPage}
                                    onChange={(e) =>
                                        handlePerPageChange(
                                            Number(e.target.value),
                                        )
                                    }
                                >
                                    {normalizedPerPageOptions.map((option) => (
                                        <option key={option} value={option}>
                                            {option}
                                        </option>
                                    ))}
                                </select>
                                <img
                                    src="/icons/small-drop.svg"
                                    alt="Arrow Down"
                                />
                            </div>
                        </div>
                        <span className="records-count caption-md">
                            Records of {toRecord} of {totalRecords}
                        </span>
                    </div>

                    <div className="pagination-controls d-flex flex-wrap flex-md-nowrap align-items-center gap-2">
                        <button
                            type="button"
                            className={`pagination-btn caption-md ${currentPage === 1 ? "disabled" : ""}`}
                            disabled={currentPage === 1}
                            onClick={() => goToPage(1)}
                        >
                            First
                        </button>

                        {visiblePageNumbers.map((pageNumber) => (
                            <button
                                key={pageNumber}
                                type="button"
                                className={`pagination-btn caption-md ${currentPage === pageNumber ? "active" : ""}`}
                                onClick={() => goToPage(pageNumber)}
                            >
                                {pageNumber}
                            </button>
                        ))}

                        <button
                            type="button"
                            className={`pagination-btn caption-md ${currentPage === totalPages ? "disabled" : ""}`}
                            disabled={currentPage === totalPages}
                            onClick={() => goToPage(totalPages)}
                        >
                            Last
                        </button>

                        <div className="pagination-nav">
                            <button
                                type="button"
                                className={`pagination-nav-btn ${currentPage === 1 ? "disabled" : ""}`}
                                disabled={currentPage === 1}
                                onClick={() => goToPage(currentPage - 1)}
                            >
                                <img src="/icons/prev.svg" alt="Previous" />
                            </button>
                            <button
                                type="button"
                                className={`pagination-nav-btn ${currentPage === totalPages ? "disabled" : ""}`}
                                disabled={currentPage === totalPages}
                                onClick={() => goToPage(currentPage + 1)}
                            >
                                <img src="/icons/next.svg" alt="Next" />
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
