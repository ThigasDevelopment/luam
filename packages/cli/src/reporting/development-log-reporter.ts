import type { DevelopmentLogRecord } from '@cli/logging/log-record';
import { formatTimestamp } from '@cli/reporting/rebuild-separator';
import type { Reporter } from '@cli/reporting/reporter';
import type { StyleTone } from '@cli/reporting/output-style';

const LEVEL_TONES: Readonly<Partial<Record<DevelopmentLogRecord['level'], StyleTone>>> = {
    debug: 'muted',
    warn: 'warning',
    error: 'error',
};

export function formatDevelopmentLog(reporter: Reporter, record: DevelopmentLogRecord): string {
    const prefix = `[${formatTimestamp(record.timestamp)}][${record.environment}][${record.level}]`;
    const tone = LEVEL_TONES[record.level];
    const styled = tone === undefined ? prefix : reporter.style.paint(tone, prefix);
    const symbol = record.source?.symbol === undefined ? '' : ` (${record.source.symbol})`;
    const location = record.source === undefined ? '' : ` (${record.source.path}:${record.source.line}${symbol})`;

    return `${styled} ${record.message}${location}`;
}

export function reportDevelopmentLog(reporter: Reporter, record: DevelopmentLogRecord): void {
    if (reporter.capability.interactive) {
        reporter.paint(reporter.style.eraseLine());
    }

    reporter.raw(formatDevelopmentLog(reporter, record));
}
