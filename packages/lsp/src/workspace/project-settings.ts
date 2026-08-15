import { basename } from 'node:path';

import type { ManifestAnalysis } from '@compiler/manifest/manifest-analysis';
import { readCompilerOptions, readEnvironmentFiles, readSourceMapping, sourcePatterns } from '@compiler/manifest/manifest-contract';
import {
    DEFAULT_COMPILER_OPTIONS,
    DEFAULT_ENVIRONMENT_FILES,
    DEFAULT_SOURCE_MAPPING,
    type CompilerOptions,
    type EnvironmentFiles,
    type SourceMapping,
} from '@compiler/manifest/manifest-defaults';
import { createSourceResolver, type SourceResolver } from '@compiler/project/source-mapping';

export interface ProjectSettings {
    compilerOptions: CompilerOptions;
    sources: SourceMapping;
    environment: EnvironmentFiles;
    resolver: SourceResolver;
}

export const MANIFEST_FILE_NAME = '.luam.manifest';

export const DEFAULT_PROJECT_SETTINGS: ProjectSettings = {
    compilerOptions: DEFAULT_COMPILER_OPTIONS,
    sources: DEFAULT_SOURCE_MAPPING,
    environment: DEFAULT_ENVIRONMENT_FILES,
    resolver: createSourceResolver(DEFAULT_SOURCE_MAPPING),
};

export function isManifestPath(path: string): boolean {
    return basename(path).endsWith(MANIFEST_FILE_NAME);
}

export function settingsFrom(manifest: ManifestAnalysis | null): ProjectSettings {
    if (manifest === null) {
        return DEFAULT_PROJECT_SETTINGS;
    }

    const sources = readSourceMapping(manifest.value);

    return {
        compilerOptions: readCompilerOptions(manifest.value),
        sources,
        environment: readEnvironmentFiles(manifest.value),
        resolver: createSourceResolver(sources),
    };
}

export function settingsKey(settings: ProjectSettings): string {
    const options = Object.entries(settings.compilerOptions)
        .map(([name, value]) => `${name}=${String(value)}`)
        .join(',');

    return `${options}|${sourcePatterns(settings.sources).join(',')}|${settings.environment.file}|${settings.environment.localFile}`;
}
