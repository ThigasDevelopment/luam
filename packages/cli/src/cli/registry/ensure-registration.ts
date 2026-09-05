import { listResources, resolveCommandTarget, resourceContext, type WorkspaceContext } from '@cli/cli/cli-runtime';
import { EXIT_OK, EXIT_USAGE } from '@cli/cli/exit-codes';
import { addLayoutOptions, addProjectOptions, addWatchOptions, noMapOption, offlineOption } from '@cli/cli/shared-options';
import { runEnsureCommand } from '@cli/commands/ensure-command';

import type { CliRuntime, ProjectOptions } from '@cli/cli/cli-runtime';
import type { Command } from 'commander';

interface EnsureOptions extends ProjectOptions {
    bundle?: boolean;
    watch?: boolean;
    map: boolean;
}

async function ensureWorkspaceResources(runtime: CliRuntime, workspace: WorkspaceContext, names: readonly string[], options: EnsureOptions): Promise<number> {
    if (names.length === 0) {
        runtime.reporter.error(`"luam ensure" at the workspace "${workspace.root}" needs a resource name. The resources there are ${listResources(workspace.resources)}.`);

        return EXIT_USAGE;
    }

    let code = EXIT_OK;

    for (const name of names) {
        const resource = resourceContext(runtime, workspace, 'ensure', name, options);

        if (resource.context === null) {
            return resource.error;
        }

        const outcome = await runEnsureCommand(resource.context, {
            watch: false,
            signal: runtime.overrides.signal ?? null,
            layout: options.bundle === true ? 'bundle' : 'tree',
            map: options.map && resource.context.config.output.map,
        });

        if (outcome !== EXIT_OK) {
            code = outcome;
        }
    }

    return code;
}

export function registerEnsureCommand(program: Command, runtime: CliRuntime): void {
    const command = program.command('ensure').description('Build, sync the resource into the MTA server, and restart it.');

    addWatchOptions(addLayoutOptions(addProjectOptions(command)))
        .argument('[resources...]', 'Resources to sync when the directory is a workspace root.')
        .addOption(noMapOption())
        .addOption(offlineOption());

    command.action(async (resources: string[], options: EnsureOptions): Promise<void> => {
        const target = resolveCommandTarget(runtime, 'ensure', options);

        if (target.kind === null) {
            runtime.exitCode = target.error;

            return;
        }

        if (target.kind === 'workspace') {
            runtime.exitCode = await ensureWorkspaceResources(runtime, target.workspace, resources, options);

            return;
        }

        if (resources.length > 0) {
            runtime.reporter.error(`"luam ensure" inside a resource directory takes no resource name, but received ${resources.map((name) => `"${name}"`).join(', ')}.`);
            runtime.exitCode = EXIT_USAGE;

            return;
        }

        runtime.exitCode = await runEnsureCommand(target.project, {
            watch: options.watch ?? true,
            signal: runtime.overrides.signal ?? null,
            layout: options.bundle === true ? 'bundle' : 'tree',
            map: options.map && target.project.config.output.map,
        });
    });
}
