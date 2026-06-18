import React, { useEffect, useRef } from "react";
import { Chart, registerables } from "chart.js/auto";
import type { ChartConfiguration } from "chart.js/auto";

Chart.register(...registerables);
Chart.defaults.font.family = "Manrope";

interface ChartCardProps {
    title: string;
    filterOptions?: { value: string; label: string }[];
    chartConfig: ChartConfiguration;
    chartId?: string;
    containerClass?: string;
    headerClass?: string;
    titleClass?: string;
    chartContainerClass?: string;
}

const ChartCard: React.FC<ChartCardProps> = ({
    title,
    filterOptions,
    chartConfig,
    chartId,
    containerClass = "chart-card",
    headerClass = "chart-header",
    titleClass = "chart-title",
    chartContainerClass = "chart-container",
}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const chartRef = useRef<Chart | null>(null);

    useEffect(() => {
        if (canvasRef.current) {
            if (chartRef.current) {
                chartRef.current.destroy();
            }
            chartRef.current = new Chart(canvasRef.current, chartConfig);
        }
        return () => {
            if (chartRef.current) {
                chartRef.current.destroy();
            }
        };
    }, [chartConfig]);

    return (
        <div className={containerClass}>
            <div className={headerClass}>
                <h3 className={titleClass}>{title}</h3>
                {filterOptions && (
                    <div className="chart-filter">
                        <span className="filter-label link-md-400">
                            Sort by
                        </span>
                        <div className="dropdown-select link-md-400">
                            <select className="link-md-400 text-neutral-500">
                                {filterOptions.map((opt) => (
                                    <option key={opt.value} value={opt.value}>
                                        {opt.label}
                                    </option>
                                ))}
                            </select>
                            <img src="/icons/arrow-down.svg" alt="Arrow Down" />
                        </div>
                    </div>
                )}
            </div>
            <div className={chartContainerClass}>
                <canvas ref={canvasRef} id={chartId}></canvas>
            </div>
        </div>
    );
};

export default ChartCard;

export const chartColors = {
    cyan: "#12BDCB",
    red: "#F04F5F",
    teal: "#0D7082",
    orange: "#F79138",
    yellow: "#FFD217",
    primary: "#0F7185",
    grid: "#EFF0F2",
    text: "#56687A",
};

export const commonOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: { display: false },
        tooltip: {
            backgroundColor: "#344054",
            titleFont: { family: "Manrope", size: 12 },
            bodyFont: { family: "Manrope", size: 14, weight: "bold" as const },
            padding: 10,
            cornerRadius: 8,
            displayColors: false,
            titleColor: "#ffffff",
            bodyColor: "#ffffff",
            yAlign: "bottom" as const,
            caretSize: 6,
            callbacks: {
                title: () => "",
            },
        },
    },
    scales: {
        x: {
            grid: { display: false },
            border: { display: false },
            ticks: {
                font: { family: "Manrope", size: 12 },
                color: chartColors.text,
            },
        },
        y: {
            border: { display: false },
            grid: {
                color: chartColors.grid,
            },
            ticks: {
                font: { family: "Manrope", size: 12 },
                color: chartColors.text,
            },
        },
    },
};
