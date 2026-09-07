import type { InitProjectDetails } from '@cli/commands/init-prompt';

const INFO_OPEN = '    info = {';

const SECTION_CLOSE = '    },';

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

function entry(name: string, value: string): string {
    return `        ${name} = ${quoteManifestValue(value)},`;
}

export function renderManifestMetadata(details: InitProjectDetails): string[] {
    const author = details.author === null ? [] : [`        author = { name = ${quoteManifestValue(details.author)} },`, ''];
    const description = details.description === null ? [] : [entry('description', details.description)];

    return [...author, entry('version', details.version), ...description];
}

export function renderManifest(source: string, details: InitProjectDetails): string {
    const lines = source.replace(/\r\n/g, '\n').split('\n');
    const open = lines.indexOf(INFO_OPEN);

    if (open === -1) {
        return lines.join('\n');
    }

    const close = lines.indexOf(SECTION_CLOSE, open);

    if (close === -1) {
        return lines.join('\n');
    }

    return [...lines.slice(0, open + 1), ...renderManifestMetadata(details), ...lines.slice(close)].join('\n');
}
