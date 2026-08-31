import { runCompile } from '@cli/build/build-runner';
import { createPhaseTracker } from '@cli/build/phase-tracker';
import { reportBuildOutcome, reportPhaseTimings, totalDuration } from '@cli/commands/build-report';
import { commandReporter, type CommandContext } from '@cli/commands/command-context';
import { EXIT_DIAGNOSTICS, EXIT_OK } from '@cli/cli/exit-codes';
import { createProgressRenderer } from '@cli/reporting/progress-renderer';
import { reportRebuildSeparator } from '@cli/reporting/rebuild-separator';
import { untilAborted } from '@cli/watch/abort-wait';
import { watchManifest } from '@cli/watch/manifest-watcher';
import { watchedRoots, watchSources, type SourceWatcher } from '@cli/watch/source-watcher';
import { createProjectCache, type ProjectCache } from '@compiler/project/project-cache';

import type { BuildOutcome } from '@cli/build/build-runner';
import type { LuamConfig } from '@cli/config/config-schema';

export type ManifestReloader = () => LuamConfig | null;

export interface CheckRunOptions {
    cache?: ProjectCache;
    onOutcome?: (outcome: BuildOutcome) => void;
}

export interface CheckWatchOptions {
    signal: AbortSignal | null;
    manifestPath: string;
    reload: ManifestReloader;
}

export function runCheckCommand(context: CommandContext, options: CheckRunOptions = {}): number {
    const reporter = commandReporter(context);
    const renderer = createProgressRenderer(reporter);
    const tracker = createPhaseTracker(renderer.listen);
    const cache = options.cache;
    const outcome = runCompile(context.root, context.config, cache === undefined ? { tracker } : { tracker, cache });

    renderer.clear();

    const passed = reportBuildOutcome(context, outcome, 'Check');

    reportPhaseTimings(reporter, tracker.durations(), totalDuration(tracker.durations()));
    options.onOutcome?.(outcome);

    return passed ? EXIT_OK : EXIT_DIAGNOSTICS;
}

export async function runCheckWatch(context: CommandContext, options: CheckWatchOptions): Promise<number> {
    const reporter = commandReporter(context);
    let config = context.config;
    let cache = createProjectCache();
    const sources: SourceWatcher[] = [];
    let running = false;
    let queued = false;

    const announce = (): void => {
        const roots = watchedRoots(config.sources).map((entry) => `"${entry.length === 0 ? '.' : entry}"`);

        reporter.info(`Watching ${roots.join(', ')} for changes. Press Ctrl+C to stop.`);
    };

    const recheck = (): void => {
        if (running) {
            queued = true;

            return;
        }

        running = true;

        do {
            queued = false;

            reportRebuildSeparator(reporter);
            runCheckCommand({ ...context, config }, { cache });
        } while (queued);

        running = false;
    };

    const listen = (): void => {
        for (const watcher of sources.splice(0)) {
            watcher.close();
        }

        sources.push(watchSources(context.root, config.sources, recheck));
    };

    const reconfigure = (): void => {
        const reloaded = options.reload();

        if (reloaded !== null) {
            config = reloaded;
        }

        cache = createProjectCache();

        listen();
        recheck();
        announce();
    };

    runCheckCommand(context, { cache });
    listen();

    const manifest = watchManifest(options.manifestPath, reconfigure);

    announce();

    await untilAborted(options.signal);

    manifest.close();

    for (const watcher of sources.splice(0)) {
        watcher.close();
    }

    return EXIT_OK;
}
