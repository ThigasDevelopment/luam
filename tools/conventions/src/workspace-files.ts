import { readdirSync } from 'node:fs';
import { join, relative } from 'node:path';

export const SOURCE_ROOTS: readonly string[] = ['packages', 'tools', 'docs/scripts'];

const EXCLUDED = new Set(['node_modules', 'dist', 'generated', '.git', '.luam', 'out']);

const SOURCE_FILE = /\.(ts|tsx|js|jsx|mjs|cjs)$/;

export function listSourceFiles(root: string, roots: readonly string[] = SOURCE_ROOTS): string[] {
    const files: string[] = [];

    for (const start of roots) {
        let entries;

        try {
            entries = readdirSync(join(root, start), { recursive: true, withFileTypes: true });
        } catch {
            continue;
        }

        for (const entry of entries) {
            const path = relative(root, join(entry.parentPath, entry.name)).split('\\').join('/');

            if (!entry.isFile() || !SOURCE_FILE.test(entry.name) || path.split('/').some((segment) => EXCLUDED.has(segment))) {
                continue;
            }

            files.push(path);
        }
    }

    return [...new Set(files)].sort();
}
