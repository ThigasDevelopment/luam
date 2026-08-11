import type { PhaseTracker } from '@cli/build/phase-tracker';
import type { WriteOptions } from '@cli/build/resource-writer';
import type { LuamConfig } from '@cli/config/config-schema';
import { bundlePath, LIBRARY_DIRECTORY } from '@compiler/project/resource';

export function generatedFiles(): string[] {
    return [bundlePath('shared'), bundlePath('server'), bundlePath('client')];
}

export function generatedRoots(config: LuamConfig): string[] {
    return [...new Set([...config.assetDirs, LIBRARY_DIRECTORY])];
}

export function trackedWriteOptions(root: string, config: LuamConfig, environmentTemplate: string | null, tracker: PhaseTracker): WriteOptions {
    return {
        root,
        generatedFiles: generatedFiles(),
        generatedRoots: generatedRoots(config),
        environmentTemplate,
        onProgress: (event): void => {
            tracker.advance(event.item, event.index, event.total);
        },
    };
}

export function productionWriteOptions(root: string, config: LuamConfig, environmentTemplate: string | null, tracker: PhaseTracker): WriteOptions {
    return { ...trackedWriteOptions(root, config, environmentTemplate, tracker), minify: true };
}
