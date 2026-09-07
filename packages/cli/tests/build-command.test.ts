import { afterEach, describe, expect, it } from 'vitest';

import { discoverSources } from '@cli/build/source-discovery';
import { runBuildCommand } from '@cli/commands/build-command';
import type { CommandContext } from '@cli/commands/command-context';
import { loadManifest } from '@cli/config/manifest-loader';
import { EXIT_DIAGNOSTICS, EXIT_OK } from '@cli/cli/exit-codes';

import { createMemoryLogger, type MemoryLogger } from './support/memory-logger';
import { BROKEN_SERVER, createProjectFixture, DEFAULT_FILES, DEFAULT_SCRIPTS, defaultProjectFiles, MANIFEST_FILE, manifestSource, withWorkspace, type ProjectFixture } from './support/project-fixture';

const ROOT_SOURCE = ['function greet(name: string): string', "    return 'hi ' .. name", 'end', ''].join('\n');

function flatFiles(directive: string | null, config: Readonly<Record<string, unknown>> = {}): Record<string, string> {
    const source = directive === null ? ROOT_SOURCE : `${directive}\n\n${ROOT_SOURCE}`;

    return { [MANIFEST_FILE]: manifestSource({ build: { details: { bundle: false, map: true } }, ...config }), 'index.luam': source };
}

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

describe('root level layout', () => {
    it('builds a resource whose only source sits next to the manifest', async () => {
        const { context, fixture, logger } = harness(flatFiles(null));

        expect(await runBuildCommand(context)).toBe(EXIT_OK);
        expect(fixture.exists('build/luam-demo/index.lua')).toBe(true);
        expect(fixture.read('build/luam-demo/meta.xml')).toContain('<script src="index.lua" type="shared" cache="false" />');
        expect(logger.text()).not.toContain('config-no-scripts');
    });

    it('lets a directive give the root file its side without reporting a conflict', async () => {
        for (const side of ['client', 'server'] as const) {
            const { context, fixture, logger } = harness(flatFiles(`#!${side}`));

            expect(await runBuildCommand(context)).toBe(EXIT_OK);

            const manifest = fixture.read('build/luam-demo/meta.xml');
            const expected = side === 'server' ? '<script src="index.lua" />' : '<script src="index.lua" type="client" cache="false" />';

            expect([side, manifest.includes(expected)]).toEqual([side, true]);
            expect([side, logger.text().includes('env-path-directive-conflict')]).toEqual([side, false]);
        }
    });

    it('folds the root file into the shared bundle in the bundled layout', async () => {
        const { context, fixture } = harness(flatFiles(null, { build: { details: { bundle: true, map: true } } }));

        expect(await runBuildCommand(context)).toBe(EXIT_OK);
        expect(fixture.exists('build/luam-demo/index.lua')).toBe(false);
        expect(fixture.read('build/luam-demo/src/shared.lua')).toContain('function greet');
        expect(fixture.read('build/luam-demo/meta.xml')).toContain('<script src="src/shared.lua" type="shared" cache="false" />');
    });

    it('names the unmatched source instead of failing without one', async () => {
        const files = { [MANIFEST_FILE]: manifestSource({}), 'tools/helper.luam': ROOT_SOURCE };
        const { context, logger } = harness(files);

        expect(await runBuildCommand(context)).toBe(EXIT_DIAGNOSTICS);
        expect(logger.text()).toContain('config-unmatched-source');
        expect(logger.text()).toContain('tools/helper.luam');
    });
});

describe('build command', () => {
    it('writes the compiled scripts, helpers, and manifest', async () => {
        const { context, fixture } = harness(defaultProjectFiles());

        expect(await runBuildCommand(context)).toBe(EXIT_OK);
        expect(fixture.exists('build/luam-demo/meta.xml')).toBe(true);
        expect(fixture.exists('build/luam-demo/src/shared/config.lua')).toBe(true);
        expect(fixture.exists('build/luam-demo/src/server/main.lua')).toBe(true);
        expect(fixture.exists('build/luam-demo/src/client/hud.lua')).toBe(true);
        expect(fixture.exists('build/luam-demo/lib/string.lua')).toBe(true);
    });

    it('builds a shared file that reaches for a side-restricted API', async () => {
        const shared = ['#!shared', '', 'function isOnClient(): boolean', '    return isElement(localPlayer)', 'end', ''].join('\n');
        const { context, logger, fixture } = harness({ ...defaultProjectFiles(), 'src/shared/config.luam': shared });

        expect(await runBuildCommand(context)).toBe(EXIT_OK);
        expect(logger.text()).not.toContain('check-environment-api');
        expect(fixture.read('build/luam-demo/src/shared/config.lua')).toContain('isElement(localPlayer)');
        expect(fixture.read('build/luam-demo/meta.xml')).toContain('<script src="src/shared/**/*.lua" type="shared" cache="false" />');
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
        const config = {
            build: { output: 'dist', details: { bundle: false, map: true } },
            info: { author: { name: 'Thigas' }, version: '1.2.3', description: 'A demo resource' },
        };
        const { context, fixture } = harness(defaultProjectFiles(config));

        expect(await runBuildCommand(context)).toBe(EXIT_OK);
        expect(fixture.exists('dist/luam-demo/lib/string.lua')).toBe(true);
        expect(fixture.read('dist/luam-demo/meta.xml')).toContain('<info author="Thigas" type="script" version="1.2.3" description="A demo resource" />');
    });

    it('writes only to the output directory when a workspace names a server', async () => {
        const { context, fixture } = harness(withWorkspace(defaultProjectFiles()));

        expect(await runBuildCommand(context)).toBe(EXIT_OK);
        expect(fixture.exists('build/luam-demo/meta.xml')).toBe(true);
        expect(fixture.exists('mta-server')).toBe(false);
    });

    it('copies the runtime helper the sources trigger and names it before the authored entries', async () => {
        const { context, fixture } = harness(defaultProjectFiles());

        expect(await runBuildCommand(context)).toBe(EXIT_OK);
        expect(fixture.exists('build/luam-demo/lib/string.lua')).toBe(true);

        const entries: string[] = fixture.read('build/luam-demo/meta.xml').match(/src="[^"]+"/g) ?? [];

        expect(entries.indexOf('src="lib/string.lua"')).toBeLessThan(entries.indexOf('src="src/shared/**/*.lua"'));
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

    it('copies only the files an entry names and declares each entry once', async () => {
        const files = { ...defaultProjectFiles({ files: DEFAULT_FILES }), 'assets/images/logo.png': 'binary', 'src/server/data/spawns.json': '[]' };
        const { context, fixture } = harness(files);

        expect(await runBuildCommand(context)).toBe(EXIT_OK);
        expect(fixture.read('build/luam-demo/assets/images/logo.png')).toBe('binary');
        expect(fixture.exists('build/luam-demo/src/server/data/spawns.json')).toBe(false);

        const manifest = fixture.read('build/luam-demo/meta.xml');

        expect(manifest).toContain('<file src="assets/**/*" />');
        expect(manifest).not.toContain('spawns.json');
    });

    it('writes each file at the path its entry names', async () => {
        const files = defaultProjectFiles({ files: ['media/**/*'] });
        const { context, fixture } = harness({ ...files, 'media/logo.png': 'binary' });

        expect(await runBuildCommand(context)).toBe(EXIT_OK);
        expect(fixture.read('build/luam-demo/media/logo.png')).toBe('binary');
        expect(fixture.read('build/luam-demo/meta.xml')).toContain('<file src="media/**/*" />');
    });

    it('removes a copied file when its source disappears', async () => {
        const files = { ...defaultProjectFiles({ files: DEFAULT_FILES }), 'assets/images/logo.png': 'binary', 'assets/images/icon.png': 'binary' };
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
        expect(entries.indexOf('src="config.lua"')).toBeGreaterThan(entries.indexOf('src="lib/string.lua"'));
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

    it('ships the env reader as a server helper that names the selected file', async () => {
        const files = { ...defaultProjectFiles(), '.env': 'MAX_PLAYERS=32\n' };
        const { context, fixture } = harness(files);

        await runBuildCommand(context);

        const manifest = fixture.read('build/luam-demo/meta.xml');
        const reader = fixture.read('build/luam-demo/lib/env.lua');

        expect(manifest).toContain('<script src="lib/env.lua" />');
        expect(fixture.exists('build/luam-demo/lib/dotenv.lua')).toBe(false);
        expect(reader).toContain("'.env'");
        expect(reader).not.toContain('__LUAM_ENV_FILE__');
    });

    it('points the env reader at the file the manifest selects', async () => {
        const files = {
            ...defaultProjectFiles({ environment: { secret: '.env.production' } }),
            '.env.production': 'MAX_PLAYERS=32\n',
        };
        const { context, fixture } = harness(files);

        await runBuildCommand(context);

        expect(fixture.read('build/luam-demo/lib/env.lua')).toContain("'.env.production'");
    });

    it('ships no env helper when the project declares no keys', async () => {
        const { context, fixture } = harness(defaultProjectFiles());

        await runBuildCommand(context);

        expect(fixture.exists('build/luam-demo/lib/env.lua')).toBe(false);
        expect(fixture.exists('build/luam-demo/.env')).toBe(false);
    });

    it('reports a misspelled env key as a build error', async () => {
        const files = {
            ...defaultProjectFiles(),
            '.env': 'MAX_PLAYERS=32\n',
            'src/server/main.luam': 'print(env.MAX_PLAYER)\n',
        };
        const { context, logger } = harness(files);

        expect(await runBuildCommand(context)).toBe(EXIT_DIAGNOSTICS);
        expect(logger.text()).toContain('Declared keys: "MAX_PLAYERS"');
    });

    it('says nothing about an entry naming a directory the project has not written yet', async () => {
        const { fixture } = harness(defaultProjectFiles());
        const discovered = discoverSources(fixture.root, [
            { path: 'src/server/**/*.luam', type: 'server', group: false },
            { path: 'missing/**/*.luam', type: 'client', group: false },
        ]);

        expect(discovered.diagnostics.map((diagnostic) => diagnostic.code)).toEqual([]);
        expect(discovered.files.every((file) => file.path.startsWith('src/server/'))).toBe(true);
    });

    it('reports a script file a literal entry names that does not exist', async () => {
        const { fixture } = harness(defaultProjectFiles());
        const discovered = discoverSources(fixture.root, [{ path: 'src/server/missing.luam', type: 'server', group: false }]);

        expect(discovered.diagnostics.map((diagnostic) => diagnostic.code)).toEqual(['config-missing-script']);
    });
});

describe('build command load order', () => {
    function ordered(...paths: readonly string[]): Record<string, unknown>[] {
        return paths.map((path) => ({ path, type: path.includes('client') ? 'client' : path.includes('shared') ? 'shared' : 'server' }));
    }

    it('puts an entry where the manifest writes it', async () => {
        const scripts = ordered('src/server/main.luam', 'src/client/**/*.luam', 'src/shared/**/*.luam');
        const { context, fixture } = harness(defaultProjectFiles({ scripts }));

        expect(await runBuildCommand(context)).toBe(EXIT_OK);

        const entries: string[] = fixture.read('build/luam-demo/meta.xml').match(/src="[^"]+"/g) ?? [];

        expect(entries.filter((entry) => entry.startsWith('src="src/'))).toEqual([
            'src="src/server/main.lua"',
            'src="src/client/**/*.lua"',
            'src="src/shared/**/*.lua"',
        ]);
    });

    it('reports one file two entries of one side claim', async () => {
        const scripts = ordered('src/server/main.luam', 'src/shared/**/*.luam', 'src/server/**/*.luam', 'src/client/**/*.luam');
        const { context, logger } = harness(defaultProjectFiles({ scripts }));

        expect(await runBuildCommand(context)).toBe(EXIT_DIAGNOSTICS);
        expect(logger.text()).toContain('config-script-side-conflict');
    });

    it('fails the build and writes no manifest when an entry matches no file', async () => {
        const scripts = [...DEFAULT_SCRIPTS, { path: 'src/server/missing.luam', type: 'server' }];
        const { context, fixture, logger } = harness(defaultProjectFiles({ scripts }));

        expect(await runBuildCommand(context)).toBe(EXIT_DIAGNOSTICS);
        expect(logger.text()).toContain('src/server/missing.luam');
        expect(fixture.exists('build/luam-demo/meta.xml')).toBe(false);
    });

    it('keeps the order stable across a warm rebuild', async () => {
        const { context, fixture } = harness(defaultProjectFiles());

        await runBuildCommand(context);

        const first = fixture.read('build/luam-demo/meta.xml');

        await runBuildCommand(context);

        expect(fixture.read('build/luam-demo/meta.xml')).toBe(first);
    });

    it('carries a blank line between two entries into the generated file', async () => {
        const manifest = [
            '{',
            '    scripts = {',
            "        { path = 'src/shared/**/*.luam', type = 'shared' },",
            '',
            "        { path = 'src/server/**/*.luam', type = 'server' },",
            "        { path = 'src/client/**/*.luam', type = 'client' },",
            '    },',
            '',
            '    build = { details = { bundle = false, map = true } },',
            '}',
            '',
        ].join('\n');
        const { context, fixture } = harness({ ...defaultProjectFiles(), [MANIFEST_FILE]: manifest });

        expect(await runBuildCommand(context)).toBe(EXIT_OK);

        const lines = fixture.read('build/luam-demo/meta.xml').split('\n');
        const index = lines.findIndex((line) => line.includes('src/server/**/*.lua'));

        expect(lines[index - 1]).toBe('');
    });
});

describe('build command version element', () => {
    it('writes the resolved version last in the manifest', async () => {
        const { context, fixture } = harness(defaultProjectFiles());
        const resolved = { ...context, resolveVersion: async () => ({ server: '1.6.0', client: '1.6.0', warning: null }) };

        expect(await runBuildCommand(resolved)).toBe(EXIT_OK);

        const manifest = fixture.read('build/luam-demo/meta.xml');

        expect(manifest).toContain('<min_mta_version server="1.6.0" client="1.6.0" />');
        expect(manifest.indexOf('<min_mta_version')).toBeLessThan(manifest.indexOf('<script'));
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
        const warned = { ...context, resolveVersion: async () => ({ server: null, client: null, warning: 'No MTA release could be resolved.' }) };

        expect(await runBuildCommand(warned)).toBe(EXIT_OK);
        expect(logger.warnings.join('\n')).toContain('No MTA release could be resolved.');
        expect(fixture.read('build/luam-demo/meta.xml')).not.toContain('min_mta_version');
        expect(fixture.exists('build/luam-demo/src/server/main.lua')).toBe(true);
    });
});

describe('build command pruning without the manifest enumeration', () => {
    it('removes a compiled script when its source disappears', async () => {
        const extra = { ...defaultProjectFiles(), 'src/client/extra.luam': 'local extra: number = 1\n\nprint(extra)\n' };
        const { context, fixture } = harness(extra);

        await runBuildCommand(context);

        expect(fixture.exists('build/luam-demo/src/client/extra.lua')).toBe(true);

        fixture.remove('src/client/extra.luam');
        await runBuildCommand(context);

        expect(fixture.exists('build/luam-demo/src/client/extra.lua')).toBe(false);
    });

    it('removes a helper that stopped being required', async () => {
        const { context, fixture } = harness(defaultProjectFiles());

        await runBuildCommand(context);
        fixture.write('build/luam-demo/lib/threads.lua', 'print(1)\n');
        await runBuildCommand(context);

        expect(fixture.exists('build/luam-demo/lib/threads.lua')).toBe(false);
    });

    it('leaves a file the build never wrote alone', async () => {
        const { context, fixture } = harness(defaultProjectFiles());

        await runBuildCommand(context);

        fixture.write('build/luam-demo/notes.md', 'kept\n');
        await runBuildCommand(context);

        expect(fixture.exists('build/luam-demo/notes.md')).toBe(true);
    });
});
