import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { basename, dirname, join } from 'node:path';

import { GeneratorError } from './generator-model.ts';

export interface UpstreamFile {
    category: string;
    path: string;
    contents: string;
}

const REQUIRE = createRequire(import.meta.url);

export const UPSTREAM_PACKAGE = 'mtasa-lua-types';

export function upstreamRoot(): string {
    const manifest = REQUIRE.resolve(`${UPSTREAM_PACKAGE}/package.json`);

    return dirname(manifest);
}

export function upstreamVersion(): string {
    const manifest = REQUIRE.resolve(`${UPSTREAM_PACKAGE}/package.json`);
    const parsed: unknown = JSON.parse(readFileSync(manifest, 'utf8'));

    if (typeof parsed !== 'object' || parsed === null || !('version' in parsed) || typeof parsed.version !== 'string') {
        throw new GeneratorError(manifest, 'the upstream package manifest declares no version');
    }

    return parsed.version;
}

function readDirectory(directory: string, label: string): UpstreamFile[] {
    if (!existsSync(directory)) {
        throw new GeneratorError(directory, `the upstream ${label} directory is missing, run "pnpm install" first`);
    }

    const files = readdirSync(directory)
        .filter((entry) => entry.endsWith('.d.ts'))
        .sort();

    if (files.length === 0) {
        throw new GeneratorError(directory, `the upstream ${label} directory declares no files`);
    }

    return files.map((entry) => ({
        category: basename(entry, '.d.ts'),
        path: join(directory, entry),
        contents: readFileSync(join(directory, entry), 'utf8'),
    }));
}

function readTree(directory: string): UpstreamFile[] {
    const files: UpstreamFile[] = [];

    for (const entry of readdirSync(directory, { recursive: true, withFileTypes: true })) {
        if (!entry.isFile() || !entry.name.endsWith('.d.ts')) {
            continue;
        }

        const path = join(entry.parentPath, entry.name);

        files.push({ category: basename(entry.name, '.d.ts'), path, contents: readFileSync(path, 'utf8') });
    }

    return files.sort((left, right) => left.path.localeCompare(right.path, 'en'));
}

export function functionFiles(side: 'server' | 'client'): UpstreamFile[] {
    return readDirectory(join(upstreamRoot(), side, 'function'), `${side} function`);
}

export function typeFiles(side: 'server' | 'client'): UpstreamFile[] {
    return [...readTree(join(upstreamRoot(), 'shared')), ...readTree(join(upstreamRoot(), side))];
}

export function variableFile(side: 'server' | 'client'): UpstreamFile {
    const path = join(upstreamRoot(), side, 'variables.d.ts');

    if (!existsSync(path)) {
        throw new GeneratorError(path, `the upstream ${side} variables file is missing`);
    }

    return { category: 'variable', path, contents: readFileSync(path, 'utf8') };
}

export function eventFiles(side: 'server' | 'client'): UpstreamFile[] {
    return readDirectory(join(upstreamRoot(), side, 'event'), `${side} event`);
}

export function classFiles(side: 'server' | 'client'): UpstreamFile[] {
    const directory = join(upstreamRoot(), side, 'oop');

    if (!existsSync(directory)) {
        throw new GeneratorError(directory, `the upstream ${side} class directory is missing`);
    }

    return readTree(directory);
}
