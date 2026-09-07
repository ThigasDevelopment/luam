import { afterEach, describe, expect, it } from 'vitest';

import { loadManifest } from '@cli/config/manifest-loader';

import { createProjectFixture, MANIFEST_FILE, manifestConfig, manifestSource, RESOURCE_NAME, type ProjectFixture } from './support/project-fixture';

const fixtures: ProjectFixture[] = [];

function project(files: Readonly<Record<string, string>>): ProjectFixture {
    const fixture = createProjectFixture(files);

    fixtures.push(fixture);

    return fixture;
}

function load(source: string, env: Readonly<Record<string, string>> = {}, options: Readonly<Record<string, unknown>> = {}) {
    return loadManifest(project({ [MANIFEST_FILE]: source }).root, { env, ...options });
}

function table(...lines: readonly string[]): string {
    return ['{', ...lines.map((line) => `    ${line}`), '}', ''].join('\n');
}

function codes(diagnostics: readonly { code: string }[]): string[] {
    return diagnostics.map((diagnostic) => diagnostic.code);
}

afterEach(() => {
    for (const fixture of fixtures.splice(0)) {
        fixture.dispose();
    }
});

describe('configuration validation', () => {
    it('applies defaults to a manifest that is an empty table', () => {
        expect(manifestConfig({})).toEqual({
            name: RESOURCE_NAME,
            author: null,
            version: null,
            description: null,
            dependencies: [],
            secret: '.env',
            compilerOptions: { strict: true, oop: false, noUnusedLocals: false, noUnusedParameters: false, noImplicitGlobals: false, warningsAsErrors: false },
            oopDeclared: false,
            engine: { server: 'latest', client: 'latest' },
            libraries: [],
            scripts: [],
            files: [],
            contracts: '.luam/contracts',
            outDir: 'build',
            output: { bundle: true, map: true, minify: true, obfuscate: false },
        });
    });

    it('names the resource after the folder that holds the manifest', () => {
        expect(load(table("info = { version = '1.0.0' },")).config?.name).toBe(RESOURCE_NAME);
    });

    it('rejects fields with the wrong type', () => {
        expect(codes(load(table("scripts = { { path = 5, type = 'server' } },")).diagnostics)).toEqual(['config-invalid-type']);
        expect(codes(load(table('build = { output = 5 },')).diagnostics)).toEqual(['config-invalid-type']);
        expect(codes(load(table("build = { details = 'bundle' },")).diagnostics)).toEqual(['config-invalid-type']);
    });

    it('rejects an unknown field', () => {
        expect(codes(load(table("target = 'lua54',")).diagnostics)).toEqual(['config-unknown-field']);
    });

    it('rejects a source pattern that escapes the project directory', () => {
        expect(codes(load(table("scripts = { { path = '/etc/**/*.luam', type = 'server' } },")).diagnostics)).toEqual(['config-escaping-path']);
    });

    it('lets the output directory leave the project', () => {
        expect(codes(load(table("build = { output = '../elsewhere' },")).diagnostics)).toEqual([]);
        expect(codes(load(table("build = { output = '/media/storage/resources' },")).diagnostics)).toEqual([]);
    });

    it('reads the oop flag and records that the manifest wrote it', () => {
        expect(manifestConfig({ environment: { oop: true } }).compilerOptions.oop).toBe(true);
        expect(manifestConfig({ environment: { oop: true } }).oopDeclared).toBe(true);
        expect(manifestConfig({ environment: { oop: false } }).oopDeclared).toBe(true);
        expect(manifestConfig({}).oopDeclared).toBe(false);
    });

    it('reads the build switches and rejects an unknown one', () => {
        expect(manifestConfig({ build: { details: { bundle: false, map: false } } }).output).toEqual({ bundle: false, map: false, minify: true, obfuscate: false });
        expect(codes(load(table("build = { details = { bundle = 'yes', extra = true } },")).diagnostics).sort()).toEqual([
            'config-invalid-type',
            'config-unknown-field',
        ]);
    });

    it('rejects an oop flag that is not a boolean', () => {
        const loaded = load(table("environment = { oop = 'true' },"));

        expect(loaded.config).toBeNull();
        expect(codes(loaded.diagnostics)).toEqual(['config-invalid-type']);
        expect(loaded.diagnostics[0]?.message).toBe('"environment.oop" must be a boolean but received a string.');
    });

    it('rejects a removed field and names its replacement', () => {
        const loaded = load(table("sourceDirs = { 'src' },"));

        expect(codes(loaded.diagnostics)).toEqual(['config-removed-field']);
        expect(loaded.diagnostics[0]?.message).toContain('scripts');
    });

    it('qualifies a nested field with its section when the type is wrong', () => {
        const build = load(table("build = { details = { bundle = 'yes' } },")).diagnostics;
        const version = load(table('environment = { version = { server = 5 } },')).diagnostics;

        expect(build[0]?.message).toBe('"build.details.bundle" must be a boolean but received a string.');
        expect(version[0]?.message).toBe('"environment.version.server" must be a string but received a number.');
    });

    it('rejects a dependency that names this resource', () => {
        const loaded = load(table(`info = { dependencies = { '${RESOURCE_NAME}' } },`));

        expect(codes(loaded.diagnostics)).toEqual(['config-invalid-dependency']);
    });

    it('reports a dependency written twice rather than collapsing it', () => {
        const loaded = load(table("info = { dependencies = { 'admin', 'admin' } },"));

        expect(codes(loaded.diagnostics)).toEqual(['config-duplicate-dependency']);
    });

    it('reports every problem in one pass', () => {
        const loaded = load(table('build = { output = 3 },', "target = 'lua54',"));

        expect(loaded.config).toBeNull();
        expect(codes(loaded.diagnostics).sort()).toEqual(['config-invalid-type', 'config-unknown-field']);
    });

    it('gives every configuration diagnostic a position inside the manifest', () => {
        const loaded = load(['{', '', '    build = { output = 5 },', '}', ''].join('\n'));

        expect(loaded.diagnostics[0]?.position.line).toBe(3);
    });
});

describe('manifest loading', () => {
    it('reports a missing manifest and names the file to create', () => {
        const loaded = loadManifest(project({}).root);

        expect(codes(loaded.diagnostics)).toEqual(['config-not-found']);
        expect(loaded.diagnostics[0]?.message).toContain(MANIFEST_FILE);
        expect(loaded.config).toBeNull();
    });

    it('loads a manifest written in the dialect', () => {
        const loaded = load(table("build = { output = 'out' },"));

        expect(loaded.diagnostics).toEqual([]);
        expect(loaded.config?.name).toBe(RESOURCE_NAME);
        expect(loaded.config?.outDir).toBe('out');
    });

    it('gives the manifest the mode, the root and the environment', () => {
        const source = table(
            "info = { description = env.LUAM_NAME or 'fallback' },",
            "build = { output = mode == 'production' and 'build' or 'build-dev' },",
        );
        const loaded = load(source, { LUAM_NAME: 'from-env' }, { mode: 'development' });

        expect(loaded.diagnostics).toEqual([]);
        expect(loaded.config).toMatchObject({ description: 'from-env', outDir: 'build-dev' });
    });

    it('reads the mode a production build passes', () => {
        expect(load(table('build = { output = mode },'), {}, { mode: 'production' }).config?.outDir).toBe('production');
    });

    it('loads a manifest from an explicit path', () => {
        const fixture = project({ [`profiles/deploy${MANIFEST_FILE}`]: manifestSource({}) });
        const loaded = loadManifest(fixture.root, { path: `profiles/deploy${MANIFEST_FILE}` });

        expect(loaded.diagnostics).toEqual([]);
        expect(loaded.config?.name).toBe('profiles');
    });

    it('rejects a file that is not a manifest', () => {
        const fixture = project({ 'luam.config.lua': '{ }\n' });
        const loaded = loadManifest(fixture.root, { path: 'luam.config.lua' });

        expect(codes(loaded.diagnostics)).toEqual(['config-unsupported-manifest']);
        expect(loaded.config).toBeNull();
    });

    it('ignores a legacy luam.json beside the manifest', () => {
        const fixture = project({ 'luam.json': '{ "name": "from-json" }' });

        expect(codes(loadManifest(fixture.root).diagnostics)).toEqual(['config-not-found']);

        fixture.write(MANIFEST_FILE, manifestSource({}));

        expect(loadManifest(fixture.root).config?.name).toBe(RESOURCE_NAME);
    });

    it('keeps the environment out of the diagnostics it reports', () => {
        const loaded = load(table('build = { output = 5 },'), { LUAM_PASSWORD: 'super-secret' });

        expect(loaded.diagnostics.map((diagnostic) => diagnostic.message).join('\n')).not.toContain('super-secret');
    });

    it('resolves a field through the environment it was given', () => {
        const source = table("build = { output = env.LUAM_OUT or 'build' },");

        expect(load(source, {}).config?.outDir).toBe('build');
        expect(load(source, { LUAM_OUT: 'dist' }).config?.outDir).toBe('dist');
    });
});
