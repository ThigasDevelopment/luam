import { existsSync, watch, type FSWatcher } from 'node:fs';

import { DEFAULT_DEBOUNCE_MS, type SourceWatcher } from '@cli/watch/source-watcher';

export function watchManifest(path: string, onChange: () => void, debounceMs = DEFAULT_DEBOUNCE_MS): SourceWatcher {
    let timer: NodeJS.Timeout | null = null;
    let watcher: FSWatcher | null = null;

    const clear = (): void => {
        if (timer !== null) {
            clearTimeout(timer);
            timer = null;
        }
    };

    if (existsSync(path)) {
        watcher = watch(path, () => {
            clear();
            timer = setTimeout(() => {
                timer = null;
                onChange();
            }, debounceMs);
        });
    }

    return {
        close: (): void => {
            clear();
            watcher?.close();
        },
    };
}
