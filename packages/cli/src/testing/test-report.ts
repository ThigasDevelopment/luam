import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { formatDuration } from '@cli/reporting/duration';
import { pluralize } from '@cli/reporting/plural';
import type { Reporter } from '@cli/reporting/reporter';
import type { EnvironmentRun, TestResult } from '@cli/testing/test-runner';
import { resolveResourcePosition, type ResourceMap } from '@compiler/project/resource';

export interface SourcePosition {
    path: string;
    line: number;
    column: number;
}

export interface TestTotals {
    passed: number;
    failed: number;
}

function sourceLine(root: string, path: string, line: number, cache: Map<string, string[]>): string | null {
    let lines = cache.get(path);

    if (lines === undefined) {
        try {
            lines = readFileSync(resolve(root, path), 'utf8').split(/\r?\n/);
        } catch {
            lines = [];
        }

        cache.set(path, lines);
    }

    return lines[line - 1] ?? null;
}

function columnOf(text: string | null, symbol: string | undefined): number {
    if (text === null) {
        return 1;
    }

    const symbolIndex = symbol === undefined ? -1 : text.indexOf(symbol);

    if (symbolIndex >= 0) {
        return symbolIndex + 1;
    }

    const indent = /^\s*/.exec(text)?.[0].length ?? 0;

    return indent + 1;
}

export function resolveTestPosition(root: string, map: ResourceMap | null, result: TestResult, cache: Map<string, string[]>): SourcePosition | null {
    if (map === null || result.file === null || result.line === null) {
        return null;
    }

    const resolution = resolveResourcePosition(map, result.file, result.line);

    if (resolution.status !== 'resolved') {
        return null;
    }

    const { file, line, symbol } = resolution.position;

    return { path: file, line, column: columnOf(sourceLine(root, file, line, cache), symbol) };
}

function formatLocation(root: string, map: ResourceMap | null, result: TestResult, cache: Map<string, string[]>): string {
    const position = resolveTestPosition(root, map, result, cache);

    if (position !== null) {
        return `${position.path}:${position.line}:${position.column}`;
    }

    return result.file === null || result.line === null ? 'unknown position' : `${result.file}:${result.line}`;
}

export function countResults(runs: readonly EnvironmentRun[]): TestTotals {
    const results = runs.flatMap((run) => run.results);
    const passed = results.filter((result) => result.passed).length;

    return { passed, failed: results.length - passed };
}

export function reportTestResults(reporter: Reporter, runs: readonly EnvironmentRun[], root: string, map: ResourceMap | null, durationMs: number): boolean {
    const cache = new Map<string, string[]>();
    const marker = (name: 'success' | 'failure'): string => reporter.style.marker(name);

    for (const run of runs) {
        for (const line of run.output) {
            reporter.detail(`  ${line}`);
        }

        for (const result of run.results) {
            const tone = result.passed ? 'success' : 'error';
            const label = `${result.environment} · ${result.name}`;

            reporter.raw(`  ${reporter.style.paint(tone, marker(result.passed ? 'success' : 'failure'))} ${label}`);

            if (!result.passed) {
                reporter.rawError(`      ${formatLocation(root, map, result, cache)} ${result.message}`);
            }
        }

        if (run.failure !== null) {
            reporter.error(`The ${run.environment} test run did not complete: ${run.failure}`);
        }
    }

    const totals = countResults(runs);
    const summary = `${pluralize(totals.passed, 'test')} passed, ${totals.failed} failed in ${formatDuration(durationMs)}.`;
    const crashed = runs.some((run) => run.failure !== null);

    if (totals.failed === 0 && !crashed) {
        reporter.success(`Tests passed: ${summary}`);

        return true;
    }

    reporter.error(`Tests failed: ${summary}`);

    return false;
}
