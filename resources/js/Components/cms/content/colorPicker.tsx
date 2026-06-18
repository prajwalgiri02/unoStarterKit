import { useEffect, useId, useRef, useState } from "react";

type ColorPickerProps = {
    label: string;
    value: string;
    onChange: (value: string) => void;
    inputId?: string;
    disabled?: boolean;
};

const isHexColor = (value: string): boolean => /^#([0-9a-f]{6})$/i.test(value);

const normalizeHex = (value: string): string | null => {
    const trimmed = value.trim();
    if (!trimmed) {
        return null;
    }

    const withHash = trimmed.startsWith("#") ? trimmed : `#${trimmed}`;
    return isHexColor(withHash) ? withHash.toUpperCase() : null;
};

function ColorPicker({
    label,
    value,
    onChange,
    inputId,
    disabled = false,
}: ColorPickerProps) {
    const generatedId = useId();
    const resolvedId = inputId ?? `color-picker-${generatedId}`;
    const colorInputRef = useRef<HTMLInputElement | null>(null);
    const blobRef = useRef<HTMLButtonElement | null>(null);
    const normalizedValue = normalizeHex(value) ?? "#000000";
    const [hexInput, setHexInput] = useState(normalizedValue);
    const [pickerPosition, setPickerPosition] = useState<{
        top?: number;
        bottom?: number;
        left: number;
    }>({ top: 0, left: 0 });

    useEffect(() => {
        setHexInput(normalizedValue);
    }, [normalizedValue]);

    const openPicker = () => {
        if (disabled) {
            return;
        }
        const blob = blobRef.current;
        const picker = colorInputRef.current;
        if (!blob || !picker) {
            return;
        }

        const rect = blob.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        const spaceAbove = rect.top;
        const spaceBelow = viewportHeight - rect.bottom;
        const gap = 2;
        const openAbove = spaceAbove > spaceBelow && spaceAbove >= 160;

        const position = openAbove
            ? { bottom: viewportHeight - rect.top + gap, left: rect.left }
            : { top: rect.bottom + gap, left: rect.left };

        setPickerPosition(position);
        requestAnimationFrame(() => picker.click());
    };

    return (
        <div className={`color-field${disabled ? " disabled" : ""}`}>
            <div className="color-field-label">{label}</div>
            <div className="color-input-wrapper d-flex align-items-center gap-2">
                <button
                    ref={blobRef}
                    type="button"
                    className="color-preview border-0 p-0"
                    style={{
                        backgroundColor: normalizedValue,
                        width: 24,
                        height: 56,
                        borderRadius: 6,
                        cursor: disabled ? "default" : "pointer",
                        flexShrink: 0,
                        opacity: disabled ? 0.6 : 1,
                    }}
                    aria-label={`Pick ${label}`}
                    onClick={openPicker}
                    disabled={disabled}
                />
                <div className="w-100 color-picker-container">
                    <input
                        type="color"
                        ref={colorInputRef}
                        id={resolvedId}
                        value={normalizedValue}
                        title={`${label} visual picker`}
                        onChange={(event) =>
                            onChange(event.target.value.toUpperCase())
                        }
                        disabled={disabled}
                        style={{
                            position: "fixed",
                            top: pickerPosition.top,
                            bottom: pickerPosition.bottom,
                            left: pickerPosition.left,
                            width: 1,
                            height: 1,
                            opacity: 0,
                            pointerEvents: "none",
                            border: 0,
                            padding: 0,
                            margin: 0,
                        }}
                    />
                    <input
                        type="text"
                        className="color-picker-input color-value body-md text-neutral-900 w-100"
                        value={hexInput}
                        placeholder="#RRGGBB"
                        disabled={disabled}
                        onChange={(event) => {
                            const next = event.target.value;
                            setHexInput(next);
                            const normalized = normalizeHex(next);
                            if (normalized) {
                                onChange(normalized);
                            }
                        }}
                        onBlur={() => {
                            const normalized = normalizeHex(hexInput);
                            setHexInput(normalized ?? normalizedValue);
                        }}
                    />
                </div>
            </div>
        </div>
    );
}

export default ColorPicker;
