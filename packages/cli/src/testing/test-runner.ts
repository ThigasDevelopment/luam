import { spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';

import { entryFile, entrySource, HARNESS_FILE, HARNESS_SOURCE, SENTINEL } from '@cli/testing/harness-source';
import { ALL_ENVIRONMENTS, type Environment } from '@compiler/environment/environment';
import { bundlePath } from '@compiler/project/resource';

import type { ResourceScript } from '@compiler/project/resource';

export interface LuaExecution {
    status: number | null;
    stdout: string;
    stderr: string;
    failure: string | null;
}

export type LuaSpawn = (executable: string, args: readonly string[], cwd: string) => LuaExecution;

export interface TestResult {
    environment: Environment;
    name: string;
    passed: boolean;
    file: string | null;
    line: number | null;
    message: string;
}

export interface EnvironmentRun {
    environment: Environment;
    results: TestResult[];
    output: string[];
    failure: string | null;
}

export interface TestRunRequest {
    executable: string;
    scripts: readonly ResourceScript[];
    environments: readonly Environment[];
    spawn?: LuaSpawn;
}

export function runLua(executable: string, args: readonly string[], cwd: string): LuaExecution {
    const result = spawnSync(executable, [...args], { cwd, encoding: 'utf8', shell: false, windowsHide: true });

    return {
        status: result.status,
        stdout: result.stdout ?? '',
        stderr: result.stderr ?? '',
        failure: result.error === undefined ? null : result.error.message,
    };
}

function unescape(value: string): string {
    return value.replace(/\\(.)/g, (match, character: string) => {
        if (character === 'n') {
            return '\n';
        }

        if (character === 'r') {
            return '\r';
        }

        return character === 't' ? '\t' : character;
    });
}

function parseLine(environment: Environment, line: string): TestResult | null {
    const parts = line.split('\t');

    if (parts[0] !== SENTINEL || (parts[1] !== 'pass' && parts[1] !== 'fail')) {
        return null;
    }

    const passed = parts[1] === 'pass';
    const file = unescape(parts[3] ?? '');
    const parsedLine = Number(parts[4] ?? '');

    return {
        environment,
        name: unescape(parts[2] ?? ''),
        passed,
        file: file.length === 0 ? null : file,
        line: Number.isSafeInteger(parsedLine) && parsedLine > 0 ? parsedLine : null,
        message: unescape(parts[5] ?? ''),
    };
}

export function parseRunOutput(environment: Environment, stdout: string): { results: TestResult[]; output: string[] } {
    const results: TestResult[] = [];
    const output: string[] = [];

    for (const line of stdout.split(/\r?\n/)) {
        const result = parseLine(environment, line);

        if (result !== null) {
            results.push(result);

            continue;
        }

        if (line.startsWith(SENTINEL) || line.length === 0) {
            continue;
        }

        output.push(line);
    }

    return { results, output };
}

function writeWorkspace(directory: string, scripts: readonly ResourceScript[]): void {
    writeFileSync(join(directory, HARNESS_FILE), HARNESS_SOURCE, 'utf8');

    for (const script of scripts) {
        const target = join(directory, script.path);

        mkdirSync(dirname(target), { recursive: true });
        writeFileSync(target, script.content, 'utf8');
    }
}

function loadOrder(available: ReadonlySet<string>, environment: Environment): { preload: string[]; target: string[] } {
    const shared = bundlePath('shared');
    const own = bundlePath(environment);
    const target = available.has(own) ? [own] : [];

    if (environment === 'shared') {
        return { preload: [], target };
    }

    return { preload: available.has(shared) ? [shared] : [], target };
}

export function runTests(request: TestRunRequest): EnvironmentRun[] {
    const spawn = request.spawn ?? runLua;
    const directory = mkdtempSync(join(tmpdir(), 'luam-test-'));
    const available = new Set(request.scripts.map((script) => script.path));

    try {
        writeWorkspace(directory, request.scripts);

        return ALL_ENVIRONMENTS.filter((environment) => request.environments.includes(environment)).map((environment): EnvironmentRun => {
            const { preload, target } = loadOrder(available, environment);
            const entry = entryFile(environment);

            writeFileSync(join(directory, entry), entrySource(environment, preload, target), 'utf8');

            const execution = spawn(request.executable, [entry], directory);
            const parsed = parseRunOutput(environment, execution.stdout);
            const failure = execution.failure ?? (parsed.results.length === 0 && execution.stderr.length > 0 ? execution.stderr.trim() : null);

            return { environment, results: parsed.results, output: parsed.output, failure };
        });
    } finally {
        rmSync(directory, { recursive: true, force: true });
    }
}
