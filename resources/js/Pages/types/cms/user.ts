import type { PaginatedResponse } from "../ui/pagination";
import type { UserFilterState } from "../ui/filters";
import type { PhaseSummary } from "./phase";
import type { ColorConfig } from "../ui/common";

/** Mirrors UserCmsResource.php (list view) */
export interface UserCms {
    id: number;
    name: string;
    email: string;
    children_count: number;
    subscription: string;
    join_date: string;
    status: string;
}

/** Mirrors ChildrenResource.php (list view) */
export interface ChildListItem {
    id: number;
    name: string;
    age: number;
    phase: string;
    phase_colors: ColorConfig | null;
    waypoint: string;
    avatar: string;
    gender: string;
}

/** Mirrors UserDetailResource.php */
export interface UserDetail {
    id: number;
    name: string;
    email: string;
    status: string;
    tier: string;
    subscription: string;
    children_count: number;
    join_date: string;
    children: ChildListItem[];
}

/** Waypoint item in child detail view */
export interface Waypoint {
    id: number;
    name: string;
    lesson: string;
    status: string;
    assessment: string;
    files: string[];
}

/** Mirrors ChildDetailResource.php */
export interface ChildDetail {
    id: number;
    name: string;
    avatar: string;
    gender: string;
    parent: {
        name: string;
        email: string;
        status: string;
        tier: string;
    };
    waypoints: Waypoint[];
}

export interface UserStats {
    total_parents: number;
    total_children: number;
    active_users: number;
    premium_users: number;
}

export interface UserListPageProps {
    users: PaginatedResponse<UserCms>;
    stats: UserStats;
    phases: PhaseSummary[];
    tiers: string[];
    filters: UserFilterState;
}

export interface UserDetailPageProps {
    user: { data: UserDetail };
}

export interface ChildDetailPageProps {
    child: ChildDetail;
}
