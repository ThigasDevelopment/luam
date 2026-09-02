import { ALL_ENVIRONMENTS, type Environment } from '@compiler/environment/environment';

export interface CompilerOptions {
    strict: boolean;
    oop: boolean;
    noUnusedLocals: boolean;
    noUnusedParameters: boolean;
    noImplicitGlobals: boolean;
    warningsAsErrors: boolean;
}

export type SourceMapping = Readonly<Record<Environment, readonly string[]>>;

export interface AssetMapping {
    from: string;
    to: string;
}

export interface EngineRequirement {
    minVersion: string;
}

export interface EnvironmentFiles {
    file: string;
    localFile: string;
}

export interface OutputSettings {
    bundle: boolean;
    map: boolean;
    minify: boolean;
}

export const LATEST_ENGINE_VERSION = 'latest';

export const DEFAULT_ENVIRONMENT_FILE = '.env';

export const DEFAULT_LOCAL_ENVIRONMENT_FILE = '.env.local';

export const DEFAULT_ASSET_DESTINATION = '.';

export const DEFAULT_OUT_DIR = 'build';

export const DEFAULT_CONTRACTS_DIR = '.luam/contracts';

export const DEFAULT_RESOURCES_DIR = 'mods/deathmatch/resources';

export const DEFAULT_COMPILER_OPTIONS: CompilerOptions = {
    strict: true,
    oop: false,
    noUnusedLocals: false,
    noUnusedParameters: false,
    noImplicitGlobals: false,
    warningsAsErrors: false,
};

export const DEFAULT_SOURCE_MAPPING: SourceMapping = {
    server: ['src/server/**/*.luam'],
    client: ['src/client/**/*.luam'],
    shared: ['src/shared/**/*.luam'],
};

export const DEFAULT_ENGINE: EngineRequirement = { minVersion: LATEST_ENGINE_VERSION };

export const DEFAULT_ENVIRONMENT_FILES: EnvironmentFiles = { file: DEFAULT_ENVIRONMENT_FILE, localFile: DEFAULT_LOCAL_ENVIRONMENT_FILE };

export const DEFAULT_OUTPUT: OutputSettings = { bundle: true, map: true, minify: true };

export const SOURCE_SIDES: readonly Environment[] = ALL_ENVIRONMENTS;

export function compilerOptions(overrides: Partial<CompilerOptions> = {}): CompilerOptions {
    return { ...DEFAULT_COMPILER_OPTIONS, ...overrides };
}

export function emptySourceMapping(): Record<Environment, string[]> {
    return { server: [], client: [], shared: [] };
}
