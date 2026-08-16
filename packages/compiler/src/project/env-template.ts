import { isSensitiveKey, type EnvEntry, type EnvFile } from './env-file';

const HEADER = [
    '# Deployment values for this resource.',
    '# Generated once by "luam build" and owned by the server administrator.',
    '# The compiler never overwrites this file, and it is never sent to clients.',
    '#',
    '# Edit a value and restart the resource. A key left out falls back to nothing,',
    '# so keep every key the project declares.',
    '',
];

function quote(entry: EnvEntry): string {
    if (entry.kind !== 'string' || /^[A-Za-z0-9._:/@-]*$/.test(entry.value)) {
        return entry.value;
    }

    return `"${entry.value.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;
}

function line(entry: EnvEntry): string {
    return `${entry.key}=${isSensitiveKey(entry.key) ? '' : quote(entry)}`;
}

export function renderEnvironmentTemplate(file: EnvFile): string {
    return [...HEADER, ...file.entries.map(line), ''].join('\n');
}
