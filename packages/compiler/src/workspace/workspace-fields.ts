import { createOptional, STRING_TYPE } from '@compiler/checker/types';
import { DEFAULT_RESOURCES_DIR } from '@compiler/manifest/manifest-defaults';
import { field, type ManifestField } from '@compiler/manifest/manifest-field';

export const SERVER_FILE_NAME = '.luam.server';

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
];

export const SERVER_FIELD_NAMES: readonly string[] = SERVER_FIELDS.map((entry) => entry.name);

export function isServerFilePath(path: string): boolean {
    return path.replace(/\\/g, '/').split('/').pop() === SERVER_FILE_NAME;
}
