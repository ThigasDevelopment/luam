import { basename } from 'node:path';

import type { ManifestAnalysis } from '@compiler/manifest/manifest-analysis';

export interface ProjectSettings {
    oop: boolean;
}

export const DEFAULT_PROJECT_SETTINGS: ProjectSettings = { oop: false };

export const MANIFEST_FILE_NAME = '.luam.manifest';

export function isManifestPath(path: string): boolean {
    return basename(path).endsWith(MANIFEST_FILE_NAME);
}

export function settingsFrom(manifest: ManifestAnalysis | null): ProjectSettings {
    if (manifest === null) {
        return DEFAULT_PROJECT_SETTINGS;
    }

    return { oop: manifest.value.oop === true };
}
