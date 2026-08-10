import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const CONFIG_FILE = 'luam.json';

export interface ProjectSettings {
    oop: boolean;
}

export const DEFAULT_PROJECT_SETTINGS: ProjectSettings = { oop: false };

function readConfig(root: string): unknown {
    const path = resolve(root, CONFIG_FILE);

    try {
        return existsSync(path) ? JSON.parse(readFileSync(path, 'utf8')) : null;
    } catch {
        return null;
    }
}

export function readProjectSettings(raw: unknown): ProjectSettings | null {
    if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) {
        return null;
    }

    const oop = (raw as Record<string, unknown>).oop;

    return { oop: oop === true };
}

export function loadProjectSettings(roots: readonly string[]): ProjectSettings {
    for (const root of roots) {
        const settings = readProjectSettings(readConfig(root));

        if (settings !== null) {
            return settings;
        }
    }

    return DEFAULT_PROJECT_SETTINGS;
}
