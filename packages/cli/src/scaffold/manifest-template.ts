import type { InitProjectDetails } from '@cli/commands/init-prompt';

const METADATA_LINE = /^(name|version|description|author) =/;

const ESCAPES: ReadonlyArray<readonly [RegExp, string]> = [
    [/\\/g, '\\\\'],
    [/'/g, "\\'"],
    [/\r/g, '\\r'],
    [/\n/g, '\\n'],
];

export function quoteManifestValue(value: string): string {
    let escaped = value;

    for (const [pattern, replacement] of ESCAPES) {
        escaped = escaped.replace(pattern, replacement);
    }

    return `'${escaped}'`;
}

function metadataField(name: string, value: string | null): string[] {
    return value === null ? [] : [`${name} = ${quoteManifestValue(value)}`];
}

export function renderManifestMetadata(details: InitProjectDetails): string[] {
    return [
        ...metadataField('name', details.name),
        ...metadataField('version', details.version),
        ...metadataField('description', details.description),
        ...metadataField('author', details.author),
    ];
}

export function renderManifest(source: string, details: InitProjectDetails): string {
    const lines = source.replace(/\r\n/g, '\n').split('\n');
    const kept = lines.filter((line) => !METADATA_LINE.test(line));
    const leading = kept.findIndex((line) => line.trim().length > 0);
    const body = leading === -1 ? kept : kept.slice(leading);

    return [...renderManifestMetadata(details), '', ...body].join('\n');
}
