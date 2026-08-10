import type { ApiEnvironment } from './api-declaration';
import type { TypeDescriptor } from './type-descriptor';

export type OopMemberKind = 'method' | 'property';

export interface OopMember {
    name: string;
    kind: OopMemberKind;
    environment: ApiEnvironment;
    procedural: string;
    type: TypeDescriptor;
}

export interface OopConstructor {
    environment: ApiEnvironment;
    type: TypeDescriptor;
}

export interface OopClass {
    name: string;
    parent: string | null;
    members: readonly OopMember[];
    staticMethods: readonly OopMember[];
    constructor: OopConstructor | null;
}

export function oopMethod(name: string, environment: ApiEnvironment, procedural: string, type: TypeDescriptor): OopMember {
    return { name, kind: 'method', environment, procedural, type };
}

export function oopProperty(name: string, environment: ApiEnvironment, procedural: string, type: TypeDescriptor): OopMember {
    return { name, kind: 'property', environment, procedural, type };
}

export function oopConstructor(environment: ApiEnvironment, type: TypeDescriptor): OopConstructor {
    return { environment, type };
}

export function oopClass(
    name: string,
    parent: string | null,
    members: readonly OopMember[],
    staticMethods: readonly OopMember[] = [],
    constructor: OopConstructor | null = null,
): OopClass {
    return { name, parent, members, staticMethods, constructor };
}
