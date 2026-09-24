import { useRef, type ClipboardEvent, type KeyboardEvent } from "react";

type OtpInputProps = {
    length: number;
    value: string;
    onChange: (value: string) => void;
    hasError?: boolean;
    disabled?: boolean;
};

export default function OtpInput({
    length,
    value,
    onChange,
    hasError = false,
    disabled = false,
}: OtpInputProps) {
    const digits = Array.from({ length }, (_, i) => value[i] ?? "");
    const refs = useRef<Array<HTMLInputElement | null>>([]);

    const focus = (index: number) => refs.current[index]?.focus();

    const update = (next: string[]) => onChange(next.join("").trimEnd());

    const handleChange = (index: number, char: string) => {
        if (!/^\d$/.test(char)) return;
        update(digits.map((d, i) => (i === index ? char : d)));
        if (index < length - 1) focus(index + 1);
    };

    const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Backspace") {
            e.preventDefault();
            if (digits[index]) {
                update(digits.map((d, i) => (i === index ? "" : d)));
            } else if (index > 0) {
                update(digits.map((d, i) => (i === index - 1 ? "" : d)));
                focus(index - 1);
            }
        } else if (e.key === "ArrowLeft" && index > 0) {
            focus(index - 1);
        } else if (e.key === "ArrowRight" && index < length - 1) {
            focus(index + 1);
        }
    };

    const handlePaste = (e: ClipboardEvent) => {
        e.preventDefault();
        const pasted = e.clipboardData
            .getData("text")
            .replace(/\D/g, "")
            .slice(0, length);
        onChange(pasted);
        focus(Math.min(pasted.length, length - 1));
    };

    const stateClasses = hasError
        ? "border-error-500 bg-error-50"
        : "border-neutral-200 bg-neutral-50 focus:border-primary-500 focus:bg-primary-50";

    return (
        <div className="flex justify-center gap-4">
            {digits.map((digit, i) => (
                <input
                    key={i}
                    ref={(el) => {
                        refs.current[i] = el;
                    }}
                    type="text"
                    inputMode="numeric"
                    autoComplete={i === 0 ? "one-time-code" : "off"}
                    maxLength={1}
                    value={digit}
                    disabled={disabled}
                    aria-label={`Digit ${i + 1}`}
                    aria-invalid={hasError || undefined}
                    onChange={(e) => handleChange(i, e.target.value.slice(-1))}
                    onKeyDown={(e) => handleKeyDown(i, e)}
                    onPaste={handlePaste}
                    onFocus={(e) => e.target.select()}
                    className={`aspect-square min-w-0 max-w-16 flex-1 rounded-xl border text-center text-subtitle-sm text-neutral-900 outline-none transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${stateClasses}`}
                />
            ))}
        </div>
    );
}
