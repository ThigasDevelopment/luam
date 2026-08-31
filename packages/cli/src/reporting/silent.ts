import { PLAIN_CAPABILITY } from '@cli/reporting/output-capability';
import { createReporter, type Reporter } from '@cli/reporting/reporter';

import type { Logger } from '@cli/reporting/logger';

export function createSilentLogger(): Logger {
    return {
        info: (): void => undefined,
        warn: (): void => undefined,
        error: (): void => undefined,
    };
}

export function createSilentReporter(): Reporter {
    return createReporter(createSilentLogger(), PLAIN_CAPABILITY, (): void => undefined);
}
