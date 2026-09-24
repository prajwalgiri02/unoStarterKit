import type { PaginatedResponse } from "../ui/pagination";

export interface UserCms {
    id: number;
    name: string;
    email: string;
    phone: string | null;
    avatar: string | null;
    location: string | null;
    subscription_type: string | null;
    roles?: string[];
    is_blocked: boolean;
    is_approved: boolean;
    approved_at: string | null;
    blocked_at: string | null;
    created_at: string | null;
    updated_at: string | null;
}

export interface UserListPageProps {
    users: PaginatedResponse<UserCms>;
    filters: { search: string };
}

export interface UserDetailPageProps {
    user: { data: UserCms };
}
