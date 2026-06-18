import React from "react";

export interface FilterOption {
    value: string | number;
    label: string;
}

export interface FilterDropdownItem {
    value: string | number;
    onChange: (value: string) => void;
    options: FilterOption[];
    className?: string;
    containerClassName?: string;
    iconSrc?: string;
}

interface FilterRowProps {
    label?: string;
    items?: FilterDropdownItem[];
    className?: string;
    labelClassName?: string;
    dropdownContainerClassName?: string;
    dropdownClassName?: string;
    iconSrc?: string;
    children?: React.ReactNode;
}

const FilterRow: React.FC<FilterRowProps> = ({
    label = "Sort by",
    items = [],
    className = "filter-row",
    labelClassName = "filter-label body-xs",
    dropdownContainerClassName = "dropdown-select-sml",
    dropdownClassName = "body-xs text-neutral-600",
    iconSrc = "/icons/small-drop.svg",
    children,
}) => {
    return (
        <div className={className}>
            {label && <span className={labelClassName}>{label}</span>}
            {items.map((item, index) => (
                <div
                    key={index}
                    className={
                        item.containerClassName || dropdownContainerClassName
                    }
                >
                    <select
                        className={item.className || dropdownClassName}
                        value={item.value}
                        onChange={(e) => item.onChange(e.target.value)}
                        title={
                            item.options.find(
                                (opt) =>
                                    String(opt.value) === String(item.value),
                            )?.label || ""
                        }
                    >
                        {item.options.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                                {opt.label}
                            </option>
                        ))}
                    </select>
                    <img src={item.iconSrc || iconSrc} alt="Arrow Down" />
                </div>
            ))}
            {children}
        </div>
    );
};

export default FilterRow;
