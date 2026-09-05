import { resolveCommandTarget, resourceContext, runtimeProcessService } from '@cli/cli/cli-runtime';
import { EXIT_USAGE } from '@cli/cli/exit-codes';
import { addProjectOptions, addWatchOptions, noMapOption, offlineOption } from '@cli/cli/shared-options';
import { runDevCommand } from '@cli/commands/dev-command';
import { runWorkspaceDevCommand, START_SERVER_AT_A_WORKSPACE } from '@cli/session/workspace-dev-command';

import { Option } from 'commander';

import type { CliRuntime, ProjectOptions } from '@cli/cli/cli-runtime';
import type { CommandContext } from '@cli/commands/command-context';
import type { Command } from 'commander';

interface DevOptions extends ProjectOptions {
    watch?: boolean;
    map: boolean;
    startServer?: boolean;
}

export function registerDevCommand(program: Command, runtime: CliRuntime): void {
    const command = program.command('dev').description('Build, sync, restart, watch, and stream resource development logs.');

    addWatchOptions(addProjectOptions(command))
        .addOption(noMapOption())
        .addOption(offlineOption())
        .addOption(new Option('--start-server', 'Start and own the configured local MTA server before development.'));

    command.action(async (options: DevOptions): Promise<void> => {
        const target = resolveCommandTarget(runtime, 'dev', options);

        if (target.kind === null) {
            runtime.exitCode = target.error;

            return;
        }

        if (target.kind === 'workspace') {
            if (options.startServer === true) {
                runtime.reporter.error(START_SERVER_AT_A_WORKSPACE);
                runtime.exitCode = EXIT_USAGE;

                return;
            }

            const workspace = target.workspace;
            const deployment = workspace.workspace.deployment;

            if (deployment === null) {
                runtime.exitCode = EXIT_USAGE;

                return;
            }

            runtime.exitCode = await runWorkspaceDevCommand({
                root: workspace.root,
                resources: workspace.resources,
                logger: runtime.logger,
                reporter: runtime.reporter,
                deployment: { serverRoot: deployment.serverRoot, resourcesDir: deployment.resourcesDir, executable: deployment.executable, logs: deployment.logs },
                loadResource: (name: string): CommandContext | null => resourceContext(runtime, workspace, 'dev', name, options).context,
                processService: runtimeProcessService(runtime),
                env: runtime.env,
                signal: runtime.overrides.signal ?? null,
            });

            return;
        }

        runtime.exitCode = await runDevCommand(target.project, {
            watch: options.watch ?? true,
            signal: runtime.overrides.signal ?? null,
            layout: 'tree',
            map: options.map && target.project.config.output.map,
            startServer: options.startServer ?? false,
            processService: options.startServer === true ? runtimeProcessService(runtime) : undefined,
            env: runtime.env,
        });
    });
}
