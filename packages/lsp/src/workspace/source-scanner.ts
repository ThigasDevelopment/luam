import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

import { normalizeFsPath } from './document-uri';

export const SOURCE_EXTENSION = '.luam';

const IGNORED_DIRECTORIES: ReadonlySet<string> = new Set(['node_modules', '.git', 'dist', 'build']);

export interface ScannedFile {
    path: string;
    text: string;
}

function isDirectory(path: string): boolean {
    try {
        return statSync(path).isDirectory();
    } catch {
        return false;
    }
}

function isIgnored(name: string): boolean {
    return IGNORED_DIRECTORIES.has(name) || name.startsWith('.');
}

function collect(directory: string, files: ScannedFile[]): void {
    let entries;

    try {
        entries = readdirSync(directory, { withFileTypes: true });
    } catch {
        return;
    }

    for (const entry of entries) {
        const absolute = join(directory, entry.name);

        if (entry.isDirectory()) {
            if (!isIgnored(entry.name)) {
                collect(absolute, files);
            }

            continue;
        }

        if (!entry.isFile() || !entry.name.endsWith(SOURCE_EXTENSION)) {
            continue;
        }

        try {
            files.push({ path: normalizeFsPath(absolute), text: readFileSync(absolute, 'utf8') });
        } catch {
            continue;
        }
    }
}

export function scanSources(roots: readonly string[]): ScannedFile[] {
    const files: ScannedFile[] = [];

    for (const root of roots) {
        if (isDirectory(root)) {
            collect(root, files);
        }
    }

    return files.sort((left, right) => left.path.localeCompare(right.path));
}
