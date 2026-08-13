import { existsSync, readFileSync } from 'node:fs';

import { discoverResourceMap, explicitResourceMapPath, readResourceMap, resourceMapPath } from '@cli/build/resource-map-file';
import { parseTracePosition } from '@cli/commands/trace-position';
import { manifestMode } from '@cli/config/manifest-context';
import { loadManifest } from '@cli/config/manifest-loader';
import type { Environment } from '@cli/config/validation-context';
import { EXIT_DIAGNOSTICS, EXIT_OK } from '@cli/cli/exit-codes';
import type { Reporter } from '@cli/reporting/reporter';
import { resolveResourcePosition } from '@compiler/project/resource';

export interface TraceOptions {
    manifestPath: string | null;
    env: Environment;
    mapPath: string | null;
    operand: string | null;
    input?: string;
}

function defaultMapPath(root: string, options: TraceOptions, reporter: Reporter): string | null {
    const loaded = loadManifest(root, { path: options.manifestPath, mode: manifestMode('trace'), env: options.env });

    if (loaded.config !== null) {
        const configured = resourceMapPath(root, loaded.config);

        if (existsSync(configured)) {
            return configured;
        }
    }

    const discovered = discoverResourceMap(root);

    if (discovered.path !== null) {
        return discovered.path;
    }

    if (discovered.candidates.length > 1) {
        reporter.error(`Trace found multiple resource maps: ${discovered.candidates.map((path) => `"${path}"`).join(', ')}. Use --map to choose one.`);
    } else {
        reporter.error('Trace could not find a resource map. Build with maps enabled or provide --map.');
    }

    return null;
}

function readStandardInput(): string {
    if (process.stdin.isTTY === true) {
        return '';
    }

    try {
        return readFileSync(0, 'utf8');
    } catch {
        return '';
    }
}

function traceInput(options: TraceOptions): string[] {
    const input = options.operand ?? options.input ?? readStandardInput();

    return input.split(/\r?\n/).filter((line) => line.trim().length > 0);
}

function generatedFile(resource: string, file: string): string {
    const normalized = file.replace(/^@/, '').replace(/^\.\//, '');
    const prefix = `${resource}/`;

    return normalized.startsWith(prefix) ? normalized.slice(prefix.length) : normalized;
}

export function runTraceCommand(root: string, reporter: Reporter, options: TraceOptions): number {
    const lines = traceInput(options);

    if (lines.length === 0) {
        reporter.error('Trace received no positions. Provide a file and line or pipe positions through stdin.');

        return EXIT_DIAGNOSTICS;
    }

    const path = options.mapPath === null ? defaultMapPath(root, options, reporter) : explicitResourceMapPath(root, options.mapPath);

    if (path === null) {
        return EXIT_DIAGNOSTICS;
    }

    const loaded = readResourceMap(path);

    if (loaded.map === null) {
        reporter.error(loaded.error);

        return EXIT_DIAGNOSTICS;
    }

    if (loaded.map.minified === true) {
        reporter.error(`Resource map "${path}" describes minified production output, where every script is one line.`);
        reporter.detail('A generated line cannot be resolved there. Reproduce the error under "luam dev" or "luam ensure" for a source position.');

        return EXIT_DIAGNOSTICS;
    }

    let failed = false;

    for (const line of lines) {
        const generated = parseTracePosition(line);

        if (generated === null) {
            reporter.error(`Trace could not find a file and line in "${line}".`);
            failed = true;

            continue;
        }

        const file = generatedFile(loaded.map.resource, generated.file);
        const resolution = resolveResourcePosition(loaded.map, file, generated.line);

        if (resolution.status === 'unknown-version') {
            reporter.error(`Resource map version ${resolution.version} is not supported.`);
            failed = true;

            continue;
        }

        if (resolution.status === 'uncovered') {
            reporter.error(`Resource map does not cover "${generated.file}:${generated.line}".`);
            failed = true;

            continue;
        }

        const symbol = resolution.position.symbol === undefined ? '' : ` (${resolution.position.symbol})`;

        reporter.raw(`${resolution.position.file}:${resolution.position.line}${symbol}`);
    }

    return failed ? EXIT_DIAGNOSTICS : EXIT_OK;
}
