import Popover from "@/Components/common/popover";
import { CheckIcon, NavArrowDownIcon } from "@/Components/icons";
import { useState } from "react";

export type SortOption = {
    value: string;
    label: string;
};

type SortMenuProps = {
    options: SortOption[];
    value?: string | null;
    onChange: (value: string) => void;
    placeholder?: string;
};

export default function SortMenu({ options, value, onChange, placeholder = "Sort by" }: SortMenuProps) {
    const [open, setOpen] = useState(false);
    const selected = options.find((option) => option.value === value);

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
                    className="flex cursor-pointer items-center gap-2 rounded-lg text-body-xs text-neutral-600 outline-none transition-colors hover:text-neutral-800 focus-visible:ring-[3px] focus-visible:ring-primary-50"
                >
                    {selected ? `${placeholder}: ${selected.label}` : placeholder}
                    <NavArrowDownIcon className={`size-4 transition-transform ${open ? "rotate-180" : ""}`} />
                </button>
            }
        >
            <ul
                role="listbox"
                aria-label={placeholder}
                className="flex w-max min-w-44 flex-col gap-1 rounded-[20px] border border-neutral-200 bg-base-white p-3 shadow-panel"
            >
                {options.map((option) => {
                    const active = option.value === selected?.value;

                    return (
                        <li key={option.value} role="option" aria-selected={active}>
                            <button
                                type="button"
                                onClick={() => {
                                    setOpen(false);
                                    onChange(option.value);
                                }}
                                className={`flex w-full cursor-pointer items-center justify-between gap-4 rounded-lg px-3 py-2 text-left text-body-xs whitespace-nowrap outline-none transition-colors hover:bg-neutral-50 focus-visible:bg-neutral-50 ${
                                    active ? "font-medium text-primary-500" : "text-neutral-700"
                                }`}
                            >
                                {option.label}
                                {active && <CheckIcon className="size-4" />}
                            </button>
                        </li>
                    );
                })}
            </ul>
        </Popover>
    );
}
