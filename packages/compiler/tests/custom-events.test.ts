import { describe, expect, it } from 'vitest';

import { check } from '@compiler/checker/checker';
import { typeToString } from '@compiler/checker/types';
import { compile } from '@compiler/index';
import { parse } from '@compiler/parser/parser';
import { createProjectCache } from '@compiler/project/project-cache';

function codes(source: string, filePath = 'src/shared/events.luam'): string[] {
    return compile(source, { filePath }).diagnostics.map((diagnostic) => diagnostic.code);
}

describe('custom event declarations', () => {
    it('parses a dedicated event node with optional and typed variadic parameters', () => {
        const parsed = parse("declare event 'onMatchStart'(player: Player, round?: number, ...tags: string): void\n");

        expect(parsed.diagnostics).toEqual([]);
        expect(parsed.program.body[0]).toMatchObject({
            kind: 'event-declaration',
            name: 'onMatchStart',
            parameters: [
                { name: 'player', annotation: { kind: 'type-name', name: 'Player' }, isVararg: false },
                { name: 'round', annotation: { kind: 'type-optional', element: { name: 'number' } }, isVararg: false },
                { name: 'tags', annotation: { kind: 'type-name', name: 'string' }, isVararg: true },
            ],
            returnAnnotation: { kind: 'type-name', name: 'void' },
        });
    });

    it('keeps event contextual outside a declare event declaration', () => {
        const parsed = parse('local event = 1\nprint(event)\n');

        expect(parsed.diagnostics).toEqual([]);
        expect(parsed.program.body.map((statement) => statement.kind)).toEqual(['local-statement', 'call-statement']);
    });

    it('carries parameter names, types, variadic state, and source environment through checking', () => {
        const source = "interface Player {}\ndeclare event 'onMatchStart'(player: Player, round?: number, ...tags: string)\n";
        const parsed = parse(source);
        const checked = check(parsed.program, 'strict', 'server');
        const event = checked.events[0];

        expect(checked.diagnostics).toEqual([]);
        expect(event).toMatchObject({ name: 'onMatchStart', environment: 'server' });
        expect(event?.parameters.map((parameter) => [parameter.name, typeToString(parameter.type), parameter.isVariadic])).toEqual([
            ['player', 'Player', false],
            ['round', 'number?', false],
            ['tags', 'string', true],
        ]);
    });

    it('accepts omitted parameter annotations as any', () => {
        const result = compile("declare event 'onReady'(source)\n", { filePath: 'src/client/events.luam' });

        expect(result.diagnostics).toEqual([]);
        expect(typeToString(result.events[0]?.parameters[0]?.type ?? { kind: 'unknown' })).toBe('any');
        expect(result.events[0]?.environment).toBe('client');
    });

    it('reports duplicate and invalid declarations without output', () => {
        const duplicate = compile("declare event 'onReady'()\ndeclare event 'onReady'()\n");
        const invalidReturn = compile("declare event 'onReady'(): string\n");
        const invalidName = compile("declare event ''()\n");

        expect(duplicate.diagnostics.map((diagnostic) => diagnostic.code)).toEqual(['check-duplicate-event']);
        expect(invalidReturn.diagnostics.map((diagnostic) => diagnostic.code)).toEqual(['check-event-return-type']);
        expect(invalidName.diagnostics.map((diagnostic) => diagnostic.code)).toEqual(['check-invalid-event-name']);
        expect([duplicate.code, invalidReturn.code, invalidName.code]).toEqual([null, null, null]);
    });

    it('reports duplicate parameters and requires a final variadic parameter', () => {
        expect(codes("declare event 'onReady'(value: string, value: number)\n")).toEqual(['check-duplicate-event-parameter']);
        expect(codes("declare event 'onReady'(...values: string, final: string)\n")).toEqual(['check-invalid-event-parameter']);
    });

    it('erases event declarations without runtime helpers', () => {
        const result = compile("declare event 'onReady'()\nlocal ready: boolean = true\n");

        expect(result.diagnostics).toEqual([]);
        expect(result.code).toBe('\nlocal ready = true\n');
        expect(result.requiredHelpers).toEqual([]);
    });

    it('exposes shared event contracts to project modules and the project result', () => {
        const cache = createProjectCache();
        const result = cache.compile([
            { path: 'src/shared/events.d.luam', source: "declare event 'onMatchStart'(round: number)\n" },
            { path: 'src/server/main.luam', source: 'print(1)\n' },
        ]);
        const server = result.modules.find((module) => module.path === 'src/server/main.luam');

        expect(result.diagnostics).toEqual([]);
        expect(result.events).toHaveLength(1);
        expect(result.events[0]).toMatchObject({ name: 'onMatchStart', environment: 'shared' });
        expect(server?.events[0]).toMatchObject({ name: 'onMatchStart', environment: 'shared' });
        expect(typeToString(server?.events[0]?.parameters[0]?.type ?? { kind: 'unknown' })).toBe('number');
    });

    it('retains separate server and client contracts with the same event name', () => {
        const result = createProjectCache().compile([
            { path: 'src/server/events.d.luam', source: "declare event 'onReady'(value: number)\n" },
            { path: 'src/client/events.d.luam', source: "declare event 'onReady'(value: string)\n" },
        ]);

        expect(result.diagnostics).toEqual([]);
        expect(result.events.map((event) => [event.name, event.environment, typeToString(event.parameters[0]?.type ?? { kind: 'unknown' })])).toEqual([
            ['onReady', 'server', 'number'],
            ['onReady', 'client', 'string'],
        ]);
    });

    it('invalidates project modules when an event contract changes', () => {
        const cache = createProjectCache();
        const files = (type: string) => [
            { path: 'src/shared/events.d.luam', source: `declare event 'onMatchStart'(round: ${type})\n` },
            { path: 'src/server/main.luam', source: 'print(1)\n' },
        ];

        cache.compile(files('number'));

        const changed = cache.compile(files('string'));

        expect(changed.stats).toEqual({ files: 2, declarationsReused: 1, modulesReused: 0 });
        expect(typeToString(changed.events[0]?.parameters[0]?.type ?? { kind: 'unknown' })).toBe('string');
    });
});
