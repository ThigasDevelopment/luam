import { afterEach, describe, expect, it } from 'vitest';

import { discoverSources } from '@cli/build/source-discovery';
import { runBuildCommand } from '@cli/commands/build-command';
import type { CommandContext } from '@cli/commands/command-context';
import { loadManifest } from '@cli/config/manifest-loader';
import { EXIT_DIAGNOSTICS, EXIT_OK } from '@cli/cli/exit-codes';

import { createMemoryLogger, type MemoryLogger } from './support/memory-logger';
import { BROKEN_SERVER, createProjectFixture, defaultProjectFiles, type ProjectFixture } from './support/project-fixture';

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

afterEach(() => {
    for (const fixture of fixtures.splice(0)) {
        fixture.dispose();
    }
});

describe('build command', () => {
    it('writes the compiled scripts, helpers, and manifest', async () => {
        const { context, fixture } = harness(defaultProjectFiles());

        expect(await runBuildCommand(context)).toBe(EXIT_OK);
        expect(fixture.exists('build/luam-demo/meta.xml')).toBe(true);
        expect(fixture.exists('build/luam-demo/src/shared/config.lua')).toBe(true);
        expect(fixture.exists('build/luam-demo/src/server/main.lua')).toBe(true);
        expect(fixture.exists('build/luam-demo/src/client/hud.lua')).toBe(true);
        expect(fixture.exists('build/luam-demo/lib/client/string.lua')).toBe(true);
    });

    it('lists every script in the manifest with its environment', async () => {
        const { context, fixture } = harness(defaultProjectFiles());

        await runBuildCommand(context);

        const manifest = fixture.read('build/luam-demo/meta.xml');

        expect(manifest).toContain('<info type="script" />');
        expect(manifest).toContain('<script src="src/shared/**/*.lua" type="shared" cache="false" />');
        expect(manifest).toContain('<script src="src/server/**/*.lua" />');
        expect(manifest).toContain('<script src="src/client/**/*.lua" type="client" cache="false" />');
    });

    it('honours outDir and the manifest metadata', async () => {
        const config = { outDir: 'dist', author: 'Thigas', version: '1.2.3', description: 'A demo resource' };
        const { context, fixture } = harness(defaultProjectFiles(config));

        expect(await runBuildCommand(context)).toBe(EXIT_OK);
        expect(fixture.exists('dist/luam-demo/lib/client/string.lua')).toBe(true);
        expect(fixture.read('dist/luam-demo/meta.xml')).toContain('<info author="Thigas" type="script" version="1.2.3" description="A demo resource" />');
    });

    it('writes only to outDir when serverPath is configured', async () => {
        const { context, fixture } = harness(defaultProjectFiles({ serverPath: 'mta-server' }));

        expect(await runBuildCommand(context)).toBe(EXIT_OK);
        expect(fixture.exists('build/luam-demo/meta.xml')).toBe(true);
        expect(fixture.exists('mta-server')).toBe(false);
    });

    it('copies an opt-in runtime helper the sources never trigger', async () => {
        const { context, fixture } = harness(defaultProjectFiles({ helpers: ['threads'] }));

        expect(await runBuildCommand(context)).toBe(EXIT_OK);
        expect(fixture.exists('build/luam-demo/lib/shared/threads.lua')).toBe(true);
        expect(fixture.read('build/luam-demo/meta.xml')).toContain('<script src="lib/shared/threads.lua" type="shared" cache="false" />');
    });

    it('produces no output when the build fails', async () => {
        const { context, fixture, logger } = harness({ ...defaultProjectFiles(), 'src/server/main.luam': BROKEN_SERVER });

        expect(await runBuildCommand(context)).toBe(EXIT_DIAGNOSTICS);
        expect(fixture.exists('build')).toBe(false);
        expect(logger.errors.at(-1)).toContain('Build failed:');
    });

    it('keeps the previous output when a later build fails', async () => {
        const { context, fixture } = harness(defaultProjectFiles());

        expect(await runBuildCommand(context)).toBe(EXIT_OK);

        fixture.write('src/server/main.luam', BROKEN_SERVER);

        expect(await runBuildCommand(context)).toBe(EXIT_DIAGNOSTICS);
        expect(fixture.read('build/luam-demo/src/server/main.lua')).toContain('announceJoin');
    });

    it('rewrites only the files whose content changed', async () => {
        const { context, fixture, logger } = harness(defaultProjectFiles());

        await runBuildCommand(context);
        logger.lines.length = 0;
        await runBuildCommand(context);

        expect(logger.text()).toContain('Wrote 0 files');
    });

    it('removes generated files that the project no longer produces', async () => {
        const files = { ...defaultProjectFiles(), 'src/client/extra.luam': 'local unused: number = 1\n' };
        const { context, fixture } = harness(files);

        await runBuildCommand(context);

        expect(fixture.exists('build/luam-demo/src/client/extra.lua')).toBe(true);

        fixture.remove('src/client/extra.luam');
        await runBuildCommand(context);

        expect(fixture.exists('build/luam-demo/src/client/extra.lua')).toBe(false);
    });

    it('keeps files it never generated in the output directory', async () => {
        const { context, fixture } = harness(defaultProjectFiles());

        await runBuildCommand(context);
        fixture.write('build/luam-demo/images/logo.png', 'binary');
        await runBuildCommand(context);

        expect(fixture.exists('build/luam-demo/images/logo.png')).toBe(true);
    });

    it('copies only the files a mapping names and declares them in the manifest', async () => {
        const files = { ...defaultProjectFiles(), 'assets/images/logo.png': 'binary', 'src/server/data/spawns.json': '[]' };
        const { context, fixture } = harness(files);

        expect(await runBuildCommand(context)).toBe(EXIT_OK);
        expect(fixture.read('build/luam-demo/assets/images/logo.png')).toBe('binary');
        expect(fixture.exists('build/luam-demo/src/server/data/spawns.json')).toBe(false);

        const manifest = fixture.read('build/luam-demo/meta.xml');

        expect(manifest).toContain('<file src="assets/images/logo.png" />');
        expect(manifest).not.toContain('spawns.json');
    });

    it('rewrites the destination a mapping names', async () => {
        const files = defaultProjectFiles({ assets: [{ from: 'media/**/*', to: 'assets/images' }] });
        const { context, fixture } = harness({ ...files, 'media/logo.png': 'binary' });

        expect(await runBuildCommand(context)).toBe(EXIT_OK);
        expect(fixture.read('build/luam-demo/assets/images/logo.png')).toBe('binary');
        expect(fixture.read('build/luam-demo/meta.xml')).toContain('<file src="assets/images/logo.png" />');
    });

    it('removes a copied asset when its source disappears', async () => {
        const files = { ...defaultProjectFiles(), 'assets/images/logo.png': 'binary' };
        const { context, fixture } = harness(files);

        await runBuildCommand(context);

        expect(fixture.exists('build/luam-demo/assets/images/logo.png')).toBe(true);

        fixture.remove('assets/images/logo.png');
        await runBuildCommand(context);

        expect(fixture.exists('build/luam-demo/assets/images/logo.png')).toBe(false);
    });

    it('minifies config.lua and lists it before the developer scripts', async () => {
        const files = { ...defaultProjectFiles(), 'config.lua': 'Config = { greeting = "hi" } -- keep\n' };
        const { context, fixture } = harness(files);

        expect(await runBuildCommand(context)).toBe(EXIT_OK);
        expect(fixture.read('build/luam-demo/config.lua')).toBe('Config={greeting="hi"}');

        const entries: string[] = fixture.read('build/luam-demo/meta.xml').match(/src="[^"]+"/g) ?? [];

        expect(entries.indexOf('src="config.lua"')).toBeLessThan(entries.indexOf('src="src/shared/**/*.lua"'));
        expect(entries.indexOf('src="config.lua"')).toBeGreaterThan(entries.indexOf('src="lib/client/string.lua"'));
    });

    it('generates the deployment env file once and never overwrites it', async () => {
        const files = { ...defaultProjectFiles(), '.env': 'MAX_PLAYERS=32\nDB_PASSWORD=changeme\n' };
        const { context, fixture } = harness(files);

        expect(await runBuildCommand(context)).toBe(EXIT_OK);

        const generated = fixture.read('build/luam-demo/.env');

        expect(generated).toContain('MAX_PLAYERS=32');
        expect(generated).toContain('DB_PASSWORD=');
        expect(generated).not.toContain('changeme');

        fixture.write('build/luam-demo/.env', 'MAX_PLAYERS=64\n');
        await runBuildCommand(context);

        expect(fixture.read('build/luam-demo/.env')).toBe('MAX_PLAYERS=64\n');
    });

    it('keeps a local override out of the generated deployment values', async () => {
        const files = { ...defaultProjectFiles(), '.env': 'MAX_PLAYERS=32\n', '.env.local': 'MAX_PLAYERS=64\n' };
        const { context, fixture } = harness(files);

        await runBuildCommand(context);

        expect(fixture.read('build/luam-demo/.env')).toContain('MAX_PLAYERS=32');
        expect(fixture.read('build/luam-demo/.env')).not.toContain('64');
    });

    it('never declares the env file in the manifest and never prunes it', async () => {
        const files = { ...defaultProjectFiles(), '.env': 'MAX_PLAYERS=32\n' };
        const { context, fixture } = harness(files);

        await runBuildCommand(context);
        await runBuildCommand(context);

        expect(fixture.read('build/luam-demo/meta.xml')).not.toContain('.env');
        expect(fixture.exists('build/luam-demo/.env')).toBe(true);
    });

    it('injects the server side env library when the project declares keys', async () => {
        const files = { ...defaultProjectFiles(), '.env': 'MAX_PLAYERS=32\n' };
        const { context, fixture } = harness(files);

        await runBuildCommand(context);

        const manifest = fixture.read('build/luam-demo/meta.xml');

        expect(fixture.exists('build/luam-demo/lib/server/env.lua')).toBe(true);
        expect(fixture.exists('build/luam-demo/lib/server/dotenv.lua')).toBe(true);
        expect(manifest).toContain('<script src="lib/server/env.lua" />');
        expect(manifest.indexOf('lib/server/dotenv.lua')).toBeLessThan(manifest.indexOf('lib/server/env.lua'));
    });

    it('ships no env library when the project declares no keys', async () => {
        const { context, fixture } = harness(defaultProjectFiles());

        await runBuildCommand(context);

        expect(fixture.exists('build/luam-demo/lib/server/env.lua')).toBe(false);
        expect(fixture.exists('build/luam-demo/lib/server/dotenv.lua')).toBe(false);
        expect(fixture.exists('build/luam-demo/.env')).toBe(false);
    });

    it('reports a misspelled env key as a build error', async () => {
        const files = {
            ...defaultProjectFiles(),
            '.env': 'MAX_PLAYERS=32\n',
            'src/server/main.luam': 'print(process.env.MAX_PLAYER)\n',
        };
        const { context, logger } = harness(files);

        expect(await runBuildCommand(context)).toBe(EXIT_DIAGNOSTICS);
        expect(logger.text()).toContain('Declared keys: "MAX_PLAYERS"');
    });

    it('reports a source pattern that matches nothing', async () => {
        const { fixture } = harness(defaultProjectFiles());
        const discovered = discoverSources(fixture.root, { server: ['src/server/**/*.luam'], client: ['missing/**/*.luam'], shared: [] });

        expect(discovered.diagnostics.map((diagnostic) => diagnostic.code)).toEqual([]);
        expect(discovered.files.every((file) => file.path.startsWith('src/server/'))).toBe(true);
    });

    it('reports a source file listed by a literal pattern that does not exist', async () => {
        const { fixture } = harness(defaultProjectFiles());
        const discovered = discoverSources(fixture.root, { server: ['src/server/missing.luam'], client: [], shared: [] });

        expect(discovered.diagnostics.map((diagnostic) => diagnostic.code)).toEqual(['config-missing-source']);
    });
});

describe('build command load order', () => {
    it('pins a source file ahead of its environment group', async () => {
        const { context, fixture } = harness(defaultProjectFiles({ loadOrder: ['src/server/main.luam'] }));

        expect(await runBuildCommand(context)).toBe(EXIT_OK);

        const entries: string[] = fixture.read('build/luam-demo/meta.xml').match(/src="[^"]+"/g) ?? [];

        expect(entries.indexOf('src="src/server/main.lua"')).toBeLessThan(entries.indexOf('src="src/server/**/*.lua"'));
    });

    it('fails the build and writes no manifest when an entry matches no file', async () => {
        const { context, fixture, logger } = harness(defaultProjectFiles({ loadOrder: ['src/server/missing.luam'] }));

        expect(await runBuildCommand(context)).toBe(EXIT_DIAGNOSTICS);
        expect(logger.text()).toContain('src/server/missing.luam');
        expect(fixture.exists('build/luam-demo/meta.xml')).toBe(false);
    });

    it('keeps the order stable across a warm rebuild', async () => {
        const { context, fixture } = harness(defaultProjectFiles({ loadOrder: ['src/server/main.luam'] }));

        await runBuildCommand(context);

        const first = fixture.read('build/luam-demo/meta.xml');

        await runBuildCommand(context);

        expect(fixture.read('build/luam-demo/meta.xml')).toBe(first);
    });
});

describe('build command version element', () => {
    it('writes the resolved version last in the manifest', async () => {
        const { context, fixture } = harness(defaultProjectFiles());
        const resolved = { ...context, resolveVersion: async () => ({ version: '1.6.0', warning: null }) };

        expect(await runBuildCommand(resolved)).toBe(EXIT_OK);

        const manifest = fixture.read('build/luam-demo/meta.xml');

        expect(manifest).toContain('<min_mta_version server="1.6.0" client="1.6.0" />');
        expect(manifest.indexOf('<min_mta_version')).toBeGreaterThan(manifest.indexOf('<script'));
    });

    it('produces a complete resource when the lookup throws', async () => {
        const { context, fixture, logger } = harness(defaultProjectFiles());
        const failing = {
            ...context,
            resolveVersion: async (): Promise<never> => {
                throw new Error('the lookup must never reach here');
            },
        };

        await expect(runBuildCommand(failing)).rejects.toThrow();
        expect(fixture.exists('build/luam-demo/meta.xml')).toBe(false);
        expect(logger.errors).toEqual([]);
    });

    it('warns, omits the element, and still writes a loadable resource with no version', async () => {
        const { context, fixture, logger } = harness(defaultProjectFiles());
        const warned = { ...context, resolveVersion: async () => ({ version: null, warning: 'No MTA release could be resolved.' }) };

        expect(await runBuildCommand(warned)).toBe(EXIT_OK);
        expect(logger.warnings.join('\n')).toContain('No MTA release could be resolved.');
        expect(fixture.read('build/luam-demo/meta.xml')).not.toContain('min_mta_version');
        expect(fixture.exists('build/luam-demo/src/server/main.lua')).toBe(true);
    });
});

describe('build command pruning without the manifest enumeration', () => {
    it('removes a compiled script when its source disappears', async () => {
        const { context, fixture } = harness(defaultProjectFiles());

        await runBuildCommand(context);

        expect(fixture.exists('build/luam-demo/src/client/hud.lua')).toBe(true);

        fixture.remove('src/client/hud.luam');
        await runBuildCommand(context);

        expect(fixture.exists('build/luam-demo/src/client/hud.lua')).toBe(false);
    });

    it('removes a helper that stopped being required', async () => {
        const { context, fixture } = harness(defaultProjectFiles({ helpers: ['threads'] }));

        await runBuildCommand(context);

        expect(fixture.exists('build/luam-demo/lib/shared/threads.lua')).toBe(true);

        await runBuildCommand({ ...context, config: { ...context.config, helpers: [] } });

        expect(fixture.exists('build/luam-demo/lib/shared/threads.lua')).toBe(false);
    });

    it('leaves a file the build never wrote alone', async () => {
        const { context, fixture } = harness(defaultProjectFiles());

        await runBuildCommand(context);

        fixture.write('build/luam-demo/notes.md', 'kept\n');
        await runBuildCommand(context);

        expect(fixture.exists('build/luam-demo/notes.md')).toBe(true);
    });
});
