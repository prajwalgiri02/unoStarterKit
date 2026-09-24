import Popover from "@/Components/common/popover";
import { useState, type ReactNode } from "react";

export type MenuItem = {
    label: string;
    icon?: ReactNode;
    tone?: "neutral" | "danger";
    disabled?: boolean;
    onSelect: () => void;
};

type DropdownMenuProps = {
    label: string;
    trigger: ReactNode;
    items: MenuItem[];
    align?: "start" | "end";
};

export default function DropdownMenu({ label, trigger, items, align = "end" }: DropdownMenuProps) {
    const [open, setOpen] = useState(false);

    return (
        <Popover
            open={open}
            onOpenChange={setOpen}
            align={align}
            trigger={
                <button
                    type="button"
                    aria-label={label}
                    aria-haspopup="menu"
                    aria-expanded={open}
                    onClick={(e) => {
                        e.stopPropagation();
                        setOpen((v) => !v);
                    }}
                    className="flex size-8 cursor-pointer items-center justify-center rounded-full text-neutral-600 outline-none transition-colors hover:bg-neutral-50 focus-visible:ring-[3px] focus-visible:ring-primary-50 [&>svg]:size-5"
                >
                    {trigger}
                </button>
            }
        >
            <div role="menu" className="flex min-w-52 flex-col gap-1 rounded-[20px] border border-neutral-200 bg-base-white p-3 shadow-panel">
                {items.map((item) => (
                    <button
                        key={item.label}
                        type="button"
                        role="menuitem"
                        disabled={item.disabled}
                        onClick={(e) => {
                            e.stopPropagation();
                            setOpen(false);
                            item.onSelect();
                        }}
                        className={`flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-left text-body-xs outline-none transition-colors hover:bg-neutral-50 focus-visible:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-50 [&_svg]:size-5 ${
                            item.tone === "danger" ? "text-error-500" : "text-neutral-700"
                        }`}
                    >
                        {item.icon && <span aria-hidden="true" className="flex shrink-0 text-primary-500">{item.icon}</span>}
                        {item.label}
                    </button>
                ))}
            </div>
        </Popover>
    );
}
