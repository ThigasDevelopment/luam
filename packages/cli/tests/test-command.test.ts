import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import { afterEach, describe, expect, it } from 'vitest';

import { runBuildCommand } from '@cli/commands/build-command';
import type { CommandContext } from '@cli/commands/command-context';
import { runTestCommand } from '@cli/commands/test-command';
import { loadManifest } from '@cli/config/manifest-loader';
import { EXIT_DIAGNOSTICS, EXIT_OK, EXIT_USAGE } from '@cli/cli/exit-codes';
import { discoverSources } from '@cli/build/source-discovery';
import { discoverTests } from '@cli/testing/test-discovery';
import { HARNESS_SOURCE, SENTINEL } from '@cli/testing/harness-source';
import { REQUIRED_LUA_VERSION } from '@cli/testing/lua-interpreter';
import type { LuaExecution } from '@cli/testing/test-runner';

import { parsesAsLua51 } from './support/lua-check';
import { createMemoryLogger, type MemoryLogger } from './support/memory-logger';
import { createProjectFixture, defaultProjectFiles, type ProjectFixture } from './support/project-fixture';

const fixtures: ProjectFixture[] = [];

const PASSING_TEST = ["test('formats the player name', function()", "    expect(formatPlayerName('Ana')).toBe('Player: Ana')", 'end)', ''].join('\n');

const FAILING_TEST = ["test('formats the player name', function()", "    expect(formatPlayerName('Ana')).toBe('Player: Bo')", 'end)', ''].join('\n');

interface Harness {
    fixture: ProjectFixture;
    logger: MemoryLogger;
    context: CommandContext;
}

function harness(files: Readonly<Record<string, string>>): Harness {
    const fixture = createProjectFixture(files);
    const logger = createMemoryLogger();
    const config = loadManifest(fixture.root, { mode: 'development' }).config;

    if (config === null) {
        throw new Error('The fixture configuration is invalid.');
    }

    fixtures.push(fixture);

    return { fixture, logger, context: { root: fixture.root, config, logger } };
}

function fakeProbe(): string {
    return REQUIRED_LUA_VERSION;
}

function emit(...parts: readonly string[]): string {
    return [SENTINEL, ...parts].join('\t');
}

function generatedLine(cwd: string, bundle: string, needle: string): number {
    const lines = readFileSync(join(cwd, bundle), 'utf8').split('\n');

    return lines.findIndex((line) => line.includes(needle)) + 1;
}

function passingSpawn(): LuaExecution {
    return { status: 0, stdout: `${emit('pass', 'formats the player name')}\n${emit('done', '1', '0')}\n`, stderr: '', failure: null };
}

function failingSpawn(_executable: string, _args: readonly string[], cwd: string): LuaExecution {
    const line = generatedLine(cwd, 'src/server.lua', 'Player: Bo');
    const stdout = [emit('fail', 'formats the player name', 'src/server.lua', String(line), 'expected "Player: Bo", got "Player: Ana"'), emit('done', '0', '1')];

    return { status: 1, stdout: `${stdout.join('\n')}\n`, stderr: '', failure: null };
}

afterEach(() => {
    for (const fixture of fixtures.splice(0)) {
        fixture.dispose();
    }
});

describe('test discovery', () => {
    it('keeps test files out of the build and finds them for the test command', () => {
        const { context } = harness({ ...defaultProjectFiles(), 'src/server/main.test.luam': PASSING_TEST });
        const sources = discoverSources(context.root, context.config.sources, [context.config.outDir, context.config.contracts]);
        const tests = discoverTests(context.root, context.config.sources, [context.config.outDir, context.config.contracts]);

        expect(sources.files.map((file) => file.path)).not.toContain('src/server/main.test.luam');
        expect(tests.files.map((file) => file.path)).toEqual(['src/server/main.test.luam']);
        expect(tests.files[0]?.environment).toBe('server');
    });

    it('leaves the build byte-identical whether or not a test file exists', async () => {
        const withoutTests = harness(defaultProjectFiles());

        expect(await runBuildCommand(withoutTests.context)).toBe(EXIT_OK);

        const withTests = harness({ ...defaultProjectFiles(), 'src/server/main.test.luam': PASSING_TEST });

        expect(await runBuildCommand(withTests.context)).toBe(EXIT_OK);
        expect(withTests.fixture.read('build/luam-demo/meta.xml')).toBe(withoutTests.fixture.read('build/luam-demo/meta.xml'));
        expect(withTests.fixture.read('build/luam-demo/src/server/main.lua')).toBe(withoutTests.fixture.read('build/luam-demo/src/server/main.lua'));
        expect(withTests.fixture.exists('build/luam-demo/src/server/main.test.lua')).toBe(false);
    });
});

describe('test command', () => {
    it('reports no test files and succeeds', () => {
        const { context, logger } = harness(defaultProjectFiles());

        expect(runTestCommand(context)).toBe(EXIT_OK);
        expect(logger.warnings.join('\n')).toContain('No ".test.luam" files were found');
    });

    it('fails with guidance when no Lua 5.1 interpreter is available', () => {
        const { context, logger } = harness({ ...defaultProjectFiles(), 'src/server/main.test.luam': PASSING_TEST });

        expect(runTestCommand(context, { lua: 'definitely-not-lua' })).toBe(EXIT_USAGE);
        expect(logger.errors.join('\n')).toContain('is not a Lua 5.1 interpreter');
    });

    it('passes when every test passes', () => {
        const { context, logger } = harness({ ...defaultProjectFiles(), 'src/server/main.test.luam': PASSING_TEST });

        expect(runTestCommand(context, { lua: 'lua', probe: fakeProbe, spawn: passingSpawn })).toBe(EXIT_OK);
        expect(logger.text()).toContain('Tests passed: 1 test passed, 0 failed');
    });

    it('reports a failing assertion at a position in the luam source', () => {
        const { context, logger } = harness({ ...defaultProjectFiles(), 'src/server/main.test.luam': FAILING_TEST });

        expect(runTestCommand(context, { lua: 'lua', probe: fakeProbe, spawn: failingSpawn })).toBe(EXIT_DIAGNOSTICS);
        expect(logger.errors.join('\n')).toContain('src/server/main.test.luam:2:5');
        expect(logger.text()).toContain('Tests failed: 0 tests passed, 1 failed');
    });
});

describe('test harness', () => {
    it('is valid Lua 5.1', () => {
        expect(parsesAsLua51(HARNESS_SOURCE)).toBe(true);
    });
});
