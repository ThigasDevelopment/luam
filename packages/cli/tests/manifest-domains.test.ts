import { afterEach, describe, expect, it } from 'vitest';

import { resolveFiles } from '@cli/build/file-resolution';
import { resolveEngineVersion } from '@cli/build/mta-release';
import { readProjectInputs } from '@cli/build/project-inputs';
import { discoverSources } from '@cli/build/source-discovery';
import { DEFAULT_ENVIRONMENT_FILE, type FileEntry, type ScriptEntry } from '@compiler/manifest/manifest-defaults';

import { createProjectFixture, defaultProjectFiles, type ProjectFixture } from './support/project-fixture';

const ROOT_SOURCE = ['function greet(name: string): string', "    return 'hi ' .. name", 'end', ''].join('\n');

const fixtures: ProjectFixture[] = [];

const OFFLINE = { skip: true } as const;

function fixture(files: Readonly<Record<string, string>>): string {
    const created = createProjectFixture(files);

    fixtures.push(created);

    return created.root;
}

function sources(overrides: Partial<Record<'server' | 'client' | 'shared', readonly string[]>> = {}): ScriptEntry[] {
    const mapping = { shared: ['src/shared/**/*.luam'], server: ['src/server/**/*.luam'], client: ['src/client/**/*.luam'], ...overrides };

    return (['shared', 'server', 'client'] as const).flatMap((type) => (mapping[type] ?? []).map((path) => ({ path, type, group: false })));
}

function fileEntries(...paths: readonly string[]): FileEntry[] {
    return paths.map((path) => ({ path, group: false }));
}

function codes(diagnostics: readonly { code: string }[]): string[] {
    return diagnostics.map((diagnostic) => diagnostic.code);
}

afterEach(() => {
    for (const created of fixtures.splice(0)) {
        created.dispose();
    }
});

describe('script discovery', () => {
    it('tags every discovered file with the side its entry declares', () => {
        const discovered = discoverSources(fixture(defaultProjectFiles()), sources());

        expect(discovered.diagnostics).toEqual([]);
        expect(discovered.files.map((file) => [file.path, file.environment])).toEqual([
            ['src/client/hud.luam', 'client'],
            ['src/server/main.luam', 'server'],
            ['src/shared/config.luam', 'shared'],
        ]);
    });

    it('records the entry that matched each file so the bundle can order it', () => {
        const discovered = discoverSources(fixture(defaultProjectFiles()), sources());

        expect([...discovered.order.entries()].sort()).toEqual([
            ['src/client/hud.luam', 2],
            ['src/server/main.luam', 1],
            ['src/shared/config.luam', 0],
        ]);
    });

    it('reports a file two entries claim and leaves it out', () => {
        const discovered = discoverSources(fixture(defaultProjectFiles()), sources({ client: ['src/**/*.luam'] }));

        expect(codes(discovered.diagnostics)).toContain('config-script-side-conflict');
        expect(discovered.files.some((file) => file.path === 'src/server/main.luam')).toBe(false);
    });

    it('names both entries and their sides in the conflict', () => {
        const discovered = discoverSources(fixture(defaultProjectFiles()), sources({ client: ['src/**/*.luam'] }));
        const [first] = discovered.diagnostics.filter((entry) => entry.code === 'config-script-side-conflict');

        expect(first?.message).toContain('as "client"');
        expect(first?.message).toContain(' and ');
    });

    it('types a file by its entry rather than by the directory it sits in', () => {
        const files = { ...defaultProjectFiles(), 'src/utils/panel.luam': "local title: string = 'a'\n\nprint(title)\n" };
        const entries = [...sources(), { path: 'src/utils/**/*.luam', type: 'client' as const, group: false }];
        const discovered = discoverSources(fixture(files), entries);

        expect(discovered.diagnostics).toEqual([]);
        expect(discovered.files.find((file) => file.path === 'src/utils/panel.luam')?.environment).toBe('client');
    });

    it('never scans an excluded directory', () => {
        const files = { ...defaultProjectFiles(), 'node_modules/pkg/src/server/vendor.luam': 'print(1)\n' };
        const discovered = discoverSources(fixture(files), [{ path: '**/*.luam', type: 'server', group: false }]);

        expect(discovered.files.some((file) => file.path.startsWith('node_modules/'))).toBe(false);
    });

    it('leaves the output directory out of discovery', () => {
        const files = { ...defaultProjectFiles(), 'build/luam-demo/src/server/stale.luam': 'print(1)\n' };
        const discovered = discoverSources(fixture(files), [{ path: '**/*.luam', type: 'server', group: false }], ['build']);

        expect(discovered.files.some((file) => file.path.startsWith('build/'))).toBe(false);
    });

    it('names a literal entry that does not exist', () => {
        const discovered = discoverSources(fixture(defaultProjectFiles()), sources({ shared: ['src/shared/missing.luam'] }));

        expect(codes(discovered.diagnostics)).toEqual(['config-missing-script']);
        expect(discovered.diagnostics[0]?.message).toContain('src/shared/missing.luam');
    });

    it('names a pattern entry whose directory exists and matched nothing', () => {
        const files = { ...defaultProjectFiles(), 'ui/readme.md': 'notes\n' };
        const discovered = discoverSources(fixture(files), [...sources(), { path: 'ui/**/*.luam', type: 'client', group: false }]);

        expect(codes(discovered.diagnostics)).toEqual(['config-empty-script-entry']);
        expect(discovered.diagnostics[0]?.severity).toBe('warning');
        expect(discovered.diagnostics[0]?.message).toContain('"scripts[4]"');
    });

    it('says nothing about an entry naming a directory the project has not written yet', () => {
        const discovered = discoverSources(fixture(defaultProjectFiles()), [...sources(), { path: 'ui/**/*.luam', type: 'client', group: false }]);

        expect(codes(discovered.diagnostics)).toEqual([]);
    });

    it('refuses an entry that names the generated helper or library directory', () => {
        const discovered = discoverSources(fixture(defaultProjectFiles()), [...sources(), { path: 'lib/**/*.lua', type: 'shared', group: false }]);

        expect(codes(discovered.diagnostics)).toEqual(['config-reserved-script-path']);
    });

    it('copies a native lua file an entry names rather than checking it', () => {
        const files = { ...defaultProjectFiles(), 'config.lua': 'Config = {}\n' };
        const entries = [{ path: 'config.lua', type: 'shared' as const, group: false }, ...sources()];
        const discovered = discoverSources(fixture(files), entries);

        expect(discovered.diagnostics).toEqual([]);
        expect(discovered.natives.map((script) => script.path)).toEqual(['config.lua']);
        expect(discovered.files.some((file) => file.path === 'config.lua')).toBe(false);
    });

    it('builds a source file in the project root that no entry names', () => {
        const discovered = discoverSources(fixture({ ...defaultProjectFiles(), 'index.luam': ROOT_SOURCE }), sources());

        expect(discovered.diagnostics).toEqual([]);
        expect(discovered.files.map((file) => file.path)).toContain('index.luam');
        expect(discovered.files.find((file) => file.path === 'index.luam')?.environment).toBeUndefined();
    });

    it('leaves the side of a root file to the compiler even when the file declares one', () => {
        const files = { ...defaultProjectFiles(), 'index.luam': `#!client\n\n${ROOT_SOURCE}` };
        const discovered = discoverSources(fixture(files), sources());

        expect(discovered.files.find((file) => file.path === 'index.luam')?.environment).toBeUndefined();
    });

    it('keeps the declared side of a root file an entry does name', () => {
        const files = { ...defaultProjectFiles(), 'index.luam': ROOT_SOURCE };
        const discovered = discoverSources(fixture(files), sources({ client: ['src/client/**/*.luam', '*.luam'] }));

        expect(discovered.files.find((file) => file.path === 'index.luam')?.environment).toBe('client');
    });

    it('builds neither a root test file nor a source no entry reaches', () => {
        const files = { ...defaultProjectFiles(), 'index.test.luam': ROOT_SOURCE, 'tools/helper.luam': ROOT_SOURCE };
        const discovered = discoverSources(fixture(files), sources());

        expect(discovered.files.map((file) => file.path)).toEqual(['src/client/hud.luam', 'src/server/main.luam', 'src/shared/config.luam']);
    });

    it('names the source files no entry matched when the build found none', () => {
        const discovered = discoverSources(fixture({ 'tools/helper.luam': ROOT_SOURCE }), []);

        expect(codes(discovered.diagnostics)).toEqual(['config-unmatched-source']);
        expect(discovered.diagnostics[0]?.message).toContain('"tools/helper.luam"');
        expect(discovered.diagnostics[0]?.message).toContain('Add an entry to "scripts"');
        expect(discovered.diagnostics[0]?.message).toContain('move the file under a path "scripts" already names');
        expect(discovered.diagnostics[0]?.message).toContain('put it in the project root');
    });

    it('names five unmatched files and counts the rest', () => {
        const files = Object.fromEntries(Array.from({ length: 8 }, (_, index) => [`tools/file-${index}.luam`, ROOT_SOURCE]));
        const discovered = discoverSources(fixture(files), []);

        expect(codes(discovered.diagnostics)).toEqual(['config-unmatched-source']);
        expect(discovered.diagnostics[0]?.message).toContain('"tools/file-4.luam" and 3 more');
        expect(discovered.diagnostics[0]?.message).not.toContain('tools/file-5.luam');
    });

    it('reports no scripts for a project that holds no source file at all', () => {
        const discovered = discoverSources(fixture({ 'docs/notes.md': 'ignored\n' }), []);

        expect(codes(discovered.diagnostics)).toEqual(['config-no-scripts']);
        expect(discovered.diagnostics[0]?.message).toContain('No ".luam" source files matched "scripts"');
    });
});

describe('file resolution', () => {
    it('copies every matching file at the path the pattern describes', () => {
        const root = fixture({ 'assets/images/logo.png': 'binary', 'assets/sounds/beep.wav': 'binary' });
        const resolved = resolveFiles(root, fileEntries('assets/**/*'));

        expect(resolved.diagnostics).toEqual([]);
        expect(resolved.assets.map((asset) => asset.path)).toEqual(['assets/images/logo.png', 'assets/sounds/beep.wav']);
    });

    it('emits one element per entry carrying the entry text', () => {
        const root = fixture({ 'assets/images/logo.png': 'binary', 'assets/sounds/beep.wav': 'binary' });

        expect(resolveFiles(root, fileEntries('assets/**/*')).elements).toEqual([{ src: 'assets/**/*', group: false }]);
    });

    it('keeps a literal file at its own path', () => {
        const root = fixture({ 'logo.png': 'binary', 'icon.png': 'binary' });
        const resolved = resolveFiles(root, fileEntries('logo.png', 'icon.png'));

        expect(resolved.assets.map((asset) => asset.path).sort()).toEqual(['icon.png', 'logo.png']);
    });

    it('declares every file so clients download it', () => {
        const root = fixture({ 'assets/logo.png': 'binary' });

        expect(resolveFiles(root, fileEntries('assets/**/*')).assets.every((asset) => asset.isDownloaded)).toBe(true);
    });

    it('rejects two entries that claim one file', () => {
        const root = fixture({ 'assets/logo.png': 'binary' });
        const resolved = resolveFiles(root, fileEntries('assets/**/*', 'assets/logo.png'));

        expect(codes(resolved.diagnostics)).toEqual(['config-output-collision']);
        expect(resolved.assets).toHaveLength(1);
    });

    it('refuses a path reserved for generated output', () => {
        const root = fixture({ 'meta.xml': 'x', 'lib/helper.lua': 'x' });
        const resolved = resolveFiles(root, fileEntries('meta.xml', 'lib/**/*'));

        expect(codes(resolved.diagnostics)).toEqual(['config-output-collision', 'config-output-collision']);
        expect(resolved.assets).toEqual([]);
    });

    it('names a literal entry that does not exist', () => {
        const resolved = resolveFiles(fixture({}), fileEntries('assets/logo.png'));

        expect(codes(resolved.diagnostics)).toEqual(['config-missing-file']);
        expect(resolved.diagnostics[0]?.message).toContain('"files[1]"');
    });

    it('copies nothing when no entry is listed', () => {
        const root = fixture({ 'assets/logo.png': 'binary' });

        expect(resolveFiles(root, []).assets).toEqual([]);
    });

    it('fails the build when the root a glob points at is not a directory', () => {
        const resolved = resolveFiles(fixture({}), fileEntries('assets/**/*'));

        expect(codes(resolved.diagnostics)).toEqual(['config-empty-file-entry']);
        expect(resolved.diagnostics[0]?.severity).toBe('error');
        expect(resolved.diagnostics[0]?.message).toContain('"assets" is not a directory');
    });

    it('fails the build when a glob whose root exists matches no file', () => {
        const resolved = resolveFiles(fixture({ 'assets/readme.txt': 'text' }), fileEntries('assets/**/*.jpg'));

        expect(codes(resolved.diagnostics)).toEqual(['config-empty-file-entry']);
        expect(resolved.diagnostics[0]?.message).toContain('matched no file under "assets"');
    });

    it('stays quiet for an entry that matches at least one file', () => {
        expect(resolveFiles(fixture({ 'assets/logo.png': 'binary' }), fileEntries('assets/**/*')).diagnostics).toEqual([]);
    });

    it('keeps the environment file out of the resource', () => {
        const resolved = resolveFiles(fixture({ '.env': 'PORT=1\n' }), fileEntries('.env'));

        expect(codes(resolved.diagnostics)).toEqual(['config-environment-file-entry']);
    });

    it('resolves every documented pattern shape to the files it names', () => {
        const root = fixture({ 'assets/readme.txt': 'text', 'assets/img/logo.png': 'binary' });
        const both = ['assets/img/logo.png', 'assets/readme.txt'];
        const cases: readonly (readonly [string, readonly string[]])[] = [
            ['assets/**/*', both],
            ['assets', both],
            ['assets/**', both],
            ['assets/*', ['assets/readme.txt']],
            ['assets/**/*.png', ['assets/img/logo.png']],
            ['**/*.png', ['assets/img/logo.png']],
        ];

        for (const [path, expected] of cases) {
            const resolved = resolveFiles(root, fileEntries(path));

            expect([path, resolved.assets.map((asset) => asset.path)]).toEqual([path, expected]);
            expect([path, codes(resolved.diagnostics)]).toEqual([path, []]);
        }
    });
});

describe('engine version', () => {
    it('returns a pinned version without asking the network', async () => {
        const request = (): Promise<Response> => Promise.reject(new Error('the network must not be used'));

        expect(await resolveEngineVersion(fixture({}), '1.6.0', { request })).toEqual({ version: '1.6.0', warning: null });
    });

    it('leaves the version out without a warning when the lookup is skipped on purpose', async () => {
        expect(await resolveEngineVersion(fixture({}), 'latest', OFFLINE)).toEqual({ version: null, warning: null });
    });

    it('warns instead of failing when the release feed cannot be reached', async () => {
        const request = (): Promise<Response> => Promise.reject(new Error('offline'));
        const resolved = await resolveEngineVersion(fixture({}), 'latest', { request });

        expect(resolved.version).toBeNull();
        expect(resolved.warning).toContain('min_mta_version');
    });
});

describe('environment file', () => {
    const source = 'MAX_PLAYERS=32\n';

    it('reads the file "environment.secret" names instead of the default', () => {
        const root = fixture({ ...defaultProjectFiles(), '.env': 'MAX_PLAYERS=1\n', '.env.development': source });
        const inputs = readProjectInputs(root, { files: [], secret: '.env.development' });

        expect(inputs.declared?.entries.map((entry) => [entry.key, entry.value])).toEqual([['MAX_PLAYERS', '32']]);
    });

    it('reads one environment file and no override beside it', () => {
        const root = fixture({ ...defaultProjectFiles(), '.env': source, '.env.local': 'MAX_PLAYERS=64\nEXTRA=1\n' });
        const inputs = readProjectInputs(root, { files: [], secret: DEFAULT_ENVIRONMENT_FILE });

        expect(inputs.declared?.entries.map((entry) => [entry.key, entry.value])).toEqual([['MAX_PLAYERS', '32']]);
    });

    it('reports a configured file that does not exist', () => {
        const root = fixture(defaultProjectFiles());
        const inputs = readProjectInputs(root, { files: [], secret: '.env.staging' });

        expect(codes(inputs.diagnostics)).toEqual(['config-missing-env-file']);
        expect(inputs.diagnostics[0]?.message).toContain('environment.secret');
    });

    it('stays quiet when the default file is simply absent', () => {
        const inputs = readProjectInputs(fixture(defaultProjectFiles()), { files: [], secret: DEFAULT_ENVIRONMENT_FILE });

        expect(inputs.diagnostics).toEqual([]);
        expect(inputs.declared).toBeNull();
    });
});
