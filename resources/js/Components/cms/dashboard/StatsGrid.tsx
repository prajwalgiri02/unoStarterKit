import React from "react";

const StatsGrid: React.FC = () => {
    const stats: StatCardProps[] = [
        {
            icon: "/icons/dash-user.svg",
            label: "Total Users",
            value: 2960,
            change: "+ 201",
            type: "number",
        },
        {
            icon: "/icons/total-way.svg",
            label: "Total Waypoints",
            value: 2012,
            change: "+ 201",
            type: "number",
        },
        {
            icon: "/icons/active-sub.svg",
            label: "Active Subscriptions",
            value: 2012,
            change: "+ 201",
            type: "number",
        },
        {
            icon: "/icons/signup-user.svg",
            label: "New sign ups",
            value: 125,
            change: "+ 201",
            type: "number",
        },
        {
            icon: "/icons/engagment.svg",
            label: "Engagement Rate",
            value: 85,
            change: "+ 20%",
            type: "percentage",
        },
        {
            icon: "/icons/reports.svg",
            label: "Pending Reports",
            value: 45,
            linkText: "View all",
            type: "number",
        },
    ];

    return (
        <div className="stats-grid">
            {stats.map((stat, index) => (
                <StatCard key={index} {...stat} />
            ))}
        </div>
    );
};

interface StatCardProps {
    icon: string;
    label: string;
    value: string | number;
    change?: string;
    linkText?: string;
    type?: "number" | "percentage";
}

const StatCard: React.FC<StatCardProps> = ({
    icon,
    label,
    value,
    change,
    linkText,
    type = "number",
}) => {
    const formatValue = (val: string | number) => {
        const num = typeof val === "string" ? parseFloat(val) : val;
        if (isNaN(num)) return val;

        if (type === "percentage") {
            return `${num}%`;
        }

        return new Intl.NumberFormat().format(num);
    };

    return (
        <div className="stat-card">
            <div className="stat-icon">
                <img src={icon} alt={label} className="stat-icon-img" />
            </div>
            <p className="stat-label">{label}</p>
            <div className="flex justify-between items-center">
                <p className="stat-value">{formatValue(value)}</p>
                {change && <span className="stat-change">{change}</span>}
                {linkText && <span className="view-all-link">{linkText}</span>}
            </div>
        </div>
    );
};

export default StatsGrid;
