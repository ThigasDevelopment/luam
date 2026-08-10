import { afterEach, describe, expect, it } from 'vitest';

import { loadConfig } from '@cli/config/config-loader';
import { validateConfig } from '@cli/config/config-validation';

import { createProjectFixture, type ProjectFixture } from './support/project-fixture';

const fixtures: ProjectFixture[] = [];

function project(files: Readonly<Record<string, string>>): ProjectFixture {
    const fixture = createProjectFixture(files);

    fixtures.push(fixture);

    return fixture;
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
    it('applies defaults to a minimal configuration', () => {
        const { config, diagnostics } = validateConfig({ name: 'luam-demo' }, {});

        expect(diagnostics).toEqual([]);
        expect(config).toEqual({
            name: 'luam-demo',
            author: null,
            version: null,
            description: null,
            sourceDirs: ['src'],
            assetDirs: ['assets'],
            outDir: 'build',
            loadOrder: [],
            oop: false,
            helpers: [],
            serverPath: null,
            resourcesDir: 'mods/deathmatch/resources',
            transport: { kind: 'none' },
            development: {
                logs: { enabled: false, maxMessageLength: 4096, rateLimit: 30, rateWindowMs: 1000 },
            },
        });
    });

    it('rejects a configuration that is not an object', () => {
        expect(codes(validateConfig(['luam-demo'], {}).diagnostics)).toEqual(['config-invalid-root']);
        expect(validateConfig(42, {}).diagnostics[0]?.message).toBe('The configuration must be a JSON object but received a number.');
    });

    it('requires a resource name', () => {
        expect(codes(validateConfig({}, {}).diagnostics)).toEqual(['config-missing-field']);
    });

    it('rejects an invalid resource name', () => {
        expect(codes(validateConfig({ name: 'my resource' }, {}).diagnostics)).toEqual(['config-invalid-name']);
    });

    it('rejects fields with the wrong type', () => {
        expect(codes(validateConfig({ name: 'demo', sourceDirs: [] }, {}).diagnostics)).toEqual(['config-invalid-type']);
        expect(codes(validateConfig({ name: 'demo', outDir: 5 }, {}).diagnostics)).toEqual(['config-invalid-type']);
        expect(codes(validateConfig({ name: 'demo', transport: 'http' }, {}).diagnostics)).toEqual(['config-invalid-type']);
    });

    it('rejects an unknown field', () => {
        expect(codes(validateConfig({ name: 'demo', target: 'lua54' }, {}).diagnostics)).toEqual(['config-unknown-field']);
    });

    it('rejects a path that escapes the project directory', () => {
        expect(codes(validateConfig({ name: 'demo', outDir: '../elsewhere' }, {}).diagnostics)).toEqual(['config-escaping-path']);
        expect(codes(validateConfig({ name: 'demo', sourceDirs: ['/etc'] }, {}).diagnostics)).toEqual(['config-escaping-path']);
    });

    it('reads the opt-in runtime helpers', () => {
        const { config, diagnostics } = validateConfig({ name: 'demo', helpers: ['threads', 'threads'] }, {});

        expect(diagnostics).toEqual([]);
        expect(config?.helpers).toEqual(['threads']);
    });

    it('reads the oop flag', () => {
        expect(validateConfig({ name: 'demo', oop: true }, {}).config?.oop).toBe(true);
        expect(validateConfig({ name: 'demo', oop: false }, {}).config?.oop).toBe(false);
    });

    it('rejects an oop flag that is not a boolean', () => {
        const { config, diagnostics } = validateConfig({ name: 'demo', oop: 'true' }, {});

        expect(config).toBeNull();
        expect(codes(diagnostics)).toEqual(['config-invalid-type']);
        expect(diagnostics[0]?.message).toBe('"oop" must be a boolean but received a string.');
    });

    it('rejects a helper the runtime does not ship', () => {
        const { config, diagnostics } = validateConfig({ name: 'demo', helpers: ['promise'] }, {});

        expect(config).toBeNull();
        expect(codes(diagnostics)).toEqual(['config-unknown-helper']);
        expect(diagnostics[0]?.message).toContain('Known helpers: "async", "class", "dotenv", "env", "math", "string", "table", "threads"');
    });

    it('reads development log capture limits', () => {
        const development = { logs: { enabled: true, maxMessageLength: 512, rateLimit: 10, rateWindowMs: 2000 } };
        const { config, diagnostics } = validateConfig({ name: 'demo', development }, {});

        expect(diagnostics).toEqual([]);
        expect(config?.development).toEqual(development);
    });

    it('rejects invalid and unknown development log fields', () => {
        const development = { logs: { maxMessageLength: 0, extra: true } };

        expect(codes(validateConfig({ name: 'demo', development }, {}).diagnostics).sort()).toEqual(['config-invalid-type', 'config-unknown-field']);
    });

    it('reports every problem in one pass', () => {
        const { config, diagnostics } = validateConfig({ outDir: 3, target: 'lua54' }, {});

        expect(config).toBeNull();
        expect(codes(diagnostics).sort()).toEqual(['config-invalid-type', 'config-missing-field', 'config-unknown-field']);
    });
});

describe('transport configuration', () => {
    it('reads an http transport with defaults', () => {
        const raw = { name: 'demo', transport: { kind: 'http', resource: 'luam-sync', username: 'admin', passwordEnv: 'LUAM_PASSWORD' } };
        const { config, diagnostics } = validateConfig(raw, { LUAM_PASSWORD: 'secret' });

        expect(diagnostics).toEqual([]);
        expect(config?.transport).toEqual({
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
        const raw = { name: 'demo', transport: { kind: 'http', resource: 'luam-sync', username: 'admin', passwordEnv: 'LUAM_PASSWORD' } };

        expect(codes(validateConfig(raw, {}).diagnostics)).toEqual(['config-missing-secret']);
    });

    it('warns when a password is stored in plain text', () => {
        const raw = { name: 'demo', transport: { kind: 'http', resource: 'luam-sync', username: 'admin', password: 'secret' } };
        const { config, diagnostics } = validateConfig(raw, {});

        expect(codes(diagnostics)).toEqual(['config-plaintext-password']);
        expect(diagnostics[0]?.severity).toBe('warning');
        expect(config?.transport).toMatchObject({ kind: 'http', password: 'secret' });
    });

    it('requires the http credentials', () => {
        const raw = { name: 'demo', transport: { kind: 'http' } };

        expect(codes(validateConfig(raw, {}).diagnostics)).toEqual(['config-missing-field', 'config-missing-field', 'config-missing-field']);
    });

    it('rejects an unknown transport kind', () => {
        expect(codes(validateConfig({ name: 'demo', transport: { kind: 'rcon' } }, {}).diagnostics)).toEqual(['config-invalid-transport']);
    });

    it('rejects an unknown transport field', () => {
        expect(codes(validateConfig({ name: 'demo', transport: { kind: 'none', retries: 3 } }, {}).diagnostics)).toEqual(['config-unknown-field']);
    });

    it('rejects a transport field that would change the request path', () => {
        const base = { kind: 'http', username: 'admin', passwordEnv: 'LUAM_PASSWORD' };
        const env = { LUAM_PASSWORD: 'secret' };

        expect(codes(validateConfig({ name: 'demo', transport: { ...base, resource: '../admin' } }, env).diagnostics)).toEqual(['config-invalid-url-segment']);
        expect(codes(validateConfig({ name: 'demo', transport: { ...base, resource: 'sync', restartFunction: 'a/b' } }, env).diagnostics)).toEqual([
            'config-invalid-url-segment',
        ]);
        expect(codes(validateConfig({ name: 'demo', transport: { ...base, resource: 'sync', host: 'host/../x' } }, env).diagnostics)).toEqual([
            'config-invalid-url-segment',
        ]);
    });

    it('produces no configuration when a url segment is rejected', () => {
        const raw = { name: 'demo', transport: { kind: 'http', resource: 'a?b', username: 'admin', passwordEnv: 'LUAM_PASSWORD' } };

        expect(validateConfig(raw, { LUAM_PASSWORD: 'secret' }).config).toBeNull();
    });

    it('warns when the password would cross the network without tls', () => {
        const raw = { name: 'demo', transport: { kind: 'http', host: 'mta.example.com', resource: 'sync', username: 'admin', passwordEnv: 'PW' } };
        const { config, diagnostics } = validateConfig(raw, { PW: 'secret' });

        expect(codes(diagnostics)).toEqual(['config-remote-plaintext-transport']);
        expect(diagnostics[0]?.severity).toBe('warning');
        expect(config?.transport).toMatchObject({ kind: 'http', host: 'mta.example.com' });
    });

    it('stays quiet for a loopback host', () => {
        const raw = { name: 'demo', transport: { kind: 'http', host: 'localhost', resource: 'sync', username: 'admin', passwordEnv: 'PW' } };

        expect(codes(validateConfig(raw, { PW: 'secret' }).diagnostics)).toEqual([]);
    });
});

describe('configuration loading', () => {
    it('reports a missing configuration file', () => {
        const fixture = project({});
        const loaded = loadConfig(fixture.root, null, {});

        expect(codes(loaded.diagnostics)).toEqual(['config-not-found']);
        expect(loaded.config).toBeNull();
    });

    it('reports invalid JSON', () => {
        const fixture = project({ 'luam.json': '{ "name": }' });

        expect(codes(loadConfig(fixture.root, null, {}).diagnostics)).toEqual(['config-invalid-json']);
    });

    it('loads a configuration file from an explicit path', () => {
        const fixture = project({ 'config/luam.dev.json': '{ "name": "luam-demo" }' });
        const loaded = loadConfig(fixture.root, 'config/luam.dev.json', {});

        expect(loaded.diagnostics).toEqual([]);
        expect(loaded.config?.name).toBe('luam-demo');
    });
});
