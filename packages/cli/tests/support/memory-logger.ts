import type { Logger } from '@cli/reporting/logger';
import { PLAIN_CAPABILITY, RICH_CAPABILITY, type OutputCapability } from '@cli/reporting/output-capability';
import { createReporter, type Reporter } from '@cli/reporting/reporter';

export interface MemoryLogger extends Logger {
    lines: string[];
    errors: string[];
    warnings: string[];
    text(): string;
}

export interface MemoryReporter {
    logger: MemoryLogger;
    reporter: Reporter;
    painted: string[];
    paint(text: string): void;
    output(): string;
}

export function createMemoryLogger(): MemoryLogger {
    const lines: string[] = [];
    const errors: string[] = [];
    const warnings: string[] = [];

    return {
        lines,
        errors,
        warnings,
        info: (message: string): void => {
            lines.push(message);
        },
        warn: (message: string): void => {
            lines.push(message);
            warnings.push(message);
        },
        error: (message: string): void => {
            lines.push(message);
            errors.push(message);
        },
        text: (): string => lines.join('\n'),
    };
}

export function createMemoryReporter(capability: OutputCapability = PLAIN_CAPABILITY): MemoryReporter {
    const logger = createMemoryLogger();
    const painted: string[] = [];
    const paint = (text: string): void => {
        painted.push(text);
    };

    return {
        logger,
        reporter: createReporter(logger, capability, paint),
        painted,
        paint,
        output: (): string => [...logger.lines, ...painted].join('\n'),
    };
}

export function createTtyReporter(overrides: Partial<OutputCapability> = {}): MemoryReporter {
    return createMemoryReporter({ ...RICH_CAPABILITY, ...overrides });
}
