import { resolveEngineVersions, type MtaVersionPair } from '@cli/build/mta-release';
import type { LuamConfig } from '@cli/config/config-schema';
import { emptyDeployment, type DeploymentSettings } from '@cli/config/deployment';
import type { Logger } from '@cli/reporting/logger';
import { createReporter, type Reporter } from '@cli/reporting/reporter';

export type VersionResolver = () => Promise<MtaVersionPair>;

export const NO_VERSION: MtaVersionPair = { server: null, client: null, warning: null };

export interface CommandContext {
    root: string;
    config: LuamConfig;
    deployment?: DeploymentSettings | null;
    logger: Logger;
    reporter?: Reporter;
    resolveVersion?: VersionResolver;
}

export function commandDeployment(context: CommandContext): DeploymentSettings {
    return context.deployment ?? emptyDeployment();
}

export function commandReporter(context: CommandContext): Reporter {
    return context.reporter ?? createReporter(context.logger);
}

export async function commandVersion(context: CommandContext): Promise<MtaVersionPair> {
    return context.resolveVersion === undefined ? resolveEngineVersions(context.root, context.config.engine, { skip: true }) : context.resolveVersion();
}
