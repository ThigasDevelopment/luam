import { describe, expect, it } from 'vitest';

import { formatDevelopmentLog, reportDevelopmentLog } from '@cli/reporting/development-log-reporter';

import { createMemoryReporter, createTtyReporter } from './support/memory-logger';

const RECORD = {
    timestamp: new Date('2026-08-10T14:22:07Z'),
    environment: 'client' as const,
    level: 'warn' as const,
    message: 'Missing vehicle model',
    resource: 'demo',
};

describe('development log reporting', () => {
    it('prints a stable plain line without ANSI sequences', () => {
        const { reporter, logger } = createMemoryReporter();

        reportDevelopmentLog(reporter, RECORD);

        expect(logger.lines).toEqual(['[14:22:07][client][warn] Missing vehicle model']);
        expect(logger.text()).not.toContain(String.fromCharCode(27));
    });

    it('colours severity and clears transient output on a terminal', () => {
        const { reporter, painted } = createTtyReporter();

        expect(formatDevelopmentLog(reporter, RECORD)).toContain(`${String.fromCharCode(27)}[33m`);

        reportDevelopmentLog(reporter, RECORD);

        expect(painted).toEqual([reporter.style.eraseLine()]);
    });
});
