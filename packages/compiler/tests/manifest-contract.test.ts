import { describe, expect, it } from 'vitest';

import { analyzeManifest } from '@compiler/manifest/manifest-analysis';
import {
    names,
    readAuthor,
    readBuild,
    readCompilerOptions,
    readDependencies,
    readEngineVersions,
    readFiles,
    readLibraries,
    readScripts,
    readSecret,
} from '@compiler/manifest/manifest-contract';
import {
    DEFAULT_BUILD_DETAILS,
    DEFAULT_COMPILER_OPTIONS,
    DEFAULT_ENGINE_VERSIONS,
    DEFAULT_ENVIRONMENT_FILE,
    DEFAULT_OUT_DIR,
} from '@compiler/manifest/manifest-defaults';
import type { ManifestObject } from '@compiler/manifest/manifest-value';

function analyze(source: string): ReturnType<typeof analyzeManifest> {
    return analyzeManifest(source, { mode: 'production', root: '/project', env: {} });
}

function value(source: string): ManifestObject {
    return analyze(source).value;
}

function codes(source: string): string[] {
    return analyze(source).diagnostics.map((diagnostic) => diagnostic.code);
}

describe('compiler options', () => {
    it('defaults every option when the section is absent', () => {
        expect(readCompilerOptions(value('{ }\n'))).toEqual(DEFAULT_COMPILER_OPTIONS);
    });

    it('reads the options the environment section carries', () => {
        const options = readCompilerOptions(value('{ environment = { strict = false, noUnusedLocals = true, warningsAsErrors = true } }\n'));

        expect(options).toEqual({ ...DEFAULT_COMPILER_OPTIONS, strict: false, noUnusedLocals: true, warningsAsErrors: true });
    });
});

describe('scripts', () => {
    it('reads nothing when the section is absent', () => {
        expect(readScripts(value('{ }\n'))).toEqual([]);
    });

    it('keeps the order the manifest wrote', () => {
        const scripts = readScripts(
            value("{\n    scripts = {\n        { path = 'config.lua', type = 'shared' },\n        { path = 'src/**/*.luam', type = 'server' },\n    },\n}\n"),
        );

        expect(scripts.map((entry) => [entry.path, entry.type])).toEqual([
            ['config.lua', 'shared'],
            ['src/**/*.luam', 'server'],
        ]);
    });

    it('normalizes a windows separator in an entry path', () => {
        const scripts = readScripts(value("{ scripts = { { path = 'src\\\\server\\\\**\\\\*.luam', type = 'server' } } }\n"));

        expect(scripts[0]?.path).toBe('src/server/**/*.luam');
    });

    it('rejects a side the catalog does not carry', () => {
        expect(codes("{ scripts = { { path = 'a.luam', type = 'both' } } }\n")).toEqual(['config-unknown-script-type']);
    });

    it('requires both fields of an entry', () => {
        expect(codes("{ scripts = { { path = 'a.luam' } } }\n")).toEqual(['config-missing-field']);
    });
});

describe('files', () => {
    it('reads nothing when the section is absent', () => {
        expect(readFiles(value('{ }\n'))).toEqual([]);
    });

    it('keeps the order the manifest wrote', () => {
        const files = readFiles(value("{\n    files = {\n        'list.xml',\n        'assets/**/*.png',\n    },\n}\n"));

        expect(files.map((entry) => entry.path)).toEqual(['list.xml', 'assets/**/*.png']);
    });
});

describe('dependencies', () => {
    it('emits them in the order they were written rather than sorted', () => {
        const written = value("{ info = { dependencies = { 'scoreboard', 'admin' } } }\n");

        expect(names(readDependencies(written))).toEqual(['scoreboard', 'admin']);
    });

    it('keeps a repeated entry rather than collapsing it', () => {
        const written = value("{ info = { dependencies = { 'admin', 'admin' } } }\n");

        expect(names(readDependencies(written))).toEqual(['admin', 'admin']);
    });
});

describe('author', () => {
    it('reads nothing when the record is absent', () => {
        expect(readAuthor(value('{ }\n'))).toBeNull();
    });

    it('reads the name and every extra key', () => {
        const author = readAuthor(value("{ info = { author = { name = 'dracoN*', discord = 'draconzx' } } }\n"));

        expect(author?.name).toBe('dracoN*');
        expect(author?.extra).toEqual([['discord', 'draconzx']]);
    });

    it('requires a name inside the record rather than at the file', () => {
        const analysis = analyze("{ info = { author = { discord = 'draconzx' } } }\n");

        expect(analysis.diagnostics.map((entry) => entry.code)).toEqual(['config-missing-field']);
        expect(analysis.diagnostics[0]?.position.line).toBe(1);
    });
});

describe('environment', () => {
    it('defaults the version on both sides', () => {
        expect(readEngineVersions(value('{ }\n'))).toEqual(DEFAULT_ENGINE_VERSIONS);
    });

    it('reads a pinned version per side', () => {
        expect(readEngineVersions(value("{ environment = { version = { server = '1.6.0', client = 'latest' } } }\n"))).toEqual({
            server: '1.6.0',
            client: 'latest',
        });
    });

    it('names one environment file', () => {
        expect(readSecret(value('{ }\n'))).toBe(DEFAULT_ENVIRONMENT_FILE);
        expect(readSecret(value("{ environment = { secret = '.env.development' } }\n"))).toBe('.env.development');
    });

    it('keeps the library order the manifest wrote', () => {
        expect(names(readLibraries(value("{ environment = { libraries = { '@luam-example/collections', '@infobox' } } }\n")))).toEqual([
            '@luam-example/collections',
            '@infobox',
        ]);
    });
});

describe('build', () => {
    it('defaults the output directory and every switch', () => {
        expect(readBuild(value('{ }\n'))).toEqual({ output: DEFAULT_OUT_DIR, details: DEFAULT_BUILD_DETAILS });
    });

    it('reads each switch independently', () => {
        expect(readBuild(value('{ build = { details = { minify = false } } }\n')).details).toEqual({ ...DEFAULT_BUILD_DETAILS, minify: false });
    });

    it('accepts an absolute output that leaves the project', () => {
        expect(codes("{ build = { output = '/media/storage/resources' } }\n")).toEqual([]);
        expect(readBuild(value("{ build = { output = '/media/storage/resources' } }\n")).output).toBe('/media/storage/resources');
    });

    it('reports an obfuscate that is on and stays quiet otherwise', () => {
        expect(codes('{ build = { details = { obfuscate = true } } }\n')).toEqual(['config-unimplemented-option']);
        expect(codes('{ build = { details = { obfuscate = false } } }\n')).toEqual([]);
        expect(codes('{ }\n')).toEqual([]);
    });

    it('names the milestone that will honour obfuscate', () => {
        expect(analyze('{ build = { details = { obfuscate = true } } }\n').diagnostics[0]?.message).toContain('Milestone 52');
    });
});

describe('removed fields', () => {
    it.each([
        ["{ name = 'demo' }\n", 'folder'],
        ['{ oop = true }\n', 'environment'],
        ["{ sourceDirs = { 'src' } }\n", 'scripts'],
        ["{ assetDirs = { 'assets' } }\n", 'files'],
        ["{ mta = { minVersion = '1.6' } }\n", 'environment'],
        ["{ loadOrder = { 'a.luam' } }\n", 'scripts'],
        ["{ helpers = { 'class' } }\n", 'Helper selection'],
        ["{ serverPath = 'server' }\n", '.luam.server'],
    ])('rejects %j and names its replacement', (source, replacement) => {
        const analysis = analyze(source);

        expect(analysis.diagnostics.map((diagnostic) => diagnostic.code)).toEqual(['config-removed-field']);
        expect(analysis.diagnostics[0]?.message).toContain(replacement);
    });

    it('names the assets entry that has no replacement', () => {
        expect(analyze("{ assets = { { from = 'a', to = 'b' } } }\n").diagnostics[0]?.message).toContain('has no replacement');
    });
});
