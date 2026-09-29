import Button from "@/Components/buttons/button";
import Popover from "@/Components/common/popover";
import { ArrowLeftIcon, ArrowRightIcon, ArrowSquareDownIcon } from "@/Components/icons";
import { useState } from "react";

export type DateRange = {
    from: Date | null;
    to: Date | null;
};

type DateRangePickerProps = {
    value: DateRange;
    onApply: (range: DateRange) => void;
    placeholder?: string;
};

const WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"];

function startOfDay(date: Date) {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function sameDay(a: Date | null, b: Date | null) {
    return !!a && !!b && a.getTime() === b.getTime();
}

function buildMonth(month: Date) {
    const first = new Date(month.getFullYear(), month.getMonth(), 1);
    const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
    const cells = Math.ceil((first.getDay() + daysInMonth) / 7) * 7;

    return Array.from({ length: cells }, (_, i) =>
        new Date(first.getFullYear(), first.getMonth(), i - first.getDay() + 1),
    );
}

function formatShort(date: Date) {
    return date.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

function formatRange({ from, to }: DateRange) {
    if (!from) return null;
    if (!to || sameDay(from, to)) return formatShort(from);
    return `${formatShort(from)} – ${formatShort(to)}`;
}

export default function DateRangePicker({
    value,
    onApply,
    placeholder = "Date",
}: DateRangePickerProps) {
    const [open, setOpen] = useState(false);
    const [draft, setDraft] = useState<DateRange>(value);
    const [month, setMonth] = useState(() => startOfDay(value.from ?? new Date()));

    const openPicker = () => {
        setDraft(value);
        setMonth(startOfDay(value.from ?? new Date()));
        setOpen((v) => !v);
    };

    const selectDay = (day: Date) => {
        const { from, to } = draft;
        if (!from || to) setDraft({ from: day, to: null });
        else if (day < from) setDraft({ from: day, to: from });
        else setDraft({ from, to: day });
    };

    const shiftMonth = (delta: number) =>
        setMonth((m) => new Date(m.getFullYear(), m.getMonth() + delta, 1));

    const apply = () => {
        onApply({ from: draft.from, to: draft.to ?? draft.from });
        setOpen(false);
    };

    const days = buildMonth(month);
    const label = formatRange(value) ?? placeholder;
    const hasRange = !!draft.from && !!draft.to && !sameDay(draft.from, draft.to);

    return (
        <Popover
            open={open}
            onOpenChange={setOpen}
            trigger={
                <button
                    type="button"
                    onClick={openPicker}
                    aria-haspopup="dialog"
                    aria-expanded={open}
                    className="flex h-8 cursor-pointer items-center gap-2 rounded-full border border-neutral-200 bg-base-white pr-2.5 pl-4 text-link-sm font-normal text-neutral-600 outline-none transition-colors hover:border-neutral-300 focus-visible:ring-[3px] focus-visible:ring-primary-50"
                >
                    {label}
                    <ArrowSquareDownIcon className="size-5" />
                </button>
            }
        >
            <div
                role="dialog"
                aria-label="Choose date range"
                className="w-[387px] max-w-[calc(100vw-2rem)] rounded-[20px] bg-base-white shadow-popover"
            >
                <div className="flex items-center justify-between border-b border-neutral-200/50 px-8 py-6">
                    <p className="text-subtitle-md text-neutral-900" aria-live="polite">
                        {month.toLocaleDateString("en-GB", { month: "long", year: "numeric" })}
                    </p>
                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={() => shiftMonth(-1)}
                            aria-label="Previous month"
                            className="flex size-[22px] cursor-pointer items-center justify-center rounded bg-neutral-100 text-neutral-700 outline-none transition-colors hover:bg-neutral-200 focus-visible:ring-[3px] focus-visible:ring-primary-50"
                        >
                            <ArrowLeftIcon className="size-4" />
                        </button>
                        <button
                            type="button"
                            onClick={() => shiftMonth(1)}
                            aria-label="Next month"
                            className="flex size-[22px] cursor-pointer items-center justify-center rounded bg-neutral-100 text-neutral-700 outline-none transition-colors hover:bg-neutral-200 focus-visible:ring-[3px] focus-visible:ring-primary-50"
                        >
                            <ArrowRightIcon className="size-4" />
                        </button>
                    </div>
                </div>

                <div className="px-6 py-6">
                    <div className="mb-4 grid grid-cols-7 text-center text-body-sm font-semibold text-neutral-500">
                        {WEEKDAYS.map((d, i) => (
                            <span key={i} aria-hidden="true">{d}</span>
                        ))}
                    </div>

                    <div className="grid grid-cols-7 gap-y-1">
                        {days.map((day) => {
                            const inMonth = day.getMonth() === month.getMonth();
                            const isStart = sameDay(day, draft.from);
                            const isEnd = sameDay(day, draft.to);
                            const selected = isStart || isEnd;
                            const inRange =
                                hasRange && !!draft.from && !!draft.to && day >= draft.from && day <= draft.to;

                            return (
                                <div key={day.getTime()} className="relative flex h-10 items-center justify-center">
                                    {inRange && (
                                        <span
                                            aria-hidden="true"
                                            className={`absolute inset-y-0 bg-primary-50 ${isStart ? "left-1/2" : "left-0"} ${isEnd ? "right-1/2" : "right-0"}`}
                                        />
                                    )}
                                    <button
                                        type="button"
                                        onClick={() => selectDay(day)}
                                        aria-pressed={selected}
                                        aria-label={day.toLocaleDateString("en-GB", { dateStyle: "full" })}
                                        className={`relative flex size-10 cursor-pointer items-center justify-center rounded-full text-body-md outline-none transition-colors focus-visible:ring-[3px] focus-visible:ring-primary-100 ${
                                            selected
                                                ? "bg-primary-500 font-semibold text-base-white"
                                                : `hover:bg-neutral-100 ${inMonth ? "text-neutral-600" : "text-neutral-300"}`
                                        }`}
                                    >
                                        {day.getDate()}
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="border-t border-neutral-200/50 px-7 py-4">
                    <Button className="w-full" onClick={apply} disabled={!draft.from}>
                        Apply
                    </Button>
                </div>
            </div>
        </Popover>
    );
}
