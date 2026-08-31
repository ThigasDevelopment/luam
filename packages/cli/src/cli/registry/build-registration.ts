import { createProjectContext } from '@cli/cli/cli-runtime';
import { addLayoutOptions, addMinifyOptions, addProjectOptions, jsonOption, noMapOption, offlineOption } from '@cli/cli/shared-options';
import { runBuildCommand } from '@cli/commands/build-command';
import { captureJson, emitJson } from '@cli/commands/json-command';

import type { CliRuntime, ProjectOptions } from '@cli/cli/cli-runtime';
import type { Command } from 'commander';

interface BuildOptions extends ProjectOptions {
    bundle?: boolean;
    minify?: boolean;
    map: boolean;
    json?: boolean;
}

export function registerBuildCommand(program: Command, runtime: CliRuntime): void {
    const command = program.command('build').description('Compile the project and write the resource to the output directory.');

    addMinifyOptions(addLayoutOptions(addProjectOptions(command)))
        .addOption(noMapOption())
        .addOption(offlineOption())
        .addOption(jsonOption());

    command.action(async (options: BuildOptions): Promise<void> => {
        const project = createProjectContext(runtime, 'build', options);

        if (project.context === null) {
            runtime.exitCode = project.error;

            return;
        }

        const bundled = options.bundle ?? project.context.config.output.bundle;
        const build = {
            layout: bundled ? ('bundle' as const) : ('tree' as const),
            map: options.map && project.context.config.output.map,
            minify: options.minify ?? project.context.config.output.minify,
        };

        if (options.json !== true) {
            runtime.exitCode = await runBuildCommand(project.context, build);

            return;
        }

        const capture = captureJson(project.context);

        runtime.exitCode = emitJson(runtime.logger, 'build', capture, await runBuildCommand(capture.context, { ...build, onOutcome: capture.record }));
    });
}
