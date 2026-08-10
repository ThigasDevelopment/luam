import { runCompile } from '@cli/build/build-runner';
import { createPhaseTracker } from '@cli/build/phase-tracker';
import { reportBuildOutcome, reportPhaseTimings, totalDuration } from '@cli/commands/build-report';
import { commandReporter, type CommandContext } from '@cli/commands/command-context';
import { EXIT_DIAGNOSTICS, EXIT_OK } from '@cli/cli/exit-codes';
import { createProgressRenderer } from '@cli/reporting/progress-renderer';

export function runCheckCommand(context: CommandContext): number {
    const reporter = commandReporter(context);
    const renderer = createProgressRenderer(reporter);
    const tracker = createPhaseTracker(renderer.listen);
    const outcome = runCompile(context.root, context.config, { tracker });

    renderer.clear();

    const passed = reportBuildOutcome(context, outcome, 'Check');

    reportPhaseTimings(reporter, tracker.durations(), totalDuration(tracker.durations()));

    return passed ? EXIT_OK : EXIT_DIAGNOSTICS;
}
