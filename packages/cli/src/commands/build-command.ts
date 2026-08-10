import { runCompile } from '@cli/build/build-runner';
import { createPhaseTracker } from '@cli/build/phase-tracker';
import { writeResource } from '@cli/build/resource-writer';
import { trackedWriteOptions } from '@cli/build/write-options';
import { reportBuildOutcome, reportPhaseTimings, totalDuration } from '@cli/commands/build-report';
import { commandReporter, commandVersion, type CommandContext } from '@cli/commands/command-context';
import { resolveBuildTarget } from '@cli/commands/resource-targets';
import { EXIT_DIAGNOSTICS, EXIT_OK } from '@cli/cli/exit-codes';
import { pluralize } from '@cli/reporting/plural';
import { createProgressRenderer } from '@cli/reporting/progress-renderer';

export async function runBuildCommand(context: CommandContext): Promise<number> {
    const reporter = commandReporter(context);
    const renderer = createProgressRenderer(reporter);
    const tracker = createPhaseTracker(renderer.listen);

    tracker.begin('version');

    const version = await commandVersion(context);
    const outcome = runCompile(context.root, context.config, { tracker, minMtaVersion: version.version });

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

    const options = trackedWriteOptions(context.root, context.config, outcome.environmentTemplate, tracker);
    const result = writeResource(target, outcome.build, options);

    tracker.end();
    renderer.clear();
    reportBuildOutcome(context, outcome, 'Build');

    const counts = `${result.unchanged} unchanged, ${result.removed.length} removed`;

    reporter.info(`Wrote ${pluralize(result.written.length, 'file')} to "${target}" (${counts}).`);
    reportPhaseTimings(reporter, tracker.durations(), totalDuration(tracker.durations()));

    return EXIT_OK;
}
