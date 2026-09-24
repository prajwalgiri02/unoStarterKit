import type { ReactNode } from "react";

export type Column<T> = {
    key: string;
    header: ReactNode;
    render: (row: T) => ReactNode;
    className?: string;
};

type DataTableProps<T> = {
    columns: Column<T>[];
    rows: T[];
    rowKey: (row: T) => string | number;
    emptyMessage?: string;
    caption?: string;
};

export default function DataTable<T>({ columns, rows, rowKey, emptyMessage = "No records found", caption }: DataTableProps<T>) {
    return (
        <div className="-mx-1 overflow-x-auto px-1">
            <table className="w-full min-w-[640px] border-separate border-spacing-0 text-left">
                {caption && <caption className="sr-only">{caption}</caption>}
                <thead>
                    <tr>
                        {columns.map((column) => (
                            <th
                                key={column.key}
                                scope="col"
                                className={`border-b border-neutral-200 pr-4 pb-1.5 text-body-xs font-normal text-neutral-600 ${column.className ?? ""}`}
                            >
                                {column.header}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {rows.length === 0 ? (
                        <tr>
                            <td colSpan={columns.length} className="py-10 text-center text-body-xs text-neutral-500">
                                {emptyMessage}
                            </td>
                        </tr>
                    ) : (
                        rows.map((row) => (
                            <tr key={rowKey(row)}>
                                {columns.map((column) => (
                                    <td
                                        key={column.key}
                                        className={`py-2.5 pr-4 align-middle text-body-xs text-neutral-600 first:pt-4 ${column.className ?? ""}`}
                                    >
                                        {column.render(row)}
                                    </td>
                                ))}
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
}
