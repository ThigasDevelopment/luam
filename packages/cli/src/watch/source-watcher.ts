import { existsSync, watch, type FSWatcher } from 'node:fs';
import { relative, resolve } from 'node:path';

import type { SourceMapping } from '@compiler/manifest/manifest-contract';
import { normalizePattern } from '@compiler/project/path-pattern';
import { createSourceResolver } from '@compiler/project/source-mapping';
import { SOURCE_EXTENSION } from '@compiler/project/source-kind';

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

        return path.endsWith(SOURCE_EXTENSION) && resolver.resolve(path).matches.length > 0;
    };

    for (const entry of resolver.roots) {
        const absolute = resolve(root, entry);

        if (!existsSync(absolute)) {
            continue;
        }

        watchers.push(
            watch(absolute, { recursive: true }, (_event, filename) => {
                if (filename !== null && isWatched(absolute, filename.toString())) {
                    schedule();
                }
            }),
        );
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
