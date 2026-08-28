import { runCompile } from '@cli/build/build-runner';
import { EXIT_DIAGNOSTICS, EXIT_OK, EXIT_USAGE } from '@cli/cli/exit-codes';
import { commandReporter, type CommandContext } from '@cli/commands/command-context';
import { hasCliErrors } from '@cli/reporting/cli-diagnostic';
import { reportCliDiagnostics, reportFileDiagnostics } from '@cli/reporting/diagnostic-reporter';
import { describeMissingInterpreter, findLuaInterpreter, INSTALL_HINT, type LuaProbe } from '@cli/testing/lua-interpreter';
import { reportTestResults } from '@cli/testing/test-report';
import { discoverTests, TEST_EXTENSION } from '@cli/testing/test-discovery';
import { runTests, type LuaSpawn } from '@cli/testing/test-runner';
import type { Environment } from '@compiler/environment/environment';
import type { ResourceBuild } from '@compiler/project/resource';

export interface TestCommandOptions {
    lua?: string | null;
    env?: string | null;
    probe?: LuaProbe;
    spawn?: LuaSpawn;
}

function testEnvironments(build: ResourceBuild, paths: ReadonlySet<string>): Environment[] {
    const found = build.bundles.flatMap((bundle) =>
        bundle.members.flatMap((member) => (member.kind === 'module' && paths.has(member.module.source) ? [member.module.environment] : [])),
    );

    return [...new Set(found)];
}

export function runTestCommand(context: CommandContext, options: TestCommandOptions = {}): number {
    const reporter = commandReporter(context);
    const excluded = [context.config.outDir, context.config.contracts];
    const discovered = discoverTests(context.root, context.config.sources, excluded);

    reportCliDiagnostics(reporter, discovered.diagnostics);

    if (hasCliErrors(discovered.diagnostics)) {
        return EXIT_DIAGNOSTICS;
    }

    if (discovered.files.length === 0) {
        reporter.warn(`No "${TEST_EXTENSION}" files were found. Write one next to the module it covers.`);

        return EXIT_OK;
    }

    const request = { explicit: options.lua ?? null, env: options.env ?? null, ...(options.probe === undefined ? {} : { probe: options.probe }) };
    const interpreter = findLuaInterpreter(request);

    if (interpreter === null) {
        reporter.error(describeMissingInterpreter(request));
        reporter.detail(INSTALL_HINT);

        return EXIT_USAGE;
    }

    const started = performance.now();
    const outcome = runCompile(context.root, context.config, { additionalFiles: discovered.files, development: true, layout: 'bundle', map: true });

    reportCliDiagnostics(reporter, outcome.diagnostics);
    reportFileDiagnostics(reporter, outcome.fileDiagnostics, outcome.sources);

    if (outcome.build === null) {
        reporter.error('Tests failed: the project did not compile.');

        return EXIT_DIAGNOSTICS;
    }

    const paths = new Set(discovered.files.map((file) => file.path));
    const environments = testEnvironments(outcome.build, paths);
    const runs = runTests({
        executable: interpreter.executable,
        scripts: outcome.build.scripts,
        environments,
        ...(options.spawn === undefined ? {} : { spawn: options.spawn }),
    });

    return reportTestResults(reporter, runs, context.root, outcome.map, performance.now() - started) ? EXIT_OK : EXIT_DIAGNOSTICS;
}
