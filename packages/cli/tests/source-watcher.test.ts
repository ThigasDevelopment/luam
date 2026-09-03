import { watch } from 'node:fs';

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { watchSources, type SourceWatcher } from '@cli/watch/source-watcher';
import type { SourceMapping } from '@compiler/manifest/manifest-contract';

import { createProjectFixture, type ProjectFixture } from './support/project-fixture';

vi.mock('node:fs', async (importOriginal) => {
    const actual = await importOriginal<typeof import('node:fs')>();

    return { ...actual, default: actual, watch: vi.fn(actual.watch) };
});

const DEBOUNCE_MS = 20;

const QUIET_MS = 400;

const ROOT_SOURCE = ['function greet(name: string): string', "    return 'hi ' .. name", 'end', ''].join('\n');

const fixtures: ProjectFixture[] = [];

const watchers: SourceWatcher[] = [];

function sources(overrides: Partial<SourceMapping> = {}): SourceMapping {
    return { server: ['src/server/**/*.luam'], client: ['src/client/**/*.luam'], shared: ['src/shared/**/*.luam'], ...overrides };
}

function fixture(files: Readonly<Record<string, string>>): ProjectFixture {
    const created = createProjectFixture(files);

    fixtures.push(created);

    return created;
}

function start(root: string, mapping: SourceMapping, onChange: () => void): void {
    watchers.push(watchSources(root, mapping, onChange, DEBOUNCE_MS));
}

async function waitFor(condition: () => boolean, timeoutMs = 5000): Promise<void> {
    const deadline = Date.now() + timeoutMs;

    while (!condition()) {
        if (Date.now() > deadline) {
            throw new Error('The rebuild was not scheduled before the timeout.');
        }

        await new Promise((resolve) => setTimeout(resolve, 10));
    }
}

async function quiet(): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, QUIET_MS));
}

beforeEach(() => {
    vi.mocked(watch).mockClear();
});

afterEach(() => {
    for (const created of watchers.splice(0)) {
        created.close();
    }

    for (const created of fixtures.splice(0)) {
        created.dispose();
    }
});

describe('source watcher', () => {
    it('rebuilds when a source file in the project root is saved', async () => {
        const created = fixture({ 'index.luam': ROOT_SOURCE });
        let changes = 0;

        start(created.root, sources(), () => {
            changes += 1;
        });

        created.write('index.luam', `${ROOT_SOURCE}\nprint(greet('a'))\n`);

        await waitFor(() => changes === 1);
    });

    it('rebuilds when a new source file appears in the project root', async () => {
        const created = fixture({ 'index.luam': ROOT_SOURCE });
        let changes = 0;

        start(created.root, sources(), () => {
            changes += 1;
        });

        created.write('feature.luam', ROOT_SOURCE);

        await waitFor(() => changes === 1);
    });

    it('never rebuilds for a file written into the output directory', async () => {
        const created = fixture({ 'index.luam': ROOT_SOURCE });
        let changes = 0;

        start(created.root, sources(), () => {
            changes += 1;
        });

        created.write('build/luam-demo/index.lua', 'print(1)\n');
        created.write('build/luam-demo/meta.xml', '<meta />\n');

        await quiet();

        expect(changes).toBe(0);
    });

    it('never rebuilds for a test file', async () => {
        const created = fixture({ 'index.luam': ROOT_SOURCE });
        let changes = 0;

        start(created.root, sources(), () => {
            changes += 1;
        });

        created.write('index.test.luam', ROOT_SOURCE);

        await quiet();

        expect(changes).toBe(0);
    });

    it('opens one watcher when the patterns already cover the project root', () => {
        const created = fixture({ 'index.luam': ROOT_SOURCE });

        start(created.root, sources({ server: ['*.luam'], client: [], shared: [] }), () => undefined);

        expect(vi.mocked(watch).mock.calls).toHaveLength(1);
    });

    it('watches the project root beside every pattern root', () => {
        const created = fixture({ 'index.luam': ROOT_SOURCE, 'src/server/main.luam': ROOT_SOURCE, 'src/client/hud.luam': ROOT_SOURCE });

        start(created.root, sources(), () => undefined);

        expect(vi.mocked(watch).mock.calls.map((call) => call[1])).toContainEqual({ recursive: false });
    });
});
