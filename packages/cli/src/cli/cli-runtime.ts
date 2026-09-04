import { existsSync } from 'node:fs';
import { join, resolve } from 'node:path';

import { resolveEngineVersion } from '@cli/build/mta-release';
import { EXIT_USAGE } from '@cli/cli/exit-codes';
import { MANIFEST_FILE_NAME } from '@cli/config/config-schema';
import { manifestMode } from '@cli/config/manifest-context';
import { loadManifest } from '@cli/config/manifest-loader';
import { loadWorkspace, workspaceResources, SERVER_FILE_NAME, type LoadedWorkspace } from '@cli/config/workspace-loader';
import { createEditorService } from '@cli/editor/editor-service';
import { reportManifestDiagnostics } from '@cli/reporting/diagnostic-reporter';
import { createConsoleLogger } from '@cli/reporting/logger';
import { detectCapability, PLAIN_CAPABILITY } from '@cli/reporting/output-capability';
import { createReporter } from '@cli/reporting/reporter';
import { createProcessService } from '@cli/server/process-service';

import type { CommandContext } from '@cli/commands/command-context';
import type { InitPrompt } from '@cli/commands/init-prompt';
import type { Environment } from '@cli/config/validation-context';
import type { EditorService } from '@cli/editor/editor-service';
import type { InstallationPrompt } from '@cli/editor/installation-prompt';
import type { Logger } from '@cli/reporting/logger';
import type { OutputCapability } from '@cli/reporting/output-capability';
import type { Reporter } from '@cli/reporting/reporter';
import type { ProcessService } from '@cli/server/process-service';

export interface CliOverrides {
    logger: Logger;
    capability: OutputCapability;
    cwd: string;
    env: Environment;
    signal: AbortSignal | null;
    editorService: EditorService;
    prompt: InstallationPrompt;
    initPrompt: InitPrompt;
    processService: ProcessService;
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

export interface WorkspaceContext {
    root: string;
    workspace: LoadedWorkspace;
    resources: readonly string[];
    logger: Logger;
    reporter: Reporter;
}

export type WorkspaceResolution = { context: WorkspaceContext; error: null } | { context: null; error: number };

export type CommandTarget =
    | { kind: 'project'; project: CommandContext; workspace: null; error: null }
    | { kind: 'workspace'; project: null; workspace: WorkspaceContext; error: null }
    | { kind: null; project: null; workspace: null; error: number };

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

export function hasManifest(root: string): boolean {
    return existsSync(join(root, MANIFEST_FILE_NAME));
}

export function createProjectContext(runtime: CliRuntime, command: string, options: ProjectOptions): ProjectContext {
    const root = commandRoot(runtime, options);
    const workspace = loadWorkspace(root);
    const loaded = loadManifest(root, { path: options.manifest ?? null, mode: manifestMode(command), env: runtime.env, workspace });

    reportManifestDiagnostics(runtime.reporter, loaded.path, loaded.source, loaded.diagnostics);

    if (loaded.config === null) {
        runtime.reporter.error(`Manifest "${loaded.path}" is invalid.`);

        return { context: null, error: EXIT_USAGE };
    }

    const skip = options.offline === true || runtime.env.LUAM_OFFLINE !== undefined;
    const engine = loaded.config.engine.minVersion;

    return {
        context: {
            root,
            config: loaded.config,
            deployment: loaded.deployment,
            logger: runtime.logger,
            reporter: runtime.reporter,
            resolveVersion: () => resolveEngineVersion(root, engine, { skip }),
        },
        error: null,
    };
}

export function createWorkspaceContext(runtime: CliRuntime, options: RootOptions): WorkspaceResolution {
    const root = commandRoot(runtime, options);
    const workspace = loadWorkspace(root);

    if (workspace === null) {
        runtime.reporter.error(missingRootMessage(root));

        return { context: null, error: EXIT_USAGE };
    }

    reportManifestDiagnostics(runtime.reporter, workspace.path, workspace.source, workspace.diagnostics);

    if (workspace.deployment === null) {
        runtime.reporter.error(`The workspace file "${workspace.path}" is invalid.`);

        return { context: null, error: EXIT_USAGE };
    }

    return {
        context: { root: workspace.root, workspace, resources: workspace.resources, logger: runtime.logger, reporter: runtime.reporter },
        error: null,
    };
}

export function resolveCommandTarget(runtime: CliRuntime, command: string, options: ProjectOptions): CommandTarget {
    const root = commandRoot(runtime, options);

    if (options.manifest !== undefined || hasManifest(root)) {
        const project = createProjectContext(runtime, command, options);

        return project.context === null ? { kind: null, project: null, workspace: null, error: project.error } : { kind: 'project', project: project.context, workspace: null, error: null };
    }

    const workspace = createWorkspaceContext(runtime, options);

    return workspace.context === null ? { kind: null, project: null, workspace: null, error: workspace.error } : { kind: 'workspace', project: null, workspace: workspace.context, error: null };
}

export function resourceContext(runtime: CliRuntime, workspace: WorkspaceContext, command: string, name: string, options: ProjectOptions = {}): ProjectContext {
    const present = workspaceResources(workspace.root);

    if (!present.includes(name)) {
        runtime.reporter.error(unknownResourceMessage(workspace.root, present, name));

        return { context: null, error: EXIT_USAGE };
    }

    const root = join(workspace.root, name);
    const loaded = loadManifest(root, { mode: manifestMode(command), env: runtime.env, workspace: workspace.workspace });

    reportManifestDiagnostics(runtime.reporter, loaded.path, loaded.source, loaded.diagnostics);

    if (loaded.config === null) {
        runtime.reporter.error(`Manifest "${loaded.path}" is invalid.`);

        return { context: null, error: EXIT_USAGE };
    }

    const skip = options.offline === true || runtime.env.LUAM_OFFLINE !== undefined;
    const engine = loaded.config.engine.minVersion;

    return {
        context: {
            root,
            config: loaded.config,
            deployment: loaded.deployment,
            logger: runtime.logger,
            reporter: runtime.reporter,
            resolveVersion: () => resolveEngineVersion(root, engine, { skip }),
        },
        error: null,
    };
}

const LISTED_RESOURCES = 5;

export function listResources(resources: readonly string[]): string {
    const shown = resources.slice(0, LISTED_RESOURCES).map((name) => `"${name}"`);
    const rest = resources.length - shown.length;

    if (shown.length === 0) {
        return 'none';
    }

    return rest === 0 ? shown.join(', ') : `${shown.join(', ')} and ${rest} more`;
}

export function unknownResourceMessage(root: string, resources: readonly string[], name: string): string {
    return `"${name}" is not a resource of the workspace at "${root}". The resources there are ${listResources(resources)}.`;
}

export function missingRootMessage(root: string): string {
    return [
        `"${root}" holds neither a "${MANIFEST_FILE_NAME}" nor a "${SERVER_FILE_NAME}".`,
        `Run "luam init" to create a resource here, or add a "${SERVER_FILE_NAME}" naming the MTA server this directory of resources shares.`,
    ].join(' ');
}

export function runtimeEditorService(runtime: CliRuntime): EditorService {
    return runtime.overrides.editorService ?? createEditorService();
}

export function runtimeProcessService(runtime: CliRuntime): ProcessService {
    return runtime.overrides.processService ?? createProcessService();
}
