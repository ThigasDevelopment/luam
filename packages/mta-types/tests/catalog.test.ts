import { describe, expect, it } from 'vitest';

import { isAvailableIn } from '@mta-types/api-declaration';
import { allDeclarations, declarationEnvironment, findDeclaration, globalsFor, isApiAvailable } from '@mta-types/catalog';
import { CATALOG_OVERRIDES } from '@mta-types/catalog-overrides';
import { elementAncestors, isElementType } from '@mta-types/element-hierarchy';
import { ELEMENT_TYPES } from '@mta-types/generated/element-types';
import { eventEnvironment } from '@mta-types/event-lookup';
import { findLibraryMember, isLibrary } from '@mta-types/library-members';
import { MTA_EVENTS } from '@mta-types/generated/mta-events';
import type { TypeDescriptor } from '@mta-types/type-descriptor';

const ENVIRONMENTS = ['server', 'client', 'shared'] as const;

function isValidDescriptor(descriptor: TypeDescriptor): boolean {
    if (descriptor.kind === 'function') {
        const withinRange = descriptor.minimumArguments >= 0 && descriptor.minimumArguments <= descriptor.parameters.length;

        return withinRange && descriptor.parameters.every(isValidDescriptor) && isValidDescriptor(descriptor.returnType);
    }

    if (descriptor.kind === 'array' || descriptor.kind === 'optional') {
        return isValidDescriptor(descriptor.element);
    }

    if (descriptor.kind === 'union') {
        return descriptor.options.length > 1 && descriptor.options.every(isValidDescriptor);
    }

    if (descriptor.kind === 'named') {
        return descriptor.name.length > 0;
    }

    return true;
}

describe('catalog invariants', () => {
    it('declares every API name exactly once', () => {
        const names = allDeclarations().map((declaration) => declaration.name);

        expect(names.length).toBe(new Set(names).size);
    });

    it('carries an environment and a source for every declaration', () => {
        const invalid = allDeclarations().filter((declaration) => !ENVIRONMENTS.includes(declaration.environment));

        expect(invalid).toEqual([]);
        expect(allDeclarations().every((declaration) => declaration.source.length > 0)).toBe(true);
    });

    it('carries a valid descriptor for every declaration', () => {
        const invalid = allDeclarations().filter((declaration) => !isValidDescriptor(declaration.type));

        expect(invalid.map((declaration) => declaration.name)).toEqual([]);
    });

    it('names every element type a declaration references', () => {
        const referenced = new Set<string>();

        const walk = (descriptor: TypeDescriptor): void => {
            if (descriptor.kind === 'named') {
                referenced.add(descriptor.name);
            } else if (descriptor.kind === 'array' || descriptor.kind === 'optional') {
                walk(descriptor.element);
            } else if (descriptor.kind === 'union') {
                descriptor.options.forEach(walk);
            } else if (descriptor.kind === 'function') {
                descriptor.parameters.forEach(walk);
                walk(descriptor.returnType);
            }
        };

        allDeclarations().forEach((declaration) => walk(declaration.type));

        expect([...referenced].filter((name) => !isElementType(name))).toEqual([]);
    });

    it('covers the full MTA surface', () => {
        const mta = allDeclarations().filter((declaration) => declaration.source === 'mta');

        expect(mta.length).toBeGreaterThan(1200);
        expect(MTA_EVENTS.server.length).toBeGreaterThan(70);
        expect(MTA_EVENTS.client.length).toBeGreaterThan(110);
        expect(ELEMENT_TYPES.length).toBeGreaterThan(50);
    });
});

describe('catalog environments', () => {
    it('scopes dxDrawText to the client', () => {
        expect(declarationEnvironment('dxDrawText')).toBe('client');
        expect(isApiAvailable('dxDrawText', 'client')).toBe(true);
        expect(isApiAvailable('dxDrawText', 'server')).toBe(false);
    });

    it('scopes banPlayer to the server', () => {
        expect(declarationEnvironment('banPlayer')).toBe('server');
        expect(isApiAvailable('banPlayer', 'server')).toBe(true);
        expect(isApiAvailable('banPlayer', 'client')).toBe(false);
        expect(isApiAvailable('banPlayer', 'shared')).toBe(false);
    });

    it('declares outputChatBox on both sides', () => {
        expect(declarationEnvironment('outputChatBox')).toBe('shared');

        for (const environment of ENVIRONMENTS) {
            expect(isApiAvailable('outputChatBox', environment)).toBe(true);
        }
    });

    it('resolves shared globals and element functions in every environment', () => {
        for (const environment of ENVIRONMENTS) {
            expect(isApiAvailable('root', environment)).toBe(true);
            expect(isApiAvailable('source', environment)).toBe(true);
            expect(isApiAvailable('getElementByID', environment)).toBe(true);
            expect(isApiAvailable('addEventHandler', environment)).toBe(true);
            expect(isApiAvailable('addCommandHandler', environment)).toBe(true);
            expect(isApiAvailable('removeCommandHandler', environment)).toBe(true);
        }
    });

    it('merges both sides into the shared surface', () => {
        const shared = globalsFor('shared').map((declaration) => declaration.name);

        expect(shared.length).toBeGreaterThan(globalsFor('server').length);
        expect(shared.length).toBeGreaterThan(globalsFor('client').length);
        expect(new Set(shared).size).toBe(shared.length);
    });

    it('keeps the declared side on a merged shared declaration', () => {
        const shared = new Map(globalsFor('shared').map((declaration) => [declaration.name, declaration.environment]));

        expect(shared.get('dxDrawText')).toBe('client');
        expect(shared.get('banPlayer')).toBe('server');
        expect(shared.get('outputChatBox')).toBe('shared');
    });

    it('resolves a side-restricted name only in a shared file', () => {
        expect(findDeclaration('dxDrawText', 'shared')?.environment).toBe('client');
        expect(findDeclaration('dxDrawText', 'server')).toBeNull();
        expect(findDeclaration('banPlayer', 'shared')?.environment).toBe('server');
        expect(findDeclaration('banPlayer', 'client')).toBeNull();
    });

    it('includes the Lua standard library in every environment', () => {
        const shared = globalsFor('shared').map((declaration) => declaration.name);

        expect(shared).toContain('print');
        expect(shared).toContain('tostring');
        expect(globalsFor('server').map((declaration) => declaration.name)).not.toContain('dxDrawText');
    });

    it('treats an unknown name as available', () => {
        expect(isApiAvailable('myCustomHelper', 'server')).toBe(true);
        expect(findDeclaration('myCustomHelper')).toBeNull();
    });

    it('resolves availability from a declared environment', () => {
        expect(isAvailableIn('shared', 'client')).toBe(true);
        expect(isAvailableIn('server', 'client')).toBe(false);
        expect(isAvailableIn('client', 'client')).toBe(true);
    });
});

describe('catalog signatures', () => {
    it('types getElementType', () => {
        expect(findDeclaration('getElementType')?.type).toEqual({
            kind: 'function',
            parameters: [{ kind: 'named', name: 'Element' }],
            returnType: { kind: 'string' },
            minimumArguments: 1,
            isVariadic: false,
        });
    });

    it('types addEventHandler from the override', () => {
        expect(findDeclaration('addEventHandler')?.type).toEqual(CATALOG_OVERRIDES.addEventHandler?.type);
    });

    it('types a multi-return function as a tuple', () => {
        const descriptor = findDeclaration('getElementPosition')?.type;

        expect(descriptor?.kind).toBe('function');
        expect(descriptor?.kind === 'function' ? descriptor.returnType : null).toEqual({
            kind: 'tuple',
            elements: [{ kind: 'number' }, { kind: 'number' }, { kind: 'number' }],
        });
    });

    it('keeps dxDrawText and outputChatBox callable with their common arguments', () => {
        const draw = findDeclaration('dxDrawText')?.type;
        const chat = findDeclaration('outputChatBox')?.type;

        expect(draw?.kind === 'function' ? draw.minimumArguments : null).toBeLessThanOrEqual(3);
        expect(chat?.kind === 'function' ? chat.minimumArguments : null).toBe(1);
    });

    it('types the Luam class runtime globals', () => {
        expect(declarationEnvironment('getClasses')).toBe('shared');
        expect(findDeclaration('bind')?.source).toBe('extension');
        expect(findDeclaration('getClasses')?.type).toEqual({
            kind: 'function',
            parameters: [],
            returnType: { kind: 'table' },
            minimumArguments: 0,
            isVariadic: false,
        });
    });

    it('types the extension helpers', () => {
        expect(isLibrary('table')).toBe(true);
        expect(findLibraryMember('table', 'size')).not.toBeNull();
        expect(findLibraryMember('string', 'template')).not.toBeNull();
        expect(findLibraryMember('math', 'clamp')).not.toBeNull();
        expect(findLibraryMember('table', 'missing')).toBeNull();
    });
});

describe('catalog events and elements', () => {
    it('scopes events by environment', () => {
        expect(eventEnvironment('onPlayerJoin')).toBe('server');
        expect(eventEnvironment('onClientRender')).toBe('client');
        expect(eventEnvironment('onCustomResourceEvent')).toBeNull();
        expect(MTA_EVENTS.shared).toEqual([]);
    });

    it('declares no event on two sides at once', () => {
        const overlap = MTA_EVENTS.server.filter((name) => MTA_EVENTS.client.includes(name));

        expect(overlap).toEqual([]);
    });

    it('describes the element hierarchy', () => {
        expect(isElementType('Player')).toBe(true);
        expect(isElementType('Table')).toBe(false);
        expect(elementAncestors('Player')).toEqual(['Ped', 'Element']);
        expect(elementAncestors('Element')).toEqual([]);
        expect(elementAncestors('Object')).toEqual(['Element']);
    });

    it('resolves every element parent to a declared type', () => {
        const orphans = ELEMENT_TYPES.filter((element) => element.parent !== null && !isElementType(element.parent));

        expect(orphans).toEqual([]);
    });
});
