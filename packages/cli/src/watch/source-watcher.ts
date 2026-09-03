import { existsSync, watch, type FSWatcher } from 'node:fs';
import { relative, resolve } from 'node:path';

import type { SourceMapping } from '@compiler/manifest/manifest-contract';
import { normalizePattern } from '@compiler/project/path-pattern';
import { createSourceResolver } from '@compiler/project/source-mapping';
import { isTestPath, SOURCE_EXTENSION } from '@compiler/project/source-kind';

export interface SourceWatcher {
    close(): void;
}

export const DEFAULT_DEBOUNCE_MS = 120;

export function watchSources(root: string, sources: SourceMapping, onChange: () => void, debounceMs = DEFAULT_DEBOUNCE_MS): SourceWatcher {
    const resolver = createSourceResolver(sources);
    const watchers: FSWatcher[] = [];
    let timer: NodeJS.Timeout | null = null;

    const schedule = (): void => {
        if (timer !== null) {
            clearTimeout(timer);
        }

        timer = setTimeout(() => {
            timer = null;
            onChange();
        }, debounceMs);
    };

    const isWatched = (directory: string, filename: string): boolean => {
        const path = normalizePattern(relative(root, resolve(directory, filename)));

        if (!path.endsWith(SOURCE_EXTENSION) || isTestPath(path)) {
            return false;
        }

        return resolver.resolve(path).matches.length > 0 || !path.includes('/');
    };

    const observe = (absolute: string, recursive: boolean): void => {
        if (!existsSync(absolute)) {
            return;
        }

        watchers.push(
            watch(absolute, { recursive }, (_event, filename) => {
                if (filename !== null && isWatched(absolute, filename.toString())) {
                    schedule();
                }
            }),
        );
    };

    for (const entry of resolver.roots) {
        observe(resolve(root, entry), true);
    }

    if (!resolver.roots.includes('')) {
        observe(root, false);
    }

    return {
        close: (): void => {
            if (timer !== null) {
                clearTimeout(timer);
                timer = null;
            }

            for (const watcher of watchers) {
                watcher.close();
            }
        },
    };
}

export function watchedRoots(sources: SourceMapping): readonly string[] {
    return createSourceResolver(sources).roots;
}
