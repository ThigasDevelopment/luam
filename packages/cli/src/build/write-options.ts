import type { PhaseTracker } from '@cli/build/phase-tracker';
import type { WriteOptions } from '@cli/build/resource-writer';
import type { FileEntry, LuamConfig } from '@cli/config/config-schema';
import { normalizePattern, patternRoot, splitSegments } from '@compiler/project/path-pattern';
import { bundlePath, LIBRARIES_DIRECTORY, LIBRARY_DIRECTORY } from '@compiler/project/resource';

export function generatedFiles(): string[] {
    return [bundlePath('shared'), bundlePath('server'), bundlePath('client')];
}

function destinationRoot(entry: FileEntry): string {
    return splitSegments(patternRoot(normalizePattern(entry.path)))[0] ?? '';
}

export function generatedRoots(config: LuamConfig): string[] {
    const roots = config.files.map(destinationRoot).filter((root) => root.length > 0);

    return [...new Set([...roots, LIBRARY_DIRECTORY, LIBRARIES_DIRECTORY])];
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

export function productionWriteOptions(
    root: string,
    config: LuamConfig,
    environmentTemplate: string | null,
    tracker: PhaseTracker,
    minify?: boolean,
): WriteOptions {
    return { ...trackedWriteOptions(root, config, environmentTemplate, tracker), minify: minify ?? config.output.minify };
}
