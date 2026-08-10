import type { Reporter } from '@cli/reporting/reporter';

const RULE_WIDTH = 40;

export function formatTimestamp(at: Date): string {
    return at.toISOString().slice(11, 19);
}

export function reportRebuildSeparator(reporter: Reporter, at: Date = new Date()): void {
    const rule = (reporter.capability.unicode ? '─' : '-').repeat(RULE_WIDTH);

    reporter.raw('');
    reporter.detail(`${rule} rebuild at ${formatTimestamp(at)}`);
}
