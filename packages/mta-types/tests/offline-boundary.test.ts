import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { afterEach, describe, expect, it } from 'vitest';

import { generate } from '@generator/catalog-generator';

const WORKSPACE = fileURLToPath(new URL('../../..', import.meta.url));

const NETWORK = /\bfetch\s*\(|from '(node:)?https?'|require\('(node:)?https?'\)/;

const ALLOWED = ['packages/mta-types/scripts/wiki-endpoint.ts'];

function sourceFiles(directory: string): string[] {
    const files: string[] = [];

    for (const entry of readdirSync(join(WORKSPACE, directory), { recursive: true, withFileTypes: true })) {
        if (entry.isFile() && entry.name.endsWith('.ts') && !entry.parentPath.includes('generated')) {
            files.push(join(entry.parentPath, entry.name).slice(WORKSPACE.length).replace(/\\/g, '/'));
        }
    }

    return files;
}

describe('offline generation boundary', () => {
    const original = globalThis.fetch;

    afterEach(() => {
        globalThis.fetch = original;
    });

    it('generates the whole catalog without reaching the network', () => {
        globalThis.fetch = (() => {
            throw new Error('generation reached the network');
        }) as unknown as typeof fetch;

        expect(generate().files.length).toBeGreaterThan(100);
    });

    it('keeps the network call in the fetch script alone', () => {
        const offenders = sourceFiles('packages/mta-types/scripts')
            .filter((path) => !ALLOWED.includes(path))
            .filter((path) => NETWORK.test(readFileSync(join(WORKSPACE, path), 'utf8')));

        expect(offenders).toEqual([]);
    });

    it('keeps every compiled package free of network calls', () => {
        const offenders = ['packages/compiler/src', 'packages/runtime/src', 'packages/lsp/src', 'packages/template/src', 'packages/mta-types/src']
            .flatMap(sourceFiles)
            .filter((path) => NETWORK.test(readFileSync(join(WORKSPACE, path), 'utf8')));

        expect(offenders).toEqual([]);
    });
});
