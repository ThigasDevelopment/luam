import { runCompile } from '@cli/build/build-runner';
import { createPhaseTracker } from '@cli/build/phase-tracker';
import { writeResourceMap } from '@cli/build/resource-map-file';
import { writeResource, type WriteResult } from '@cli/build/resource-writer';
import { productionWriteOptions } from '@cli/build/write-options';
import { reportBuildOutcome, reportPhaseTimings, totalDuration } from '@cli/commands/build-report';
import { commandReporter, commandVersion, type CommandContext } from '@cli/commands/command-context';
import { resolveBuildTarget } from '@cli/commands/resource-targets';
import { EXIT_DIAGNOSTICS, EXIT_OK } from '@cli/cli/exit-codes';
import { pluralize } from '@cli/reporting/plural';
import { createProgressRenderer } from '@cli/reporting/progress-renderer';
import type { OutputLayout, ResourceMap } from '@compiler/project/resource';

export interface BuildCommandOptions {
    layout?: OutputLayout;
    map?: boolean;
    minify?: boolean;
}

function writtenMap(map: ResourceMap | null, minified: boolean): ResourceMap | null {
    return map === null ? null : { ...map, minified };
}

export async function runBuildCommand(context: CommandContext, options: BuildCommandOptions = {}): Promise<number> {
    const reporter = commandReporter(context);
    const renderer = createProgressRenderer(reporter);
    const tracker = createPhaseTracker(renderer.listen);

    tracker.begin('version');

    const version = await commandVersion(context);
    const layout = options.layout ?? (context.config.output.bundle ? 'bundle' : 'tree');
    const minify = options.minify ?? context.config.output.minify;
    const outcome = runCompile(context.root, context.config, {
        tracker,
        minMtaVersion: version.version,
        development: !minify,
        layout,
        map: options.map ?? context.config.output.map,
    });

    renderer.clear();

    if (version.warning !== null) {
        reporter.warn(version.warning);
    }

    if (outcome.build === null) {
        reportBuildOutcome(context, outcome, 'Build');
        reportPhaseTimings(reporter, tracker.durations(), totalDuration(tracker.durations()));

        return EXIT_DIAGNOSTICS;
    }

    const target = resolveBuildTarget(context.root, context.config);

    tracker.begin('write');

    const writeOptions = productionWriteOptions(context.root, context.config, outcome.environmentTemplate, tracker, minify);
    let result: WriteResult;

    try {
        result = writeResource(target, outcome.build, writeOptions);
    } catch (error: unknown) {
        tracker.end('failed');
        renderer.clear();
        reporter.error(`Build wrote nothing to "${target}". ${error instanceof Error ? error.message : String(error)}`);

        return EXIT_DIAGNOSTICS;
    }

    writeResourceMap(context.root, context.config, writtenMap(outcome.map, minify));

    tracker.end();
    renderer.clear();
    reportBuildOutcome(context, outcome, 'Build');

    const counts = `${result.unchanged} unchanged, ${result.removed.length} removed`;

    reporter.info(`Wrote ${pluralize(result.written.length, 'file')} to "${target}" (${counts}).`);
    reportPhaseTimings(reporter, tracker.durations(), totalDuration(tracker.durations()));

    return EXIT_OK;
}
