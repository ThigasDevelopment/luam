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
            compilerOptions: { strict: true, oop: false, noUnusedLocals: false, noUnusedParameters: false, warningsAsErrors: false },
            sources: { server: ['src/server/**/*.luam'], client: ['src/client/**/*.luam'], shared: ['src/shared/**/*.luam'] },
            assets: [],
            dependencies: [],
            engine: { minVersion: 'latest' },
            environment: { file: '.env', localFile: '.env.local' },
            outDir: 'build',
            loadOrder: [],
            helpers: [],
            serverPath: null,
            resourcesDir: 'mods/deathmatch/resources',
            output: { bundle: true, map: true, minify: true },
            transport: { kind: 'none' },
            development: {
                logs: { enabled: false, maxMessageLength: 4096, rateLimit: 30, rateWindowMs: 1000 },
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
        expect(codes(load("name = 'demo'\ntransport = 'http'\n").diagnostics)).toEqual(['config-invalid-type']);
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
        expect(manifestConfig({ name: 'demo', compilerOptions: { oop: true } }).compilerOptions.oop).toBe(true);
        expect(manifestConfig({ name: 'demo', compilerOptions: { oop: false } }).compilerOptions.oop).toBe(false);
    });

    it('reads output switches and rejects invalid output fields', () => {
        expect(manifestConfig({ name: 'demo', output: { bundle: false, map: false } }).output).toEqual({ bundle: false, map: false, minify: true });
        expect(codes(load("name = 'demo'\noutput = { bundle = 'yes', extra = true }\n").diagnostics).sort()).toEqual([
            'config-invalid-type',
            'config-unknown-field',
        ]);
    });

    it('rejects an oop flag that is not a boolean', () => {
        const loaded = load("name = 'demo'\ncompilerOptions = { oop = 'true' }\n");

        expect(loaded.config).toBeNull();
        expect(codes(loaded.diagnostics)).toEqual(['config-invalid-type']);
        expect(loaded.diagnostics[0]?.message).toBe('"compilerOptions.oop" must be a boolean but received a string.');
    });

    it('rejects a removed field and names its replacement', () => {
        const loaded = load("name = 'demo'\nsourceDirs = { 'src' }\n");

        expect(codes(loaded.diagnostics)).toEqual(['config-removed-field']);
        expect(loaded.diagnostics[0]?.message).toContain('sources');
    });

    it('qualifies a nested field with its scope when the type is wrong', () => {
        const output = load("name = 'demo'\noutput = { bundle = 'yes' }\n").diagnostics;
        const logs = load("name = 'demo'\ndevelopment = { logs = { enabled = 'yes' } }\n").diagnostics;
        const transport = load("name = 'demo'\ntransport = { kind = 5 }\n").diagnostics;

        expect(output[0]?.message).toBe('"output.bundle" must be a boolean but received a string.');
        expect(logs[0]?.message).toBe('"development.logs.enabled" must be a boolean but received a string.');
        expect(transport[0]?.message).toBe('"transport.kind" must be one of "none", "http" but received a number.');
    });

    it('rejects a helper the runtime does not ship', () => {
        const loaded = load("name = 'demo'\nhelpers = { 'promise' }\n");

        expect(loaded.config).toBeNull();
        expect(codes(loaded.diagnostics)).toEqual(['config-unknown-helper']);
        expect(loaded.diagnostics[0]?.message).toContain('Known helpers: "async", "class", "math", "string", "table", "threads"');
    });

    it('reads development log capture limits', () => {
        const development = { logs: { enabled: true, maxMessageLength: 512, rateLimit: 10, rateWindowMs: 2000 } };

        expect(manifestConfig({ name: 'demo', development }).development).toEqual(development);
    });

    it('rejects invalid and unknown development log fields', () => {
        const source = "name = 'demo'\ndevelopment = { logs = { maxMessageLength = 0, extra = true } }\n";

        expect(codes(load(source).diagnostics).sort()).toEqual(['config-invalid-type', 'config-unknown-field']);
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

describe('transport configuration', () => {
    const HTTP = { kind: 'http', resource: 'luam-sync', username: 'admin', passwordEnv: 'LUAM_PASSWORD' };

    it('reads an http transport with defaults', () => {
        expect(manifestConfig({ name: 'demo', transport: HTTP }, { LUAM_PASSWORD: 'secret' }).transport).toEqual({
            kind: 'http',
            host: '127.0.0.1',
            port: 22005,
            resource: 'luam-sync',
            username: 'admin',
            password: 'secret',
            refreshFunction: 'refreshResources',
            restartFunction: 'restartResource',
        });
    });

    it('requires the environment variable named by passwordEnv', () => {
        expect(codes(load(manifestSource({ name: 'demo', transport: HTTP })).diagnostics)).toEqual(['config-missing-secret']);
    });

    it('warns when a password is stored in plain text', () => {
        const source = manifestSource({ name: 'demo', transport: { kind: 'http', resource: 'luam-sync', username: 'admin', password: 'secret' } });
        const loaded = load(source);

        expect(codes(loaded.diagnostics)).toEqual(['config-plaintext-password']);
        expect(loaded.diagnostics[0]?.severity).toBe('warning');
        expect(loaded.config?.transport).toMatchObject({ kind: 'http', password: 'secret' });
    });

    it('requires the http credentials', () => {
        const loaded = load(manifestSource({ name: 'demo', transport: { kind: 'http' } }));

        expect(codes(loaded.diagnostics)).toEqual(['config-missing-field', 'config-missing-field', 'config-missing-field']);
    });

    it('rejects an unknown transport kind', () => {
        expect(codes(load(manifestSource({ name: 'demo', transport: { kind: 'rcon' } })).diagnostics)).toEqual(['config-invalid-transport']);
    });

    it('rejects an unknown transport field', () => {
        expect(codes(load(manifestSource({ name: 'demo', transport: { kind: 'none', retries: 3 } })).diagnostics)).toEqual(['config-unknown-field']);
    });

    it('rejects a transport field that would change the request path', () => {
        const env = { LUAM_PASSWORD: 'secret' };
        const base = { kind: 'http', username: 'admin', passwordEnv: 'LUAM_PASSWORD' };
        const escaping = manifestSource({ name: 'demo', transport: { ...base, resource: '../admin' } });
        const restart = manifestSource({ name: 'demo', transport: { ...base, resource: 'sync', restartFunction: 'a/b' } });
        const host = manifestSource({ name: 'demo', transport: { ...base, resource: 'sync', host: 'host/../x' } });

        expect(codes(load(escaping, env).diagnostics)).toEqual(['config-invalid-url-segment']);
        expect(codes(load(restart, env).diagnostics)).toEqual(['config-invalid-url-segment']);
        expect(codes(load(host, env).diagnostics)).toEqual(['config-invalid-url-segment']);
    });

    it('produces no configuration when a url segment is rejected', () => {
        const source = manifestSource({ name: 'demo', transport: { ...HTTP, resource: 'a?b' } });

        expect(load(source, { LUAM_PASSWORD: 'secret' }).config).toBeNull();
    });

    it('warns when the password would cross the network without tls', () => {
        const source = manifestSource({ name: 'demo', transport: { ...HTTP, host: 'mta.example.com', passwordEnv: 'PW' } });
        const loaded = load(source, { PW: 'secret' });

        expect(codes(loaded.diagnostics)).toEqual(['config-remote-plaintext-transport']);
        expect(loaded.diagnostics[0]?.severity).toBe('warning');
        expect(loaded.config?.transport).toMatchObject({ kind: 'http', host: 'mta.example.com' });
    });

    it('stays quiet for a loopback host', () => {
        const source = manifestSource({ name: 'demo', transport: { ...HTTP, host: 'localhost', passwordEnv: 'PW' } });

        expect(codes(load(source, { PW: 'secret' }).diagnostics)).toEqual([]);
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

    it('resolves the transport password through the environment it was given', () => {
        const source = [
            'local password = env.LUAM_PASSWORD',
            "name = 'luam-demo'",
            'transport = {',
            "    kind = password and 'http' or 'none',",
            "    resource = 'luam-sync',",
            "    username = 'admin',",
            "    passwordEnv = 'LUAM_PASSWORD',",
            '}',
            '',
        ].join('\n');

        expect(load(source, {}).config?.transport).toEqual({ kind: 'none' });
        expect(load(source, { LUAM_PASSWORD: 'secret' }).config?.transport).toMatchObject({ kind: 'http', password: 'secret' });
    });
});
