import { describe, expect, it } from 'vitest';

import { generate } from '@generator/catalog-generator';
import { normalize } from '@generator/catalog-normalizer';
import { emitOopSurface } from '@generator/oop-emitter';
import { parseOopClasses } from '@generator/oop-parser';
import { buildOopSurface } from '@generator/oop-surface-builder';
import type { MapContext } from '@generator/type-mapper';
import { oopMethod } from '@mta-types/oop-declaration';
import { BOOLEAN, fn, STRING } from '@mta-types/type-descriptor';

const result = generate();

const context: MapContext = { elementTypes: new Set(['Element', 'Player']), aliases: {}, typeParameters: new Set() };

function upstreamFile(contents: string) {
    return { category: 'fixture', path: 'fixture.d.ts', contents };
}

function classNamed(name: string) {
    return result.oop.classes.find((declaration) => declaration.name === name);
}

describe('oop surface generator', () => {
    const declared = new Set([...result.catalog.shared, ...result.catalog.server, ...result.catalog.client].map((entry) => entry.name));

    it('maps every member to a declared procedural function', () => {
        const orphans = result.oop.classes.flatMap((declaration) =>
            declaration.members.filter((member) => !declared.has(member.procedural)).map((member) => `${declaration.name}.${member.name}`),
        );

        expect(orphans).toEqual([]);
    });

    it('roots the element hierarchy at Element and resolves every parent', () => {
        const names = new Set(result.oop.classes.map((declaration) => declaration.name));

        expect(classNamed('Element')?.parent).toBeNull();

        for (const declaration of result.oop.classes) {
            expect(declaration.parent === null || names.has(declaration.parent), declaration.name).toBe(true);
        }
    });

    it('covers every element type with a class and declares Player under Ped', () => {
        expect(result.oop.classes).toHaveLength(result.elementTypes);
        expect(classNamed('Player')?.parent).toBe('Ped');
        expect(classNamed('Player')?.members.find((member) => member.name === 'getName')?.procedural).toBe('getPlayerName');
    });

    it('takes the environment of every member from its procedural function', () => {
        const entries = [...result.catalog.shared, ...result.catalog.server, ...result.catalog.client];
        const environments = new Map(entries.map((entry) => [entry.name, entry.environment]));

        for (const declaration of result.oop.classes) {
            for (const member of declaration.members) {
                expect(member.environment, `${declaration.name}.${member.name}`).toBe(environments.get(member.procedural));
            }
        }
    });

    it('keeps a server-only method server-only', () => {
        expect(classNamed('Player')?.members.find((member) => member.name === 'kick')?.environment).toBe('server');
    });

    it('emits every chunk the oop aggregate imports', () => {
        const emitted = new Set(result.files.map((file) => file.path));
        const aggregate = result.files.find((file) => file.path === 'src/generated/oop/mta-oop.ts');
        const imports = [...(aggregate?.contents.matchAll(/from '\.\/(mta-oop-[0-9]+)'/g) ?? [])];

        expect(imports.length).toBeGreaterThan(0);

        for (const match of imports) {
            expect(emitted.has(`src/generated/oop/${match[1]}.ts`)).toBe(true);
        }
    });
});

describe('oop parser', () => {
    it('reads the procedural function from the upstream wiki link and skips a static member', () => {
        const source = [
            'export class Player extends Ped {',
            '    name: string;',
            '    /** @see https://wiki.multitheftauto.com/wiki/GetPlayerName */',
            '    getName(): string;',
            '    /** @see https://wiki.multitheftauto.com/wiki/GetRandomPlayer */',
            '    static getRandom(): Player;',
            '    undocumented(): boolean;',
            '}',
            '',
        ].join('\n');
        const [parsed] = parseOopClasses(upstreamFile(source), context);

        expect(parsed?.methods).toEqual([{ name: 'getName', procedural: 'getPlayerName', type: fn([], STRING, 0) }]);
        expect(parsed?.properties).toEqual(['name']);
    });

    it('reads optional and variadic parameters the way the procedural parser does', () => {
        const source = [
            'export class Player extends Ped {',
            '    /** @see https://wiki.multitheftauto.com/wiki/BanPlayer */',
            '    ban(reason?: string, ...rest: any[]): boolean;',
            '}',
            '',
        ].join('\n');
        const [parsed] = parseOopClasses(upstreamFile(source), context);

        expect(parsed?.methods[0]?.type).toEqual(fn([STRING], BOOLEAN, 0, true));
    });
});

describe('oop surface builder', () => {
    const elementOnly = [{ name: 'Element', parent: null }];

    it('drops a member whose procedural function is not declared', () => {
        const parsed = [{ name: 'Element', methods: [{ name: 'vanish', procedural: 'vanishElement', type: fn([], BOOLEAN, 0) }], properties: [] }];
        const surface = buildOopSurface(parsed, elementOnly, normalize([], []));

        expect(surface.skippedMethods).toEqual(['Element.vanish']);
        expect(surface.classes[0]?.members).toEqual([]);
    });

    it('types a property from the getter it resolves to', () => {
        const methods = [{ name: 'getName', procedural: 'getElementName', type: fn([], STRING, 0) }];
        const catalog = normalize([{ name: 'getElementName', category: 'element', type: fn([], STRING, 0) }], []);
        const surface = buildOopSurface([{ name: 'Element', methods, properties: ['name'] }], elementOnly, catalog);

        expect(surface.classes[0]?.members).toContainEqual(oopMethod('getName', 'server', 'getElementName', fn([], STRING, 0)));
        expect(surface.classes[0]?.members).toContainEqual({
            name: 'name',
            kind: 'property',
            environment: 'server',
            procedural: 'getElementName',
            type: STRING,
        });
    });

    it('drops a property with no resolvable getter', () => {
        const catalog = normalize([{ name: 'getElementName', category: 'element', type: fn([], STRING, 0) }], []);
        const surface = buildOopSurface([{ name: 'Element', methods: [], properties: ['vehicle'] }], elementOnly, catalog);

        expect(surface.skippedProperties).toEqual(['Element.vehicle']);
    });
});

describe('oop emitter', () => {
    it('wraps a member that does not fit on one line', () => {
        const wide = fn([STRING, STRING, STRING, STRING, STRING, STRING, STRING, STRING, STRING, STRING, STRING, STRING], BOOLEAN, 12);
        const member = oopMethod('aVeryLongMethodNameIndeedThatKeepsGoing', 'server', 'setSomethingExceedinglyWide', wide);
        const [file] = emitOopSurface([{ name: 'Element', parent: null, members: [member] }]);

        expect(Math.max(...(file?.contents.split('\n').map((line) => line.length) ?? [0]))).toBeLessThanOrEqual(150);
    });

    it('emits a class with no members as an empty list', () => {
        const [file] = emitOopSurface([{ name: 'Element', parent: null, members: [] }]);

        expect(file?.contents).toContain("oopClass('Element', null, []),");
    });
});
