import type { PaginationLink } from "../ui/pagination";

export interface BroadcastNotification {
    id: number;
    title: string;
    message: string;
    location: string | null;
    subscription_type: string | null;
    send_to_all: boolean;
    url: string | null;
    sent_at: string | null;
    scheduled_at: string | null;
    created_at: string;
}

export interface BroadcastNotificationPageProps {
    notifications: {
        data: BroadcastNotification[];
        links: PaginationLink[];
        from: number | null;
        to: number | null;
        total: number;
    };
}
