type TabItem<T extends string> = {
    value: T;
    label: string;
};

type TabsProps<T extends string> = {
    items: TabItem<T>[];
    value: T;
    onChange: (value: T) => void;
    label: string;
    className?: string;
};

export default function Tabs<T extends string>({ items, value, onChange, label, className = "" }: TabsProps<T>) {
    return (
        <div
            role="tablist"
            aria-label={label}
            className={`inline-grid max-w-full auto-cols-fr grid-flow-col overflow-x-auto rounded-2xl bg-neutral-100 p-1 ${className}`.trim()}
        >
            {items.map((item) => {
                const selected = item.value === value;

                return (
                    <button
                        key={item.value}
                        type="button"
                        role="tab"
                        aria-selected={selected}
                        onClick={() => onChange(item.value)}
                        className={`min-w-[106px] cursor-pointer rounded-xl px-3 py-2 text-link-sm leading-[15px] font-semibold whitespace-nowrap outline-none transition-colors focus-visible:ring-[3px] focus-visible:ring-primary-100 ${
                            selected ? "bg-primary-500 text-neutral-50" : "text-neutral-500 hover:text-neutral-700"
                        }`}
                    >
                        {item.label}
                    </button>
                );
            })}
        </div>
    );
}
