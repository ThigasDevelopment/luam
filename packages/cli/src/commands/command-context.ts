import type { MtaVersion } from '@cli/build/mta-release';
import type { LuamConfig } from '@cli/config/config-schema';
import type { Logger } from '@cli/reporting/logger';
import { createReporter, type Reporter } from '@cli/reporting/reporter';

export type VersionResolver = () => Promise<MtaVersion>;

export const NO_VERSION: MtaVersion = { version: null, warning: null };

export interface CommandContext {
    root: string;
    config: LuamConfig;
    logger: Logger;
    reporter?: Reporter;
    resolveVersion?: VersionResolver;
}

export function commandReporter(context: CommandContext): Reporter {
    return context.reporter ?? createReporter(context.logger);
}

export async function commandVersion(context: CommandContext): Promise<MtaVersion> {
    return context.resolveVersion === undefined ? NO_VERSION : context.resolveVersion();
}
