export interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

export interface PaginationMeta {
    current_page: number;
    from: number;
    to: number;
    total: number;
    links: PaginationLink[];
    per_page: number;
}

export interface PaginatedResponse<T> {
    data: T[];
    meta: PaginationMeta;
}
