import { isCountedPhase, PHASE_LABELS, PHASE_UNITS, type PhaseDuration } from '@cli/build/build-phase';
import type { BuildOutcome } from '@cli/build/build-runner';
import type { CommandContext } from '@cli/commands/command-context';
import { commandReporter } from '@cli/commands/command-context';
import {
    countCliDiagnostics,
    countFileDiagnostics,
    formatCounts,
    reportCliDiagnostics,
    reportFileDiagnostics,
} from '@cli/reporting/diagnostic-reporter';
import { formatDuration } from '@cli/reporting/duration';
import { pluralize } from '@cli/reporting/plural';
import type { Reporter } from '@cli/reporting/reporter';

const LABEL_WIDTH = 10;

function formatReuse(outcome: BuildOutcome): string {
    if (outcome.stats === null || outcome.stats.modulesReused === 0) {
        return '';
    }

    return `, ${outcome.stats.modulesReused} reused`;
}

function phaseDetail(phase: PhaseDuration): string {
    if (phase.state === 'failed') {
        return 'failed';
    }

    if (!isCountedPhase(phase.phase) || phase.total === 0) {
        return '';
    }

    return pluralize(phase.completed, PHASE_UNITS[phase.phase]);
}

export function totalDuration(phases: readonly PhaseDuration[]): number {
    return phases.reduce((sum, phase) => sum + phase.durationMs, 0);
}

export function reportPhaseTimings(reporter: Reporter, phases: readonly PhaseDuration[], totalMs: number): void {
    if (!reporter.capability.interactive || phases.length === 0) {
        return;
    }

    for (const phase of phases) {
        const label = PHASE_LABELS[phase.phase].padEnd(LABEL_WIDTH, ' ');
        const marker = reporter.style.marker(phase.state === 'failed' ? 'failure' : 'success');
        const tone = phase.state === 'failed' ? 'error' : 'success';
        const detail = phaseDetail(phase);
        const suffix = detail === '' ? '' : `  ${reporter.style.paint('muted', detail)}`;

        reporter.raw(`  ${reporter.style.paint(tone, marker)} ${label} ${formatDuration(phase.durationMs).padStart(8, ' ')}${suffix}`);
    }

    reporter.detail(`  ${'Total'.padEnd(LABEL_WIDTH, ' ')} ${formatDuration(totalMs).padStart(8, ' ')}`);
}

export function reportBuildOutcome(context: CommandContext, outcome: BuildOutcome, action: string): boolean {
    const reporter = commandReporter(context);

    reportCliDiagnostics(reporter, outcome.diagnostics);
    reportFileDiagnostics(reporter, outcome.fileDiagnostics, outcome.sources);

    const config = countCliDiagnostics(outcome.diagnostics);
    const files = countFileDiagnostics(outcome.fileDiagnostics);
    const counts = { errors: config.errors + files.errors, warnings: config.warnings + files.warnings };
    const duration = formatDuration(outcome.durationMs);

    if (outcome.build === null) {
        reporter.error(`${action} failed: ${formatCounts(counts)} in ${duration}.`);

        return false;
    }

    reporter.success(`${action} passed: ${pluralize(outcome.fileCount, 'file')}${formatReuse(outcome)}, ${formatCounts(counts)} in ${duration}.`);

    return true;
}
