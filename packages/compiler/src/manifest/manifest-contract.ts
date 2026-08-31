import {
    DEFAULT_ASSET_DESTINATION,
    DEFAULT_COMPILER_OPTIONS,
    DEFAULT_ENGINE,
    DEFAULT_ENVIRONMENT_FILES,
    DEFAULT_OUTPUT,
    DEFAULT_SOURCE_MAPPING,
    emptySourceMapping,
    SOURCE_SIDES,
    type AssetMapping,
    type CompilerOptions,
    type EngineRequirement,
    type EnvironmentFiles,
    type OutputSettings,
    type SourceMapping,
} from './manifest-defaults';
import { readBoolean, readString, readStrings, readTable, readTables } from './manifest-readers';
import type { ManifestObject } from './manifest-value';

const EMPTY: ManifestObject = {};

function flag(source: ManifestObject, name: string, fallback: boolean): boolean {
    return readBoolean(source, name) ?? fallback;
}

export function readCompilerOptions(value: ManifestObject): CompilerOptions {
    const source = readTable(value, 'compiler') ?? EMPTY;

    return {
        strict: flag(source, 'strict', DEFAULT_COMPILER_OPTIONS.strict),
        oop: flag(source, 'oop', DEFAULT_COMPILER_OPTIONS.oop),
        noUnusedLocals: flag(source, 'noUnusedLocals', DEFAULT_COMPILER_OPTIONS.noUnusedLocals),
        noUnusedParameters: flag(source, 'noUnusedParameters', DEFAULT_COMPILER_OPTIONS.noUnusedParameters),
        warningsAsErrors: flag(source, 'warningsAsErrors', DEFAULT_COMPILER_OPTIONS.warningsAsErrors),
    };
}

export function readSourceMapping(value: ManifestObject): SourceMapping {
    const source = readTable(value, 'sources');

    if (source === null) {
        return DEFAULT_SOURCE_MAPPING;
    }

    const mapping = emptySourceMapping();

    for (const environment of SOURCE_SIDES) {
        mapping[environment] = source[environment] === undefined ? [...DEFAULT_SOURCE_MAPPING[environment]] : readStrings(source, environment);
    }

    return mapping;
}

export function readAssetMappings(value: ManifestObject): AssetMapping[] {
    return readTables(value, 'assets').map((entry) => ({
        from: readString(entry, 'from') ?? '',
        to: readString(entry, 'to') ?? DEFAULT_ASSET_DESTINATION,
    }));
}

export function readDependencies(value: ManifestObject): string[] {
    return [...new Set(readStrings(value, 'dependencies'))].sort();
}

export function readLibraries(value: ManifestObject): string[] {
    return readStrings(value, 'libraries');
}

export function readEngine(value: ManifestObject): EngineRequirement {
    const source = readTable(value, 'engine') ?? EMPTY;

    return { minVersion: readString(source, 'minVersion') ?? DEFAULT_ENGINE.minVersion };
}

export function readEnvironmentFiles(value: ManifestObject): EnvironmentFiles {
    const source = readTable(value, 'environment') ?? EMPTY;

    return {
        file: readString(source, 'file') ?? DEFAULT_ENVIRONMENT_FILES.file,
        localFile: readString(source, 'localFile') ?? DEFAULT_ENVIRONMENT_FILES.localFile,
    };
}

export function readOutputSettings(value: ManifestObject): OutputSettings {
    const source = readTable(value, 'output') ?? EMPTY;

    return {
        bundle: flag(source, 'bundle', DEFAULT_OUTPUT.bundle),
        map: flag(source, 'map', DEFAULT_OUTPUT.map),
        minify: flag(source, 'minify', DEFAULT_OUTPUT.minify),
    };
}

export function sourcePatterns(mapping: SourceMapping): string[] {
    return SOURCE_SIDES.flatMap((environment) => [...mapping[environment]]);
}

export type { AssetMapping, CompilerOptions, EngineRequirement, EnvironmentFiles, OutputSettings, SourceMapping } from './manifest-defaults';
