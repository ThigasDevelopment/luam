export type PrimitiveKind = 'any' | 'unknown' | 'nil' | 'boolean' | 'number' | 'string' | 'thread' | 'userdata' | 'void';

export interface PrimitiveType {
    kind: PrimitiveKind;
}

export interface TableType {
    kind: 'table';
}

export interface ArrayType {
    kind: 'array';
    element: Type;
}

export interface MapType {
    kind: 'map';
    key: Type;
    value: Type;
}

export interface OptionalType {
    kind: 'optional';
    element: Type;
}

export interface UnionType {
    kind: 'union';
    options: Type[];
}

export interface StringLiteralType {
    kind: 'string-literal';
    value: string;
}

export interface BooleanLiteralType {
    kind: 'boolean-literal';
    value: boolean;
}

export interface NumberLiteralType {
    kind: 'number-literal';
    value: number;
}

export interface NamedType {
    kind: 'named';
    name: string;
}

export interface FunctionType {
    kind: 'function';
    parameters: Type[];
    parameterNames?: string[];
    variadicType?: Type;
    minimumArguments: number;
    isVariadic: boolean;
    returnType: Type;
}

export interface TupleType {
    kind: 'tuple';
    elements: Type[];
}

export interface RecordType {
    kind: 'record';
    name: string;
    origin: string | null;
    members: ReadonlyMap<string, Type>;
    isLiteral?: boolean;
}

export type Type =
    | PrimitiveType
    | TableType
    | ArrayType
    | MapType
    | OptionalType
    | UnionType
    | StringLiteralType
    | BooleanLiteralType
    | NumberLiteralType
    | NamedType
    | FunctionType
    | TupleType
    | RecordType;

export interface AssignabilityOptions {
    allowNil: boolean;
}

export const ANY_TYPE: Type = { kind: 'any' };
export const UNKNOWN_TYPE: Type = { kind: 'unknown' };
export const NIL_TYPE: Type = { kind: 'nil' };
export const BOOLEAN_TYPE: Type = { kind: 'boolean' };
export const NUMBER_TYPE: Type = { kind: 'number' };
export const STRING_TYPE: Type = { kind: 'string' };
export const THREAD_TYPE: Type = { kind: 'thread' };
export const USERDATA_TYPE: Type = { kind: 'userdata' };
export const VOID_TYPE: Type = { kind: 'void' };
export const TABLE_TYPE: Type = { kind: 'table' };

export function createArray(element: Type): Type {
    return { kind: 'array', element };
}

export function createNamed(name: string): Type {
    return { kind: 'named', name };
}

export function createMap(key: Type, value: Type): Type {
    return { kind: 'map', key, value };
}

export function createStringLiteral(value: string): Type {
    return { kind: 'string-literal', value };
}

export function createBooleanLiteral(value: boolean): Type {
    return { kind: 'boolean-literal', value };
}

export function createNumberLiteral(value: number): Type {
    return { kind: 'number-literal', value };
}

export function isLiteralType(type: Type): boolean {
    return type.kind === 'string-literal' || type.kind === 'boolean-literal' || type.kind === 'number-literal';
}

export function widenLiteral(type: Type): Type {
    if (type.kind === 'boolean-literal') {
        return BOOLEAN_TYPE;
    }

    if (type.kind === 'number-literal') {
        return NUMBER_TYPE;
    }

    return type.kind === 'string-literal' ? STRING_TYPE : type;
}

export function createRecord(name: string, members: ReadonlyMap<string, Type>, origin: string | null = null): Type {
    return { kind: 'record', name, origin, members };
}

export function renameRecord(type: Type, name: string): Type {
    return type.kind === 'record' ? createRecord(name, type.members, type.origin) : type;
}

export function createObjectType(members: ReadonlyMap<string, Type>): Type {
    const keys = [...members].map(([name, member]) =>
        member.kind === 'optional' ? `${name}?: ${typeToString(member.element)}` : `${name}: ${typeToString(member)}`,
    );

    return createRecord(keys.length === 0 ? '{}' : `{ ${keys.join(', ')} }`, members);
}

export function createLiteralRecord(members: ReadonlyMap<string, Type>): Type {
    const literal = createObjectType(members);

    return literal.kind === 'record' ? { ...literal, isLiteral: true } : literal;
}

function isEmptyLiteral(type: Type): boolean {
    return type.kind === 'record' && type.isLiteral === true && type.members.size === 0;
}

export function widenInferred(type: Type): Type {
    if (type.kind !== 'record' || type.isLiteral !== true) {
        return widenLiteral(type);
    }

    return type.members.size === 0 ? TABLE_TYPE : createRecord(type.name, type.members, type.origin);
}

export function createFunction(
    parameters: Type[],
    returnType: Type,
    minimumArguments?: number,
    isVariadic = false,
    parameterNames?: string[],
    variadicType?: Type,
): FunctionType {
    return {
        kind: 'function',
        parameters,
        ...(parameterNames === undefined ? {} : { parameterNames }),
        ...(variadicType === undefined ? {} : { variadicType }),
        returnType,
        minimumArguments: minimumArguments ?? parameters.length,
        isVariadic,
    };
}

export function createTuple(elements: Type[]): Type {
    const first = elements[0];

    if (first === undefined) {
        return VOID_TYPE;
    }

    if (elements.length === 1) {
        return first;
    }

    return { kind: 'tuple', elements };
}

export function firstValueOf(type: Type): Type {
    if (type.kind !== 'tuple') {
        return type;
    }

    return type.elements[0] ?? NIL_TYPE;
}

export function valuesOf(type: Type): Type[] {
    if (type.kind === 'tuple') {
        return [...type.elements];
    }

    return [type];
}

export function createOptional(element: Type): Type {
    if (element.kind === 'optional' || element.kind === 'nil' || element.kind === 'any') {
        return element;
    }

    return { kind: 'optional', element };
}

export function createUnion(options: Type[]): Type {
    const flattened: Type[] = [];

    for (const option of options) {
        const parts = option.kind === 'union' ? option.options : [option];

        for (const part of parts) {
            if (!flattened.some((existing) => typeToString(existing) === typeToString(part))) {
                flattened.push(part);
            }
        }
    }

    const first = flattened[0];

    if (first === undefined) {
        return UNKNOWN_TYPE;
    }

    if (flattened.length === 1) {
        return first;
    }

    if (flattened.length === 2 && flattened.some((option) => option.kind === 'nil')) {
        const value = flattened.find((option) => option.kind !== 'nil');

        return value === undefined ? NIL_TYPE : createOptional(value);
    }

    return { kind: 'union', options: flattened };
}

export function typeToString(type: Type): string {
    if (type.kind === 'array') {
        return `${typeToString(type.element)}[]`;
    }

    if (type.kind === 'map') {
        return `table<${typeToString(type.key)}, ${typeToString(type.value)}>`;
    }

    if (type.kind === 'optional') {
        return `${typeToString(type.element)}?`;
    }

    if (type.kind === 'union') {
        return type.options.map(typeToString).join(' | ');
    }

    if (type.kind === 'string-literal') {
        return `'${type.value.replace(/(['\\])/g, '\\$1')}'`;
    }

    if (type.kind === 'boolean-literal' || type.kind === 'number-literal') {
        return String(type.value);
    }

    if (type.kind === 'named' || type.kind === 'record') {
        return type.name;
    }

    if (type.kind === 'tuple') {
        return `(${type.elements.map(typeToString).join(', ')})`;
    }

    if (type.kind === 'function') {
        const parameters = type.parameters.map(typeToString);

        if (type.isVariadic) {
            parameters.push(type.variadicType === undefined ? '...' : `...: ${typeToString(type.variadicType)}`);
        }

        return `fun(${parameters.join(', ')}): ${typeToString(type.returnType)}`;
    }

    return type.kind;
}

export function withoutNil(type: Type): Type {
    if (type.kind === 'optional') {
        return type.element;
    }

    if (type.kind === 'union') {
        return createUnion(type.options.filter((option) => option.kind !== 'nil'));
    }

    return type;
}

export function acceptsNil(type: Type): boolean {
    if (type.kind === 'nil' || type.kind === 'optional' || type.kind === 'any' || type.kind === 'unknown') {
        return true;
    }

    return type.kind === 'union' && type.options.some((option) => option.kind === 'nil');
}

export function isTableLike(type: Type): boolean {
    return type.kind === 'table' || type.kind === 'array' || type.kind === 'map';
}

export function isBooleanType(type: Type | undefined): boolean {
    const resolved = type?.kind === 'optional' ? type.element : type;

    return resolved?.kind === 'boolean' || resolved?.kind === 'boolean-literal';
}

export function isNumeric(type: Type): boolean {
    if (type.kind === 'union') {
        return type.options.every(isNumeric);
    }

    return type.kind === 'number' || type.kind === 'number-literal' || type.kind === 'any' || type.kind === 'unknown' || type.kind === 'named';
}

export function isConcatenable(type: Type): boolean {
    if (type.kind === 'union') {
        return type.options.every(isConcatenable);
    }

    return type.kind === 'string' || type.kind === 'string-literal' || isNumeric(type);
}

function isFunctionAssignable(source: FunctionType, target: FunctionType, options: AssignabilityOptions): boolean {
    if (!target.isVariadic && source.minimumArguments > target.parameters.length) {
        return false;
    }

    const shared = Math.min(source.parameters.length, target.parameters.length);

    for (let index = 0; index < shared; index += 1) {
        const sourceParameter = source.parameters[index];
        const targetParameter = target.parameters[index];

        if (sourceParameter !== undefined && targetParameter !== undefined && !isAssignable(targetParameter, sourceParameter, options)) {
            return false;
        }
    }

    return target.returnType.kind === 'void' || isAssignable(source.returnType, target.returnType, options);
}

function isMapAssignable(source: Type, target: MapType, options: AssignabilityOptions): boolean {
    if (source.kind === 'table') {
        return true;
    }

    if (source.kind === 'array') {
        return isAssignable(NUMBER_TYPE, target.key, options) && isAssignable(source.element, target.value, options);
    }

    if (source.kind === 'record') {
        return isAssignable(STRING_TYPE, target.key, options) && [...source.members.values()].every((member) => isAssignable(member, target.value, options));
    }

    return source.kind === 'map' && isAssignable(source.key, target.key, options) && isAssignable(source.value, target.value, options);
}

function isRecordAssignable(source: RecordType, target: RecordType, options: AssignabilityOptions): boolean {
    for (const [name, member] of target.members) {
        const value = source.members.get(name);

        if (value === undefined) {
            if (member.kind !== 'optional') {
                return false;
            }

            continue;
        }

        if (!isAssignable(value, member, options)) {
            return false;
        }
    }

    return true;
}

export function isAssignable(source: Type, target: Type, options: AssignabilityOptions = { allowNil: false }): boolean {
    if (source.kind === 'any' || target.kind === 'any' || target.kind === 'unknown') {
        return true;
    }

    if (source.kind === 'tuple' || target.kind === 'tuple') {
        return isAssignable(firstValueOf(source), firstValueOf(target), options);
    }

    if (source.kind === 'named' || target.kind === 'named') {
        return true;
    }

    if (source.kind === 'nil' && (options.allowNil || target.kind === 'optional' || target.kind === 'nil')) {
        return true;
    }

    if (source.kind === 'unknown') {
        return options.allowNil;
    }

    if (source.kind === 'union') {
        return source.options.every((option) => isAssignable(option, target, options));
    }

    if (source.kind === 'optional') {
        return isAssignable(NIL_TYPE, target, options) && isAssignable(source.element, target, options);
    }

    if (target.kind === 'union') {
        return target.options.some((option) => isAssignable(source, option, options));
    }

    if (target.kind === 'optional') {
        return isAssignable(source, target.element, options);
    }

    if (target.kind === 'table') {
        return isTableLike(source) || source.kind === 'record';
    }

    if (target.kind === 'record') {
        return source.kind === 'record' ? isRecordAssignable(source, target, options) : source.kind === 'table';
    }

    if (target.kind === 'array') {
        return source.kind === 'table' || isEmptyLiteral(source) || (source.kind === 'array' && isAssignable(source.element, target.element, options));
    }

    if (target.kind === 'map') {
        return isMapAssignable(source, target, options);
    }

    if (source.kind === 'function' && target.kind === 'function') {
        return isFunctionAssignable(source, target, options);
    }

    if (source.kind === 'string-literal') {
        return target.kind === 'string' || (target.kind === 'string-literal' && source.value === target.value);
    }

    if (source.kind === 'boolean-literal') {
        return target.kind === 'boolean' || (target.kind === 'boolean-literal' && source.value === target.value);
    }

    if (source.kind === 'number-literal') {
        return target.kind === 'number' || (target.kind === 'number-literal' && source.value === target.value);
    }

    if (isLiteralType(target)) {
        return false;
    }

    return source.kind === target.kind;
}
