import Popover from "@/Components/common/popover";
import { ArrowSquareDownIcon, CheckIcon } from "@/Components/icons";
import { useState } from "react";

export type FilterOption = {
    value: string;
    label: string;
};

type FilterMenuProps = {
    label: string;
    options: FilterOption[];
    value?: string | null;
    onChange: (value: string | null) => void;
};

export default function FilterMenu({ label, options, value, onChange }: FilterMenuProps) {
    const [open, setOpen] = useState(false);
    const selected = options.find((option) => option.value === value);
    const items: { value: string | null; label: string }[] = [{ value: null, label: "All" }, ...options];

    return (
        <Popover
            open={open}
            onOpenChange={setOpen}
            trigger={
                <button
                    type="button"
                    aria-haspopup="listbox"
                    aria-expanded={open}
                    onClick={() => setOpen((v) => !v)}
                    className={`flex h-8 cursor-pointer items-center gap-1.5 rounded-full border pr-2.5 pl-3.5 text-link-sm font-normal outline-none transition-colors focus-visible:ring-[3px] focus-visible:ring-primary-50 ${
                        selected
                            ? "border-primary-500 text-primary-500"
                            : "border-neutral-200 text-neutral-600 hover:border-neutral-300 hover:text-neutral-800"
                    }`}
                >
                    {selected ? `${label}: ${selected.label}` : label}
                    <ArrowSquareDownIcon className={`size-5 transition-transform ${open ? "rotate-180" : ""}`} />
                </button>
            }
        >
            <ul
                role="listbox"
                aria-label={label}
                className="flex w-max min-w-40 flex-col gap-1 rounded-[20px] border border-neutral-200 bg-base-white p-3 shadow-panel"
            >
                {items.map((item) => {
                    const active = item.value === (selected?.value ?? null);

                    return (
                        <li key={item.value ?? "all"} role="option" aria-selected={active}>
                            <button
                                type="button"
                                onClick={() => {
                                    setOpen(false);
                                    onChange(item.value);
                                }}
                                className={`flex w-full cursor-pointer items-center justify-between gap-4 rounded-lg px-3 py-2 text-left text-body-xs whitespace-nowrap outline-none transition-colors hover:bg-neutral-50 focus-visible:bg-neutral-50 ${
                                    active ? "font-medium text-primary-500" : "text-neutral-700"
                                }`}
                            >
                                {item.label}
                                {active && <CheckIcon className="size-4" />}
                            </button>
                        </li>
                    );
                })}
            </ul>
        </Popover>
    );
}
