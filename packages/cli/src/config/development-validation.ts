import { DEFAULT_DEVELOPMENT_LOGS, type DevelopmentConfig } from '@cli/config/config-schema';
import { readBoolean, readNumber, readObject, rejectUnknownFields, type RawObject } from '@cli/config/value-readers';
import type { CliDiagnostic } from '@cli/reporting/cli-diagnostic';

const DEVELOPMENT_FIELDS = ['logs'];

const LOG_FIELDS = ['enabled', 'maxMessageLength', 'rateLimit', 'rateWindowMs'];

export function validateDevelopment(source: RawObject | null, diagnostics: CliDiagnostic[]): DevelopmentConfig {
    if (source === null) {
        return { logs: { ...DEFAULT_DEVELOPMENT_LOGS } };
    }

    rejectUnknownFields(source, DEVELOPMENT_FIELDS, 'development.', diagnostics);

    const logs = readObject(source, 'logs', diagnostics, 'development.');

    if (logs === null) {
        return { logs: { ...DEFAULT_DEVELOPMENT_LOGS } };
    }

    rejectUnknownFields(logs, LOG_FIELDS, 'development.logs.', diagnostics);

    const scope = 'development.logs.';

    return {
        logs: {
            enabled: readBoolean(logs, 'enabled', diagnostics, scope) ?? DEFAULT_DEVELOPMENT_LOGS.enabled,
            maxMessageLength: readNumber(logs, 'maxMessageLength', diagnostics, scope) ?? DEFAULT_DEVELOPMENT_LOGS.maxMessageLength,
            rateLimit: readNumber(logs, 'rateLimit', diagnostics, scope) ?? DEFAULT_DEVELOPMENT_LOGS.rateLimit,
            rateWindowMs: readNumber(logs, 'rateWindowMs', diagnostics, scope) ?? DEFAULT_DEVELOPMENT_LOGS.rateWindowMs,
        },
    };
}
