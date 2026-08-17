import { describe, expect, it } from 'vitest';

import { analyzeManifest } from '@compiler/manifest/manifest-analysis';
import type { ManifestContext } from '@compiler/manifest/manifest-pass';

const CONTEXT: ManifestContext = { mode: 'production', root: '/project', env: {} };

function analyze(source: string, context: Partial<ManifestContext> = {}) {
    return analyzeManifest(source, { ...CONTEXT, ...context });
}

function codes(source: string, context: Partial<ManifestContext> = {}): string[] {
    return analyze(source, context).diagnostics.map((diagnostic) => diagnostic.code);
}

function messages(source: string, context: Partial<ManifestContext> = {}): string[] {
    return analyze(source, context).diagnostics.map((diagnostic) => diagnostic.message);
}

const NAME = "name = 'luam-demo'\n";

describe('manifest subset', () => {
    it('accepts the two statements the dialect allows', () => {
        const source = ['local password = env.LUAM_PASSWORD', NAME, "description = password or 'A demo'", "outDir = mode == 'production' and 'build' or 'build-dev'"].join('\n');

        expect(codes(source)).toEqual([]);
    });

    it('reports a local that is never read', () => {
        const diagnostic = analyze(`local password = env.LUAM_PASSWORD\n${NAME}`).diagnostics[0];

        expect(diagnostic?.code).toBe('check-unused-local');
        expect(diagnostic?.severity).toBe('warning');
        expect(diagnostic?.message).toBe('"password" is declared but never read. Read it, remove it, or rename it with a leading "_" to keep it on purpose.');
        expect(diagnostic?.position.line).toBe(1);
    });

    it('keeps a local named with a leading underscore', () => {
        expect(codes(`local _password = env.LUAM_PASSWORD\n${NAME}`)).toEqual([]);
    });

    it('rejects a function declaration, a call, an if statement and a return', () => {
        expect(codes(`${NAME}function build() end`)).toEqual(['config-invalid-statement']);
        expect(codes(`${NAME}print('hello')`)).toEqual(['config-invalid-statement']);
        expect(codes(`${NAME}if true then end`)).toEqual(['config-invalid-statement']);
        expect(codes(`${NAME}return 1`)).toEqual(['config-invalid-statement']);
    });

    it('names what a manifest allows when it rejects a statement', () => {
        expect(messages(`${NAME}return 1`)[0]).toBe(
            'A manifest cannot contain a return. A manifest holds only "local" declarations and assignments to configuration fields.',
        );
    });

    it('points at the rejected statement', () => {
        const diagnostic = analyze(`${NAME}for index = 1, 2 do end`).diagnostics[0];

        expect(diagnostic?.position.line).toBe(2);
        expect(diagnostic?.position.column).toBe(1);
    });

    it('rejects a call expression and a function expression inside a value', () => {
        expect(codes(`${NAME}outDir = tostring(1)`)).toEqual(['config-invalid-expression']);
        expect(codes(`${NAME}outDir = function() end`)).toEqual(['config-invalid-expression']);
    });

    it('rejects a build directive', () => {
        expect(codes(`#!server\n${NAME}`)).toEqual(['config-invalid-statement']);
    });

    it('rejects an assignment to a member', () => {
        expect(codes(`${NAME}transport.kind = 'none'`)).toEqual(['config-invalid-statement']);
    });
});

describe('manifest checking', () => {
    it('reports an unknown field with a caret under the field name', () => {
        const diagnostic = analyze(`${NAME}outdir = 'build'`).diagnostics[0];

        expect(diagnostic?.code).toBe('config-unknown-field');
        expect(diagnostic?.position.line).toBe(2);
        expect(diagnostic?.position.column).toBe(1);
    });

    it('reports a wrong type with a caret under the value', () => {
        const diagnostic = analyze(`${NAME}outDir = 5`).diagnostics[0];

        expect(diagnostic?.code).toBe('config-invalid-type');
        expect(diagnostic?.message).toBe('"outDir" must be a string but received a number.');
        expect(diagnostic?.position.column).toBe(10);
    });

    it('reports a missing required field once at the top of the file', () => {
        const diagnostics = analyze("outDir = 'build'\n").diagnostics;

        expect(diagnostics.map((diagnostic) => diagnostic.code)).toEqual(['config-missing-field']);
        expect(diagnostics[0]?.position.line).toBe(1);
    });

    it('checks nested output, transport and development tables', () => {
        expect(codes(`${NAME}output = { bundle = 'yes' }`)).toEqual(['config-invalid-type']);
        expect(messages(`${NAME}output = { bundle = 'yes' }`)[0]).toBe('"output.bundle" must be a boolean but received a string.');
        expect(codes(`${NAME}development = { logs = { enabled = 1 } }`)).toEqual(['config-invalid-type']);
        expect(codes(`${NAME}transport = { kind = 'none', retries = 3 }`)).toEqual(['config-unknown-field']);
    });

    it('requires a kind once a transport table exists', () => {
        expect(codes(`${NAME}transport = { }`)).toEqual(['config-missing-field']);
        expect(codes(`${NAME}transport = { kind = 'none' }`)).toEqual([]);
    });

    it('rejects a transport kind outside the closed set', () => {
        expect(codes(`${NAME}transport = { kind = 'rcon' }`)).toEqual(['config-invalid-transport']);
        expect(messages(`${NAME}transport = { kind = 'rcon' }`)[0]).toBe('"transport.kind" must be "none" or "http" but received "rcon".');
    });

    it('rejects a helper the runtime does not ship', () => {
        expect(codes(`${NAME}helpers = { 'promise' }`)).toEqual(['config-unknown-helper']);
        expect(messages(`${NAME}helpers = { 'promise' }`)[0]).toContain('Known helpers: "async", "class", "env"');
    });

    it('types env members as optional strings', () => {
        expect(codes(`${NAME}outDir = env.OUT_DIR`)).toEqual(['config-invalid-type']);
        expect(messages(`${NAME}outDir = env.OUT_DIR`)[0]).toBe('"outDir" must be a string but received a string that may be nil.');
        expect(codes(`${NAME}outDir = env.OUT_DIR or 'build'`)).toEqual([]);
    });

    it('rejects arithmetic on an environment value', () => {
        expect(codes(`${NAME}transport = { kind = 'none' }\nversion = env.PORT + 1`)).toEqual(['config-invalid-type']);
    });

    it('closes the global scope', () => {
        expect(codes(`${NAME}outDir = somewhere`)).toEqual(['config-unknown-field']);
        expect(messages(`${NAME}outDir = somewhere`)[0]).toBe('"somewhere" is not defined in this manifest. Declare it with "local", or read "mode", "env", or "root".');
    });
});

describe('manifest evaluation', () => {
    it('resolves the conditional idiom for each mode', () => {
        const source = `${NAME}outDir = mode == 'production' and 'build' or 'build-dev'`;

        expect(analyze(source, { mode: 'production' }).value.outDir).toBe('build');
        expect(analyze(source, { mode: 'development' }).value.outDir).toBe('build-dev');
    });

    it('follows lua truthiness', () => {
        const source = `${NAME}transport = { kind = password and 'http' or 'none' }`;
        const withLocal = `local password = env.LUAM_PASSWORD\n${source}`;

        expect(analyze(withLocal, { env: {} }).raw.transport).toEqual({ kind: 'none' });
        expect(analyze(withLocal, { env: { LUAM_PASSWORD: 'secret' } }).raw.transport).toEqual({ kind: 'http' });
    });

    it('evaluates arithmetic, concatenation and comparison', () => {
        const source = [NAME, "version = '1.' .. 2 .. '.' .. 3", 'compilerOptions = { oop = 2 > 1 }', 'development = { logs = { rateLimit = 10 * 3 } }'].join('\n');
        const analysis = analyze(source);

        expect(analysis.diagnostics).toEqual([]);
        expect(analysis.value.version).toBe('1.2.3');
        expect(analysis.value.compilerOptions).toEqual({ strict: true, oop: true, noUnusedLocals: false, noUnusedParameters: false, warningsAsErrors: false });
        expect(analysis.value.development).toEqual({ logs: { enabled: false, maxMessageLength: 4096, rateLimit: 30, rateWindowMs: 1000 }, server: {} });
    });

    it('reads root and a local table member', () => {
        const source = ['local paths = { out = "dist" }', NAME, 'outDir = paths.out', 'serverPath = root'].join('\n');
        const analysis = analyze(source, { root: '/srv/mta' });

        expect(analysis.diagnostics).toEqual([]);
        expect(analysis.value.outDir).toBe('dist');
        expect(analysis.value.serverPath).toBe('/srv/mta');
    });

    it('keeps every accepted manifest free of environment values in its diagnostics', () => {
        const source = `${NAME}outDir = 5`;

        expect(messages(source, { env: { LUAM_PASSWORD: 'super-secret' } }).join('\n')).not.toContain('super-secret');
    });

    it('records a position for every assigned field', () => {
        const analysis = analyze(`${NAME}dependencies = { 'scoreboard', 'admin' }`);

        expect(analysis.positions.get('name')?.line).toBe(1);
        expect(analysis.positions.get('dependencies.1')?.column).toBe(32);
    });
});
