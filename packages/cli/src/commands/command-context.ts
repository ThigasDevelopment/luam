import type { MtaVersion } from '@cli/build/mta-release';
import type { LuamConfig } from '@cli/config/config-schema';
import { manifestDeployment, type DeploymentSettings } from '@cli/config/deployment';
import type { Logger } from '@cli/reporting/logger';
import { createReporter, type Reporter } from '@cli/reporting/reporter';

export type VersionResolver = () => Promise<MtaVersion>;

export const NO_VERSION: MtaVersion = { version: null, warning: null };

export interface CommandContext {
    root: string;
    config: LuamConfig;
    deployment?: DeploymentSettings | null;
    logger: Logger;
    reporter?: Reporter;
    resolveVersion?: VersionResolver;
}

export function commandDeployment(context: CommandContext): DeploymentSettings {
    return context.deployment ?? manifestDeployment(context.root, context.config);
}

export function commandReporter(context: CommandContext): Reporter {
    return context.reporter ?? createReporter(context.logger);
}

export async function commandVersion(context: CommandContext): Promise<MtaVersion> {
    return context.resolveVersion === undefined ? NO_VERSION : context.resolveVersion();
}
