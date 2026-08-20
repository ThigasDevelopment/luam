export interface ObsoleteRule {
    id: string;
    pattern: RegExp;
    replacement: string;
    removedIn: string | null;
    note: string;
}

export interface ObsoleteFile {
    id: string;
    name: string;
    replacement: string;
    note: string;
}

export interface ObsoleteExemption {
    file: string;
    rule: string;
    line: string;
    reason: string;
}

export const SCAN_ROOTS: readonly string[] = ['CHANGELOG.md', 'README.md', 'docs/en', 'docs/pt-br', 'docs/snippets', 'examples'];

export const SCAN_EXTENSIONS: readonly string[] = ['.md', '.luam', '.manifest', '.json'];

export const OBSOLETE_RULES: readonly ObsoleteRule[] = [
    {
        id: 'project-config-file',
        pattern: /luam\.json/g,
        replacement: '.luam.manifest',
        removedIn: '0.6.0',
        note: 'The project file is a Luam manifest dialect, not JSON.',
    },
    {
        id: 'config-option',
        pattern: /--config\b/g,
        replacement: '--manifest',
        removedIn: '0.6.0',
        note: 'The CLI option that points at the project file was renamed.',
    },
    {
        id: 'config-diagnostics',
        pattern: /\bconfig-(invalid-json|unreadable)(?![\w-])/g,
        replacement: 'config-invalid-statement or config-unreadable-manifest',
        removedIn: '0.6.0',
        note: 'The JSON configuration diagnostics were replaced by manifest codes.',
    },
    {
        id: 'pinned-cli-version',
        pattern: /@thigasdevelopment\/luam@\d+\.\d+\.\d+/g,
        replacement: '@thigasdevelopment/luam@%LUAM_VERSION%',
        removedIn: null,
        note: 'A pinned install version goes stale on every release. The manual renders %LUAM_VERSION% from packages/cli/package.json.',
    },
    {
        id: 'pinned-vsix-version',
        pattern: /luam-\d+\.\d+\.\d+\.vsix/g,
        replacement: 'luam-%LUAM_VERSION%.vsix',
        removedIn: null,
        note: 'A pinned extension file name goes stale on every release. The manual renders %LUAM_VERSION% from packages/cli/package.json.',
    },
];

export const OBSOLETE_FILES: readonly ObsoleteFile[] = [
    {
        id: 'project-config-file',
        name: 'luam.json',
        replacement: '.luam.manifest',
        note: 'A maintained example must not ship the removed project file.',
    },
];

export const OBSOLETE_EXEMPTIONS: readonly ObsoleteExemption[] = [
    {
        file: 'docs/en/tooling/cli.md',
        rule: 'project-config-file',
        line: '| `luam build --config luam.json` | `--config` became `--manifest`, and the file it points at is now a [`.luam.manifest`](/en/tooling/luam-manifest) written in the Luam manifest dialect. |',
        reason: 'The CLI migration table shows the removed invocation next to its replacement.',
    },
    {
        file: 'docs/en/tooling/cli.md',
        rule: 'config-option',
        line: '| `luam build --config luam.json` | `--config` became `--manifest`, and the file it points at is now a [`.luam.manifest`](/en/tooling/luam-manifest) written in the Luam manifest dialect. |',
        reason: 'The CLI migration table shows the removed invocation next to its replacement.',
    },
    {
        file: 'docs/pt-br/tooling/cli.md',
        rule: 'project-config-file',
        line: '| `luam build --config luam.json` | `--config` virou `--manifest`, e o arquivo que ele aponta agora é um [`.luam.manifest`](/pt-br/tooling/luam-manifest) escrito no dialeto de manifesto do Luam. |',
        reason: 'The CLI migration table shows the removed invocation next to its replacement.',
    },
    {
        file: 'docs/pt-br/tooling/cli.md',
        rule: 'config-option',
        line: '| `luam build --config luam.json` | `--config` virou `--manifest`, e o arquivo que ele aponta agora é um [`.luam.manifest`](/pt-br/tooling/luam-manifest) escrito no dialeto de manifesto do Luam. |',
        reason: 'The CLI migration table shows the removed invocation next to its replacement.',
    },
];
