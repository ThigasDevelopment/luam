import { readdirSync, readFileSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

import { afterEach, describe, expect, it } from 'vitest';

import { runBuildCommand } from '@cli/commands/build-command';
import type { CommandContext } from '@cli/commands/command-context';
import { EXIT_OK } from '@cli/cli/exit-codes';
import { loadManifest } from '@cli/config/manifest-loader';

import { createMemoryLogger, type MemoryLogger } from './support/memory-logger';
import { createProjectFixture, type ProjectFixture } from './support/project-fixture';

const FIXTURES = fileURLToPath(new URL('./fixtures', import.meta.url));

const fixtures: ProjectFixture[] = [];

interface Harness {
    fixture: ProjectFixture;
    logger: MemoryLogger;
    context: CommandContext;
}

const ASYNC_LIBRARY = 'mta-async-fixture';

const HUD_LIBRARY = 'mta-hud-fixture';

function packageFiles(name: string, luam: unknown, files: Readonly<Record<string, string>>): Record<string, string> {
    const manifest = JSON.stringify({ name, version: '1.0.0', luam }, null, 4);
    const entries: Record<string, string> = { [`node_modules/${name}/package.json`]: `${manifest}\n` };

    for (const [path, contents] of Object.entries(files)) {
        entries[`node_modules/${name}/${path}`] = contents;
    }

    return entries;
}

function libraryPackages(): Record<string, string> {
    return {
        ...packageFiles(ASYNC_LIBRARY, { sources: { shared: ['src/**/*.luam'] } }, {
            'src/async.luam': 'function fixtureDelay(seconds: number): number\n    return seconds\nend\n',
        }),
        ...packageFiles(HUD_LIBRARY, { sources: { client: ['src/**/*.luam'] } }, {
            'src/hud.luam': "function fixtureHudLabel(): string\n    return 'hud'\nend\n",
        }),
    };
}

function fixtureFiles(name: string): Record<string, string> {
    const root = join(FIXTURES, name);
    const files: Record<string, string> = {};

    for (const entry of readdirSync(root, { recursive: true, withFileTypes: true })) {
        if (!entry.isFile() || entry.name === 'meta.xml') {
            continue;
        }

        const absolute = join(entry.parentPath, entry.name);

        files[relative(root, absolute).split(sep).join('/')] = readFileSync(absolute, 'utf8');
    }

    return files;
}

function authored(name: string): string {
    return readFileSync(join(FIXTURES, name, 'meta.xml'), 'utf8');
}

function harness(name: string, extra: Readonly<Record<string, string>> = {}): Harness {
    const fixture = createProjectFixture({ ...fixtureFiles(name), ...extra }, { resource: name });
    const logger = createMemoryLogger();
    const loaded = loadManifest(fixture.root);

    if (loaded.config === null) {
        throw new Error(`The "${name}" manifest is invalid: ${loaded.diagnostics.map((entry) => entry.message).join(' ')}`);
    }

    fixtures.push(fixture);

    return { fixture, logger, context: { root: fixture.root, config: loaded.config, logger } };
}

function scriptOrder(manifest: string): string[] {
    return (manifest.match(/<script src="[^"]+"/g) ?? []).map((entry) => entry.slice(13, -1));
}

afterEach(() => {
    for (const fixture of fixtures.splice(0)) {
        fixture.dispose();
    }
});

describe('the heaven-roleplay manifest', () => {
    it('generates the authored file byte for byte', async () => {
        const { context, fixture, logger } = harness('heaven-roleplay');

        expect(await runBuildCommand(context)).toBe(EXIT_OK);
        expect(logger.errors).toEqual([]);
        expect(fixture.read('build/heaven-roleplay/meta.xml')).toBe(authored('heaven-roleplay'));
    });

    it('writes every file its patterns name at the path the pattern describes', async () => {
        const { context, fixture } = harness('heaven-roleplay');

        await runBuildCommand(context);

        expect(fixture.exists('build/heaven-roleplay/assets/images/logo.png')).toBe(true);
        expect(fixture.exists('build/heaven-roleplay/list.xml')).toBe(true);
        expect(fixture.exists('build/heaven-roleplay/config.lua')).toBe(true);
        expect(fixture.exists('build/heaven-roleplay/src/utils/lib/numbers.lua')).toBe(true);
    });

    it('changes no line of the generated file when an image is added to a matched directory', async () => {
        const { context, fixture } = harness('heaven-roleplay');

        await runBuildCommand(context);

        const before = fixture.read('build/heaven-roleplay/meta.xml');

        fixture.write('assets/images/icon.png', 'binary\n');
        await runBuildCommand(context);

        expect(fixture.read('build/heaven-roleplay/meta.xml')).toBe(before);
        expect(fixture.exists('build/heaven-roleplay/assets/images/icon.png')).toBe(true);
    });

    it('merges two blocks when the blank line between them is deleted', async () => {
        const { context, fixture } = harness('heaven-roleplay');

        await runBuildCommand(context);

        const before = fixture.read('build/heaven-roleplay/meta.xml');
        const source = fixture.read('.luam.manifest');

        fixture.write('.luam.manifest', source.replace("\n\n        { path = 'src/utils/format.luam'", "\n        { path = 'src/utils/format.luam'"));

        const reloaded = loadManifest(fixture.root).config;

        expect(reloaded).not.toBeNull();

        await runBuildCommand({ ...context, config: reloaded ?? context.config });

        const after = fixture.read('build/heaven-roleplay/meta.xml');

        expect(before.split('\n').length - after.split('\n').length).toBe(1);
        expect(scriptOrder(after)).toEqual(scriptOrder(before));
    });
});

describe('the bcg manifest', () => {
    it('generates the authored file byte for byte in the tree layout', async () => {
        const { context, fixture, logger } = harness('bcg', libraryPackages());

        expect(await runBuildCommand(context)).toBe(EXIT_OK);
        expect(logger.errors).toEqual([]);
        expect(fixture.read('build/bcg/meta.xml')).toBe(authored('bcg'));
    });

    it('lists the configuration script and one element per non-empty side under a bundle', async () => {
        const { context, fixture } = harness('bcg', libraryPackages());

        expect(await runBuildCommand(context, { layout: 'bundle' })).toBe(EXIT_OK);

        const manifest = fixture.read('build/bcg/meta.xml');

        expect(scriptOrder(manifest)).toEqual(['config.lua', 'src/shared.lua', 'src/server.lua', 'src/client.lua']);
        expect(manifest).not.toContain('lib/');
        expect(manifest).not.toContain('libs/');
    });

    it('reorders the bundle members and leaves the bundled file untouched when two entries swap', async () => {
        const first = harness('bcg', libraryPackages());

        await runBuildCommand(first.context, { layout: 'bundle' });

        const manifest = first.fixture.read('build/bcg/meta.xml');
        const server = first.fixture.read('build/bcg/src/server.lua');
        const source = first.fixture.read('.luam.manifest');
        const swapped = source
            .replace("{ path = 'src/index.luam', type = 'server' },", '__FIRST__')
            .replace("{ path = 'src/server/**/*.luam', type = 'server' },", "{ path = 'src/index.luam', type = 'server' },")
            .replace('__FIRST__', "{ path = 'src/server/**/*.luam', type = 'server' },");

        first.fixture.write('.luam.manifest', swapped);

        const reloaded = loadManifest(first.fixture.root).config;

        await runBuildCommand({ ...first.context, config: reloaded ?? first.context.config }, { layout: 'bundle' });

        expect(first.fixture.read('build/bcg/meta.xml')).toBe(manifest);
        expect(first.fixture.read('build/bcg/src/server.lua')).not.toBe(server);
    });
});

describe('a blank line in every ordered list', () => {
    it('reaches the generated file for scripts, files, dependencies and libraries', async () => {
        const { context, fixture } = harness('bcg', libraryPackages());

        expect(await runBuildCommand(context)).toBe(EXIT_OK);

        const lines = fixture.read('build/bcg/meta.xml').split('\n');
        const blankBefore = (needle: string): boolean => lines[lines.findIndex((line) => line.includes(needle)) - 1] === '';

        expect(blankBefore('bcg_example')).toBe(true);
        expect(blankBefore('mta-hud-fixture')).toBe(true);
        expect(blankBefore('src/index.lua')).toBe(true);
        expect(blankBefore('assets/images/**/*.png')).toBe(true);
    });

    it('opens no group before the first element of a section', async () => {
        const { context, fixture } = harness('bcg', libraryPackages());

        await runBuildCommand(context);

        const manifest = fixture.read('build/bcg/meta.xml');

        expect(manifest).not.toContain('SCRIPTS -->\n\n');
        expect(manifest).not.toContain('FILES -->\n\n');
        expect(manifest).not.toContain('INFO -->\n\n');
    });
});
