import React from "react";

interface FormErrorAlertProps {
    message: string;
    className?: string;
    /** Used by scroll-to-error helpers (e.g. waypoint slot, lesson blocks). */
    id?: string;
}

/**
 * Form-level error banner (matches GGI styling).
 * Use for cross-field / builder-level issues (duplicate waypoint slot,
 * lesson missing content blocks). Standard single-field validation uses
 * inline errors on inputs.
 */
export default function FormErrorAlert({
    message,
    className = "mb-3",
    id,
}: FormErrorAlertProps) {
    if (!message) {
        return null;
    }

    return (
        <div
            id={id}
            className={`alert alert-danger p-2 body-sm flex items-center ${className}`}
            role="alert"
        >
            <img
                src="/icons/warning.svg"
                alt="warning"
                width="16"
                height="16"
                className="mr-2"
            />
            <span>{message}</span>
        </div>
    );
}
