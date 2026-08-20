import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export interface ChangelogTarget {
    path: string;
    unreleased: string;
    locale: string;
}

export interface PackageVersion {
    name: string;
    path: string;
    version: string;
}

export const VERSION_SOURCE = 'packages/cli/package.json';

export const WORKSPACE_DIRECTORIES: readonly string[] = ['packages', 'tools'];

export const CHANGELOG_TARGETS: readonly ChangelogTarget[] = [
    { path: 'CHANGELOG.md', unreleased: 'Unreleased', locale: 'product' },
    { path: 'docs/en/changelog.md', unreleased: 'Unreleased', locale: 'en' },
    { path: 'docs/pt-br/changelog.md', unreleased: 'Não lançado', locale: 'pt-br' },
];

export function repositoryRoot(): string {
    return resolve(dirname(fileURLToPath(import.meta.url)), '..', '..', '..');
}

export function readJson(file: string): Record<string, unknown> {
    return JSON.parse(readFileSync(file, 'utf8')) as Record<string, unknown>;
}

export function sourceVersion(root: string): string {
    const manifest = readJson(join(root, VERSION_SOURCE));
    const version = manifest['version'];

    if (typeof version !== 'string') {
        throw new Error(`${VERSION_SOURCE} declares no string "version".`);
    }

    return version;
}

export function workspacePackages(root: string): PackageVersion[] {
    const found: PackageVersion[] = [];

    for (const directory of WORKSPACE_DIRECTORIES) {
        const parent = join(root, directory);

        if (!existsSync(parent)) {
            continue;
        }

        for (const entry of readdirSync(parent, { withFileTypes: true })) {
            const file = join(parent, entry.name, 'package.json');

            if (!entry.isDirectory() || !existsSync(file)) {
                continue;
            }

            const manifest = readJson(file);

            found.push({
                name: typeof manifest['name'] === 'string' ? manifest['name'] : `${directory}/${entry.name}`,
                path: `${directory}/${entry.name}/package.json`,
                version: typeof manifest['version'] === 'string' ? manifest['version'] : '',
            });
        }
    }

    return found.sort((left, right) => left.path.localeCompare(right.path));
}
