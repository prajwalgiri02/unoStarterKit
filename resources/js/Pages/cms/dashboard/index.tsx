import Button from "@/Components/buttons/button";
import DateRangePicker, { type DateRange } from "@/Components/inputs/date-range-picker";
import AppLayout from "@/Layouts/app-layout";
import { router } from "@inertiajs/react";

function toQueryDate(date: Date | null) {
    if (!date) return undefined;
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${date.getFullYear()}-${month}-${day}`;
}

function fromQueryDate(value: string | null) {
    if (!value) return null;
    const [year, month, day] = value.split("-").map(Number);
    if (!year || !month || !day) return null;
    return new Date(year, month - 1, day);
}

const Dashboard = () => {
    const params = new URLSearchParams(window.location.search);
    const range: DateRange = {
        from: fromQueryDate(params.get("from")),
        to: fromQueryDate(params.get("to")),
    };

    const applyRange = ({ from, to }: DateRange) => {
        router.get(
            window.location.pathname,
            { from: toQueryDate(from), to: toQueryDate(to) },
            { preserveState: true, preserveScroll: true, replace: true },
        );
    };

    return (
        <div className="flex flex-col gap-8">
            <div className="flex items-center justify-end gap-5">
                <span className="text-link-sm font-normal text-neutral-600">Sort by</span>
                <DateRangePicker value={range} onApply={applyRange} />
                <Button size="medium">Export</Button>
            </div>
        </div>
    );
};

Dashboard.layout = (page: React.ReactNode) => (
    <AppLayout title="Dashboard">{page}</AppLayout>
);

export default Dashboard;
