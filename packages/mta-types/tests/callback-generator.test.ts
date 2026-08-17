import { describe, expect, it } from 'vitest';

import { emitCatalog } from '@generator/catalog-emitter';
import { normalize } from '@generator/catalog-normalizer';
import { parseFunctions, parseTypeAliases } from '@generator/declaration-parser';
import { EMPTY_DOCUMENTATION } from '@mta-types/api-documentation';
import { BOOLEAN, fn, named, STRING, VOID } from '@mta-types/type-descriptor';

import type { MapContext } from '@generator/type-mapper';

const source = [
    'type Handler = (value: Element, label?: string, ...flags: boolean[]) => (done?: number) => void;',
    'export declare function sample(callback: (value: Element, label?: string, ...flags: boolean[]) => (done?: number) => void): boolean;',
    'export declare function aliasSample(callback: Handler): boolean;',
    '',
].join('\n');
const file = { category: 'fixture', path: 'fixture.d.ts', contents: source };
const context: MapContext = {
    elementTypes: new Set(['Element']),
    aliases: {},
    typeParameters: new Set(),
    typeAliases: parseTypeAliases([file]),
};

describe('callback generation', () => {
    it('maps an inline callback and its nested return recursively', () => {
        const [declaration] = parseFunctions(file, context, new Set());
        const callback = declaration?.type.kind === 'function' ? declaration.type.parameters[0] : null;

        expect(callback).toEqual({
            kind: 'function',
            parameters: [{ kind: 'named', name: 'Element' }, { kind: 'string' }],
            parameterNames: ['value', 'label'],
            variadicType: { kind: 'boolean' },
            returnType: {
                kind: 'function',
                parameters: [{ kind: 'number' }],
                parameterNames: ['done'],
                returnType: { kind: 'void' },
                minimumArguments: 0,
                isVariadic: false,
            },
            minimumArguments: 1,
            isVariadic: true,
        });
    });

    it('resolves callback type aliases', () => {
        const declarations = parseFunctions(file, context, new Set());
        const callback = declarations[1]?.type.kind === 'function' ? declarations[1].type.parameters[0] : null;

        expect(callback?.kind).toBe('function');
    });

    it('emits nested callbacks as fn data', () => {
        const [declaration] = parseFunctions(file, context, new Set());
        const entry = declaration === undefined ? [] : [{ ...declaration, environment: 'server' as const }];
        const generated = emitCatalog('server', entry).find((candidate) => candidate.path === 'src/generated/api/mta-fixture-server.ts');

        expect(generated?.contents).toContain("fn([named('Element'), STRING], fn([NUMBER], VOID, 0, false, ['done']), 1, true, ['value', 'label'], BOOLEAN)");
    });

    it('keeps matching nested callbacks when environments normalize to shared', () => {
        const [declaration] = parseFunctions(file, context, new Set());
        const catalog = declaration === undefined ? normalize([], []) : normalize([declaration], [declaration]);
        const callback = catalog.shared[0]?.type.kind === 'function' ? catalog.shared[0].type.parameters[0] : null;

        expect(callback?.kind).toBe('function');
        expect(callback?.kind === 'function' ? callback.returnType.kind : null).toBe('function');
    });

    it('retains exact variants when nested callbacks differ', () => {
        const serverType = fn([fn([named('Player'), STRING], VOID, 2, true)], BOOLEAN, 1);
        const clientType = fn([fn([STRING], VOID, 1, true)], BOOLEAN, 1);
        const server = { name: 'sample', category: 'fixture', type: serverType, documentation: EMPTY_DOCUMENTATION };
        const client = { name: 'sample', category: 'fixture', type: clientType, documentation: EMPTY_DOCUMENTATION };
        const catalog = normalize([server], [client]);
        const shared = catalog.shared[0]?.type;

        expect(shared?.kind === 'function' ? shared.parameters[0]?.kind : null).toBe('function');
        expect(catalog.serverVariants[0]?.type).toEqual(serverType);
        expect(catalog.clientVariants[0]?.type).toEqual(clientType);
    });
});
