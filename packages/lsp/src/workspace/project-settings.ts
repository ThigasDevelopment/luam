import { basename } from 'node:path';

import type { ManifestAnalysis } from '@compiler/manifest/manifest-analysis';
import { names, readCompilerOptions, readLibraries, readScripts, readSecret, scriptPatterns } from '@compiler/manifest/manifest-contract';
import { DEFAULT_COMPILER_OPTIONS, DEFAULT_ENVIRONMENT_FILE, type CompilerOptions, type ScriptEntry } from '@compiler/manifest/manifest-defaults';
import { createScriptResolver, type ScriptResolver } from '@compiler/project/source-mapping';

export interface ProjectSettings {
    compilerOptions: CompilerOptions;
    scripts: readonly ScriptEntry[];
    libraries: string[];
    secret: string;
    resolver: ScriptResolver;
}

export const MANIFEST_FILE_NAME = '.luam.manifest';

export const DEFAULT_PROJECT_SETTINGS: ProjectSettings = {
    compilerOptions: DEFAULT_COMPILER_OPTIONS,
    scripts: [],
    libraries: [],
    secret: DEFAULT_ENVIRONMENT_FILE,
    resolver: createScriptResolver([]),
};

export function isManifestPath(path: string): boolean {
    return basename(path).endsWith(MANIFEST_FILE_NAME);
}

export function settingsFrom(manifest: ManifestAnalysis | null): ProjectSettings {
    if (manifest === null) {
        return DEFAULT_PROJECT_SETTINGS;
    }

    const scripts = readScripts(manifest.value);

    return {
        compilerOptions: readCompilerOptions(manifest.value),
        scripts,
        libraries: names(readLibraries(manifest.value)),
        secret: readSecret(manifest.value),
        resolver: createScriptResolver(scripts),
    };
}

export function settingsKey(settings: ProjectSettings): string {
    const options = Object.entries(settings.compilerOptions)
        .map(([name, value]) => `${name}=${String(value)}`)
        .join(',');
    const scripts = settings.scripts.map((entry) => `${entry.path}:${entry.type}`);

    return `${options}|${scriptPatterns(settings.scripts).length}:${scripts.join(',')}|${settings.libraries.join(',')}|${settings.secret}`;
}
