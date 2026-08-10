import {
    type DevelopmentLogEnvironment,
    type DevelopmentLogLevel,
    type DevelopmentLogRecord,
} from '@cli/logging/log-record';

const RELAY_MARKER = '__LUAM_DEV_LOG__';

const TIMESTAMP = /^\[(\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2}:\d{2})\]\s*/;

const RESOURCE = /\[([A-Za-z0-9._-]+)(?:[\/:]([^\]]+?):(\d+))?\]/g;

const LEVEL = /\b(DEBUG|INFO|WARNING|WARN|ERROR)\b:?/i;

interface RelayRecord {
    environment?: unknown;
    level?: unknown;
    message?: unknown;
    resource?: unknown;
}

const RESERVED_RECORD_NAMES = new Set(['debug', 'error', 'info', 'output', 'script', 'warn', 'warning']);

function resourceToken(line: string): RegExpMatchArray | null {
    for (const match of line.matchAll(RESOURCE)) {
        if (match[1] !== undefined && !RESERVED_RECORD_NAMES.has(match[1].toLowerCase())) {
            return match;
        }
    }

    return null;
}

function timestamp(line: string, fallback: Date): { value: Date; rest: string } {
    const match = TIMESTAMP.exec(line);

    if (match?.[1] === undefined) {
        return { value: fallback, rest: line };
    }

    const value = new Date(`${match[1].replace(' ', 'T')}Z`);

    return { value: Number.isNaN(value.valueOf()) ? fallback : value, rest: line.slice(match[0].length) };
}

function logLevel(value: string | number): DevelopmentLogLevel | null {
    if (typeof value === 'number') {
        return ({ 0: 'debug', 1: 'error', 2: 'warn', 3: 'info', 4: 'debug' } as const)[value] ?? null;
    }

    const normalized = value.toLowerCase();

    if (normalized === 'warning') {
        return 'warn';
    }

    return normalized === 'debug' || normalized === 'info' || normalized === 'warn' || normalized === 'error' ? normalized : null;
}

function relayRecord(line: string, at: Date): DevelopmentLogRecord | null {
    const marker = line.indexOf(RELAY_MARKER);

    if (marker < 0) {
        return null;
    }

    try {
        const parsed = JSON.parse(line.slice(marker + RELAY_MARKER.length)) as RelayRecord;
        const level = typeof parsed.level === 'string' || typeof parsed.level === 'number' ? logLevel(parsed.level) : null;
        const environment: DevelopmentLogEnvironment | null = parsed.environment === 'client' || parsed.environment === 'server' ? parsed.environment : null;

        if (environment === null || level === null || typeof parsed.message !== 'string' || typeof parsed.resource !== 'string') {
            return null;
        }

        return { timestamp: at, environment, level, message: parsed.message, resource: parsed.resource };
    } catch {
        return null;
    }
}

export function parseMtaLogLine(line: string, activeResource: string, fallback: Date = new Date()): DevelopmentLogRecord | null {
    const stamped = timestamp(line, fallback);
    const relay = relayRecord(stamped.rest, stamped.value);

    if (relay !== null) {
        return relay.resource === activeResource ? relay : null;
    }

    if (stamped.rest.includes(RELAY_MARKER)) {
        return null;
    }

    const resource = resourceToken(stamped.rest);
    const severity = LEVEL.exec(stamped.rest);

    if (resource?.[1] !== undefined) {
        if (resource[1] !== activeResource) {
            return null;
        }

        const level = severity?.[1] === undefined ? 'info' : logLevel(severity[1]) ?? 'info';
        const message = stamped.rest.replace(resource[0], '').replace(severity?.[0] ?? '', '').replace(/^\s*[:|-]?\s*/, '');
        const sourcePath = resource[2];
        const sourceLine = resource[3];

        return {
            timestamp: stamped.value,
            environment: 'server',
            level,
            message,
            resource: activeResource,
            ...(sourcePath !== undefined && sourceLine !== undefined ? { source: { path: sourcePath, line: Number(sourceLine) } } : {}),
        };
    }

    return { timestamp: stamped.value, environment: 'server', level: 'info', message: stamped.rest, resource: activeResource };
}
