import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from 'vitest';

import { generate } from '@generator/catalog-generator';
import { emitCatalog } from '@generator/catalog-emitter';
import { parseClasses, parseEvents, parseFunctions, parseVariables } from '@generator/declaration-parser';
import { GeneratorError } from '@generator/generator-model';
import { normalize } from '@generator/catalog-normalizer';
import type { MapContext } from '@generator/type-mapper';
import { CATALOG_OVERRIDES } from '@mta-types/catalog-overrides';
import { BOOLEAN, fn, NUMBER, STRING } from '@mta-types/type-descriptor';

const packageRoot = fileURLToPath(new URL('..', import.meta.url));
const result = generate();

const context: MapContext = { elementTypes: new Set(['Element']), aliases: {}, typeParameters: new Set() };

function upstreamFile(contents: string) {
    return { category: 'fixture', path: 'fixture.d.ts', contents };
}

describe('catalog generator', () => {
    it('regenerates every committed catalog file byte for byte', () => {
        const drifted = result.files.filter((file) => readFileSync(`${packageRoot}${file.path}`, 'utf8') !== file.contents);

        expect(drifted.map((file) => file.path)).toEqual([]);
    });

    it('produces the same output on a second run', () => {
        const second = generate();

        expect(second.files).toEqual(result.files);
    });

    it('emits every catalog the aggregates import', () => {
        const emitted = new Set(result.files.map((file) => file.path));

        for (const environment of ['shared', 'server', 'client'] as const) {
            const aggregate = result.files.find((file) => file.path === `src/generated/api/mta-${environment}.ts`);
            const imports = [...(aggregate?.contents.matchAll(/from '\.\/(mta-[a-z0-9-]+)'/g) ?? [])];

            expect(imports.length).toBeGreaterThan(0);

            for (const match of imports) {
                expect(emitted.has(`src/generated/api/${match[1]}.ts`)).toBe(true);
            }
        }
    });

    it('keeps every generated file inside the project limits', () => {
        for (const file of result.files) {
            const lines = file.contents.split('\n');

            expect(lines.length, file.path).toBeLessThanOrEqual(275);
            expect(Math.max(...lines.map((line) => line.length)), file.path).toBeLessThanOrEqual(150);
        }
    });

    it('declares every name in exactly one environment', () => {
        const names = [...result.catalog.shared, ...result.catalog.server, ...result.catalog.client].map((entry) => entry.name);

        expect(names.length).toBe(new Set(names).size);
    });

    it('lets an override win over the upstream declaration', () => {
        const entries = [...result.catalog.shared, ...result.catalog.server, ...result.catalog.client];

        for (const [name, override] of Object.entries(CATALOG_OVERRIDES)) {
            const entry = entries.find((candidate) => candidate.name === name);

            expect(entry, name).toBeDefined();

            if (override.type !== undefined) {
                expect(entry?.type, name).toEqual(override.type);
            }

            if (override.environment !== undefined) {
                expect(entry?.environment, name).toBe(override.environment);
            }
        }
    });

    it('never declares a Lua or runtime global from the upstream source', () => {
        expect(result.catalog.reserved).toContain('exports');
    });
});

describe('generator input validation', () => {
    it('rejects an event catalog with a non string member', () => {
        const source = 'export const enum EventNames {\n    OnBroken = 1,\n}\n';

        expect(() => parseEvents(upstreamFile(source))).toThrow(GeneratorError);
    });

    it('rejects an event catalog that declares nothing', () => {
        expect(() => parseEvents(upstreamFile('export const value: number;\n'))).toThrow(GeneratorError);
    });

    it('rejects a variable declared with a binding pattern', () => {
        expect(() => parseVariables(upstreamFile('export const { root }: Element;\n'), context)).toThrow(GeneratorError);
    });

    it('reads optional parameters as a lower minimum', () => {
        const source = 'export declare function sample(a: string, b?: number, ...rest: any[]): boolean;\n';
        const [declaration] = parseFunctions(upstreamFile(source), context, new Set());

        expect(declaration?.type).toEqual({
            kind: 'function',
            parameters: [{ kind: 'string' }, { kind: 'number' }],
            returnType: { kind: 'boolean' },
            minimumArguments: 1,
            isVariadic: true,
        });
    });

    it('types a mixed union as any and a literal union as its primitive', () => {
        const source = "export declare function sample(a: 'up' | 'down', b: number | string): void;\n";
        const [declaration] = parseFunctions(upstreamFile(source), context, new Set());
        const parameters = declaration?.type.kind === 'function' ? declaration.type.parameters : [];

        expect(parameters).toEqual([{ kind: 'string' }, { kind: 'any' }]);
    });

    it('types a multi return function as a tuple and records it', () => {
        const source = 'export declare function sample(): LuaMultiReturn<[number, number]>;\n';
        const multiReturns = new Set<string>();
        const [declaration] = parseFunctions(upstreamFile(source), context, multiReturns);

        expect([...multiReturns]).toEqual(['sample']);
        expect(declaration?.type.kind === 'function' ? declaration.type.returnType : null).toEqual({
            kind: 'tuple',
            elements: [{ kind: 'number' }, { kind: 'number' }],
        });
    });

    it('falls back to any for a multi return with a rest element', () => {
        const source = 'export declare function sample(): LuaMultiReturn<[...any[]]>;\n';
        const multiReturns = new Set<string>();
        const [declaration] = parseFunctions(upstreamFile(source), context, multiReturns);

        expect(declaration?.type.kind === 'function' ? declaration.type.returnType : null).toEqual({ kind: 'any' });
    });

    it('reads the parent of a declared class', () => {
        const source = 'export class Player extends Ped {}\nexport class Ped extends Element {}\n';

        expect(parseClasses(upstreamFile(source))).toEqual([
            { name: 'Player', parent: 'Ped' },
            { name: 'Ped', parent: 'Element' },
        ]);
    });
});

describe('generator normalization', () => {
    const serverOnly = { name: 'serverThing', category: 'fixture', type: { kind: 'string' } as const };
    const clientOnly = { name: 'clientThing', category: 'fixture', type: { kind: 'number' } as const };

    it('declares a function present on both sides as shared', () => {
        const both = { name: 'bothThing', category: 'fixture', type: { kind: 'string' } as const };
        const catalog = normalize([serverOnly, both], [clientOnly, both]);

        expect(catalog.shared.map((entry) => entry.name)).toEqual(['bothThing']);
        expect(catalog.server.map((entry) => entry.name)).toEqual(['serverThing']);
        expect(catalog.client.map((entry) => entry.name)).toEqual(['clientThing']);
    });

    it('widens a signature the two sides disagree on', () => {
        const server = { name: 'thing', category: 'fixture', type: fn([STRING], BOOLEAN, 1) };
        const client = { name: 'thing', category: 'fixture', type: fn([NUMBER], BOOLEAN, 0, true) };
        const [entry] = normalize([server], [client]).shared;

        expect(entry?.type).toEqual({
            kind: 'function',
            parameters: [{ kind: 'any' }],
            returnType: { kind: 'boolean' },
            minimumArguments: 0,
            isVariadic: true,
        });
    });

    it('emits an aggregate that spreads every category module', () => {
        const files = emitCatalog('server', [{ name: 'thing', category: 'fixture', environment: 'server', type: { kind: 'string' } }]);
        const aggregate = files.find((file) => file.path === 'src/generated/api/mta-server.ts');

        expect(files.map((file) => file.path)).toContain('src/generated/api/mta-fixture-server.ts');
        expect(aggregate?.contents).toContain('...MTA_FIXTURE_SERVER,');
    });
});
