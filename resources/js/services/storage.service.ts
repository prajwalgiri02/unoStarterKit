export function getItem<T>(key: string): T | null {
    if (typeof window === 'undefined') return null;
    try {
        const raw = localStorage.getItem(key);
        return raw !== null ? (JSON.parse(raw) as T) : null;
    } catch {
        return null;
    }
}

export function saveItem(key: string, value: unknown): void {
    if (typeof window === 'undefined') return;
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch {
        /* storage quota / private mode */
    }
}

export function removeItem(key: string): void {
    if (typeof window === 'undefined') return;
    try {
        localStorage.removeItem(key);
    } catch {
        /* ignore */
    }
}
