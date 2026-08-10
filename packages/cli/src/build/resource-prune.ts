import { existsSync, readdirSync, rmdirSync, unlinkSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';

import { ENVIRONMENT_FILE } from '@compiler/project/resource';

export interface PruneOptions {
    generatedRoots: readonly string[];
}

const GENERATED_MANIFEST = 'meta.xml';

const GENERATED_EXTENSION = '.lua';

const PROTECTED: ReadonlySet<string> = new Set([ENVIRONMENT_FILE, '.env.local']);

function normalize(path: string): string {
    return path.replace(/\\/g, '/');
}

function isUnderRoot(relativePath: string, root: string): boolean {
    return relativePath === root || relativePath.startsWith(`${root}/`);
}

function isGenerated(relativePath: string, options: PruneOptions): boolean {
    if (relativePath.endsWith(GENERATED_EXTENSION) || relativePath === GENERATED_MANIFEST) {
        return true;
    }

    return options.generatedRoots.some((root) => isUnderRoot(relativePath, root));
}

function removeEmptyDirectories(targetDir: string, directory: string): void {
    if (resolve(directory) === resolve(targetDir)) {
        return;
    }

    if (readdirSync(directory).length > 0) {
        return;
    }

    rmdirSync(directory);
    removeEmptyDirectories(targetDir, resolve(directory, '..'));
}

export function pruneResource(targetDir: string, keep: ReadonlySet<string>, options: PruneOptions): string[] {
    if (!existsSync(targetDir)) {
        return [];
    }

    const removed: string[] = [];
    const directories = new Set<string>();

    for (const entry of readdirSync(targetDir, { recursive: true, withFileTypes: true })) {
        if (!entry.isFile()) {
            continue;
        }

        const absolute = join(entry.parentPath, entry.name);
        const relativePath = normalize(relative(targetDir, absolute));

        if (keep.has(relativePath) || PROTECTED.has(relativePath) || !isGenerated(relativePath, options)) {
            continue;
        }

        unlinkSync(absolute);
        removed.push(relativePath);
        directories.add(entry.parentPath);
    }

    for (const directory of directories) {
        removeEmptyDirectories(targetDir, directory);
    }

    return removed.sort((left, right) => left.localeCompare(right));
}
