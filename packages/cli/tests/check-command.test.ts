import { readdirSync } from 'node:fs';
import { join, relative } from 'node:path';

import { afterEach, describe, expect, it } from 'vitest';

import { runCheckCommand, runCheckWatch } from '@cli/commands/check-command';
import type { CommandContext } from '@cli/commands/command-context';
import { loadManifest } from '@cli/config/manifest-loader';
import { EXIT_DIAGNOSTICS, EXIT_OK } from '@cli/cli/exit-codes';

import { createMemoryLogger, type MemoryLogger } from './support/memory-logger';
import { BROKEN_SERVER, clientSource, createProjectFixture, defaultProjectFiles, MANIFEST_FILE, manifestSource, type ProjectFixture } from './support/project-fixture';

const SIDED_SHARED = [
    '#!shared',
    '',
    'function isOnClient(): boolean',
    '    return isElement(localPlayer)',
    'end',
    '',
].join('\n');

const fixtures: ProjectFixture[] = [];

interface Harness {
    fixture: ProjectFixture;
    logger: MemoryLogger;
    context: CommandContext;
}

function harness(files: Readonly<Record<string, string>>): Harness {
    const fixture = createProjectFixture(files);
    const logger = createMemoryLogger();
    const config = loadManifest(fixture.root).config;

    if (config === null) {
        throw new Error('The fixture configuration is invalid.');
    }

    fixtures.push(fixture);

    return { fixture, logger, context: { root: fixture.root, config, logger } };
}

async function waitFor(condition: () => boolean, timeoutMs = 5000): Promise<void> {
    const deadline = Date.now() + timeoutMs;

    while (!condition()) {
        if (Date.now() > deadline) {
            throw new Error('The condition was not met before the timeout.');
        }

        await new Promise((resolveWait) => setTimeout(resolveWait, 25));
    }
}

function snapshot(root: string): string[] {
    return readdirSync(root, { recursive: true, withFileTypes: true })
        .map((entry) => `${relative(root, join(entry.parentPath, entry.name)).replace(/\\/g, '/')}${entry.isDirectory() ? '/' : ''}`)
        .sort();
}

function passes(logger: MemoryLogger): number {
    return logger.lines.filter((line) => line.includes('Check passed:')).length;
}

afterEach(() => {
    for (const fixture of fixtures.splice(0)) {
        fixture.dispose();
    }
});

describe('check command', () => {
    it('passes on a valid project and writes nothing', () => {
        const { context, logger, fixture } = harness(defaultProjectFiles());

        expect(runCheckCommand(context)).toBe(EXIT_OK);
        expect(logger.errors).toEqual([]);
        expect(logger.text()).toContain('Check passed: 3 files, 0 errors, 0 warnings');
        expect(fixture.exists('build')).toBe(false);
    });

    it('reports diagnostics with file, line, and column and exits non-zero', () => {
        const { context, logger } = harness({ ...defaultProjectFiles(), 'src/server/main.luam': BROKEN_SERVER });

        expect(runCheckCommand(context)).toBe(EXIT_DIAGNOSTICS);
        expect(logger.errors[0]).toMatch(/^src\/server\/main\.luam:\d+:\d+ error check-/);
        expect(logger.errors.at(-1)).toContain('Check failed:');
    });

    it('reports a cross-environment violation across files', () => {
        const files = {
            ...defaultProjectFiles(),
            'src/client/hud.luam': 'function openMenu(): void\nend\n',
            'src/server/main.luam': 'openMenu()\n',
        };
        const { context, logger } = harness(files);

        expect(runCheckCommand(context)).toBe(EXIT_DIAGNOSTICS);
        expect(logger.errors.join('\n')).toContain('project-environment-import');
    });

    it('reports nothing for a side-restricted API in a shared file', () => {
        const { context, logger } = harness({ ...defaultProjectFiles(), 'src/shared/config.luam': SIDED_SHARED });

        expect(runCheckCommand(context)).toBe(EXIT_OK);
        expect(logger.text()).not.toContain('check-environment-api');
        expect(logger.text()).toContain('Check passed: 3 files, 0 errors, 0 warnings');
    });

    it('reports a source mapping that matches nothing', () => {
        const { context, logger } = harness({ [MANIFEST_FILE]: manifestSource({ name: 'luam-demo' }) });

        expect(runCheckCommand(context)).toBe(EXIT_DIAGNOSTICS);
        expect(logger.errors[0]).toContain('config-no-sources');
    });

    it('reports a project without source files', () => {
        const { context, logger } = harness({ [MANIFEST_FILE]: manifestSource({ name: 'luam-demo' }), 'src/shared/notes.md': 'ignored\n' });

        expect(runCheckCommand(context)).toBe(EXIT_DIAGNOSTICS);
        expect(logger.errors[0]).toContain('config-no-sources');
    });
});

describe('check watch', () => {
    it('re-checks on a source change and prints a separator between runs', async () => {
        const { context, fixture, logger } = harness(defaultProjectFiles());
        const controller = new AbortController();
        const reload = (): null => null;
        const watching = runCheckWatch(context, { signal: controller.signal, manifestPath: `${fixture.root}/${MANIFEST_FILE}`, reload });

        await waitFor(() => passes(logger) === 1);

        fixture.write('src/client/hud.luam', clientSource('Luam watched'));

        await waitFor(() => passes(logger) === 2);

        expect(logger.text()).toContain('rebuild at');

        controller.abort();

        expect(await watching).toBe(EXIT_OK);
    });

    it('writes nothing across several re-checks', async () => {
        const { context, fixture, logger } = harness(defaultProjectFiles());
        const controller = new AbortController();
        const before = snapshot(fixture.root);
        const watching = runCheckWatch(context, {
            signal: controller.signal,
            manifestPath: `${fixture.root}/${MANIFEST_FILE}`,
            reload: (): null => null,
        });

        await waitFor(() => passes(logger) === 1);

        for (const [index, title] of ['one', 'two', 'three'].entries()) {
            fixture.write('src/client/hud.luam', clientSource(title));

            await waitFor(() => passes(logger) >= index + 2);
        }

        controller.abort();
        await watching;

        expect(snapshot(fixture.root)).toEqual(before);
        expect(fixture.exists('build')).toBe(false);
    });

    it('re-reads the manifest and re-derives the watched set when it changes', async () => {
        const { context, fixture, logger } = harness(defaultProjectFiles());
        const controller = new AbortController();
        const manifestPath = `${fixture.root}/${MANIFEST_FILE}`;
        const reload = (): ReturnType<typeof loadManifest>['config'] => loadManifest(fixture.root).config;
        const watching = runCheckWatch(context, { signal: controller.signal, manifestPath, reload });

        await waitFor(() => passes(logger) === 1);

        fixture.write('lib/shared/extra.luam', 'local extra: number = 1\n');
        fixture.write(MANIFEST_FILE, manifestSource({ name: 'luam-demo', sources: { shared: ['src/shared/**/*.luam', 'lib/shared/**/*.luam'] } }));

        await waitFor(() => logger.text().includes('"lib/shared"'));

        const rechecks = passes(logger);

        fixture.write('lib/shared/extra.luam', 'local extra: number = 2\n');

        await waitFor(() => passes(logger) > rechecks);

        controller.abort();

        expect(await watching).toBe(EXIT_OK);
    });

    it('needs no release lookup, so it runs with no network and no flag', async () => {
        const { context, fixture, logger } = harness(defaultProjectFiles());
        const controller = new AbortController();
        const watching = runCheckWatch(context, {
            signal: controller.signal,
            manifestPath: `${fixture.root}/${MANIFEST_FILE}`,
            reload: (): null => null,
        });

        await waitFor(() => passes(logger) === 1);
        controller.abort();

        expect(await watching).toBe(EXIT_OK);
        expect(context.resolveVersion).toBeUndefined();
    });
});
