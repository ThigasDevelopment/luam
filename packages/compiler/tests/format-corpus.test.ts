import { readdirSync, readFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import { formatSource } from '@compiler/format/format';
import { compile } from '@compiler/index';
import { parse } from '@compiler/parser/parser';

const compilerRoot = fileURLToPath(new URL('..', import.meta.url));

const repositoryRoot = join(compilerRoot, '..', '..');

const ROOTS: readonly string[] = [join(repositoryRoot, 'docs', 'snippets'), join(compilerRoot, 'tests', 'fixtures')];

interface Entry {
    name: string;
    path: string;
    filePath: string;
}

function sourcePath(root: string, absolute: string): string {
    const inside = relative(root, absolute).replace(/\\/g, '/');
    const index = inside.indexOf('src/');

    return index === -1 ? inside.slice(inside.lastIndexOf('/') + 1) : inside.slice(index);
}

function corpus(): Entry[] {
    const entries: Entry[] = [];

    for (const root of ROOTS) {
        for (const found of readdirSync(root, { recursive: true, withFileTypes: true })) {
            if (!found.isFile() || !found.name.endsWith('.luam')) {
                continue;
            }

            const absolute = join(found.parentPath, found.name);

            entries.push({ name: relative(repositoryRoot, absolute).replace(/\\/g, '/'), path: absolute, filePath: sourcePath(root, absolute) });
        }
    }

    return entries.sort((left, right) => left.name.localeCompare(right.name));
}

function withoutIndentation(code: string | null): string {
    return (code ?? '').replace(/^[ \t]+/gm, '');
}

const ENTRIES = corpus();

describe('the formatter over the corpus', () => {
    it('finds every file in the corpus', () => {
        expect(ENTRIES.length).toBeGreaterThan(40);
    });

    it.each(ENTRIES.map((entry) => [entry.name, entry] as const))('%s is already formatted', (_name, entry) => {
        const source = readFileSync(entry.path, 'utf8');
        const formatted = formatSource(source);

        if (formatted === null) {
            expect(parse(source).diagnostics.length).toBeGreaterThan(0);

            return;
        }

        expect(formatted).toBe(source);
    });

    it.each(ENTRIES.map((entry) => [entry.name, entry] as const))('%s formats idempotently and keeps its meaning', (_name, entry) => {
        const source = readFileSync(entry.path, 'utf8');
        const formatted = formatSource(source);

        if (formatted === null) {
            return;
        }

        expect(formatSource(formatted)).toBe(formatted);
        expect(withoutIndentation(compile(formatted, { filePath: entry.filePath }).code)).toBe(
            withoutIndentation(compile(source, { filePath: entry.filePath }).code),
        );
    });
});
