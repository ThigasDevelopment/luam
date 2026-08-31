import { afterEach, describe, expect, it } from 'vitest';

import { EXIT_DIAGNOSTICS, EXIT_OK, EXIT_USAGE } from '@cli/cli/exit-codes';
import { runCli } from '@cli/cli/run';
import { VERSION } from '@cli/cli/version';
import { REPORT_SCHEMA_VERSION, type JsonReport } from '@cli/reporting/json-report';

import { createMemoryLogger, type MemoryLogger } from './support/memory-logger';
import { BROKEN_SERVER, createProjectFixture, defaultProjectFiles, MANIFEST_FILE, manifestSource, type ProjectFixture } from './support/project-fixture';

const OFFLINE = { LUAM_OFFLINE: '1' };

const fixtures: ProjectFixture[] = [];

function project(files: Readonly<Record<string, string>> = defaultProjectFiles()): ProjectFixture {
    const fixture = createProjectFixture(files);

    fixtures.push(fixture);

    return fixture;
}

function standardOut(logger: MemoryLogger): string[] {
    return logger.lines.filter((line) => !logger.errors.includes(line) && !logger.warnings.includes(line));
}

function document(logger: MemoryLogger): JsonReport {
    const out = standardOut(logger);

    expect(out).toHaveLength(1);

    return JSON.parse(out[0] ?? '') as JsonReport;
}

afterEach(() => {
    for (const fixture of fixtures.splice(0)) {
        fixture.dispose();
    }
});

describe('machine-readable diagnostics', () => {
    it('writes one document to stdout and nothing else there', async () => {
        const fixture = project();
        const logger = createMemoryLogger();

        expect(await runCli(['check', '--json', '--cwd', fixture.root], { logger, env: OFFLINE })).toBe(EXIT_OK);

        const report = document(logger);

        expect(report.version).toBe(REPORT_SCHEMA_VERSION);
        expect(report.luam).toBe(VERSION);
        expect(report.command).toBe('check');
        expect(report.success).toBe(true);
        expect(report.diagnostics).toEqual([]);
        expect(report.summary.files).toBe(3);
        expect(report.summary.errors).toBe(0);
    });

    it('carries every diagnostic the human output reports, with the same paths', async () => {
        const files = { ...defaultProjectFiles(), 'src/server/main.luam': BROKEN_SERVER };
        const fixture = project(files);
        const machine = createMemoryLogger();
        const human = createMemoryLogger();

        expect(await runCli(['check', '--json', '--cwd', fixture.root], { logger: machine, env: OFFLINE })).toBe(EXIT_DIAGNOSTICS);
        expect(await runCli(['check', '--cwd', fixture.root], { logger: human, env: OFFLINE })).toBe(EXIT_DIAGNOSTICS);

        const report = document(machine);
        const reported = human.errors.join('\n');

        expect(report.success).toBe(false);
        expect(report.diagnostics.length).toBeGreaterThan(0);

        for (const diagnostic of report.diagnostics) {
            expect(reported).toContain(diagnostic.code);
            expect(reported).toContain(diagnostic.message);

            if (diagnostic.path !== null) {
                expect(reported).toContain(`${diagnostic.path}:${diagnostic.line}:${diagnostic.column}`);
            }
        }

        expect(report.summary.errors).toBe(report.diagnostics.filter((entry) => entry.severity === 'error').length);
    });

    it('keeps every field present, with nulls where a diagnostic has no location', async () => {
        const fixture = project({ [MANIFEST_FILE]: manifestSource({ name: 'luam-demo' }), 'src/shared/notes.md': 'ignored\n' });
        const logger = createMemoryLogger();

        await runCli(['check', '--json', '--cwd', fixture.root], { logger, env: OFFLINE });

        const report = document(logger);
        const keys = ['path', 'line', 'column', 'endLine', 'endColumn', 'severity', 'code', 'message'];

        expect(report.diagnostics.length).toBeGreaterThan(0);

        for (const diagnostic of report.diagnostics) {
            expect(Object.keys(diagnostic).sort()).toEqual([...keys].sort());
        }
    });

    it('matches the exit code of the same run without the flag', async () => {
        for (const [files, expected] of [
            [defaultProjectFiles(), EXIT_OK],
            [{ ...defaultProjectFiles(), 'src/server/main.luam': BROKEN_SERVER }, EXIT_DIAGNOSTICS],
        ] as const) {
            const fixture = project(files);
            const machine = createMemoryLogger();
            const human = createMemoryLogger();
            const withJson = await runCli(['check', '--json', '--cwd', fixture.root], { logger: machine, env: OFFLINE });
            const without = await runCli(['check', '--cwd', fixture.root], { logger: human, env: OFFLINE });

            expect(withJson).toBe(expected);
            expect(without).toBe(expected);
        }
    });

    it('leaves the human output byte-identical when the flag is absent', async () => {
        const fixture = project({ ...defaultProjectFiles(), 'src/server/main.luam': BROKEN_SERVER });
        const first = createMemoryLogger();
        const second = createMemoryLogger();

        await runCli(['check', '--cwd', fixture.root, '--no-color'], { logger: first, env: OFFLINE });
        await runCli(['check', '--cwd', fixture.root, '--no-color'], { logger: second, env: OFFLINE });

        const masked = (lines: readonly string[]): string[] => lines.map((line) => line.replace(/\d+(\.\d+)? (ms|s)/g, '<duration>'));

        expect(masked(first.lines)).toEqual(masked(second.lines));
        expect(first.lines.join('\n')).not.toContain('"version"');
    });

    it('reports a build the same way and still writes the resource', async () => {
        const fixture = project();
        const logger = createMemoryLogger();

        expect(await runCli(['build', '--json', '--cwd', fixture.root], { logger, env: OFFLINE })).toBe(EXIT_OK);

        const report = document(logger);

        expect(report.command).toBe('build');
        expect(report.success).toBe(true);
        expect(fixture.exists('build')).toBe(true);
    });

    it('refuses to pair a single document with a watch that never stops', async () => {
        const fixture = project();
        const logger = createMemoryLogger();

        expect(await runCli(['check', '--json', '--watch', '--cwd', fixture.root], { logger, env: OFFLINE })).toBe(EXIT_USAGE);
        expect(standardOut(logger)).toEqual([]);
    });

    it('exits two when a command that does not own the flag is given it', async () => {
        const fixture = project();

        for (const command of ['test', 'dev', 'ensure', 'doctor', 'format']) {
            const logger = createMemoryLogger();
            const code = await runCli([command, '--json', '--cwd', fixture.root], { logger, env: OFFLINE });

            expect(code, command).toBe(EXIT_USAGE);
        }
    });
});
