import React from "react";
import { router } from "@inertiajs/react";
import type { BroadcastNotification } from "@/types/cms/notification";

interface SentNotificationsProps {
    notifications: {
        data: BroadcastNotification[];
        current_page: number;
        last_page: number;
        total: number;
        per_page: number;
    };
}

const SentNotifications: React.FC<SentNotificationsProps> = ({
    notifications,
}) => {
    const items = notifications?.data ?? [];

    const formatDate = (dateStr: string | null) => {
        if (!dateStr) return "—";
        return new Date(dateStr).toLocaleDateString();
    };

    return (
        <div className="notification-card">
            <div className="table-header">
                <h2 className="subtitle-md">Sent Notifications</h2>
            </div>
            <div className="table-wrapper table-responsive">
                <table className="notification-table">
                    <thead>
                        <tr>
                            <th>Title</th>
                            <th>Message</th>
                            <th>Location</th>
                            <th>Subscription</th>
                            <th>All Users</th>
                            <th>Sent At</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.length === 0 ? (
                            <tr>
                                <td
                                    colSpan={6}
                                    className="text-center py-4 body-xs text-neutral-500"
                                >
                                    No notifications sent yet.
                                </td>
                            </tr>
                        ) : (
                            items.map((n) => (
                                <tr key={n.id}>
                                    <td className="body-xs text-neutral-700 font-medium">
                                        {n.title}
                                    </td>
                                    <td className="body-xs text-neutral-700">
                                        {n.message}
                                    </td>
                                    <td className="body-xs text-neutral-700">
                                        {n.location ? (
                                            <span className="location-badge caption-md">
                                                {n.location}
                                            </span>
                                        ) : (
                                            "—"
                                        )}
                                    </td>
                                    <td className="body-xs text-neutral-700">
                                        {n.subscription_type || "—"}
                                    </td>
                                    <td className="body-xs text-neutral-700">
                                        {n.send_to_all ? "Yes" : "No"}
                                    </td>
                                    <td className="body-xs text-neutral-700">
                                        {formatDate(n.sent_at)}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default SentNotifications;
