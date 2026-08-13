import { resolve } from 'node:path';

import { resolveMtaVersion } from '@cli/build/mta-release';
import { EXIT_USAGE } from '@cli/cli/exit-codes';
import { manifestMode } from '@cli/config/manifest-context';
import { loadManifest } from '@cli/config/manifest-loader';
import { createEditorService } from '@cli/editor/editor-service';
import { reportManifestDiagnostics } from '@cli/reporting/diagnostic-reporter';
import { createConsoleLogger } from '@cli/reporting/logger';
import { detectCapability, PLAIN_CAPABILITY } from '@cli/reporting/output-capability';
import { createReporter } from '@cli/reporting/reporter';
import { createTransport } from '@cli/transport/transport-factory';

import type { CommandContext } from '@cli/commands/command-context';
import type { InitPrompt } from '@cli/commands/init-prompt';
import type { LuamConfig } from '@cli/config/config-schema';
import type { Environment } from '@cli/config/validation-context';
import type { EditorService } from '@cli/editor/editor-service';
import type { InstallationPrompt } from '@cli/editor/installation-prompt';
import type { Logger } from '@cli/reporting/logger';
import type { OutputCapability } from '@cli/reporting/output-capability';
import type { Reporter } from '@cli/reporting/reporter';
import type { MtaTransport } from '@cli/transport/transport';

export interface CliOverrides {
    logger: Logger;
    capability: OutputCapability;
    cwd: string;
    env: Environment;
    transport: MtaTransport | null;
    signal: AbortSignal | null;
    editorService: EditorService;
    prompt: InstallationPrompt;
    initPrompt: InitPrompt;
}

export interface CliRuntime {
    overrides: Partial<CliOverrides>;
    logger: Logger;
    reporter: Reporter;
    env: Environment;
    cwd: string;
    exitCode: number;
}

export interface RootOptions {
    cwd?: string;
}

export interface ProjectOptions extends RootOptions {
    manifest?: string;
    offline?: boolean;
}

export type ProjectContext = { context: CommandContext; error: null } | { context: null; error: number };

function resolveCapability(overrides: Partial<CliOverrides>, env: Environment, noColor: boolean): OutputCapability {
    if (overrides.capability !== undefined) {
        return overrides.capability;
    }

    if (overrides.logger !== undefined) {
        return PLAIN_CAPABILITY;
    }

    return detectCapability({ target: process.stdout, env, noColor });
}

export function createRuntime(argv: readonly string[], overrides: Partial<CliOverrides>): CliRuntime {
    const logger = overrides.logger ?? createConsoleLogger();
    const env = overrides.env ?? process.env;
    const capability = resolveCapability(overrides, env, argv.includes('--no-color'));

    return {
        overrides,
        logger,
        reporter: createReporter(logger, capability),
        env,
        cwd: overrides.cwd ?? process.cwd(),
        exitCode: 0,
    };
}

export function commandRoot(runtime: CliRuntime, options: RootOptions): string {
    return resolve(runtime.cwd, options.cwd ?? '.');
}

export function createProjectContext(runtime: CliRuntime, command: string, options: ProjectOptions): ProjectContext {
    const root = commandRoot(runtime, options);
    const loaded = loadManifest(root, { path: options.manifest ?? null, mode: manifestMode(command), env: runtime.env });

    reportManifestDiagnostics(runtime.reporter, loaded.path, loaded.source, loaded.diagnostics);

    if (loaded.config === null) {
        runtime.reporter.error(`Manifest "${loaded.path}" is invalid.`);

        return { context: null, error: EXIT_USAGE };
    }

    const skip = options.offline === true || runtime.env.LUAM_OFFLINE !== undefined;

    return {
        context: {
            root,
            config: loaded.config,
            logger: runtime.logger,
            reporter: runtime.reporter,
            resolveVersion: () => resolveMtaVersion(root, { skip }),
        },
        error: null,
    };
}

export function runtimeEditorService(runtime: CliRuntime): EditorService {
    return runtime.overrides.editorService ?? createEditorService();
}

export function runtimeTransport(runtime: CliRuntime, config: LuamConfig): MtaTransport {
    return runtime.overrides.transport ?? createTransport(config.transport);
}
