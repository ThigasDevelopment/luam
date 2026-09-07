import { isAbsolute } from 'node:path';

import { runCompile, type BuildOutcome } from '@cli/build/build-runner';
import { writeResourceContract } from '@cli/build/contract-files';
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
    onOutcome?: (outcome: BuildOutcome) => void;
}

function writtenMap(map: ResourceMap | null, minified: boolean): ResourceMap | null {
    return map === null ? null : { ...map, minified };
}

function writeFailure(output: string, target: string, error: unknown): string {
    const reason = error instanceof Error ? error.message : String(error);
    const detail = /[.!?]$/.test(reason) ? reason : `${reason}.`;
    const outside = isAbsolute(output)
        ? ` "build.output" is "${output}", which starts at the filesystem root rather than inside the project. Write it without the leading separator to mean a directory beside the manifest.`
        : '';

    return `Build wrote nothing to "${target}". ${detail}${outside}`;
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
        minServerVersion: version.server,
        minClientVersion: version.client,
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
        options.onOutcome?.(outcome);

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
        reporter.error(writeFailure(context.config.outDir, target, error));
        options.onOutcome?.(outcome);

        return EXIT_DIAGNOSTICS;
    }

    writeResourceMap(context.root, context.config, writtenMap(outcome.map, minify));

    if (outcome.contract !== null && outcome.contract.exports.length > 0) {
        writeResourceContract(context.root, context.config, outcome.contract);
    }

    tracker.end();
    renderer.clear();
    reportBuildOutcome(context, outcome, 'Build');

    const counts = `${result.unchanged} unchanged, ${result.removed.length} removed`;

    reporter.info(`Wrote ${pluralize(result.written.length, 'file')} to "${target}" (${counts}).`);

    if (result.refusal !== null) {
        reporter.warn(result.refusal);
    }

    reportPhaseTimings(reporter, tracker.durations(), totalDuration(tracker.durations()));
    options.onOutcome?.(outcome);

    return EXIT_OK;
}
