import { describe, expect, it } from 'vitest';

import { declarationEnvironment } from '@mta-types/catalog';
import { ELEMENT_TYPES } from '@mta-types/generated/element-types';
import { allOopClasses, findOopClass, findOopMember, findOopStaticMethod, oopClassesFor } from '@mta-types/oop-surface';
import { fn, STRING } from '@mta-types/type-descriptor';

describe('oop surface', () => {
    it('declares a class for every element type', () => {
        expect(allOopClasses().map((declaration) => declaration.name).sort()).toEqual(ELEMENT_TYPES.map((element) => element.name).sort());
    });

    it('finds a class and reports an unknown one', () => {
        expect(findOopClass('Player')?.parent).toBe('Ped');
        expect(findOopClass('Table')).toBeNull();
    });

    it('resolves a member through the element hierarchy', () => {
        expect(findOopMember('Player', 'getName')?.procedural).toBe('getPlayerName');
        expect(findOopMember('Player', 'setDimension')?.procedural).toBe('setElementDimension');
        expect(findOopMember('Player', 'getNam')).toBeNull();
    });

    it('keeps static methods separate and scoped to their declared side', () => {
        expect(findOopStaticMethod('Player', 'getRandom')?.environment).toBe('server');
        expect(findOopMember('Player', 'getRandom')).toBeNull();
        expect(oopClassesFor('client').find((declaration) => declaration.name === 'Player')?.staticMethods).not.toContainEqual(
            expect.objectContaining({ name: 'getRandom' }),
        );
    });

    it('exposes File as a shared callable class with static methods', () => {
        const file = findOopClass('File');

        expect(file?.constructor?.environment).toBe('shared');
        expect(file?.constructor?.type).toEqual(fn([STRING], { kind: 'named', name: 'File' }, 1));
        expect(file?.staticMethods.map((member) => member.name)).toEqual(['copy', 'delete', 'exists', 'new', 'rename']);
    });

    it('scopes the members of a class by environment', () => {
        const names = (environment: 'server' | 'client'): string[] =>
            oopClassesFor(environment)
                .find((declaration) => declaration.name === 'Element')
                ?.members.map((member) => member.name) ?? [];

        expect(names('client')).toContain('getLighting');
        expect(names('server')).not.toContain('getLighting');
        expect(names('server')).toContain('setDimension');
    });

    it('declares every member where its procedural function is available', () => {
        for (const declaration of allOopClasses()) {
            for (const member of declaration.members) {
                const proceduralEnvironment = declarationEnvironment(member.procedural);

                expect(
                    proceduralEnvironment === 'shared' || proceduralEnvironment === member.environment,
                    `${declaration.name}.${member.name}`,
                ).toBe(true);
            }
        }
    });
});
