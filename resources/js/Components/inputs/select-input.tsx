import React, { useState, useRef, useEffect } from "react";

interface Option {
    value: string;
    label: string;
}

interface SelectInputProps {
    id?: string;
    label?: string;
    value: string;
    options: Option[];
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
    error?: string;
    disabled?: boolean;
}

const SelectInput: React.FC<SelectInputProps> = ({
    id,
    label,
    value,
    options,
    onChange,
    placeholder = "Select Option",
    className = "",
    error,
    disabled = false,
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const selectedOption = options.find(
        (opt) => opt.value === (value?.toString() ?? ""),
    );

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node)
            ) {
                setIsOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const handleSelect = (val: string) => {
        onChange(val);
        setIsOpen(false);
    };

    return (
        <div className={`d-flex flex-column gap-2 ${className}`}>
            {label && (
                <label htmlFor={id} className="caption-md text-neutral-700">
                    {label}
                </label>
            )}
            <div className="dropdown-select1" ref={dropdownRef}>
                <select
                    id={id}
                    className="select-input"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    style={{ display: "none" }}
                    aria-hidden="true"
                >
                    <option value="" disabled hidden>
                        {placeholder}
                    </option>
                    {options.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                            {opt.label}
                        </option>
                    ))}
                </select>

                <div className={`custom-select1 ${isOpen ? "open" : ""}`}>
                    <div
                        className={`custom-select1-trigger ${!selectedOption ? "is-placeholder" : ""}`}
                        onClick={() => !disabled && setIsOpen(!isOpen)}
                    >
                        <span>
                            {selectedOption
                                ? selectedOption.label
                                : placeholder}
                        </span>
                        <div>
                            <svg
                                viewBox="0 0 24 24"
                                fill="none"
                                className="custom-select-icon"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <path d="M6 9l6 6 6-6" />
                            </svg>
                        </div>
                    </div>
                    <div className="custom-select1-options">
                        {options.map((opt) => (
                            <div
                                key={opt.value}
                                className={`select-option ${opt.value === (value?.toString() ?? "") ? "selected" : ""}`}
                                onClick={() => handleSelect(opt.value)}
                            >
                                {opt.label}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            {error && <span className="text-danger caption-md">{error}</span>}
        </div>
    );
};

export default SelectInput;
