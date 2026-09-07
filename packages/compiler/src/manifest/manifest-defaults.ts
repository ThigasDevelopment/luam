import { ALL_ENVIRONMENTS, type Environment } from '@compiler/environment/environment';

export interface CompilerOptions {
    strict: boolean;
    oop: boolean;
    noUnusedLocals: boolean;
    noUnusedParameters: boolean;
    noImplicitGlobals: boolean;
    warningsAsErrors: boolean;
}

export interface ScriptEntry {
    path: string;
    type: Environment;
    group: boolean;
}

export interface FileEntry {
    path: string;
    group: boolean;
}

export interface OrderedName {
    name: string;
    group: boolean;
}

export interface AuthorInfo {
    name: string;
    extra: readonly (readonly [string, string])[];
}

export interface EngineVersions {
    server: string;
    client: string;
}

export interface BuildDetails {
    bundle: boolean;
    map: boolean;
    minify: boolean;
    obfuscate: boolean;
}

export interface BuildSettings {
    output: string;
    details: BuildDetails;
}

export const MANIFEST_FILE_NAME = '.luam.manifest';

export const LATEST_ENGINE_VERSION = 'latest';

export const DEFAULT_ENVIRONMENT_FILE = '.env';

export const DEFAULT_OUT_DIR = 'build';

export const DEFAULT_CONTRACTS_DIR = '.luam/contracts';

export const DEFAULT_RESOURCES_DIR = 'mods/deathmatch/resources';

export const SCRIPT_SIDES: readonly Environment[] = ALL_ENVIRONMENTS;

export const DEFAULT_COMPILER_OPTIONS: CompilerOptions = {
    strict: true,
    oop: false,
    noUnusedLocals: false,
    noUnusedParameters: false,
    noImplicitGlobals: false,
    warningsAsErrors: false,
};

export const DEFAULT_ENGINE_VERSIONS: EngineVersions = { server: LATEST_ENGINE_VERSION, client: LATEST_ENGINE_VERSION };

export const DEFAULT_BUILD_DETAILS: BuildDetails = { bundle: true, map: true, minify: true, obfuscate: false };

export const DEFAULT_BUILD: BuildSettings = { output: DEFAULT_OUT_DIR, details: DEFAULT_BUILD_DETAILS };

export function compilerOptions(overrides: Partial<CompilerOptions> = {}): CompilerOptions {
    return { ...DEFAULT_COMPILER_OPTIONS, ...overrides };
}

export function isScriptSide(value: string): value is Environment {
    return (SCRIPT_SIDES as readonly string[]).includes(value);
}
