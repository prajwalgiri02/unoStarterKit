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

export function secondsUntil(isoExpiresAt: string): number {
    const expires = Date.parse(isoExpiresAt);
    if (Number.isNaN(expires)) {
        return 0;
    }
    return Math.max(0, Math.ceil((expires - Date.now()) / 1000));
}
