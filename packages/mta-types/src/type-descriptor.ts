export type PrimitiveDescriptorKind = 'any' | 'boolean' | 'nil' | 'number' | 'string' | 'table' | 'thread' | 'userdata' | 'void';

export interface PrimitiveDescriptor {
    kind: PrimitiveDescriptorKind;
}

export interface ArrayDescriptor {
    kind: 'array';
    element: TypeDescriptor;
}

export interface OptionalDescriptor {
    kind: 'optional';
    element: TypeDescriptor;
}

export interface UnionDescriptor {
    kind: 'union';
    options: TypeDescriptor[];
}

export interface NamedDescriptor {
    kind: 'named';
    name: string;
}

export interface FunctionDescriptor {
    kind: 'function';
    parameters: TypeDescriptor[];
    returnType: TypeDescriptor;
    minimumArguments: number;
    isVariadic: boolean;
}

export interface TupleDescriptor {
    kind: 'tuple';
    elements: TypeDescriptor[];
}

export interface RecordMember {
    name: string;
    type: TypeDescriptor;
}

export interface RecordDescriptor {
    kind: 'record';
    name: string;
    origin: string | null;
    members: RecordMember[];
}

export type TypeDescriptor =
    | PrimitiveDescriptor
    | ArrayDescriptor
    | OptionalDescriptor
    | UnionDescriptor
    | NamedDescriptor
    | FunctionDescriptor
    | TupleDescriptor
    | RecordDescriptor;

export const ANY: TypeDescriptor = { kind: 'any' };
export const BOOLEAN: TypeDescriptor = { kind: 'boolean' };
export const NIL: TypeDescriptor = { kind: 'nil' };
export const NUMBER: TypeDescriptor = { kind: 'number' };
export const STRING: TypeDescriptor = { kind: 'string' };
export const TABLE: TypeDescriptor = { kind: 'table' };
export const THREAD: TypeDescriptor = { kind: 'thread' };
export const USERDATA: TypeDescriptor = { kind: 'userdata' };
export const VOID: TypeDescriptor = { kind: 'void' };

export function arrayOf(element: TypeDescriptor): TypeDescriptor {
    return { kind: 'array', element };
}

export function optionalOf(element: TypeDescriptor): TypeDescriptor {
    return { kind: 'optional', element };
}

export function unionOf(options: TypeDescriptor[]): TypeDescriptor {
    return { kind: 'union', options };
}

export function named(name: string): TypeDescriptor {
    return { kind: 'named', name };
}

export function record(name: string, members: RecordMember[], origin: string | null = null): TypeDescriptor {
    return { kind: 'record', name, origin, members };
}

export function tupleOf(elements: TypeDescriptor[]): TypeDescriptor {
    return { kind: 'tuple', elements };
}

export function fn(parameters: TypeDescriptor[], returnType: TypeDescriptor, minimumArguments?: number, isVariadic = false): TypeDescriptor {
    return { kind: 'function', parameters, returnType, minimumArguments: minimumArguments ?? parameters.length, isVariadic };
}
