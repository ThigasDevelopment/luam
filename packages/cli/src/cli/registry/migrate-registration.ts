import { commandRoot } from '@cli/cli/cli-runtime';
import { addProjectOptions } from '@cli/cli/shared-options';
import { runMigrateCommand } from '@cli/commands/migrate-command';
import { resolveManifestPath } from '@cli/config/manifest-loader';

import type { CliRuntime, ProjectOptions } from '@cli/cli/cli-runtime';
import type { Command } from 'commander';

interface MigrateOptions extends ProjectOptions {
    check?: boolean;
}

export function registerMigrateCommand(program: Command, runtime: CliRuntime): void {
    const command = program.command('migrate').description('Rewrite an assignment-form manifest as the one table of sections it is now.');

    addProjectOptions(command).option('--check', 'Report the rewrite without writing it.');

    command.action((options: MigrateOptions): void => {
        const root = commandRoot(runtime, options);

        runtime.exitCode = runMigrateCommand({
            root,
            manifestPath: resolveManifestPath(root, options.manifest ?? null),
            reporter: runtime.reporter,
            check: options.check === true,
        });
    });
}
