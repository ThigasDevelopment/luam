import { afterEach, describe, expect, it } from 'vitest';

import { resolveAssets } from '@cli/build/asset-resolution';
import { resolveEngineVersion } from '@cli/build/mta-release';
import { readProjectInputs } from '@cli/build/project-inputs';
import { discoverSources } from '@cli/build/source-discovery';
import { DEFAULT_ENVIRONMENT_FILES, type SourceMapping } from '@compiler/manifest/manifest-defaults';

import { createProjectFixture, defaultProjectFiles, type ProjectFixture } from './support/project-fixture';

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
