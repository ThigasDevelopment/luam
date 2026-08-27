import { isAvailableIn, type ApiEnvironment } from '@mta-types/api-declaration';
import { allOopClasses } from '@mta-types/oop-surface';

import { descriptorToType } from './api-types';
import { DeclarationRegistry, type MemberInfo } from './registry';
import type { FunctionType } from './types';

const MTA_POSITION = { line: 0, column: 0, offset: 0 };

let cache: DeclarationRegistry | null = null;

let staticCache: ReadonlyMap<string, ReadonlyMap<string, MemberInfo>> | null = null;

export interface MtaConstructorInfo {
    type: FunctionType;
    environment: ApiEnvironment;
    procedural: string | null;
}

let constructorCache: ReadonlyMap<string, MtaConstructorInfo> | null = null;

function buildRegistry(): DeclarationRegistry {
    const registry = new DeclarationRegistry();

    for (const declaration of allOopClasses()) {
        const members = new Map<string, MemberInfo>();

        for (const member of declaration.members) {
            members.set(member.name, {
                name: member.name,
                type: descriptorToType(member.type),
                isMethod: member.kind === 'method',
                position: MTA_POSITION,
                environment: member.environment,
                procedural: member.procedural,
            });
        }

        registry.declareClass({
            name: declaration.name,
            typeParameters: [],
            typeConstraints: [],
            superClass: declaration.parent,
            superArguments: [],
            interfaces: [],
            members,
            statics: new Map(),
            position: MTA_POSITION,
        });
    }

    return registry;
}

export function clearMtaClassCache(): void {
    cache = null;
    staticCache = null;
    constructorCache = null;
}

function buildStaticMembers(): ReadonlyMap<string, ReadonlyMap<string, MemberInfo>> {
    const classes = new Map<string, ReadonlyMap<string, MemberInfo>>();

    for (const declaration of allOopClasses()) {
        classes.set(
            declaration.name,
            new Map(
                declaration.staticMethods.map((member) => [
                    member.name,
                    {
                        name: member.name,
                        type: descriptorToType(member.type),
                        isMethod: true,
                        position: MTA_POSITION,
                        environment: member.environment,
                        procedural: member.procedural,
                    },
                ]),
            ),
        );
    }

    return classes;
}

function buildConstructors(): ReadonlyMap<string, MtaConstructorInfo> {
    const constructors = new Map<string, MtaConstructorInfo>();

    for (const declaration of allOopClasses()) {
        const type = declaration.constructor === null ? null : descriptorToType(declaration.constructor.type);

        if (type?.kind === 'function') {
            const environment = declaration.constructor?.environment ?? 'shared';

            constructors.set(declaration.name, { type, environment, procedural: declaration.constructor?.procedural ?? null });
        }
    }

    return constructors;
}

export function isMtaClass(name: string): boolean {
    return mtaClassRegistry().lookupClass(name) !== null;
}

export function mtaStaticMember(className: string, member: string): MemberInfo | null {
    staticCache ??= buildStaticMembers();

    return staticCache.get(className)?.get(member) ?? null;
}

export function mtaStaticMembersFor(className: string, environment: ApiEnvironment): MemberInfo[] {
    staticCache ??= buildStaticMembers();

    return [...(staticCache.get(className)?.values() ?? [])].filter(
        (member) => member.environment !== undefined && isAvailableIn(member.environment, environment),
    );
}

export function mtaConstructor(className: string): MtaConstructorInfo | null {
    constructorCache ??= buildConstructors();

    return constructorCache.get(className) ?? null;
}

export function mtaClassRegistry(): DeclarationRegistry {
    cache ??= buildRegistry();

    return cache;
}

export function mtaMember(className: string, member: string): MemberInfo | null {
    return mtaClassRegistry().lookupMember(className, member);
}

export function mtaMembersFor(className: string, environment: ApiEnvironment): MemberInfo[] {
    const members = mtaClassRegistry().collectMembers(className);

    return members.filter((member) => member.environment !== undefined && isAvailableIn(member.environment, environment));
}
