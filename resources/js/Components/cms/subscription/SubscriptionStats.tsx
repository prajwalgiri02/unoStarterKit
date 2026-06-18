import React from "react";

interface StatCardProps {
    icon: string;
    iconColor: string;
    change: string;
    isPositive: boolean;
    value: string;
    label: string;
}

const StatCard = ({
    icon,
    iconColor,
    change,
    isPositive,
    value,
    label,
}: StatCardProps) => (
    <div className="stat-card">
        <div className="stat-card-header">
            <div className={`stat-card-icon ${iconColor}`}>
                <img src={icon} alt={label} />
            </div>
            <span
                className={`stat-card-change body-sm ${
                    isPositive ? "positive" : "negative"
                }`}
            >
                {change}
            </span>
        </div>
        <div className="stat-card-value">{value}</div>
        <div className="stat-card-label">{label}</div>
    </div>
);

const SubscriptionStats = () => {
    const stats = [
        {
            icon: "/icons/dollar.svg",
            iconColor: "green",
            change: "+18.3%",
            isPositive: true,
            value: "$28,450",
            label: "Total Revenue",
        },
        {
            icon: "/icons/active-user.svg",
            iconColor: "teal",
            change: "+18.3%",
            isPositive: true,
            value: "342",
            label: "Active Subscriptions",
        },
        {
            icon: "/icons/renew.svg",
            iconColor: "blue",
            change: "+18.3%",
            isPositive: true,
            value: "46",
            label: "Renewals This Month",
        },
        {
            icon: "/icons/cancel.svg",
            iconColor: "red",
            change: "-20%",
            isPositive: false,
            value: "7",
            label: "Cancellations",
        },
    ];

    return (
        <div className="subscription-stats">
            {stats.map((stat, index) => (
                <StatCard key={index} {...stat} />
            ))}
        </div>
    );
};

export default SubscriptionStats;
