import { createProjectContext } from '@cli/cli/cli-runtime';
import { EXIT_USAGE } from '@cli/cli/exit-codes';
import { addProjectOptions, jsonOption } from '@cli/cli/shared-options';
import { runCheckCommand, runCheckWatch } from '@cli/commands/check-command';
import { captureJson, emitJson } from '@cli/commands/json-command';
import { manifestMode } from '@cli/config/manifest-context';
import { loadManifest, resolveManifestPath } from '@cli/config/manifest-loader';
import { reportManifestDiagnostics } from '@cli/reporting/diagnostic-reporter';

import { Option } from 'commander';

import type { CliRuntime, ProjectOptions } from '@cli/cli/cli-runtime';
import type { LuamConfig } from '@cli/config/config-schema';
import type { Command } from 'commander';

interface CheckOptions extends ProjectOptions {
    watch?: boolean;
    json?: boolean;
}

export function registerCheckCommand(program: Command, runtime: CliRuntime): void {
    const command = program.command('check').description('Compile the project and report diagnostics without writing files.');

    addProjectOptions(command)
        .addOption(new Option('--watch', 'Keep the command running and re-check on source changes.'))
        .addOption(new Option('--no-watch', 'Run the command once and exit.'))
        .addOption(jsonOption());

    command.action(async (options: CheckOptions): Promise<void> => {
        if (options.json === true && options.watch === true) {
            runtime.reporter.error('"--json" writes one document and "--watch" never stops. Run "luam check --json" without "--watch".');

            runtime.exitCode = EXIT_USAGE;

            return;
        }

        const project = createProjectContext(runtime, 'check', options);

        if (project.context === null) {
            runtime.exitCode = project.error;

            return;
        }

        if (options.json === true) {
            const capture = captureJson(project.context);

            runtime.exitCode = emitJson(runtime.logger, 'check', capture, runCheckCommand(capture.context, { onOutcome: capture.record }));

            return;
        }

        if (options.watch !== true) {
            runtime.exitCode = runCheckCommand(project.context);

            return;
        }

        const root = project.context.root;
        const manifestPath = resolveManifestPath(root, options.manifest ?? null);

        const reload = (): LuamConfig | null => {
            const loaded = loadManifest(root, { path: options.manifest ?? null, mode: manifestMode('check'), env: runtime.env });

            reportManifestDiagnostics(runtime.reporter, loaded.path, loaded.source, loaded.diagnostics);

            if (loaded.config === null) {
                runtime.reporter.error(`Manifest "${loaded.path}" is invalid. Keeping the previous configuration.`);
            }

            return loaded.config;
        };

        runtime.exitCode = await runCheckWatch(project.context, { signal: runtime.overrides.signal ?? null, manifestPath, reload });
    });
}
