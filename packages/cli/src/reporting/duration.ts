export function formatDuration(milliseconds: number): string {
    if (milliseconds < 1000) {
        return `${Math.round(milliseconds)} ms`;
    }

    return `${(milliseconds / 1000).toFixed(2)} s`;
}
