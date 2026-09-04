import { BOOLEAN_TYPE, createOptional, NUMBER_TYPE, STRING_TYPE } from '@compiler/checker/types';
import { DEFAULT_RESOURCES_DIR } from '@compiler/manifest/manifest-defaults';
import { field, table, type ManifestField } from '@compiler/manifest/manifest-field';

export const SERVER_FILE_NAME = '.luam.server';

export const DEFAULT_SERVER_LOGS: ServerLogsSettings = { enabled: false, maxMessageLength: 4096, rateLimit: 30, rateWindowMs: 1000 };

export interface ServerLogsSettings {
    enabled: boolean;
    maxMessageLength: number;
    rateLimit: number;
    rateWindowMs: number;
}

const SERVER_LOG_FIELDS: readonly ManifestField[] = [
    field('enabled', BOOLEAN_TYPE, 'Streams server and client logs into the session "luam dev" opens.', {
        defaultValue: DEFAULT_SERVER_LOGS.enabled,
        owner: 'deployment',
    }),
    field('maxMessageLength', NUMBER_TYPE, 'Longest log message kept before it is truncated.', {
        defaultValue: DEFAULT_SERVER_LOGS.maxMessageLength,
        rule: 'positive-integer',
        owner: 'deployment',
    }),
    field('rateLimit', NUMBER_TYPE, 'Log messages accepted inside one window.', {
        defaultValue: DEFAULT_SERVER_LOGS.rateLimit,
        rule: 'positive-integer',
        owner: 'deployment',
    }),
    field('rateWindowMs', NUMBER_TYPE, 'Length of the rate window in milliseconds.', {
        defaultValue: DEFAULT_SERVER_LOGS.rateWindowMs,
        rule: 'positive-integer',
        owner: 'deployment',
    }),
];

export const SERVER_FIELDS: readonly ManifestField[] = [
    field('serverPath', STRING_TYPE, 'Path to the MTA server installation the resources in this directory share.', { required: true, owner: 'deployment' }),
    field('resourcesDir', STRING_TYPE, 'Resource directory inside the server installation.', {
        defaultValue: DEFAULT_RESOURCES_DIR,
        rule: 'contained-path',
        owner: 'deployment',
    }),
    field('executable', createOptional(STRING_TYPE), 'Executable path relative to serverPath used by "luam server" and "luam dev".', {
        rule: 'server-contained-path',
        owner: 'deployment',
    }),
    table('logs', 'Log capture used by the session "luam dev" opens.', SERVER_LOG_FIELDS, { defaultValue: {}, owner: 'deployment' }),
];

export const SERVER_FIELD_NAMES: readonly string[] = SERVER_FIELDS.map((entry) => entry.name);

export function isServerFilePath(path: string): boolean {
    return path.replace(/\\/g, '/').split('/').pop() === SERVER_FILE_NAME;
}
