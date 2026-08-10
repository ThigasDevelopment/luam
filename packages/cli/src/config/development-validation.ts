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

    const logs = readObject(source, 'logs', diagnostics);

    if (logs === null) {
        return { logs: { ...DEFAULT_DEVELOPMENT_LOGS } };
    }

    rejectUnknownFields(logs, LOG_FIELDS, 'development.logs.', diagnostics);

    return {
        logs: {
            enabled: readBoolean(logs, 'enabled', diagnostics) ?? DEFAULT_DEVELOPMENT_LOGS.enabled,
            maxMessageLength: readNumber(logs, 'maxMessageLength', diagnostics) ?? DEFAULT_DEVELOPMENT_LOGS.maxMessageLength,
            rateLimit: readNumber(logs, 'rateLimit', diagnostics) ?? DEFAULT_DEVELOPMENT_LOGS.rateLimit,
            rateWindowMs: readNumber(logs, 'rateWindowMs', diagnostics) ?? DEFAULT_DEVELOPMENT_LOGS.rateWindowMs,
        },
    };
}
