import { resolveCommandTarget, runtimeProcessService } from '@cli/cli/cli-runtime';
import { EXIT_DIAGNOSTICS } from '@cli/cli/exit-codes';
import { addProjectOptions } from '@cli/cli/shared-options';
import { commandDeployment } from '@cli/commands/command-context';
import { runServerCommand } from '@cli/commands/server-command';
import { missingServerPathMessage } from '@cli/config/deployment';
import { serverTarget } from '@cli/server/mta-server-supervisor';

import type { CliRuntime, ProjectOptions } from '@cli/cli/cli-runtime';
import type { DeploymentSettings } from '@cli/config/deployment';
import type { Command } from 'commander';

export function registerServerCommand(program: Command, runtime: CliRuntime): void {
    const command = program.command('server').description('Run an existing local MTA server in the foreground.');

    addProjectOptions(command);

    command.action(async (options: ProjectOptions): Promise<void> => {
        const resolved = resolveCommandTarget(runtime, 'server', options);

        if (resolved.kind === null) {
            runtime.exitCode = resolved.error;

            return;
        }

        const deployment: DeploymentSettings | null =
            resolved.kind === 'workspace' ? resolved.workspace.workspace.deployment : commandDeployment(resolved.project);

        if (deployment === null) {
            runtime.exitCode = EXIT_DIAGNOSTICS;

            return;
        }

        const target = serverTarget(deployment);

        if (target === null) {
            runtime.reporter.error(missingServerPathMessage('server'));
            runtime.exitCode = EXIT_DIAGNOSTICS;

            return;
        }

        runtime.exitCode = await runServerCommand(target, runtime.reporter, {
            processService: runtimeProcessService(runtime),
            env: runtime.env,
            signal: runtime.overrides.signal ?? null,
        });
    });
}
