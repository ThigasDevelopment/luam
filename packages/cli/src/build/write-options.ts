import type { PhaseTracker } from '@cli/build/phase-tracker';
import type { WriteOptions } from '@cli/build/resource-writer';
import type { AssetMapping, LuamConfig } from '@cli/config/config-schema';
import { normalizePattern, patternRoot, splitSegments } from '@compiler/project/path-pattern';
import { bundlePath, LIBRARY_DIRECTORY } from '@compiler/project/resource';

export function generatedFiles(): string[] {
    return [bundlePath('shared'), bundlePath('server'), bundlePath('client')];
}

function destinationRoot(mapping: AssetMapping): string {
    const to = normalizePattern(mapping.to);
    const base = to.length === 0 || to === '.' ? patternRoot(mapping.from) : to;

    return splitSegments(base)[0] ?? '';
}

export function generatedRoots(config: LuamConfig): string[] {
    const roots = config.assets.map(destinationRoot).filter((root) => root.length > 0);

    return [...new Set([...roots, LIBRARY_DIRECTORY])];
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
