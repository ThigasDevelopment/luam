import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { afterEach, describe, expect, it } from 'vitest';

import { EXIT_OK } from '@cli/cli/exit-codes';
import { runCli } from '@cli/cli/run';
import { runBuildCommand } from '@cli/commands/build-command';
import type { CommandContext } from '@cli/commands/command-context';
import { loadManifest } from '@cli/config/manifest-loader';

import { createMemoryLogger } from './support/memory-logger';
import { createProjectFixture, MANIFEST_FILE, VALID_CLIENT, VALID_SERVER, VALID_SHARED, type ProjectFixture } from './support/project-fixture';

const OFFLINE = { LUAM_OFFLINE: '1' };

const CORPUS = fileURLToPath(new URL('./fixtures/legacy', import.meta.url));

const REFUSED = 'pinned.manifest';

const fixtures: ProjectFixture[] = [];

const SOURCES: Readonly<Record<string, string>> = {
    'src/shared/config.luam': VALID_SHARED,
    'src/server/main.luam': VALID_SERVER,
    'src/client/hud.luam': VALID_CLIENT,
    'assets/logo.png': 'binary',
};

function corpus(): string[] {
    return readdirSync(CORPUS).sort();
}

function convertible(): string[] {
    return corpus().filter((name) => name !== REFUSED);
}

function generated(fixture: ProjectFixture): string {
    return fixture.read(`${context(fixture).config.outDir}/luam-demo/meta.xml`);
}

function project(name: string): ProjectFixture {
    const fixture = createProjectFixture({ ...SOURCES, [MANIFEST_FILE]: readFileSync(join(CORPUS, name), 'utf8') });

    fixtures.push(fixture);

    return fixture;
}

function context(fixture: ProjectFixture): CommandContext {
    const logger = createMemoryLogger();
    const config = loadManifest(fixture.root).config;

    if (config === null) {
        throw new Error(`The corpus manifest is invalid: ${loadManifest(fixture.root).diagnostics.map((entry) => entry.message).join(' ')}`);
    }

    return { root: fixture.root, config, logger };
}

afterEach(() => {
    for (const fixture of fixtures.splice(0)) {
        fixture.dispose();
    }
});

describe('the migration corpus', () => {
    it('holds every shape the repository carried before the reformulation', () => {
        expect(corpus()).toEqual(['environment.manifest', 'example.manifest', 'minimal.manifest', 'pinned.manifest', 'scaffold.manifest']);
    });

    it.each(corpus())('reads %s, warns once, and still builds', async (name) => {
        const fixture = project(name);
        const loaded = loadManifest(fixture.root);

        expect(loaded.config).not.toBeNull();
        expect(loaded.diagnostics.filter((entry) => entry.code === 'config-manifest-form')).toHaveLength(1);
        expect(await runBuildCommand(context(fixture))).toBe(EXIT_OK);
    });

    it.each(convertible())('migrates %s to a manifest whose build is byte identical', async (name) => {
        const fixture = project(name);

        expect(await runBuildCommand(context(fixture))).toBe(EXIT_OK);

        const before = generated(fixture);

        expect(await runCli(['migrate', '--cwd', fixture.root], { logger: createMemoryLogger(), env: OFFLINE })).toBe(EXIT_OK);
        expect(await runBuildCommand(context(fixture))).toBe(EXIT_OK);
        expect(generated(fixture)).toBe(before);
    });

    it('refuses a "loadOrder" entry a "sources" pattern already reaches, and says how to move it', async () => {
        const fixture = project(REFUSED);
        const before = fixture.read(MANIFEST_FILE);
        const logger = createMemoryLogger();

        expect(await runCli(['migrate', '--cwd', fixture.root], { logger, env: OFFLINE })).not.toBe(EXIT_OK);
        expect(logger.text()).toContain('src/server/main.luam');
        expect(logger.text()).toContain('a directory of its own, listed first');
        expect(fixture.read(MANIFEST_FILE)).toBe(before);
    });

    it.each(convertible())('leaves %s free of every diagnostic once migrated', async (name) => {
        const fixture = project(name);

        await runCli(['migrate', '--cwd', fixture.root], { logger: createMemoryLogger(), env: OFFLINE });

        expect(loadManifest(fixture.root).diagnostics.map((entry) => `${entry.code}: ${entry.message}`)).toEqual([]);
    });

    it.each(convertible())('writes %s in a form the formatter leaves alone', async (name) => {
        const fixture = project(name);

        await runCli(['migrate', '--cwd', fixture.root], { logger: createMemoryLogger(), env: OFFLINE });

        const migrated = fixture.read(MANIFEST_FILE);

        expect(await runCli(['format', fixture.root, '--cwd', fixture.root], { logger: createMemoryLogger(), env: OFFLINE })).toBe(EXIT_OK);
        expect(fixture.read(MANIFEST_FILE)).toBe(migrated);
    });
});
