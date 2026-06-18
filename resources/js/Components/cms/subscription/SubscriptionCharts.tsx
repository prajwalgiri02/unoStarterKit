import React, { useMemo } from "react";
import ChartCard, { commonOptions } from "../../common/ChartCard";
import type { ChartConfiguration } from "chart.js";

const SubscriptionCharts: React.FC = () => {
    const revenueChartConfig: ChartConfiguration = useMemo(
        () => ({
            type: "line",
            data: {
                labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
                datasets: [
                    {
                        label: "Revenue",
                        data: [8000, 12000, 15000, 18000, 22000, 28000],
                        borderColor: "#3CD984",
                        backgroundColor: "transparent",
                        borderWidth: 2,
                        tension: 0.4,
                        pointBackgroundColor: "#FFFFFF",
                        pointBorderColor: "#3CD984",
                        pointBorderWidth: 2,
                        pointRadius: 5,
                        pointHoverRadius: 7,
                    },
                ],
            },
            options: {
                ...commonOptions,
                plugins: {
                    ...commonOptions.plugins,
                    legend: {
                        display: false,
                    },
                },
                scales: {
                    ...commonOptions.scales,
                    y: {
                        ...commonOptions.scales?.y,
                        max: 32000,
                        ticks: {
                            ...commonOptions.scales?.y?.ticks,
                            stepSize: 8000,
                        },
                    },
                },
            },
        }),
        [],
    );

    const planChartConfig: ChartConfiguration = useMemo(
        () => ({
            type: "bar",
            data: {
                labels: ["Freemium", "Premium", "Family"],
                datasets: [
                    {
                        label: "Subscriptions",
                        data: [24000, 15000, 10000],
                        backgroundColor: ["#0F7185", "#FED119", "#00C0CD"],
                        borderRadius: 10,
                        borderSkipped: false,
                        maxBarThickness: 88,
                    },
                ],
            },
            options: {
                ...commonOptions,
                plugins: {
                    ...commonOptions.plugins,
                    legend: {
                        display: false,
                    },
                },
                scales: {
                    ...commonOptions.scales,
                    y: {
                        ...commonOptions.scales?.y,
                        max: 32000,
                        ticks: {
                            ...commonOptions.scales?.y?.ticks,
                            stepSize: 8000,
                        },
                    },
                },
            },
        }),
        [],
    );

    return (
        <div className="charts-row">
            <ChartCard
                title="Revenue Trend (6 Months)"
                chartConfig={revenueChartConfig}
                chartId="revenueChart"
                titleClass="chart-card-title"
            />
            <ChartCard
                title="Subscriptions by Plan"
                chartConfig={planChartConfig}
                chartId="planChart"
                titleClass="chart-card-title"
            />
        </div>
    );
};

export default SubscriptionCharts;
