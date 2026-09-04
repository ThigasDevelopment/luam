import { existsSync } from 'node:fs';

import type { CommandContext } from '@cli/commands/command-context';
import { createEnsureRunner, type EnsureResult, type EnsureRunner } from '@cli/commands/ensure-runner';
import { formatDuration } from '@cli/reporting/duration';
import { pluralize } from '@cli/reporting/plural';
import { reportRebuildSeparator } from '@cli/reporting/rebuild-separator';
import type { Reporter } from '@cli/reporting/reporter';
import type { ServerConsole } from '@cli/server/server-console';
import { findSessionCommand, LEADING_SPACE_ESCAPE, SESSION_COMMANDS, type SessionCommand } from '@cli/session/session-commands';
import { watchSources, type SourceWatcher } from '@cli/watch/source-watcher';

import type { SessionLine } from '@cli/server/session-console-input';

export type AttachedOutcome = 'pending' | 'built' | 'failed';

export interface AttachedResource {
    name: string;
    context: CommandContext;
    runner: EnsureRunner;
    watcher: SourceWatcher;
    started: boolean;
    outcome: AttachedOutcome;
    written: number;
    removed: number;
    at: Date;
}

export type SessionResourceLoader = (name: string) => CommandContext | null;

export interface WorkspaceSessionOptions {
    root: string;
    resources: readonly string[];
    reporter: Reporter;
    serverConsole: ServerConsole;
    loadResource: SessionResourceLoader;
    developmentLogs?: CommandContext['config']['development']['logs'] | null;
    now?: (() => Date) | undefined;
}

export interface WorkspaceSession {
    readonly attached: ReadonlySet<string>;
    reportOpening(): void;
    run(line: SessionLine): Promise<void>;
    close(): void;
}

const LISTED_RESOURCES = 5;

const NOTHING_ATTACHED = 'Watching nothing yet. Type "ensure <resource>" to attach one, "help" for the rest.';

const USAGE_COLUMN = 20;

function listNames(names: readonly string[]): string {
    const shown = names.slice(0, LISTED_RESOURCES).map((name) => `"${name}"`);
    const rest = names.length - shown.length;

    if (shown.length === 0) {
        return 'none';
    }

    return rest === 0 ? shown.join(', ') : `${shown.join(', ')} and ${rest} more`;
}

function changedFiles(result: EnsureResult): boolean {
    return result.sync !== null && (result.sync.written.length > 0 || result.sync.removed.length > 0);
}

export function createWorkspaceSession(options: WorkspaceSessionOptions): WorkspaceSession {
    const reporter = options.reporter;
    const now = options.now ?? ((): Date => new Date());
    const attached = new Map<string, AttachedResource>();
    const pending = new Set<string>();
    const separated = new Set<string>();
    let chain: Promise<void> = Promise.resolve();
    let closed = false;

    const unknownResource = (name: string): string =>
        `"${name}" is not a resource of the workspace at "${options.root}". The resources there are ${listNames([...options.resources])}.`;
    const deploy = (entry: AttachedResource): void => {
        const refreshed = options.serverConsole.refresh();

        if (!refreshed.ok) {
            reporter.error(`Refresh failed: ${refreshed.message}`);

            return;
        }

        const first = !entry.started;
        const written = first ? options.serverConsole.start(entry.name) : options.serverConsole.restart(entry.name);

        if (!written.ok) {
            reporter.error(`${first ? 'Start' : 'Restart'} failed: ${written.message}`);

            return;
        }

        entry.started = true;
        reporter.success(`${first ? 'Started' : 'Restarted'} "${entry.name}" through the owned server console.`);
    };
    const cycle = async (entry: AttachedResource): Promise<void> => {
        if (!existsSync(entry.context.root)) {
            reporter.error(`"${entry.name}" no longer exists at "${entry.context.root}". Dropping it from the session.`);
            entry.watcher.close();
            attached.delete(entry.name);

            return;
        }

        const result = await entry.runner.run();

        entry.outcome = result.ok ? 'built' : 'failed';
        entry.written = result.sync?.written.length ?? 0;
        entry.removed = result.sync?.removed.length ?? 0;
        entry.at = now();

        if (result.ok && changedFiles(result)) {
            deploy(entry);
        }
    };
    const schedule = (name: string, separator: boolean): Promise<void> => {
        pending.add(name);

        if (separator) {
            separated.add(name);
        }

        chain = chain.then(async () => {
            while (pending.size > 0) {
                const [next] = pending;

                if (next === undefined) {
                    return;
                }

                pending.delete(next);

                const wantsSeparator = separated.delete(next);
                const entry = attached.get(next);

                if (entry === undefined) {
                    continue;
                }

                if (wantsSeparator) {
                    reportRebuildSeparator(reporter);
                }

                await cycle(entry);
            }
        });

        return chain;
    };
    const attach = (name: string): AttachedResource | null => {
        const context = options.loadResource(name);

        if (context === null) {
            return null;
        }

        const entry: AttachedResource = {
            name,
            context,
            runner: createEnsureRunner(context, {
                serverConsole: null,
                developmentLogs: options.developmentLogs ?? null,
                layout: 'tree',
                map: context.config.output.map,
            }),
            watcher: watchSources(context.root, context.config.sources, () => {
                void schedule(name, true);
            }),
            started: false,
            outcome: 'pending',
            written: 0,
            removed: 0,
            at: now(),
        };

        attached.set(name, entry);

        return entry;
    };
    const ensure = async (name: string | undefined): Promise<void> => {
        if (name === undefined) {
            reporter.error(`"ensure" takes one resource name. The resources here are ${listNames([...options.resources])}.`);

            return;
        }

        if (!options.resources.includes(name)) {
            reporter.error(unknownResource(name));

            return;
        }

        if (attached.has(name)) {
            reporter.info(`"${name}" is already attached. Rebuilding it.`);
            await schedule(name, true);

            return;
        }

        if (attach(name) === null) {
            return;
        }

        reporter.info(`Attached "${name}" and watching it for changes.`);
        await schedule(name, false);
    };
    const drop = (name: string | undefined): void => {
        if (name === undefined) {
            reporter.error(`"drop" takes one attached resource name. Attached: ${listNames([...attached.keys()])}.`);

            return;
        }

        const entry = attached.get(name);

        if (entry === undefined) {
            reporter.error(`"${name}" is not attached. Attached: ${listNames([...attached.keys()])}.`);

            return;
        }

        entry.watcher.close();
        attached.delete(name);
        pending.delete(name);
        separated.delete(name);
        reporter.info(`Dropped "${name}". It is no longer built, synced or watched, and what is deployed on the server was left alone.`);
    };
    const rebuild = async (name: string | undefined): Promise<void> => {
        if (name === undefined) {
            if (attached.size === 0) {
                reporter.info(NOTHING_ATTACHED);

                return;
            }

            for (const attachedName of [...attached.keys()]) {
                await schedule(attachedName, true);
            }

            return;
        }

        if (!attached.has(name)) {
            reporter.error(options.resources.includes(name) ? `"${name}" is not attached. Type "ensure ${name}" to attach it.` : unknownResource(name));

            return;
        }

        await schedule(name, true);
    };
    const list = (): void => {
        if (attached.size === 0) {
            reporter.info(NOTHING_ATTACHED);

            return;
        }

        const at = now();

        for (const entry of attached.values()) {
            const outcome =
                entry.outcome === 'pending' ? 'building' : `${entry.outcome}, ${pluralize(entry.written, 'file')} written, ${entry.removed} removed`;

            reporter.info(`${entry.name}: ${outcome}, ${formatDuration(Math.max(0, at.valueOf() - entry.at.valueOf()))} ago.`);
        }
    };
    const help = (): void => {
        for (const entry of SESSION_COMMANDS) {
            reporter.info(`${entry.usage.padEnd(USAGE_COLUMN)}${entry.summary}`);
        }

        reporter.detail(LEADING_SPACE_ESCAPE);
    };
    const dispatch = async (command: SessionCommand, args: readonly string[]): Promise<void> => {
        if ((command.argument === 'none' && args.length > 0) || args.length > 1) {
            reporter.error(`"${command.verb}" was given the wrong arguments. Usage: ${command.usage}.`);

            return;
        }

        const [name] = args;

        if (command.verb === 'ensure') {
            await ensure(name);

            return;
        }

        if (command.verb === 'drop') {
            drop(name);

            return;
        }

        if (command.verb === 'rebuild') {
            await rebuild(name);

            return;
        }

        if (command.verb === 'list') {
            list();

            return;
        }

        help();
    };

    return {
        get attached(): ReadonlySet<string> {
            return new Set(attached.keys());
        },
        reportOpening: (): void => {
            reporter.info(NOTHING_ATTACHED);
            reporter.info(`Resources here: ${listNames([...options.resources])}.`);
        },
        run: async (line: SessionLine): Promise<void> => {
            const command = findSessionCommand(line.verb);

            if (command === null || closed) {
                return;
            }

            await dispatch(command, line.args);
        },
        close: (): void => {
            closed = true;

            for (const entry of attached.values()) {
                entry.watcher.close();
            }

            attached.clear();
            pending.clear();
            separated.clear();
        },
    };
}
