import { existsSync, mkdirSync, readdirSync, rmdirSync, unlinkSync, writeFileSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';

import { ENVIRONMENT_FILE } from '@compiler/project/resource';

export interface PruneOptions {
    generatedFiles: readonly string[];
    generatedRoots: readonly string[];
}

export interface PruneOutcome {
    removed: string[];
    refusal: string | null;
}

export const BUILD_MARKER_FILE = '.luam-build';

const MARKER_CONTENT = [
    '# Written by "luam build" when it created this directory.',
    '# The build prunes only what it generated, and only inside a directory carrying this file.',
    '# Deleting it makes the next build refuse to remove anything here.',
    '',
].join('\n');

export function markBuildDirectory(targetDir: string): void {
    mkdirSync(targetDir, { recursive: true });

    if (!existsSync(join(targetDir, BUILD_MARKER_FILE))) {
        writeFileSync(join(targetDir, BUILD_MARKER_FILE), MARKER_CONTENT, 'utf8');
    }
}

export function ownsBuildDirectory(targetDir: string): boolean {
    return !existsSync(targetDir) || existsSync(join(targetDir, BUILD_MARKER_FILE));
}

export function pruneRefusal(targetDir: string): string {
    return `"${targetDir}" holds no "${BUILD_MARKER_FILE}", so this build did not create it and removed nothing from it. Point "build.output" at a directory the build owns, or delete this one and build again.`;
}

const GENERATED_MANIFEST = 'meta.xml';

const GENERATED_EXTENSION = '.lua';

const PROTECTED: ReadonlySet<string> = new Set([ENVIRONMENT_FILE, '.env.local', BUILD_MARKER_FILE]);

function normalize(path: string): string {
    return path.replace(/\\/g, '/');
}

function isUnderRoot(relativePath: string, root: string): boolean {
    return relativePath === root || relativePath.startsWith(`${root}/`);
}

function isGenerated(relativePath: string, options: PruneOptions): boolean {
    if (relativePath.endsWith(GENERATED_EXTENSION) || relativePath === GENERATED_MANIFEST || options.generatedFiles.includes(relativePath)) {
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

export function pruneResource(targetDir: string, keep: ReadonlySet<string>, options: PruneOptions, owned = true): PruneOutcome {
    if (!existsSync(targetDir)) {
        return { removed: [], refusal: null };
    }

    if (!owned) {
        return { removed: [], refusal: pruneRefusal(targetDir) };
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

    return { removed: removed.sort((left, right) => left.localeCompare(right)), refusal: null };
}
