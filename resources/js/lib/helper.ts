export function truncate(text: string, max = 70): string {
    return text.length > max ? `${text.slice(0, max)}...` : text;
}

export function formatCountdown(totalSeconds: number): string {
    if (totalSeconds <= 0) {
        return "0:00";
    }
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
}

export function formatDate(iso: string | null, withTime = false): string {
    if (!iso) return "—";
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return "—";

    const day = date.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
    if (!withTime) return day;

    return `${day}, ${date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}`;
}

export function formatRelativeTime(iso: string | null): string {
    if (!iso) return "";
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return "";

    const minutes = Math.floor((Date.now() - date.getTime()) / 60000);
    if (minutes < 1) return "now";
    if (minutes < 60) return `${minutes}m`;
    if (minutes < 60 * 24) return `${Math.floor(minutes / 60)}h`;

    return date.toLocaleDateString("en-GB");
}

export function secondsUntil(isoExpiresAt: string): number {
    const expires = Date.parse(isoExpiresAt);
    if (Number.isNaN(expires)) {
        return 0;
    }
    return Math.max(0, Math.ceil((expires - Date.now()) / 1000));
}
