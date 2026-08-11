import { basename } from 'node:path';

import { EXIT_OK, EXIT_USAGE } from '@cli/cli/exit-codes';
import { promptForProject, type InitPrompt, type InitProjectDetails } from '@cli/commands/init-prompt';
import { isValidResourceName } from '@cli/config/config-schema';
import type { Logger } from '@cli/reporting/logger';
import { buildScaffoldPlan } from '@cli/scaffold/scaffold-plan';
import { writeScaffold } from '@cli/scaffold/scaffold-writer';

export interface InitOptions {
    name: string | null;
    force: boolean;
    yes: boolean;
    prompt: InitPrompt;
}

export const FALLBACK_RESOURCE_NAME = 'luam-resource';

export function resolveResourceName(root: string, requested: string | null): string {
    if (requested !== null) {
        return requested;
    }

    const folder = basename(root);

    return isValidResourceName(folder) ? folder : FALLBACK_RESOURCE_NAME;
}

export async function runInitCommand(root: string, logger: Logger, options: InitOptions): Promise<number> {
    if (options.name !== null && !isValidResourceName(options.name)) {
        logger.error(`"--name" must be a valid MTA resource name but received "${options.name}".`);

        return EXIT_USAGE;
    }

    const defaults: InitProjectDetails = {
        name: resolveResourceName(root, options.name),
        version: '1.0.0',
        description: null,
        author: null,
    };
    const details = options.yes ? defaults : await options.prompt(defaults, options.name !== null);

    if (!isValidResourceName(details.name)) {
        logger.error(`"Project name" must be a valid MTA resource name but received "${details.name}".`);

        return EXIT_USAGE;
    }

    const result = writeScaffold(root, buildScaffoldPlan(details), options.force);

    for (const path of result.skipped) {
        logger.warn(`Kept the existing "${path}". Pass "--force" to overwrite it.`);
    }

    if (result.written.length === 0) {
        logger.info(`The project "${details.name}" already exists in "${root}". Nothing was written.`);

        return EXIT_OK;
    }

    logger.info(`Scaffolded "${details.name}" into "${root}" (${result.written.length} files, ${result.skipped.length} kept).`);
    logger.info('Next: run "luam check", then "luam build".');

    return EXIT_OK;
}
