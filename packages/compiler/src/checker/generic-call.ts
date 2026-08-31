import type { SourcePosition } from '@compiler/diagnostics/diagnostic';
import type { TypeAnnotation } from '@compiler/parser/ast';

import type { CheckContext } from './context';
import { inferTypeArguments, reportConstraintViolations } from './generic-class';
import { substituteType } from './type-substitution';
import { ANY_TYPE, createFunction, type FunctionType, type Type } from './types';

function countArguments(total: number): string {
    return total === 1 ? '1 type argument' : `${total} type arguments`;
}

function substituteSignature(signature: FunctionType, substitutions: ReadonlyMap<string, Type>): FunctionType {
    const parameters = signature.parameters.map((parameter) => substituteType(parameter, substitutions));
    const returnType = substituteType(signature.returnType, substitutions);
    const variadicType = signature.variadicType === undefined ? undefined : substituteType(signature.variadicType, substitutions);

    return createFunction(parameters, returnType, signature.minimumArguments, signature.isVariadic, signature.parameterNames, variadicType);
}

export function specializeCall(
    context: CheckContext,
    owner: string,
    signature: FunctionType,
    argumentTypes: readonly Type[],
    typeArguments: readonly TypeAnnotation[],
    position: SourcePosition,
): FunctionType {
    const names = signature.typeParameters ?? [];

    if (names.length === 0) {
        if (typeArguments.length > 0) {
            context.report('check-generic-arity', `${owner} does not accept type arguments.`, position);
        }

        return signature;
    }

    const explicit = typeArguments.map((argument) => context.resolveAnnotation(argument));

    if (typeArguments.length > 0 && explicit.length !== names.length) {
        context.report('check-generic-arity', `${owner} expects ${countArguments(names.length)} but received ${explicit.length}.`, position);
    }

    const resolved = typeArguments.length > 0
        ? names.map((unused, index) => explicit[index] ?? ANY_TYPE)
        : inferTypeArguments(names, signature.parameters, argumentTypes);

    reportConstraintViolations(context, owner, names, signature.typeConstraints ?? [], resolved, position);

    return substituteSignature(signature, new Map(names.map((name, index) => [name, resolved[index] ?? ANY_TYPE])));
}
