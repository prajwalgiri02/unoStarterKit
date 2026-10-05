import type { PaginatedResponse } from "../ui/pagination";

export type VerificationChannel = "email" | "phone";

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
    is_email_verified: boolean;
    is_phone_verified: boolean;
    pending_verifications: VerificationChannel[];
    approved_at: string | null;
    email_verified_at: string | null;
    phone_verified_at: string | null;
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
