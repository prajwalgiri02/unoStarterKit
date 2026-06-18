import React from "react";

const SentNotifications: React.FC = () => {
    const notifications = [
        {
            id: 1,
            message:
                "This is placeholder text only, intended for visual demonstration purposes only.",
            locations: [
                { label: "QLD", color: "primary" },
                { label: "NSW", color: "warning" },
                { label: "+2", color: "more" },
            ],
            subscriptionType: "Monthly",
            allUsers: "All users",
        },
        {
            id: 2,
            message:
                "This is placeholder text only, intended for visual demonstration purposes only.",
            locations: [
                { label: "QLD", color: "primary" },
                { label: "NSW", color: "warning" },
                { label: "+2", color: "more" },
            ],
            subscriptionType: "Monthly",
            allUsers: "--",
        },
        {
            id: 3,
            message:
                "This is placeholder text only, intended for visual demonstration purposes only.",
            locations: [
                { label: "QLD", color: "primary" },
                { label: "NSW", color: "warning" },
                { label: "+2", color: "more" },
            ],
            subscriptionType: "Yearly",
            allUsers: "--",
        },
        {
            id: 4,
            message:
                "This is placeholder text only, intended for visual demonstration purposes only.",
            locations: [
                { label: "QLD", color: "primary" },
                { label: "NSW", color: "warning" },
                { label: "+2", color: "more" },
            ],
            subscriptionType: "Monthly",
            allUsers: "All users",
        },
        {
            id: 5,
            message:
                "This is placeholder text only, intended for visual demonstration purposes only.",
            locations: [
                { label: "QLD", color: "primary" },
                { label: "NSW", color: "warning" },
                { label: "+2", color: "more" },
            ],
            subscriptionType: "Monthly",
            allUsers: "--",
        },
        {
            id: 6,
            message:
                "This is placeholder text only, intended for visual demonstration purposes only.",
            locations: [
                { label: "QLD", color: "primary" },
                { label: "NSW", color: "warning" },
                { label: "+2", color: "more" },
            ],
            subscriptionType: "Yearly",
            allUsers: "All users",
        },
        {
            id: 7,
            message:
                "This is placeholder text only, intended for visual demonstration purposes only.",
            locations: [
                { label: "QLD", color: "primary" },
                { label: "NSW", color: "warning" },
                { label: "+2", color: "more" },
            ],
            subscriptionType: "Monthly",
            allUsers: "All users",
        },
    ];

    return (
        <div className="notification-card">
            <div className="table-header">
                <h2 className="subtitle-md">Sent Notifications</h2>
            </div>
            <div className="table-wrapper table-responsive">
                <table className="notification-table">
                    <thead>
                        <tr>
                            <th>Message</th>
                            <th>Location</th>
                            <th>Subscription Type</th>
                            <th>All users</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {notifications.map((n) => (
                            <tr key={n.id}>
                                <td className="body-xs text-neutral-700">
                                    {n.message}
                                </td>
                                <td className="location-lists">
                                    {n.locations.map((loc, idx) => (
                                        <span
                                            key={idx}
                                            className={`location-badge ${
                                                loc.color === "more"
                                                    ? "more-location"
                                                    : `bg-${loc.color}-50 text-${loc.color}-500`
                                            } caption-md`}
                                        >
                                            {loc.label}
                                        </span>
                                    ))}
                                </td>
                                <td className="body-xs text-neutral-700">
                                    {n.subscriptionType}
                                </td>
                                <td className="body-xs text-neutral-700">
                                    {n.allUsers}
                                </td>
                                <td className="actions-cell-notify">
                                    <button>
                                        <img
                                            src="/icons/edit-notify.svg"
                                            alt="Edit"
                                            width="17"
                                            height="17"
                                        />
                                    </button>
                                    <button
                                        className="actions-btn"
                                        data-id={n.id}
                                    >
                                        <img
                                            src="/icons/delete-notify.svg"
                                            alt="Delete"
                                            width="17"
                                            height="17"
                                        />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default SentNotifications;
