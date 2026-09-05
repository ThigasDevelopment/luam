import type { Reporter } from '@cli/reporting/reporter';

const RULE_WIDTH = 40;

function pad(value: number): string {
    return value.toString().padStart(2, '0');
}

export function formatTimestamp(at: Date): string {
    return `${pad(at.getHours())}:${pad(at.getMinutes())}:${pad(at.getSeconds())}`;
}

export function reportRebuildSeparator(reporter: Reporter, at: Date = new Date()): void {
    const rule = (reporter.capability.unicode ? '─' : '-').repeat(RULE_WIDTH);

    reporter.raw('');
    reporter.detail(`${rule} rebuild at ${formatTimestamp(at)}`);
}
