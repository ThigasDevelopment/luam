import type { TypeDescriptor } from '@mta-types/type-descriptor';

import {
    ANY_TYPE,
    BOOLEAN_TYPE,
    createArray,
    createFunction,
    createNamed,
    createOptional,
    createRecord,
    createStringLiteral,
    createTuple,
    createUnion,
    NIL_TYPE,
    NUMBER_TYPE,
    STRING_TYPE,
    TABLE_TYPE,
    THREAD_TYPE,
    USERDATA_TYPE,
    VOID_TYPE,
    type Type,
} from './types';

const PRIMITIVES: Readonly<Record<string, Type>> = {
    any: ANY_TYPE,
    boolean: BOOLEAN_TYPE,
    nil: NIL_TYPE,
    number: NUMBER_TYPE,
    string: STRING_TYPE,
    table: TABLE_TYPE,
    thread: THREAD_TYPE,
    userdata: USERDATA_TYPE,
    void: VOID_TYPE,
};

export function descriptorToType(descriptor: TypeDescriptor): Type {
    if (descriptor.kind === 'array') {
        return createArray(descriptorToType(descriptor.element));
    }

    if (descriptor.kind === 'optional') {
        return createOptional(descriptorToType(descriptor.element));
    }

    if (descriptor.kind === 'union') {
        return createUnion(descriptor.options.map(descriptorToType));
    }

    if (descriptor.kind === 'named') {
        return createNamed(descriptor.name);
    }

    if (descriptor.kind === 'literal') {
        return createStringLiteral(descriptor.value);
    }

    if (descriptor.kind === 'tuple') {
        return createTuple(descriptor.elements.map(descriptorToType));
    }

    if (descriptor.kind === 'record') {
        const members = new Map(descriptor.members.map((member) => [member.name, descriptorToType(member.type)]));

        return createRecord(descriptor.name, members, descriptor.origin);
    }

    if (descriptor.kind === 'function') {
        const parameters = descriptor.parameters.map(descriptorToType);

        const variadicType = descriptor.variadicType === undefined ? undefined : descriptorToType(descriptor.variadicType);

        return createFunction(
            parameters,
            descriptorToType(descriptor.returnType),
            descriptor.minimumArguments,
            descriptor.isVariadic,
            descriptor.parameterNames,
            variadicType,
        );
    }

    return PRIMITIVES[descriptor.kind] ?? ANY_TYPE;
}
