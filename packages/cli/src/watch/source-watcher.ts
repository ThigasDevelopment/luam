import { existsSync, watch, type FSWatcher } from 'node:fs';
import { resolve } from 'node:path';

export interface SourceWatcher {
    close(): void;
}

export const DEFAULT_DEBOUNCE_MS = 120;

const SOURCE_EXTENSION = '.luam';

export function watchSources(root: string, sourceDirs: readonly string[], onChange: () => void, debounceMs = DEFAULT_DEBOUNCE_MS): SourceWatcher {
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

    for (const directory of sourceDirs) {
        const absolute = resolve(root, directory);

        if (!existsSync(absolute)) {
            continue;
        }

        watchers.push(
            watch(absolute, { recursive: true }, (_event, filename) => {
                if (filename === null || !filename.toString().endsWith(SOURCE_EXTENSION)) {
                    return;
                }

                schedule();
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
