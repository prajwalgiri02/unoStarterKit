import React, { useMemo } from "react";
import ChartCard, { chartColors, commonOptions } from "../../common/ChartCard";
import type { ChartConfiguration } from "chart.js";

const DashboardCharts: React.FC = () => {
    const phaseDistributionConfig: ChartConfiguration = useMemo(
        () => ({
            type: "bar",
            data: {
                labels: [
                    "Sparks",
                    "Kindlers",
                    "Flames",
                    "Beacons",
                    "Light Bearers",
                ],
                datasets: [
                    {
                        data: [520, 340, 480, 300, 120],
                        backgroundColor: [
                            chartColors.cyan,
                            chartColors.red,
                            chartColors.teal,
                            chartColors.orange,
                            chartColors.yellow,
                        ],
                        borderRadius: 10,
                        borderSkipped: false,
                        maxBarThickness: 58,
                    },
                ],
            },
            options: {
                ...commonOptions,
                scales: {
                    ...commonOptions.scales,
                    x: {
                        ...commonOptions.scales?.x,
                        offset: true,
                    },
                    y: {
                        ...commonOptions.scales?.y,
                        beginAtZero: true,
                        max: 600,
                        ticks: {
                            ...commonOptions.scales?.y?.ticks,
                            stepSize: 200,
                            callback: (value: any) =>
                                window.innerWidth < 576
                                    ? value
                                    : value + "          ",
                        },
                    },
                },
                plugins: {
                    ...commonOptions.plugins,
                    tooltip: {
                        ...commonOptions.plugins?.tooltip,
                        callbacks: {
                            title: () => "",
                            label: (context: any) =>
                                `${context.parsed.y} Users`,
                        },
                    },
                },
            },
        }),
        [],
    );

    const lessonCompletionConfig: ChartConfiguration = useMemo(
        () => ({
            type: "line",
            data: {
                labels: [
                    "Jan",
                    "Feb",
                    "Mar",
                    "Apr",
                    "May",
                    "Jun",
                    "Jul",
                    "Aug",
                    "Sept",
                    "Oct",
                    "Nov",
                    "Dec",
                ],
                datasets: [
                    {
                        data: [
                            80, 95, 110, 85, 140, 100, 120, 95, 130, 110, 125,
                            105,
                        ],
                        borderColor: chartColors.primary,
                        backgroundColor: "transparent",
                        borderWidth: 3,
                        tension: 0.4,
                        pointRadius: 0,
                        pointHoverRadius: 0,
                    },
                ],
            },
            options: {
                ...commonOptions,
                scales: {
                    ...commonOptions.scales,
                    y: {
                        ...commonOptions.scales?.y,
                        beginAtZero: true,
                        max: 200,
                        ticks: {
                            ...commonOptions.scales?.y?.ticks,
                            stepSize: 50,
                            callback: (value: any) =>
                                window.innerWidth < 576
                                    ? value
                                    : value + "          ",
                        },
                    },
                },
                plugins: {
                    ...commonOptions.plugins,
                    tooltip: {
                        ...commonOptions.plugins?.tooltip,
                        callbacks: {
                            title: () => "",
                            label: (context: any) =>
                                `${context.parsed.y} Lessons`,
                        },
                    },
                },
            },
        }),
        [],
    );

    const dailyLoginsConfig: ChartConfiguration = useMemo(
        () => ({
            type: "line",
            data: {
                labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
                datasets: [
                    {
                        data: [180, 280, 350, 420, 480, 520, 580],
                        borderColor: chartColors.primary,
                        backgroundColor: "transparent",
                        borderWidth: 2,
                        tension: 0.4,
                        pointRadius: 5,
                        pointBackgroundColor: "#FFFFFF",
                        pointBorderColor: chartColors.primary,
                        pointBorderWidth: 2,
                        pointHoverRadius: 7,
                    },
                ],
            },
            options: {
                ...commonOptions,
                layout: {
                    padding: 2,
                },
                scales: {
                    x: {
                        grid: { display: false },
                        border: { display: false },
                        ticks: {
                            font: { family: "Poppins", size: 12 },
                            color: chartColors.text,
                        },
                    },
                    y: {
                        beginAtZero: true,
                        max: 600,
                        ticks: {
                            padding: 8,
                            stepSize: 150,
                            font: { family: "Poppins", size: 12 },
                            color: chartColors.text,
                            callback: (value) =>
                                window.innerWidth < 576 ? value : value + "   ",
                        },
                        border: { display: false },
                        grid: {
                            color: chartColors.grid,
                        },
                    },
                },
                interaction: { intersect: false, mode: "index" },
            },
        }),
        [],
    );

    const topWaypointsData = [
        { name: "Patience Like Jesus", phase: "Sparks", rating: "4.9" },
        { name: "Thank You God", phase: "Flames", rating: "4.2" },
        { name: "Forgiving Others", phase: "Kindlers", rating: "4.2" },
        { name: "Leading with Love", phase: "Light Bearers", rating: "4.0" },
        { name: "Discipleship in Action", phase: "Beacons", rating: "3.9" },
        { name: "Discipleship in Action", phase: "Beacons", rating: "3.9" },
        { name: "Discipleship in Action", phase: "Beacons", rating: "3.9" },
    ];

    return (
        <>
            <div className="charts-grid">
                <ChartCard
                    title="Phase Distribution"
                    chartId="phaseDistributionChart"
                    filterOptions={[
                        { value: "month", label: "Month" },
                        { value: "week", label: "Week" },
                        { value: "year", label: "Year" },
                    ]}
                    chartConfig={phaseDistributionConfig}
                />
                <ChartCard
                    title="Lesson Completion Rates"
                    chartId="lessonCompletionChart"
                    filterOptions={[
                        { value: "all", label: "All" },
                        { value: "pending", label: "Pending" },
                    ]}
                    chartConfig={lessonCompletionConfig}
                />
            </div>
            <div className="bottom-grid">
                <ChartCard
                    title="Daily Logins"
                    chartId="dailyLoginsChart"
                    chartConfig={dailyLoginsConfig}
                    containerClass="logins-card"
                    titleClass="logins-title"
                    chartContainerClass="logins-chart-container"
                    headerClass="logins-header"
                />
                <div className="table-card">
                    <div className="table-header">
                        <h3 className="table-title">Top Rated Waypoints</h3>
                    </div>
                    <div className="table-wrapper table-responsive">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Phase</th>
                                    <th>Avg. Rating</th>
                                    <th>View</th>
                                </tr>
                            </thead>
                            <tbody>
                                {topWaypointsData.map((wp, index) => (
                                    <tr key={index}>
                                        <td>{wp.name}</td>
                                        <td>{wp.phase}</td>
                                        <td>{wp.rating}</td>
                                        <td>
                                            <button className="view-btn">
                                                <img
                                                    src="/icons/eye.svg"
                                                    alt="View"
                                                />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </>
    );
};

export default DashboardCharts;
