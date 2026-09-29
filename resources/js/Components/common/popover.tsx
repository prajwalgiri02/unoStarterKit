import { useCallback, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";

type PopoverProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    trigger: ReactNode;
    align?: "start" | "end";
    className?: string;
    children: ReactNode;
};

type Position = { top: number; left: number };

const GAP = 8;
const EDGE = 8;

export default function Popover({
    open,
    onOpenChange,
    trigger,
    align = "end",
    className = "",
    children,
}: PopoverProps) {
    const triggerRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);
    const pointerInside = useRef(false);
    const [position, setPosition] = useState<Position | null>(null);

    const updatePosition = useCallback(() => {
        const anchor = triggerRef.current?.getBoundingClientRect();
        const content = contentRef.current;
        if (!anchor || !content) return;

        const { offsetWidth: width, offsetHeight: height } = content;
        const viewportWidth = document.documentElement.clientWidth;
        const viewportHeight = window.innerHeight;

        const spaceBelow = viewportHeight - anchor.bottom - GAP - EDGE;
        const spaceAbove = anchor.top - GAP - EDGE;
        const top =
            height > spaceBelow && spaceAbove > spaceBelow
                ? Math.max(EDGE, anchor.top - GAP - height)
                : anchor.bottom + GAP;

        const preferredLeft = align === "end" ? anchor.right - width : anchor.left;
        const left = Math.min(Math.max(EDGE, preferredLeft), viewportWidth - width - EDGE);

        setPosition({ top, left });
    }, [align]);

    useLayoutEffect(() => {
        if (!open) {
            setPosition(null);
            return;
        }
        updatePosition();
    }, [open, updatePosition]);

    useEffect(() => {
        if (!open) return;

        const content = contentRef.current;
        const resizeObserver = content ? new ResizeObserver(updatePosition) : null;
        if (content) resizeObserver?.observe(content);

        const handlePointer = () => {
            if (!pointerInside.current) onOpenChange(false);
            pointerInside.current = false;
        };
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") onOpenChange(false);
        };

        document.addEventListener("mousedown", handlePointer);
        document.addEventListener("keydown", handleKey);
        window.addEventListener("resize", updatePosition);
        window.addEventListener("scroll", updatePosition, true);

        return () => {
            resizeObserver?.disconnect();
            document.removeEventListener("mousedown", handlePointer);
            document.removeEventListener("keydown", handleKey);
            window.removeEventListener("resize", updatePosition);
            window.removeEventListener("scroll", updatePosition, true);
        };
    }, [open, onOpenChange, updatePosition]);

    const markInside = () => {
        pointerInside.current = true;
    };

    return (
        <div ref={triggerRef} onMouseDownCapture={markInside} className="relative inline-flex">
            {trigger}
            {open &&
                createPortal(
                    <div
                        ref={contentRef}
                        onMouseDownCapture={markInside}
                        style={{
                            top: position?.top ?? 0,
                            left: position?.left ?? 0,
                            visibility: position ? "visible" : "hidden",
                        }}
                        className={`fixed z-50 ${className}`.trim()}
                    >
                        {children}
                    </div>,
                    document.body,
                )}
        </div>
    );
}
