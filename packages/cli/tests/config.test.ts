import { afterEach, describe, expect, it } from 'vitest';

import { loadManifest } from '@cli/config/manifest-loader';

import { createProjectFixture, MANIFEST_FILE, manifestConfig, manifestSource, type ProjectFixture } from './support/project-fixture';

const fixtures: ProjectFixture[] = [];

function project(files: Readonly<Record<string, string>>): ProjectFixture {
    const fixture = createProjectFixture(files);

    fixtures.push(fixture);

    return fixture;
}

function load(source: string, env: Readonly<Record<string, string>> = {}, options: Readonly<Record<string, unknown>> = {}) {
    return loadManifest(project({ [MANIFEST_FILE]: source }).root, { env, ...options });
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
    it('applies defaults to a minimal manifest', () => {
        expect(manifestConfig({ name: 'luam-demo' })).toEqual({
            name: 'luam-demo',
            author: null,
            version: null,
            description: null,
            compilerOptions: { strict: true, oop: false, noUnusedLocals: false, noUnusedParameters: false, noImplicitGlobals: false, warningsAsErrors: false },
            sources: { server: ['src/server/**/*.luam'], client: ['src/client/**/*.luam'], shared: ['src/shared/**/*.luam'] },
            assets: [],
            dependencies: [],
            libraries: [],
            contracts: '.luam/contracts',
            engine: { minVersion: 'latest' },
            environment: { file: '.env', localFile: '.env.local' },
            outDir: 'build',
            loadOrder: [],
            helpers: [],
            serverPath: null,
            resourcesDir: 'mods/deathmatch/resources',
            output: { bundle: true, map: true, minify: true },
            development: {
                logs: { enabled: false, maxMessageLength: 4096, rateLimit: 30, rateWindowMs: 1000 },
                server: { executable: null },
            },
        });
    });

    it('requires a resource name', () => {
        expect(codes(load("outDir = 'build'\n").diagnostics)).toEqual(['config-missing-field']);
    });

    it('rejects an invalid resource name', () => {
        expect(codes(load("name = 'my resource'\n").diagnostics)).toEqual(['config-invalid-name']);
    });

    it('rejects fields with the wrong type', () => {
        expect(codes(load("name = 'demo'\nsources = { server = 'src' }\n").diagnostics)).toEqual(['config-invalid-type']);
        expect(codes(load("name = 'demo'\noutDir = 5\n").diagnostics)).toEqual(['config-invalid-type']);
        expect(codes(load("name = 'demo'\noutput = 'bundle'\n").diagnostics)).toEqual(['config-invalid-type']);
    });

    it('rejects an unknown field', () => {
        expect(codes(load("name = 'demo'\ntarget = 'lua54'\n").diagnostics)).toEqual(['config-unknown-field']);
    });

    it('rejects a path that escapes the project directory', () => {
        expect(codes(load("name = 'demo'\noutDir = '../elsewhere'\n").diagnostics)).toEqual(['config-escaping-path']);
        expect(codes(load("name = 'demo'\nsources = { server = { '/etc/**/*.luam' } }\n").diagnostics)).toEqual(['config-escaping-path']);
    });

    it('reads the opt-in runtime helpers', () => {
        expect(manifestConfig({ name: 'demo', helpers: ['threads', 'threads'] }).helpers).toEqual(['threads']);
    });

    it('reads the oop flag', () => {
        expect(manifestConfig({ name: 'demo', compiler: { oop: true } }).compilerOptions.oop).toBe(true);
        expect(manifestConfig({ name: 'demo', compiler: { oop: false } }).compilerOptions.oop).toBe(false);
    });

    it('reads output switches and rejects invalid output fields', () => {
        expect(manifestConfig({ name: 'demo', output: { bundle: false, map: false } }).output).toEqual({ bundle: false, map: false, minify: true });
        expect(codes(load("name = 'demo'\noutput = { bundle = 'yes', extra = true }\n").diagnostics).sort()).toEqual([
            'config-invalid-type',
            'config-unknown-field',
        ]);
    });

    it('rejects an oop flag that is not a boolean', () => {
        const loaded = load("name = 'demo'\ncompiler = { oop = 'true' }\n");

        expect(loaded.config).toBeNull();
        expect(codes(loaded.diagnostics)).toEqual(['config-invalid-type']);
        expect(loaded.diagnostics[0]?.message).toBe('"compiler.oop" must be a boolean but received a string.');
    });

    it('rejects a removed field and names its replacement', () => {
        const loaded = load("name = 'demo'\nsourceDirs = { 'src' }\n");

        expect(codes(loaded.diagnostics)).toEqual(['config-removed-field']);
        expect(loaded.diagnostics[0]?.message).toContain('sources');
    });

    it('qualifies a nested field with its scope when the type is wrong', () => {
        const output = load("name = 'demo'\noutput = { bundle = 'yes' }\n").diagnostics;
        const logs = load("name = 'demo'\ndevelopment = { logs = { enabled = 'yes' } }\n").diagnostics;
        const engine = load("name = 'demo'\nengine = { minVersion = 5 }\n").diagnostics;

        expect(output[0]?.message).toBe('"output.bundle" must be a boolean but received a string.');
        expect(logs[0]?.message).toBe('"development.logs.enabled" must be a boolean but received a string.');
        expect(engine[0]?.message).toBe('"engine.minVersion" must be a string but received a number.');
    });

    it('rejects a helper the runtime does not ship', () => {
        const loaded = load("name = 'demo'\nhelpers = { 'coroutine' }\n");

        expect(loaded.config).toBeNull();
        expect(codes(loaded.diagnostics)).toEqual(['config-unknown-helper']);
        expect(loaded.diagnostics[0]?.message).toContain('Known helpers: "async", "class", "env", "math", "promise", "string", "table", "threads"');
    });

    it('reads development log capture limits', () => {
        const development = { logs: { enabled: true, maxMessageLength: 512, rateLimit: 10, rateWindowMs: 2000 } };

        expect(manifestConfig({ name: 'demo', development }).development).toEqual({ ...development, server: { executable: null } });
    });

    it('rejects invalid and unknown development log fields', () => {
        const source = "name = 'demo'\ndevelopment = { logs = { maxMessageLength = 0, extra = true } }\n";

        expect(codes(load(source).diagnostics).sort()).toEqual(['config-invalid-type', 'config-unknown-field']);
    });

    it('reads and contains the development server executable', () => {
        expect(manifestConfig({ name: 'demo', development: { server: { executable: 'bin/mta-server' } } }).development.server.executable).toBe('bin/mta-server');
        expect(codes(load("name = 'demo'\ndevelopment = { server = { executable = '../mta-server' } }\n").diagnostics)).toEqual(['config-escaping-path']);
        expect(codes(load("name = 'demo'\ndevelopment = { server = { extra = true } }\n").diagnostics)).toEqual(['config-unknown-field']);
    });

    it('reports every problem in one pass', () => {
        const loaded = load("outDir = 3\ntarget = 'lua54'\n");

        expect(loaded.config).toBeNull();
        expect(codes(loaded.diagnostics).sort()).toEqual(['config-invalid-type', 'config-missing-field', 'config-unknown-field']);
    });

    it('gives every configuration diagnostic a position inside the manifest', () => {
        const loaded = load("name = 'demo'\n\noutDir = 5\n");

        expect(loaded.diagnostics[0]?.position.line).toBe(3);
        expect(loaded.diagnostics[0]?.position.column).toBe(10);
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
        const loaded = load("name = 'luam-demo'\noutDir = 'out'\n");

        expect(loaded.diagnostics).toEqual([]);
        expect(loaded.config?.name).toBe('luam-demo');
        expect(loaded.config?.outDir).toBe('out');
    });

    it('gives the manifest the mode, the root and the environment', () => {
        const source = ["name = env.LUAM_NAME or 'fallback'", "outDir = mode == 'production' and 'build' or 'build-dev'", "description = root ~= '' and 'rooted' or 'unrooted'"].join('\n');
        const loaded = load(`${source}\n`, { LUAM_NAME: 'from-env' }, { mode: 'development' });

        expect(loaded.diagnostics).toEqual([]);
        expect(loaded.config).toMatchObject({ name: 'from-env', outDir: 'build-dev', description: 'rooted' });
    });

    it('reads the mode a production build passes', () => {
        expect(load("name = 'luam-demo'\noutDir = mode\n", {}, { mode: 'production' }).config?.outDir).toBe('production');
    });

    it('loads a manifest from an explicit path', () => {
        const fixture = project({ [`profiles/deploy${MANIFEST_FILE}`]: manifestSource({ name: 'luam-deploy' }) });
        const loaded = loadManifest(fixture.root, { path: `profiles/deploy${MANIFEST_FILE}` });

        expect(loaded.diagnostics).toEqual([]);
        expect(loaded.config?.name).toBe('luam-deploy');
    });

    it('rejects a file that is not a manifest', () => {
        const fixture = project({ 'luam.config.lua': "name = 'luam-demo'\n" });
        const loaded = loadManifest(fixture.root, { path: 'luam.config.lua' });

        expect(codes(loaded.diagnostics)).toEqual(['config-unsupported-manifest']);
        expect(loaded.config).toBeNull();
    });

    it('ignores a legacy luam.json beside the manifest', () => {
        const fixture = project({ 'luam.json': '{ "name": "from-json" }' });

        expect(codes(loadManifest(fixture.root).diagnostics)).toEqual(['config-not-found']);

        fixture.write(MANIFEST_FILE, manifestSource({ name: 'from-manifest' }));

        expect(loadManifest(fixture.root).config?.name).toBe('from-manifest');
    });

    it('keeps the environment out of the diagnostics it reports', () => {
        const loaded = load("name = 'demo'\noutDir = 5\n", { LUAM_PASSWORD: 'super-secret' });

        expect(loaded.diagnostics.map((diagnostic) => diagnostic.message).join('\n')).not.toContain('super-secret');
    });

    it('resolves a field through the environment it was given', () => {
        const source = ['local root = env.LUAM_SERVER', "name = 'luam-demo'", "serverPath = root or 'mta-server'", ''].join('\n');

        expect(load(source, {}).config?.serverPath).toBe('mta-server');
        expect(load(source, { LUAM_SERVER: 'C:/mta' }).config?.serverPath).toBe('C:/mta');
    });
});
