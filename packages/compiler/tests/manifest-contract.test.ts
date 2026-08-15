import { describe, expect, it } from 'vitest';

import { analyzeManifest } from '@compiler/manifest/manifest-analysis';
import {
    readAssetMappings,
    readCompilerOptions,
    readDependencies,
    readEngine,
    readEnvironmentFiles,
    readOutputSettings,
    readSourceMapping,
} from '@compiler/manifest/manifest-contract';
import { DEFAULT_COMPILER_OPTIONS, DEFAULT_ENVIRONMENT_FILES, DEFAULT_SOURCE_MAPPING } from '@compiler/manifest/manifest-defaults';

const NAME = "name = 'luam-demo'\n";

function value(source: string) {
    return analyzeManifest(`${NAME}${source}`, { mode: 'production', root: '/project', env: {} }).value;
}

function codes(source: string): string[] {
    return analyzeManifest(`${NAME}${source}`, { mode: 'production', root: '/project', env: {} }).diagnostics.map((diagnostic) => diagnostic.code);
}

describe('compilerOptions', () => {
    it('defaults to strict with every other option off', () => {
        expect(readCompilerOptions(value(''))).toEqual(DEFAULT_COMPILER_OPTIONS);
    });

    it('reads each option independently', () => {
        const options = readCompilerOptions(value('compilerOptions = { strict = false, noUnusedLocals = true, warningsAsErrors = true }\n'));

        expect(options).toEqual({ strict: false, oop: false, noUnusedLocals: true, noUnusedParameters: false, warningsAsErrors: true });
    });

    it('rejects an unknown option and a wrongly typed one', () => {
        expect(codes('compilerOptions = { target = 54 }\n')).toEqual(['config-unknown-field']);
        expect(codes("compilerOptions = { strict = 'yes' }\n")).toEqual(['config-invalid-type']);
    });
});

describe('sources', () => {
    it('keeps the default layout when the domain is absent', () => {
        expect(readSourceMapping(value(''))).toEqual(DEFAULT_SOURCE_MAPPING);
    });

    it('replaces only the sides the manifest writes', () => {
        const mapping = readSourceMapping(value("sources = { client = { 'ui/**/*.luam' } }\n"));

        expect(mapping.client).toEqual(['ui/**/*.luam']);
        expect(mapping.server).toEqual([...DEFAULT_SOURCE_MAPPING.server]);
    });

    it('accepts an empty side', () => {
        expect(codes('sources = { client = { } }\n')).toEqual([]);
        expect(readSourceMapping(value('sources = { client = { } }\n')).client).toEqual([]);
    });

    it('rejects a pattern the grammar does not allow', () => {
        expect(codes("sources = { server = { 'src/(a|b)/*.luam' } }\n")).toEqual(['config-invalid-pattern']);
        expect(codes("sources = { server = { '../outside/**/*.luam' } }\n")).toEqual(['config-escaping-path']);
    });

    it('normalizes separators it accepts', () => {
        expect(readSourceMapping(value("sources = { server = { 'src\\\\server\\\\**\\\\*.luam' } }\n")).server).toEqual(['src/server/**/*.luam']);
    });
});

describe('assets', () => {
    it('defaults to copying nothing', () => {
        expect(readAssetMappings(value(''))).toEqual([]);
    });

    it('reads a list of mappings and defaults the destination to the resource root', () => {
        const mappings = readAssetMappings(value("assets = { { from = 'assets/**/*', to = 'assets' }, { from = 'logo.png' } }\n"));

        expect(mappings).toEqual([
            { from: 'assets/**/*', to: 'assets' },
            { from: 'logo.png', to: '.' },
        ]);
    });

    it('requires a source on every entry and rejects an unknown member', () => {
        expect(codes("assets = { { to = 'assets' } }\n")).toEqual(['config-missing-field']);
        expect(codes("assets = { { from = 'a', into = 'b' } }\n")).toEqual(['config-unknown-field']);
    });
});

describe('dependencies', () => {
    it('deduplicates and sorts the names', () => {
        expect(readDependencies(value("dependencies = { 'scoreboard', 'admin', 'scoreboard' }\n"))).toEqual(['admin', 'scoreboard']);
    });

    it('rejects a name MTA cannot resolve', () => {
        expect(codes("dependencies = { 'not a resource' }\n")).toEqual(['config-invalid-dependency']);
    });
});

describe('engine', () => {
    it('defaults to the latest published release', () => {
        expect(readEngine(value(''))).toEqual({ minVersion: 'latest' });
    });

    it('accepts a pinned version and rejects anything else', () => {
        expect(readEngine(value("engine = { minVersion = '1.6.0' }\n"))).toEqual({ minVersion: '1.6.0' });
        expect(codes("engine = { minVersion = 'newest' }\n")).toEqual(['config-invalid-engine-version']);
    });

    it('does not accept the removed mta domain', () => {
        expect(codes("mta = { minVersion = '1.6.0' }\n")).toEqual(['config-removed-field']);
    });
});

describe('environment', () => {
    it('defaults to .env with a local override', () => {
        expect(readEnvironmentFiles(value(''))).toEqual(DEFAULT_ENVIRONMENT_FILES);
    });

    it('reads a per-mode pair', () => {
        const files = readEnvironmentFiles(value("environment = { file = '.env.development', localFile = '.env.development.local' }\n"));

        expect(files).toEqual({ file: '.env.development', localFile: '.env.development.local' });
    });
});

describe('output', () => {
    it('minifies and bundles by default', () => {
        expect(readOutputSettings(value(''))).toEqual({ bundle: true, map: true, minify: true });
    });

    it('reads each switch independently', () => {
        expect(readOutputSettings(value('output = { minify = false }\n'))).toEqual({ bundle: true, map: true, minify: false });
    });
});

describe('removed fields', () => {
    it.each([
        ['oop = true\n', 'compilerOptions'],
        ["sourceDirs = { 'src' }\n", 'sources'],
        ["assetDirs = { 'assets' }\n", 'assets'],
        ["mta = { minVersion = '1.6' }\n", 'engine'],
    ])('rejects %j and names its replacement', (source, replacement) => {
        const analysis = analyzeManifest(`${NAME}${source}`, { mode: 'production', root: '/project', env: {} });

        expect(analysis.diagnostics.map((diagnostic) => diagnostic.code)).toEqual(['config-removed-field']);
        expect(analysis.diagnostics[0]?.message).toContain(replacement);
    });
});
