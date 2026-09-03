import { readdirSync, statSync, type Dirent } from 'node:fs';
import { join, relative, resolve } from 'node:path';

import { EXCLUDED_DIRECTORIES, isExcludedPath, normalizePattern } from '@compiler/project/path-pattern';

export interface ProjectTree {
    files: string[];
    errors: string[];
}

function isDirectory(path: string): boolean {
    try {
        return statSync(path).isDirectory();
    } catch {
        return false;
    }
}

function relativePath(root: string, absolute: string): string {
    return normalizePattern(relative(root, absolute));
}

function walk(root: string, directory: string, excluded: readonly string[], tree: ProjectTree): void {
    let entries: Dirent[];

    try {
        entries = readdirSync(directory, { withFileTypes: true });
    } catch (error: unknown) {
        tree.errors.push(`"${relativePath(root, directory)}" could not be read: ${error instanceof Error ? error.message : String(error)}`);

        return;
    }

    for (const entry of entries) {
        const absolute = join(directory, entry.name);
        const path = relativePath(root, absolute);

        if (path.length === 0 || isExcludedPath(path, excluded)) {
            continue;
        }

        if (entry.isDirectory()) {
            walk(root, absolute, excluded, tree);
        } else if (entry.isFile()) {
            tree.files.push(path);
        }
    }
}

export function listRootFiles(root: string, excluded: readonly string[] = []): string[] {
    let entries: Dirent[];

    try {
        entries = readdirSync(root, { withFileTypes: true });
    } catch {
        return [];
    }

    const files: string[] = [];

    for (const entry of entries) {
        const path = normalizePattern(entry.name);

        if (entry.isFile() && path.length > 0 && !isExcludedPath(path, excluded)) {
            files.push(path);
        }
    }

    return files.sort();
}

export function listProjectFiles(root: string, roots: readonly string[], excluded: readonly string[] = []): ProjectTree {
    const tree: ProjectTree = { files: [], errors: [] };
    const seen = new Set<string>();

    for (const start of [...new Set(roots)].sort()) {
        const absolute = resolve(root, start);

        if (!isDirectory(absolute) || seen.has(absolute)) {
            continue;
        }

        seen.add(absolute);
        walk(root, absolute, excluded, tree);
    }

    return { files: [...new Set(tree.files)].sort(), errors: tree.errors };
}

export { EXCLUDED_DIRECTORIES };
