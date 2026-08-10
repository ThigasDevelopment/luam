import { basename } from 'node:path';

import { EXIT_OK, EXIT_USAGE } from '@cli/cli/exit-codes';
import { isValidResourceName } from '@cli/config/config-schema';
import type { Logger } from '@cli/reporting/logger';
import { buildScaffoldPlan } from '@cli/scaffold/scaffold-plan';
import { writeScaffold } from '@cli/scaffold/scaffold-writer';

export interface InitOptions {
    name: string | null;
    force: boolean;
}

export const FALLBACK_RESOURCE_NAME = 'luam-resource';

export function resolveResourceName(root: string, requested: string | null): string {
    if (requested !== null) {
        return requested;
    }

    const folder = basename(root);

    return isValidResourceName(folder) ? folder : FALLBACK_RESOURCE_NAME;
}

export function runInitCommand(root: string, logger: Logger, options: InitOptions): number {
    if (options.name !== null && !isValidResourceName(options.name)) {
        logger.error(`"--name" must be a valid MTA resource name but received "${options.name}".`);

        return EXIT_USAGE;
    }

    const name = resolveResourceName(root, options.name);
    const result = writeScaffold(root, buildScaffoldPlan(name), options.force);

    for (const path of result.skipped) {
        logger.warn(`Kept the existing "${path}". Pass "--force" to overwrite it.`);
    }

    if (result.written.length === 0) {
        logger.info(`The project "${name}" already exists in "${root}". Nothing was written.`);

        return EXIT_OK;
    }

    logger.info(`Scaffolded "${name}" into "${root}" (${result.written.length} files, ${result.skipped.length} kept).`);
    logger.info('Next: run "luam check", then "luam build".');

    return EXIT_OK;
}
