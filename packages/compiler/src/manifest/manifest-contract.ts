import {
    DEFAULT_BUILD_DETAILS,
    DEFAULT_COMPILER_OPTIONS,
    DEFAULT_ENGINE_VERSIONS,
    DEFAULT_ENVIRONMENT_FILE,
    DEFAULT_OUT_DIR,
    isScriptSide,
    type AuthorInfo,
    type BuildDetails,
    type BuildSettings,
    type CompilerOptions,
    type EngineVersions,
    type FileEntry,
    type OrderedName,
    type ScriptEntry,
} from './manifest-defaults';
import { readBoolean, readString, readStrings, readTable, readTables } from './manifest-readers';
import type { ManifestObject } from './manifest-value';

export type GroupBreaks = ReadonlySet<string>;

const EMPTY: ManifestObject = {};

export const NO_GROUPS: GroupBreaks = new Set();

const INFO_ATTRIBUTES: readonly string[] = ['name'];

function flag(source: ManifestObject, name: string, fallback: boolean): boolean {
    return readBoolean(source, name) ?? fallback;
}

function section(value: ManifestObject, name: string): ManifestObject {
    return readTable(value, name) ?? EMPTY;
}

function ordered(names: readonly string[], groups: GroupBreaks, key: string): OrderedName[] {
    return names.map((name, index) => ({ name, group: groups.has(`${key}.${index}`) }));
}

export function names(entries: readonly OrderedName[]): string[] {
    return entries.map((entry) => entry.name);
}

export function readCompilerOptions(value: ManifestObject): CompilerOptions {
    const source = section(value, 'environment');

    return {
        strict: flag(source, 'strict', DEFAULT_COMPILER_OPTIONS.strict),
        oop: flag(source, 'oop', DEFAULT_COMPILER_OPTIONS.oop),
        noUnusedLocals: flag(source, 'noUnusedLocals', DEFAULT_COMPILER_OPTIONS.noUnusedLocals),
        noImplicitGlobals: flag(source, 'noImplicitGlobals', DEFAULT_COMPILER_OPTIONS.noImplicitGlobals),
        noUnusedParameters: flag(source, 'noUnusedParameters', DEFAULT_COMPILER_OPTIONS.noUnusedParameters),
        warningsAsErrors: flag(source, 'warningsAsErrors', DEFAULT_COMPILER_OPTIONS.warningsAsErrors),
    };
}

export function readScripts(value: ManifestObject, groups: GroupBreaks = NO_GROUPS): ScriptEntry[] {
    return readTables(value, 'scripts').flatMap((entry, index) => {
        const path = readString(entry, 'path');
        const type = readString(entry, 'type');

        if (path === null || type === null || !isScriptSide(type)) {
            return [];
        }

        return [{ path, type, group: groups.has(`scripts.${index}`) }];
    });
}

export function readFiles(value: ManifestObject, groups: GroupBreaks = NO_GROUPS): FileEntry[] {
    return readStrings(value, 'files').map((path, index) => ({ path, group: groups.has(`files.${index}`) }));
}

export function readAuthor(value: ManifestObject): AuthorInfo | null {
    const info = section(value, 'info');
    const source = readTable(info, 'author');
    const name = source === null ? null : readString(source, 'name');

    if (source === null || name === null) {
        return null;
    }

    const extra = Object.entries(source)
        .filter(([key, entry]) => !INFO_ATTRIBUTES.includes(key) && typeof entry === 'string')
        .map(([key, entry]) => [key, entry as string] as const);

    return { name, extra };
}

export function readDependencies(value: ManifestObject, groups: GroupBreaks = NO_GROUPS): OrderedName[] {
    return ordered(readStrings(section(value, 'info'), 'dependencies'), groups, 'info.dependencies');
}

export function readLibraries(value: ManifestObject, groups: GroupBreaks = NO_GROUPS): OrderedName[] {
    return ordered(readStrings(section(value, 'environment'), 'libraries'), groups, 'environment.libraries');
}

export function readEngineVersions(value: ManifestObject): EngineVersions {
    const source = readTable(section(value, 'environment'), 'version') ?? EMPTY;

    return {
        server: readString(source, 'server') ?? DEFAULT_ENGINE_VERSIONS.server,
        client: readString(source, 'client') ?? DEFAULT_ENGINE_VERSIONS.client,
    };
}

export function readSecret(value: ManifestObject): string {
    return readString(section(value, 'environment'), 'secret') ?? DEFAULT_ENVIRONMENT_FILE;
}

export function readBuild(value: ManifestObject): BuildSettings {
    const source = section(value, 'build');
    const details = readTable(source, 'details') ?? EMPTY;

    return {
        output: readString(source, 'output') ?? DEFAULT_OUT_DIR,
        details: {
            bundle: flag(details, 'bundle', DEFAULT_BUILD_DETAILS.bundle),
            map: flag(details, 'map', DEFAULT_BUILD_DETAILS.map),
            minify: flag(details, 'minify', DEFAULT_BUILD_DETAILS.minify),
            obfuscate: flag(details, 'obfuscate', DEFAULT_BUILD_DETAILS.obfuscate),
        },
    };
}

export function scriptPatterns(scripts: readonly ScriptEntry[]): string[] {
    return scripts.map((entry) => entry.path);
}

export type {
    AuthorInfo,
    BuildDetails,
    BuildSettings,
    CompilerOptions,
    EngineVersions,
    FileEntry,
    OrderedName,
    ScriptEntry,
} from './manifest-defaults';
