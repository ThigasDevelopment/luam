import { describe, expect, it } from 'vitest';

import { parseMtaLogLine } from '@cli/logging/mta-log-parser';

const AT = new Date('2026-08-10T14:22:07Z');

describe('MTA log parsing', () => {
    it('parses a validated client relay record', () => {
        const line = '[2026-08-10 14:22:07] __LUAM_DEV_LOG__{"environment":"client","level":2,"message":"Missing model","resource":"demo"}';

        expect(parseMtaLogLine(line, 'demo', AT)).toEqual({
            timestamp: AT,
            environment: 'client',
            level: 'warn',
            message: 'Missing model',
            resource: 'demo',
        });
    });

    it('rejects malformed relays and relays from another resource', () => {
        expect(parseMtaLogLine('__LUAM_DEV_LOG__{"message":4}', 'demo', AT)).toBeNull();
        expect(parseMtaLogLine('__LUAM_DEV_LOG__{"environment":"client","level":3,"message":"x","resource":"other"}', 'demo', AT)).toBeNull();
    });

    it('parses an attributed native server record with source location', () => {
        const record = parseMtaLogLine('[2026-08-10 14:22:07] [demo/server/main.lua:18] ERROR: Failed to load', 'demo', AT);

        expect(record).toMatchObject({ environment: 'server', level: 'error', message: 'Failed to load', resource: 'demo' });
        expect(record?.source).toEqual({ path: 'server/main.lua', line: 18 });
    });

    it('drops attributed records from other resources', () => {
        expect(parseMtaLogLine('[other] INFO: ready', 'demo', AT)).toBeNull();
    });

    it('renders an unknown line conservatively as plain server output', () => {
        expect(parseMtaLogLine('unclassified output', 'demo', AT)).toMatchObject({ environment: 'server', level: 'info', message: 'unclassified output' });
        expect(parseMtaLogLine('[INFO] Server started', 'demo', AT)).toMatchObject({ message: '[INFO] Server started' });
    });
});
