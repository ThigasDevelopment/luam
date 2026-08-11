import { afterEach, describe, expect, it } from 'vitest';

import { runCli } from '@cli/cli/run';
import { readResourceMap } from '@cli/build/resource-map-file';
import { EXIT_DIAGNOSTICS, EXIT_OK } from '@cli/cli/exit-codes';
import { runTraceCommand } from '@cli/commands/trace-command';
import { resolveDevelopmentLogPosition } from '@cli/commands/trace-position';
import type { ResourceMap, ResourceMapSegment } from '@compiler/project/resource';

import { createMemoryLogger, createMemoryReporter } from './support/memory-logger';
import { createProjectFixture, defaultProjectFiles, type ProjectFixture } from './support/project-fixture';

const OFFLINE = { LUAM_OFFLINE: '1' };

const fixtures: ProjectFixture[] = [];

function generatedPosition(map: ResourceMap): { generated: string; source: string } {
    for (const file of map.files) {
        for (const segment of file.segments) {
            const mapping = segment.lines[0];

            if (segment.kind === 'module' && mapping !== undefined) {
                const line = segment.contentStartLine + mapping.generatedLine - 1;

                return { generated: `${file.path}:${line}`, source: `${segment.source}:${mapping.sourceLine}` };
            }
        }
    }

    throw new Error('The test map has no mapped module position.');
}

const MAP_FILE = 'build/luam-demo.luam-map.json';

async function builtProject(minified = false): Promise<{ fixture: ProjectFixture; map: ResourceMap; position: { generated: string; source: string } }> {
    const fixture = createProjectFixture(defaultProjectFiles({ output: { bundle: true, map: true } }));

    fixtures.push(fixture);

    expect(await runCli(['build'], { cwd: fixture.root, env: OFFLINE, logger: createMemoryLogger() })).toBe(EXIT_OK);

    const written = JSON.parse(fixture.read(MAP_FILE)) as ResourceMap;
    const { minified: production, ...development } = written;
    const map = minified ? written : (development as ResourceMap);

    expect(production).toBe(true);
    fixture.write(MAP_FILE, `${JSON.stringify(map)}\n`);

    return { fixture, map, position: generatedPosition(map) };
}

afterEach(() => {
    for (const fixture of fixtures.splice(0)) {
        fixture.dispose();
    }
});

describe('trace command', () => {
    it('uses an explicit map without project configuration for bare and full log positions', async () => {
        const { fixture, map, position } = await builtProject();

        fixture.remove('luam.json');

        const bare = createMemoryLogger();
        const full = createMemoryLogger();
        const path = 'build/luam-demo.luam-map.json';

        expect(await runCli(['trace', position.generated, '--map', path], { cwd: fixture.root, logger: bare })).toBe(EXIT_OK);
        expect(await runCli(['trace', `ERROR: [${map.resource}/${position.generated}] failure`, '--map', path], { cwd: fixture.root, logger: full })).toBe(EXIT_OK);
        expect(bare.lines[0]).toContain(position.source);
        expect(full.lines[0]).toContain(position.source);
    });

    it('discovers one default map and resolves multiple stdin lines', async () => {
        const { fixture, map, position } = await builtProject();

        fixture.remove('luam.json');

        const { logger, reporter } = createMemoryReporter();
        const second = generatedPosition({ ...map, files: map.files.slice().reverse() });
        const code = runTraceCommand(fixture.root, reporter, {
            configPath: null,
            env: {},
            mapPath: null,
            operand: null,
            input: `${position.generated}\n${second.generated}\n`,
        });

        expect(code).toBe(EXIT_OK);
        expect(logger.lines).toHaveLength(2);
    });

    it('rejects empty input before it looks for a map', async () => {
        const { fixture } = await builtProject();
        const { logger, reporter } = createMemoryReporter();
        const code = runTraceCommand(fixture.root, reporter, { configPath: null, env: {}, mapPath: null, operand: null, input: '\n  \n' });

        expect(code).toBe(EXIT_DIAGNOSTICS);
        expect(logger.errors).toEqual(['Trace received no positions. Provide a file and line or pipe positions through stdin.']);
    });

    it('ignores maps below node_modules and dot directories when discovering', async () => {
        const { fixture, position } = await builtProject();

        fixture.remove('luam.json');
        fixture.write('node_modules/other/decoy.luam-map.json', '{}');
        fixture.write('.cache/decoy.luam-map.json', '{}');

        const logger = createMemoryLogger();

        expect(await runCli(['trace', position.generated], { cwd: fixture.root, logger })).toBe(EXIT_OK);
        expect(logger.lines[0]).toContain(position.source);
    });

    it('reports unknown map versions and uncovered positions', async () => {
        const { fixture, map, position } = await builtProject();
        const logger = createMemoryLogger();

        fixture.write('unknown.luam-map.json', `${JSON.stringify({ ...map, version: 99 })}\n`);

        expect(await runCli(['trace', position.generated, '--map', 'unknown.luam-map.json'], { cwd: fixture.root, logger })).toBe(EXIT_DIAGNOSTICS);
        expect(logger.errors.at(-1)).toContain('version 99 is not supported');

        logger.errors.length = 0;

        expect(await runCli(['trace', 'missing.lua:1', '--map', MAP_FILE], { cwd: fixture.root, logger })).toBe(EXIT_DIAGNOSTICS);
        expect(logger.errors.at(-1)).toContain('does not cover');
    });

    it('refuses a production map instead of resolving a line the artifact does not have', async () => {
        const { fixture, position } = await builtProject(true);
        const logger = createMemoryLogger();

        expect(await runCli(['trace', position.generated, '--map', MAP_FILE], { cwd: fixture.root, logger })).toBe(EXIT_DIAGNOSTICS);
        expect(logger.errors.join('\n')).toContain('describes minified production output');
        expect(logger.lines.join('\n')).toContain('luam dev');
    });

    it('reports an unknown integer version before validating its structure', () => {
        const fixture = createProjectFixture({ 'unknown.luam-map.json': '{"version":99}' });

        fixtures.push(fixture);

        expect(readResourceMap(`${fixture.root}/unknown.luam-map.json`).error).toContain('version 99 is not supported');
    });

    it('rejects maps that violate ordered range and mapping invariants', () => {
        const fixture = createProjectFixture();
        const segment: ResourceMapSegment = {
            kind: 'module',
            generatedStartLine: 1,
            generatedEndLine: 5,
            contentStartLine: 2,
            source: 'src/server/main.luam',
            lines: [{ generatedLine: 1, sourceLine: 1 }, { generatedLine: 3, sourceLine: 3 }],
        };
        const invalid: ResourceMap[] = [
            { version: 1, resource: 'demo', layout: 'bundle', files: [{ path: 'src/server.lua', segments: [{ ...segment, generatedStartLine: 0 }] }] },
            { version: 1, resource: 'demo', layout: 'bundle', files: [{ path: 'src/server.lua', segments: [{ ...segment, generatedEndLine: 0 }] }] },
            { version: 1, resource: 'demo', layout: 'bundle', files: [{ path: 'src/server.lua', segments: [segment, { ...segment, generatedStartLine: 5 }] }] },
            {
                version: 1,
                resource: 'demo',
                layout: 'bundle',
                files: [{ path: 'src/server.lua', segments: [{ ...segment, generatedStartLine: 8, generatedEndLine: 9, contentStartLine: 9 }, segment] }],
            },
            {
                version: 1,
                resource: 'demo',
                layout: 'bundle',
                files: [{ path: 'src/server.lua', segments: [{ ...segment, lines: [{ generatedLine: 2, sourceLine: 1 }, { generatedLine: 2, sourceLine: 2 }] }] }],
            },
            { version: 1, resource: 'demo', layout: 'bundle', files: [{ path: 'src/server.lua', segments: [{ ...segment, lines: [{ generatedLine: 5, sourceLine: 1 }] }] }] },
            { version: 1, resource: 'demo', layout: 'bundle', files: [{ path: 'src/server.lua', segments: [{ ...segment, lines: [{ generatedLine: 1, sourceLine: 0 }] }] }] },
            { version: 1, resource: 'demo', layout: 'bundle', files: [{ path: 'src/server.lua', segments: [segment] }, { path: './src/server.lua', segments: [] }] },
        ];

        fixtures.push(fixture);

        for (const [index, map] of invalid.entries()) {
            const path = `invalid-${index}.luam-map.json`;

            fixture.write(path, JSON.stringify(map));
            expect(readResourceMap(`${fixture.root}/${path}`).error).toContain('invalid structure');
        }
    });

    it('preserves unresolved development records byte-for-byte', () => {
        const segment: ResourceMapSegment = {
            kind: 'helper',
            generatedStartLine: 1,
            generatedEndLine: 3,
            contentStartLine: 2,
            source: 'helper.lua',
            lines: [],
        };
        const map: ResourceMap = { version: 1, resource: 'demo', layout: 'bundle', files: [{ path: 'src/server.lua', segments: [segment] }] };
        const record = {
            timestamp: new Date('2026-08-11T00:00:00Z'),
            environment: 'server' as const,
            level: 'error' as const,
            message: 'failure',
            resource: 'demo',
            source: { path: 'src/server.lua', line: 1 },
        };

        expect(resolveDevelopmentLogPosition(record, map)).toBe(record);
    });

    it('resolves development records covered by the in-memory map', async () => {
        const { map, position } = await builtProject();
        const separator = position.generated.lastIndexOf(':');
        const record = {
            timestamp: new Date('2026-08-11T00:00:00Z'),
            environment: 'server' as const,
            level: 'error' as const,
            message: 'failure',
            resource: map.resource,
            source: { path: position.generated.slice(0, separator), line: Number(position.generated.slice(separator + 1)) },
        };

        const resolved = resolveDevelopmentLogPosition(record, map);

        expect(`${resolved.source?.path}:${resolved.source?.line}`).toBe(position.source);
    });

    it('preserves an enclosing symbol when resolving development records', () => {
        const segment: ResourceMapSegment = {
            kind: 'module',
            generatedStartLine: 1,
            generatedEndLine: 3,
            contentStartLine: 2,
            source: 'src/server/main.luam',
            lines: [{ generatedLine: 1, sourceLine: 4, symbol: 'announceJoin' }],
        };
        const map: ResourceMap = { version: 1, resource: 'demo', layout: 'bundle', files: [{ path: 'src/server.lua', segments: [segment] }] };
        const record = {
            timestamp: new Date('2026-08-11T00:00:00Z'),
            environment: 'server' as const,
            level: 'error' as const,
            message: 'failure',
            resource: 'demo',
            source: { path: 'src/server.lua', line: 2 },
        };

        expect(resolveDevelopmentLogPosition(record, map).source).toEqual({ path: 'src/server/main.luam', line: 4, symbol: 'announceJoin' });
    });
});
