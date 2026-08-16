import { runCompile, type BuildOutcome } from '@cli/build/build-runner';
import { createPhaseTracker, type PhaseTracker } from '@cli/build/phase-tracker';
import { writeResource, type WriteResult } from '@cli/build/resource-writer';
import { trackedWriteOptions } from '@cli/build/write-options';
import { reportBuildOutcome, reportPhaseTimings, totalDuration } from '@cli/commands/build-report';
import { commandReporter, commandVersion, type CommandContext } from '@cli/commands/command-context';
import { resolveServerTarget } from '@cli/commands/resource-targets';
import { pluralize } from '@cli/reporting/plural';
import { createProgressRenderer, type ProgressRenderer } from '@cli/reporting/progress-renderer';
import type { Reporter } from '@cli/reporting/reporter';
import type { MtaTransport } from '@cli/transport/transport';
import { createProjectCache, type ProjectCache } from '@compiler/project/project-cache';
import type { OutputLayout } from '@compiler/project/resource';

export interface EnsureResult {
    ok: boolean;
    outcome: BuildOutcome;
    sync: WriteResult | null;
    restarted: boolean;
}

export interface EnsureRunner {
    target: string;
    run(): Promise<EnsureResult>;
}

export interface EnsureRunnerOptions {
    developmentLogs?: CommandContext['config']['development']['logs'] | null;
    layout?: OutputLayout;
    map?: boolean;
}

interface RunScope {
    context: CommandContext;
    reporter: Reporter;
    renderer: ProgressRenderer;
    tracker: PhaseTracker;
}

function hasChanges(result: WriteResult): boolean {
    return result.written.length > 0 || result.removed.length > 0;
}

async function restartResource(scope: RunScope, transport: MtaTransport): Promise<boolean> {
    const { reporter, tracker, renderer } = scope;

    tracker.begin('restart');

    const refreshed = await transport.refresh();

    if (!refreshed.ok) {
        tracker.end('failed');
        renderer.clear();
        reporter.error(`Refresh failed: ${refreshed.message}`);

        return false;
    }

    const restarted = await transport.restart(scope.context.config.name);

    tracker.end(restarted.ok ? 'done' : 'failed');
    renderer.clear();

    if (!restarted.ok) {
        reporter.error(`Restart failed: ${restarted.message}`);

        return false;
    }

    reporter.success(`Restarted "${scope.context.config.name}" through the "${transport.kind}" transport.`);

    return true;
}

function failed(outcome: BuildOutcome): EnsureResult {
    return { ok: false, outcome, sync: null, restarted: false };
}

async function runOnce(scope: RunScope, transport: MtaTransport, target: string, cache: ProjectCache, options: EnsureRunnerOptions): Promise<EnsureResult> {
    const { context, reporter, renderer, tracker } = scope;

    tracker.begin('version');

    const version = await commandVersion(context);
    const outcome = runCompile(context.root, context.config, {
        cache,
        tracker,
        minMtaVersion: version.version,
        developmentLogs: options.developmentLogs ?? null,
        layout: options.layout ?? 'tree',
        map: options.map ?? context.config.output.map,
    });

    renderer.clear();

    if (version.warning !== null) {
        reporter.warn(version.warning);
    }

    if (outcome.build === null) {
        reportBuildOutcome(context, outcome, 'Build');
        reporter.warn('Skipping sync and restart because the build reported errors.');

        return failed(outcome);
    }

    const writeOptions = trackedWriteOptions(context.root, context.config, outcome.environmentTemplate, tracker);

    reportBuildOutcome(context, outcome, 'Build');

    tracker.begin('sync');

    const sync = writeResource(target, outcome.build, writeOptions);

    tracker.end();
    renderer.clear();
    reporter.info(`Synced ${pluralize(sync.written.length, 'file')} to "${target}" (${sync.removed.length} removed).`);

    if (transport.kind === 'none' || !hasChanges(sync)) {
        return { ok: true, outcome, sync, restarted: false };
    }

    return { ok: true, outcome, sync, restarted: await restartResource(scope, transport) };
}

export function createEnsureRunner(context: CommandContext, transport: MtaTransport, options: EnsureRunnerOptions = {}): EnsureRunner {
    const target = resolveServerTarget(context.root, context.config);

    if (target === null) {
        throw new Error('Cannot create an ensure runner without serverPath.');
    }

    const cache = createProjectCache();
    const reporter = commandReporter(context);

    return {
        target,
        run: async (): Promise<EnsureResult> => {
            const renderer = createProgressRenderer(reporter);
            const tracker = createPhaseTracker(renderer.listen);
            const scope: RunScope = { context, reporter, renderer, tracker };
            const result = await runOnce(scope, transport, target, cache, options);

            renderer.clear();
            reportPhaseTimings(reporter, tracker.durations(), totalDuration(tracker.durations()));

            return result;
        },
    };
}
