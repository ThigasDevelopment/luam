import {
    ANY_TYPE,
    BOOLEAN_TYPE,
    createArray,
    createBooleanLiteral,
    createFunction,
    createNumberLiteral,
    createNamed,
    createObjectType,
    createOptional,
    createStringLiteral,
    createTuple,
    createUnion,
    NIL_TYPE,
    NUMBER_TYPE,
    STRING_TYPE,
    TABLE_TYPE,
    THREAD_TYPE,
    UNKNOWN_TYPE,
    USERDATA_TYPE,
    VOID_TYPE,
    type Type,
} from '@compiler/checker/types';
import type { Parameter, TypeAnnotation } from '@compiler/parser/ast';

const PRIMITIVE_TYPES: Readonly<Record<string, Type>> = {
    any: ANY_TYPE,
    boolean: BOOLEAN_TYPE,
    nil: NIL_TYPE,
    number: NUMBER_TYPE,
    string: STRING_TYPE,
    table: TABLE_TYPE,
    thread: THREAD_TYPE,
    unknown: UNKNOWN_TYPE,
    userdata: USERDATA_TYPE,
    void: VOID_TYPE,
};

function minimumOf(types: readonly Type[]): number {
    const optional = types.findIndex((type) => type.kind === 'optional');

    return optional === -1 ? types.length : optional;
}

function intersectionType(parts: readonly Type[]): Type {
    const members = new Map<string, Type>();

    for (const part of parts) {
        if (part.kind === 'record') {
            for (const [name, member] of part.members) {
                members.set(name, member);
            }
        }
    }

    return createObjectType(members);
}

export function annotationType(annotation: TypeAnnotation | null): Type {
    if (annotation === null) {
        return ANY_TYPE;
    }

    if (annotation.kind === 'type-array') {
        return createArray(annotationType(annotation.element));
    }

    if (annotation.kind === 'type-optional') {
        return createOptional(annotationType(annotation.element));
    }

    if (annotation.kind === 'type-union') {
        return createUnion(annotation.options.map((option) => annotationType(option)));
    }

    if (annotation.kind === 'type-intersection') {
        return intersectionType(annotation.parts.map((part) => annotationType(part)));
    }

    if (annotation.kind === 'type-string-literal') {
        return createStringLiteral(annotation.value);
    }

    if (annotation.kind === 'type-boolean-literal') {
        return createBooleanLiteral(annotation.value);
    }

    if (annotation.kind === 'type-number-literal') {
        return createNumberLiteral(annotation.value);
    }

    if (annotation.kind === 'type-function') {
        const parameters = annotation.parameters.map((parameter) => annotationType(parameter));

        return createFunction(parameters, annotationType(annotation.returnType), minimumOf(parameters), annotation.isVariadic);
    }

    if (annotation.kind === 'type-object') {
        return createObjectType(new Map(annotation.members.map((member) => [member.name, annotationType(member.annotation)])));
    }

    if (annotation.kind === 'type-tuple') {
        return createTuple(annotation.elements.map((element) => annotationType(element)));
    }

    return PRIMITIVE_TYPES[annotation.name] ?? createNamed(annotation.name, annotation.typeArguments.map((argument) => annotationType(argument)));
}

export function signatureType(parameters: readonly Parameter[], returnAnnotation: TypeAnnotation | null): Type {
    const named = parameters.filter((parameter) => !parameter.isVararg);
    const types = named.map((parameter) => annotationType(parameter.annotation));

    return createFunction(types, annotationType(returnAnnotation), minimumOf(types), named.length !== parameters.length);
}
