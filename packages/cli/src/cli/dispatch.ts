import { resolve } from 'node:path';

import { resolveMtaVersion } from '@cli/build/mta-release';
import { parseArguments, type ParsedArguments } from '@cli/cli/arguments';
import { EXIT_DIAGNOSTICS, EXIT_OK, EXIT_USAGE } from '@cli/cli/exit-codes';
import { USAGE, VERSION } from '@cli/cli/usage';
import { runBuildCommand } from '@cli/commands/build-command';
import { runCheckCommand } from '@cli/commands/check-command';
import type { CommandContext } from '@cli/commands/command-context';
import { runEnsureCommand } from '@cli/commands/ensure-command';
import { runDevCommand } from '@cli/commands/dev-command';
import { runInitCommand } from '@cli/commands/init-command';
import { loadConfig } from '@cli/config/config-loader';
import type { Environment } from '@cli/config/transport-validation';
import { hasCliErrors } from '@cli/reporting/cli-diagnostic';
import { reportCliDiagnostics } from '@cli/reporting/diagnostic-reporter';
import { createConsoleLogger, type Logger } from '@cli/reporting/logger';
import { detectCapability, PLAIN_CAPABILITY, type OutputCapability } from '@cli/reporting/output-capability';
import { createReporter, type Reporter } from '@cli/reporting/reporter';
import { createTransport } from '@cli/transport/transport-factory';
import type { MtaTransport } from '@cli/transport/transport';

export interface CliOverrides {
    logger: Logger;
    capability: OutputCapability;
    cwd: string;
    env: Environment;
    transport: MtaTransport | null;
    signal: AbortSignal | null;
}

function resolveCapability(overrides: Partial<CliOverrides>, env: Environment, noColor: boolean): OutputCapability {
    if (overrides.capability !== undefined) {
        return overrides.capability;
    }

    if (overrides.logger !== undefined) {
        return PLAIN_CAPABILITY;
    }

    return detectCapability({ target: process.stdout, env, noColor });
}

function reportUsageErrors(reporter: Reporter, parsed: ParsedArguments): void {
    for (const error of parsed.errors) {
        reporter.error(error);
    }

    reporter.rawError(USAGE);
}

export async function runCli(argv: readonly string[], overrides: Partial<CliOverrides> = {}): Promise<number> {
    const logger = overrides.logger ?? createConsoleLogger();
    const parsed = parseArguments(argv);
    const env = overrides.env ?? process.env;
    const reporter: Reporter = createReporter(logger, resolveCapability(overrides, env, parsed.noColor));

    if (parsed.help || (parsed.command === null && parsed.errors.length === 0 && !parsed.version)) {
        reporter.raw(USAGE);

        return parsed.help ? EXIT_OK : EXIT_USAGE;
    }

    if (parsed.version) {
        reporter.raw(VERSION);

        return EXIT_OK;
    }

    if (parsed.errors.length > 0 || parsed.command === null) {
        reportUsageErrors(reporter, parsed);

        return EXIT_USAGE;
    }

    const root = resolve(overrides.cwd ?? process.cwd(), parsed.cwd ?? '.');

    if (parsed.command === 'init') {
        return runInitCommand(root, logger, { name: parsed.name, force: parsed.force });
    }

    const loaded = loadConfig(root, parsed.config, env);

    reportCliDiagnostics(reporter, loaded.diagnostics);

    if (loaded.config === null || hasCliErrors(loaded.diagnostics)) {
        reporter.error(`Configuration "${loaded.path}" is invalid.`);

        return EXIT_USAGE;
    }

    const skip = parsed.offline || env.LUAM_OFFLINE !== undefined;
    const context: CommandContext = {
        root,
        config: loaded.config,
        logger,
        reporter,
        resolveVersion: () => resolveMtaVersion(root, { skip }),
    };

    if (parsed.command === 'check') {
        return runCheckCommand(context);
    }

    if (parsed.command === 'build') {
        return runBuildCommand(context);
    }

    const transport = overrides.transport ?? createTransport(loaded.config.transport);
    const options = {
        transport,
        watch: parsed.watch ?? true,
        signal: overrides.signal ?? null,
    };
    const exitCode = parsed.command === 'dev' ? await runDevCommand(context, options) : await runEnsureCommand(context, options);

    return exitCode === EXIT_OK ? EXIT_OK : EXIT_DIAGNOSTICS;
}
