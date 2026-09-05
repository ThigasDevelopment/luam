import type { AssetMapping, CompilerOptions, EngineRequirement, EnvironmentFiles, OutputSettings, SourceMapping } from '@compiler/manifest/manifest-contract';
import { MANIFEST_FILE_NAME } from '@compiler/manifest/manifest-defaults';
import { isValidResourceName } from '@compiler/manifest/manifest-rules';
import type { RuntimeHelperName } from '@runtime/helpers';

export interface DevelopmentLogsConfig {
    enabled: boolean;
    maxMessageLength: number;
    rateLimit: number;
    rateWindowMs: number;
}

export interface DevelopmentServerConfig {
    executable: string | null;
}

export interface DevelopmentConfig {
    logs: DevelopmentLogsConfig;
    server: DevelopmentServerConfig;
}

export interface LuamConfig {
    name: string;
    author: string | null;
    version: string | null;
    description: string | null;
    compilerOptions: CompilerOptions;
    sources: SourceMapping;
    assets: AssetMapping[];
    dependencies: string[];
    libraries: string[];
    contracts: string;
    engine: EngineRequirement;
    environment: EnvironmentFiles;
    outDir: string;
    loadOrder: string[];
    helpers: RuntimeHelperName[];
    serverPath: string | null;
    resourcesDir: string;
    output: OutputSettings;
    development: DevelopmentConfig;
}

export { MANIFEST_FILE_NAME };

export type { AssetMapping, CompilerOptions, EngineRequirement, EnvironmentFiles, OutputSettings, SourceMapping };

export { isValidResourceName };
