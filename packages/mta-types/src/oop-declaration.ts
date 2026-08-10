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

export interface OopClass {
    name: string;
    parent: string | null;
    members: readonly OopMember[];
}

export function oopMethod(name: string, environment: ApiEnvironment, procedural: string, type: TypeDescriptor): OopMember {
    return { name, kind: 'method', environment, procedural, type };
}

export function oopProperty(name: string, environment: ApiEnvironment, procedural: string, type: TypeDescriptor): OopMember {
    return { name, kind: 'property', environment, procedural, type };
}

export function oopClass(name: string, parent: string | null, members: readonly OopMember[]): OopClass {
    return { name, parent, members };
}
