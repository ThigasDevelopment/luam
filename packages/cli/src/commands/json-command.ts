import { EXIT_OK } from '@cli/cli/exit-codes';
import { buildReport, writeReport, REPORT_SCHEMA_VERSION, type JsonReport } from '@cli/reporting/json-report';
import { createSilentLogger, createSilentReporter } from '@cli/reporting/silent';
import { VERSION } from '@cli/cli/version';

import type { BuildOutcome } from '@cli/build/build-runner';
import type { CommandContext } from '@cli/commands/command-context';
import type { Logger } from '@cli/reporting/logger';

export interface JsonCapture {
    context: CommandContext;
    outcome(): BuildOutcome | null;
    record(outcome: BuildOutcome): void;
}

function emptyReport(command: string, success: boolean): JsonReport {
    return {
        version: REPORT_SCHEMA_VERSION,
        luam: VERSION,
        command,
        success,
        diagnostics: [],
        summary: { errors: success ? 0 : 1, warnings: 0, files: 0, durationMs: 0 },
    };
}

export function captureJson(context: CommandContext): JsonCapture {
    let captured: BuildOutcome | null = null;

    return {
        context: { ...context, logger: createSilentLogger(), reporter: createSilentReporter() },
        outcome: (): BuildOutcome | null => captured,
        record: (outcome: BuildOutcome): void => {
            captured = outcome;
        },
    };
}

export function emitJson(logger: Logger, command: string, capture: JsonCapture, code: number): number {
    const outcome = capture.outcome();
    const success = code === EXIT_OK;

    writeReport(logger, outcome === null ? emptyReport(command, success) : buildReport(command, outcome, success));

    return code;
}
