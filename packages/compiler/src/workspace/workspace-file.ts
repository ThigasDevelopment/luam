import { createPosition, type Diagnostic } from '@compiler/diagnostics/diagnostic';
import { analyzeManifest, type ManifestSchema } from '@compiler/manifest/manifest-analysis';
import { manifestError, MISSING_FIELD, UNKNOWN_FIELD } from '@compiler/manifest/manifest-diagnostics';
import { normalizeFields, type PositionLookup } from '@compiler/manifest/manifest-rules';
import { readBoolean, readNumber, readString, readTable } from '@compiler/manifest/manifest-readers';
import type { ManifestField } from '@compiler/manifest/manifest-field';
import type { ManifestObject } from '@compiler/manifest/manifest-value';

import { DEFAULT_SERVER_LOGS, SERVER_FIELDS, SERVER_FIELD_NAMES, SERVER_FILE_NAME, type ServerLogsSettings } from './workspace-fields';

export const SERVER_UNKNOWN_FIELD = 'server-unknown-field';

export const SERVER_INVALID_VALUE = 'server-invalid-value';

export const SERVER_PARSE_ERROR = 'server-parse-error';

export interface ServerFileSettings {
    serverPath: string;
    resourcesDir: string;
    executable: string | null;
    logs: ServerLogsSettings;
}

export interface ServerFileAnalysis {
    settings: ServerFileSettings;
    positions: PositionLookup;
    diagnostics: Diagnostic[];
}

const START = createPosition(1, 1, 0);

const SERVER_MODE = 'development';

function retag(diagnostic: Diagnostic): Diagnostic {
    if (diagnostic.stage === 'lexer' || diagnostic.stage === 'parser') {
        return { ...diagnostic, stage: 'manifest', code: SERVER_PARSE_ERROR };
    }

    if (diagnostic.code === MISSING_FIELD) {
        return diagnostic;
    }

    return { ...diagnostic, code: diagnostic.code === UNKNOWN_FIELD ? SERVER_UNKNOWN_FIELD : SERVER_INVALID_VALUE };
}

function unknownFieldMessage(name: string): string {
    const known = SERVER_FIELD_NAMES.map((entry) => `"${entry}"`).join(', ');

    return `"${name}" is not a "${SERVER_FILE_NAME}" field. The fields are ${known}.`;
}

function missingFieldMessage(entry: ManifestField): string {
    return `A "${SERVER_FILE_NAME}" file requires a "${entry.name}" field. ${entry.summary}`;
}

export const SERVER_SCHEMA: ManifestSchema = {
    fields: SERVER_FIELDS,
    removed: {},
    normalize: (value: ManifestObject, positions: PositionLookup) => normalizeFields(SERVER_FIELDS, value, positions),
    retag,
    unknownName: unknownFieldMessage,
    missingName: missingFieldMessage,
};

function readLogs(source: ManifestObject | null): ServerLogsSettings {
    const logs = source ?? {};

    return {
        enabled: readBoolean(logs, 'enabled') ?? DEFAULT_SERVER_LOGS.enabled,
        maxMessageLength: readNumber(logs, 'maxMessageLength') ?? DEFAULT_SERVER_LOGS.maxMessageLength,
        rateLimit: readNumber(logs, 'rateLimit') ?? DEFAULT_SERVER_LOGS.rateLimit,
        rateWindowMs: readNumber(logs, 'rateWindowMs') ?? DEFAULT_SERVER_LOGS.rateWindowMs,
    };
}

export function analyzeServerFile(source: string, root: string): ServerFileAnalysis {
    const analysis = analyzeManifest(source, { mode: SERVER_MODE, root, env: {} }, SERVER_SCHEMA);
    const value = analysis.value;

    return {
        settings: {
            serverPath: readString(value, 'serverPath') ?? '',
            resourcesDir: readString(value, 'resourcesDir') ?? '',
            executable: readString(value, 'executable'),
            logs: readLogs(readTable(value, 'logs')),
        },
        positions: analysis.positions,
        diagnostics: analysis.diagnostics,
    };
}

export function serverFileError(message: string): Diagnostic {
    return manifestError(SERVER_PARSE_ERROR, message, START);
}
