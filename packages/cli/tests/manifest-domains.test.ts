import { afterEach, describe, expect, it } from 'vitest';

import { resolveAssets } from '@cli/build/asset-resolution';
import { resolveEngineVersion } from '@cli/build/mta-release';
import { readProjectInputs } from '@cli/build/project-inputs';
import { discoverSources } from '@cli/build/source-discovery';
import { DEFAULT_ENVIRONMENT_FILES, type SourceMapping } from '@compiler/manifest/manifest-defaults';

import { createProjectFixture, defaultProjectFiles, type ProjectFixture } from './support/project-fixture';

const ROOT_SOURCE = ['function greet(name: string): string', "    return 'hi ' .. name", 'end', ''].join('\n');

const fixtures: ProjectFixture[] = [];

const OFFLINE = { skip: true } as const;

function fixture(files: Readonly<Record<string, string>>): string {
    const created = createProjectFixture(files);

    fixtures.push(created);

    return created.root;
}

function sources(overrides: Partial<SourceMapping> = {}): SourceMapping {
    return { server: ['src/server/**/*.luam'], client: ['src/client/**/*.luam'], shared: ['src/shared/**/*.luam'], ...overrides };
}

function codes(diagnostics: readonly { code: string }[]): string[] {
    return diagnostics.map((diagnostic) => diagnostic.code);
}

afterEach(() => {
    for (const created of fixtures.splice(0)) {
        created.dispose();
    }
});

describe('source discovery', () => {
    it('tags every discovered file with the side that matched it', () => {
        const discovered = discoverSources(fixture(defaultProjectFiles()), sources());

        expect(discovered.diagnostics).toEqual([]);
        expect(discovered.files.map((file) => [file.path, file.environment])).toEqual([
            ['src/client/hud.luam', 'client'],
            ['src/server/main.luam', 'server'],
            ['src/shared/config.luam', 'shared'],
        ]);
    });

    it('reports a file two sides claim and leaves it out', () => {
        const discovered = discoverSources(fixture(defaultProjectFiles()), sources({ client: ['src/**/*.luam'] }));

        expect(codes(discovered.diagnostics)).toContain('config-source-side-conflict');
        expect(discovered.files.some((file) => file.path === 'src/server/main.luam')).toBe(false);
    });

    it('accepts an extra pattern for one side', () => {
        const files = { ...defaultProjectFiles(), 'ui/panel.luam': "local title: string = 'a'\n\nprint(title)\n" };
        const discovered = discoverSources(fixture(files), sources({ client: ['src/client/**/*.luam', 'ui/**/*.luam'] }));

        expect(discovered.diagnostics).toEqual([]);
        expect(discovered.files.map((file) => file.path)).toContain('ui/panel.luam');
    });

    it('never scans an excluded directory', () => {
        const files = { ...defaultProjectFiles(), 'node_modules/pkg/src/server/vendor.luam': 'print(1)\n' };
        const discovered = discoverSources(fixture(files), sources({ server: ['**/*.luam'] }));

        expect(discovered.files.some((file) => file.path.startsWith('node_modules/'))).toBe(false);
    });

    it('leaves the output directory out of discovery', () => {
        const files = { ...defaultProjectFiles(), 'build/luam-demo/src/server/stale.luam': 'print(1)\n' };
        const discovered = discoverSources(fixture(files), sources({ server: ['**/*.luam'] }), ['build']);

        expect(discovered.files.some((file) => file.path.startsWith('build/'))).toBe(false);
    });

    it('names a literal entry that does not exist', () => {
        const discovered = discoverSources(fixture(defaultProjectFiles()), sources({ shared: ['src/shared/missing.luam'] }));

        expect(codes(discovered.diagnostics)).toEqual(['config-missing-source']);
        expect(discovered.diagnostics[0]?.message).toContain('src/shared/missing.luam');
    });

    it('builds a source file in the project root that no pattern names', () => {
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

    it('keeps the mapped side of a root file a pattern does name', () => {
        const files = { ...defaultProjectFiles(), 'index.luam': ROOT_SOURCE };
        const discovered = discoverSources(fixture(files), sources({ client: ['src/client/**/*.luam', '*.luam'] }));

        expect(discovered.files.find((file) => file.path === 'index.luam')?.environment).toBe('client');
    });

    it('builds neither a root test file nor a source no pattern reaches', () => {
        const files = { ...defaultProjectFiles(), 'index.test.luam': ROOT_SOURCE, 'tools/helper.luam': ROOT_SOURCE };
        const discovered = discoverSources(fixture(files), sources());

        expect(discovered.files.map((file) => file.path)).toEqual(['src/client/hud.luam', 'src/server/main.luam', 'src/shared/config.luam']);
    });

    it('names the source files no pattern matched when the build found none', () => {
        const discovered = discoverSources(fixture({ 'tools/helper.luam': ROOT_SOURCE }), sources());

        expect(codes(discovered.diagnostics)).toEqual(['config-unmatched-source']);
        expect(discovered.diagnostics[0]?.message).toContain('"tools/helper.luam"');
        expect(discovered.diagnostics[0]?.message).toContain('Add a pattern to "sources"');
        expect(discovered.diagnostics[0]?.message).toContain('move the file under a directory "sources" already names');
        expect(discovered.diagnostics[0]?.message).toContain('put it in the project root');
    });

    it('names five unmatched files and counts the rest', () => {
        const files = Object.fromEntries(Array.from({ length: 8 }, (_, index) => [`tools/file-${index}.luam`, ROOT_SOURCE]));
        const discovered = discoverSources(fixture(files), sources());

        expect(codes(discovered.diagnostics)).toEqual(['config-unmatched-source']);
        expect(discovered.diagnostics[0]?.message).toContain('"tools/file-4.luam" and 3 more');
        expect(discovered.diagnostics[0]?.message).not.toContain('tools/file-5.luam');
    });

    it('still reports no sources for a project that holds no source file at all', () => {
        const discovered = discoverSources(fixture({ 'docs/notes.md': 'ignored\n' }), sources());

        expect(codes(discovered.diagnostics)).toEqual(['config-no-sources']);
        expect(discovered.diagnostics[0]?.message).toContain('No ".luam" source files matched "sources"');
    });
});

describe('asset resolution', () => {
    it('keeps the path below the pattern root under the destination', () => {
        const root = fixture({ 'assets/images/logo.png': 'binary', 'assets/sounds/beep.wav': 'binary' });
        const resolved = resolveAssets(root, [{ from: 'assets/**/*', to: 'assets' }]);

        expect(resolved.diagnostics).toEqual([]);
        expect(resolved.assets.map((asset) => asset.path)).toEqual(['assets/images/logo.png', 'assets/sounds/beep.wav']);
    });

    it('renames the destination without touching the tree below it', () => {
        const root = fixture({ 'media/images/logo.png': 'binary' });
        const resolved = resolveAssets(root, [{ from: 'media/**/*', to: 'public' }]);

        expect(resolved.assets).toEqual([{ path: 'public/images/logo.png', source: 'media/images/logo.png', isDownloaded: true }]);
    });

    it('places a literal file at its destination and keeps its path when there is none', () => {
        const root = fixture({ 'logo.png': 'binary', 'icon.png': 'binary' });
        const resolved = resolveAssets(root, [
            { from: 'logo.png', to: 'images/logo.png' },
            { from: 'icon.png', to: '.' },
        ]);

        expect(resolved.assets.map((asset) => asset.path).sort()).toEqual(['icon.png', 'images/logo.png']);
    });

    it('declares every asset so clients download it', () => {
        const root = fixture({ 'assets/logo.png': 'binary' });

        expect(resolveAssets(root, [{ from: 'assets/**/*', to: 'assets' }]).assets.every((asset) => asset.isDownloaded)).toBe(true);
    });

    it('rejects two mappings that land on the same destination', () => {
        const root = fixture({ 'a/logo.png': 'binary', 'b/logo.png': 'binary' });
        const resolved = resolveAssets(root, [
            { from: 'a/**/*', to: 'assets' },
            { from: 'b/**/*', to: 'assets' },
        ]);

        expect(codes(resolved.diagnostics)).toEqual(['config-output-collision']);
        expect(resolved.assets).toHaveLength(1);
    });

    it('refuses a destination reserved for generated output', () => {
        const root = fixture({ 'a/meta.xml': 'x', 'b/helper.lua': 'x' });
        const resolved = resolveAssets(root, [
            { from: 'a/meta.xml', to: 'meta.xml' },
            { from: 'b/**/*', to: 'lib' },
        ]);

        expect(codes(resolved.diagnostics)).toEqual(['config-output-collision', 'config-output-collision']);
        expect(resolved.assets).toEqual([]);
    });

    it('names a literal entry that does not exist', () => {
        const resolved = resolveAssets(fixture({}), [{ from: 'assets/logo.png', to: 'assets' }]);

        expect(codes(resolved.diagnostics)).toEqual(['config-missing-asset']);
    });

    it('copies nothing when no mapping is listed', () => {
        const root = fixture({ 'assets/logo.png': 'binary' });

        expect(resolveAssets(root, []).assets).toEqual([]);
    });

    it('warns when the root a glob points at is not a directory', () => {
        const resolved = resolveAssets(fixture({}), [{ from: 'assets/**/*', to: 'assets' }]);

        expect(codes(resolved.diagnostics)).toEqual(['config-empty-asset']);
        expect(resolved.diagnostics[0]?.severity).toBe('warning');
        expect(resolved.diagnostics[0]?.message).toContain('"assets" is not a directory');
    });

    it('warns when a glob whose root exists matches no file', () => {
        const resolved = resolveAssets(fixture({ 'assets/readme.txt': 'text' }), [{ from: 'assets/**/*.jpg', to: 'assets' }]);

        expect(codes(resolved.diagnostics)).toEqual(['config-empty-asset']);
        expect(resolved.diagnostics[0]?.message).toContain('matched no file under "assets"');
    });

    it('stays quiet for a mapping that matches at least one file', () => {
        const resolved = resolveAssets(fixture({ 'assets/logo.png': 'binary' }), [{ from: 'assets/**/*', to: 'assets' }]);

        expect(resolved.diagnostics).toEqual([]);
    });

    it('resolves every documented "from" shape to the files it names today', () => {
        const root = fixture({ 'assets/readme.txt': 'text', 'assets/img/logo.png': 'binary' });
        const both = ['assets/img/logo.png', 'assets/readme.txt'];
        const cases: readonly (readonly [string, readonly string[]])[] = [
            ['assets/**/*', both],
            ['assets', both],
            ['assets/**', both],
            ['assets/*', ['assets/readme.txt']],
            ['assets/**/*.png', ['assets/img/logo.png']],
            ['**/*.png', ['assets/assets/img/logo.png']],
        ];

        for (const [from, expected] of cases) {
            const resolved = resolveAssets(root, [{ from, to: 'assets' }]);

            expect([from, resolved.assets.map((asset) => asset.path)]).toEqual([from, expected]);
            expect([from, codes(resolved.diagnostics)]).toEqual([from, []]);
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

describe('environment files', () => {
    const source = 'MAX_PLAYERS=32\n';

    it('reads the configured base file instead of the default', () => {
        const root = fixture({ ...defaultProjectFiles(), '.env': 'MAX_PLAYERS=1\n', '.env.development': source });
        const inputs = readProjectInputs(root, { assets: [], environment: { file: '.env.development', localFile: '.env.development.local' } });

        expect(inputs.declared?.entries.map((entry) => [entry.key, entry.value])).toEqual([['MAX_PLAYERS', '32']]);
    });

    it('lets the local file override a value but never add a key', () => {
        const root = fixture({ ...defaultProjectFiles(), '.env': source, '.env.local': 'MAX_PLAYERS=64\nEXTRA=1\n' });
        const inputs = readProjectInputs(root, { assets: [], environment: DEFAULT_ENVIRONMENT_FILES });

        expect(inputs.declared?.entries.map((entry) => [entry.key, entry.value])).toEqual([['MAX_PLAYERS', '64']]);
    });

    it('keeps a local override out of the deployment template', () => {
        const root = fixture({ ...defaultProjectFiles(), '.env': source, '.env.local': 'MAX_PLAYERS=64\n' });
        const inputs = readProjectInputs(root, { assets: [], environment: DEFAULT_ENVIRONMENT_FILES });

        expect(inputs.deployed?.entries.map((entry) => [entry.key, entry.value])).toEqual([['MAX_PLAYERS', '32']]);
    });

    it('never requires the local file', () => {
        const root = fixture({ ...defaultProjectFiles(), '.env.development': source });
        const inputs = readProjectInputs(root, { assets: [], environment: { file: '.env.development', localFile: '.env.development.local' } });

        expect(inputs.diagnostics).toEqual([]);
    });

    it('reports a configured file that does not exist', () => {
        const root = fixture(defaultProjectFiles());
        const inputs = readProjectInputs(root, { assets: [], environment: { file: '.env.staging', localFile: '.env.staging.local' } });

        expect(codes(inputs.diagnostics)).toEqual(['config-missing-env-file']);
    });

    it('stays quiet when the default file is simply absent', () => {
        const inputs = readProjectInputs(fixture(defaultProjectFiles()), { assets: [], environment: DEFAULT_ENVIRONMENT_FILES });

        expect(inputs.diagnostics).toEqual([]);
        expect(inputs.declared).toBeNull();
    });
});
