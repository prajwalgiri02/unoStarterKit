import { useEffect, useRef, type ReactNode } from "react";

type PopoverProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    trigger: ReactNode;
    align?: "start" | "end";
    className?: string;
    children: ReactNode;
};

export default function Popover({
    open,
    onOpenChange,
    trigger,
    align = "end",
    className = "",
    children,
}: PopoverProps) {
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!open) return;

        const handlePointer = (e: MouseEvent) => {
            if (!ref.current?.contains(e.target as Node)) onOpenChange(false);
        };
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") onOpenChange(false);
        };

        document.addEventListener("mousedown", handlePointer);
        document.addEventListener("keydown", handleKey);
        return () => {
            document.removeEventListener("mousedown", handlePointer);
            document.removeEventListener("keydown", handleKey);
        };
    }, [open, onOpenChange]);

    return (
        <div ref={ref} className="relative inline-flex">
            {trigger}
            {open && (
                <div
                    className={`absolute top-full z-30 mt-2 ${align === "end" ? "right-0" : "left-0"} ${className}`.trim()}
                >
                    {children}
                </div>
            )}
        </div>
    );
}
