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

function table(...lines: readonly string[]): string {
    return ['{', ...lines.map((line) => `    ${line}`), '}', ''].join('\n');
}

describe('manifest shape', () => {
    it('accepts one table constructor and nothing else', () => {
        expect(codes(table("build = { output = mode == 'production' and 'build' or 'build-dev' },"))).toEqual([]);
    });

    it('reads an environment value where it is used, as often as it is used', () => {
        const source = table("info = { description = env.LUAM_DESCRIPTION or 'A demo' },", "environment = { secret = env.LUAM_ENV or '.env' },");

        expect(codes(source)).toEqual([]);
    });

    it('rejects a local and shows the inline form', () => {
        const diagnostic = analyze(`local password = env.LUAM_PASSWORD\n${table("info = { version = '1.0.0' },")}`).diagnostics[0];

        expect(diagnostic?.code).toBe('config-unexpected-statement');
        expect(diagnostic?.message).toContain('A manifest has no statements.');
        expect(diagnostic?.message).toContain('env.SOME_KEY');
        expect(diagnostic?.position.line).toBe(1);
    });

    it('rejects a statement the file starts with and names the shape', () => {
        for (const source of ['function build() end', 'if true then end', 'return 1', 'for index = 1, 2 do end']) {
            expect(codes(source)).toEqual(['config-unexpected-statement']);
            expect(messages(source)[0]).toContain('A manifest is one table constructor and nothing else.');
        }
    });

    it('names every section in the shape it asks for', () => {
        const message = messages('return 1')[0] ?? '';

        for (const section of ['"info"', '"environment"', '"scripts"', '"files"', '"build"']) {
            expect(message).toContain(section);
        }
    });

    it('reports a file that is not a table', () => {
        expect(codes("'a string'\n")).toEqual(['config-manifest-not-a-table']);
        expect(codes('')).toEqual(['config-manifest-not-a-table']);
    });

    it('reports anything written after the table', () => {
        const diagnostic = analyze("{ }\n\nextra = 'value'\n").diagnostics[0];

        expect(diagnostic?.code).toBe('config-trailing-content');
        expect(diagnostic?.message).toContain('A manifest ends with its table.');
        expect(diagnostic?.position.line).toBe(3);
    });

    it('rejects a call expression and a function expression inside a value', () => {
        expect(codes(table('build = { output = tostring(1) },'))).toEqual(['config-invalid-expression']);
        expect(codes(table('build = { output = function() end },'))).toEqual(['config-invalid-expression']);
    });

    it('rejects a build directive', () => {
        expect(codes(`#!server\n${table("info = { version = '1.0.0' },")}`)).toEqual(['config-invalid-statement']);
    });

    it('reports a key written twice rather than letting the last one win', () => {
        const diagnostic = analyze(table("build = { output = 'a' },", "build = { output = 'b' },")).diagnostics[0];

        expect(diagnostic?.code).toBe('config-duplicate-field');
        expect(diagnostic?.message).toBe('"build" is written more than once. Keep one entry.');
        expect(diagnostic?.position.line).toBe(3);
    });
});

describe('manifest checking', () => {
    it('reports an unknown top-level key with a caret under the key', () => {
        const diagnostic = analyze(table("builds = { output = 'build' },")).diagnostics[0];

        expect(diagnostic?.code).toBe('config-unknown-field');
        expect(diagnostic?.position.line).toBe(2);
        expect(diagnostic?.position.column).toBe(5);
    });

    it('reports an unknown key inside a section and names the section', () => {
        const diagnostic = analyze(table('environment = {', '    strictly = true,', '},')).diagnostics[0];

        expect(diagnostic?.code).toBe('config-unknown-field');
        expect(diagnostic?.message).toContain('"environment.strictly" is not a configuration field.');
        expect(diagnostic?.message).toContain('The "environment" section holds');
        expect(diagnostic?.position.line).toBe(3);
    });

    it('reports a wrong type with a caret under the value', () => {
        const diagnostic = analyze(table('build = { output = 5 },')).diagnostics[0];

        expect(diagnostic?.code).toBe('config-invalid-type');
        expect(diagnostic?.message).toBe('"build.output" must be a string but received a number.');
    });

    it('checks a nested table two levels down', () => {
        expect(codes(table("build = { details = { bundle = 'yes' } },"))).toEqual(['config-invalid-type']);
        expect(messages(table("build = { details = { bundle = 'yes' } },"))[0]).toBe('"build.details.bundle" must be a boolean but received a string.');
    });

    it('requires every field a nested table declares as required', () => {
        expect(codes(table("scripts = { { type = 'server' } },"))).toEqual(['config-missing-field']);
        expect(codes(table("scripts = { { path = 'src/**/*.luam', type = 'server' } },"))).toEqual([]);
    });

    it('types env members as optional strings', () => {
        expect(codes(table('build = { output = env.OUT_DIR },'))).toEqual(['config-invalid-type']);
        expect(messages(table('build = { output = env.OUT_DIR },'))[0]).toBe('"build.output" must be a string but received a string that may be nil.');
        expect(codes(table("build = { output = env.OUT_DIR or 'build' },"))).toEqual([]);
    });

    it('rejects arithmetic on an environment value', () => {
        expect(codes(table('info = { version = env.PORT + 1 },'))).toEqual(['config-invalid-type']);
    });

    it('keeps the scope closed around the three names a manifest reads', () => {
        expect(codes(table('build = { output = somewhere },'))).toEqual(['config-unknown-field']);
        expect(messages(table('build = { output = somewhere },'))[0]).toBe(
            '"somewhere" is not defined in this manifest. Declare it with "local", or read "mode", "env", or "root".',
        );
    });
});

describe('manifest evaluation', () => {
    it('resolves the conditional idiom for each mode', () => {
        const source = table("build = { output = mode == 'production' and 'build' or 'build-dev' },");

        expect(analyze(source, { mode: 'production' }).value['build']).toMatchObject({ output: 'build' });
        expect(analyze(source, { mode: 'development' }).value['build']).toMatchObject({ output: 'build-dev' });
    });

    it('follows lua truthiness', () => {
        const source = table("build = { output = env.LUAM_PASSWORD and 'build-secret' or 'build' },");

        expect(analyze(source, { env: {} }).value['build']).toMatchObject({ output: 'build' });
        expect(analyze(source, { env: { LUAM_PASSWORD: 'secret' } }).value['build']).toMatchObject({ output: 'build-secret' });
    });

    it('evaluates arithmetic, concatenation and comparison', () => {
        const source = table("info = { version = '1.' .. 2 .. '.' .. 3 },", 'environment = { oop = 2 > 1 },');
        const analysis = analyze(source);

        expect(analysis.diagnostics).toEqual([]);
        expect(analysis.value['info']).toMatchObject({ version: '1.2.3' });
        expect(analysis.value['environment']).toMatchObject({ oop: true });
    });

    it('reads root and mode', () => {
        const analysis = analyze(table('build = { output = root },', 'info = { description = mode },'), { root: '/srv/mta' });

        expect(analysis.diagnostics).toEqual([]);
        expect(analysis.value['build']).toMatchObject({ output: '/srv/mta' });
        expect(analysis.value['info']).toMatchObject({ description: 'production' });
    });

    it('keeps every accepted manifest free of environment values in its diagnostics', () => {
        const source = table('build = { output = 5 },');

        expect(messages(source, { env: { LUAM_PASSWORD: 'super-secret' } }).join('\n')).not.toContain('super-secret');
    });

    it('records a position for every written field', () => {
        const analysis = analyze(table("info = { dependencies = { 'scoreboard', 'admin' } },"));

        expect(analysis.positions.get('info')?.line).toBe(2);
        expect(analysis.positions.get('info.dependencies.1')?.line).toBe(2);
    });
});

describe('group boundaries', () => {
    function groups(...lines: readonly string[]): string[] {
        return [...analyze(table(...lines)).groups].sort();
    }

    it('records a blank line between two entries of an ordered list', () => {
        expect(groups('scripts = {', "    { path = 'a.luam', type = 'server' },", '', "    { path = 'b.luam', type = 'server' },", '},')).toEqual(['scripts.1']);
    });

    it('records one boundary for a run of blank lines', () => {
        expect(groups('scripts = {', "    { path = 'a.luam', type = 'server' },", '', '', "    { path = 'b.luam', type = 'server' },", '},')).toEqual(['scripts.1']);
    });

    it('records nothing before the first entry or after the last', () => {
        expect(groups('files = {', '', "    'a.png',", "    'b.png',", '', '},')).toEqual([]);
    });

    it('treats a comment between two entries as no boundary', () => {
        expect(groups('files = {', "    'a.png',", '    # a note', "    'b.png',", '},')).toEqual([]);
    });

    it('keeps a boundary a comment line follows', () => {
        expect(groups('files = {', "    'a.png',", '', '    # a note', "    'b.png',", '},')).toEqual(['files.1']);
    });

    it('records boundaries in the libraries and dependencies lists', () => {
        expect(groups('environment = {', '    libraries = {', "        '@a/one',", '', "        '@b/two',", '    },', '},')).toEqual(['environment.libraries.1']);
        expect(groups('info = {', '    dependencies = {', "        'one',", '', "        'two',", '    },', '},')).toEqual(['info.dependencies.1']);
    });
});
